const gulp = require('gulp')
const rollup = require('rollup')
const ts = require('gulp-typescript');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify-es').default;
const tsProject = ts.createProject('tsconfig.json', { declaration: true });
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const clean = require('gulp-clean')

const onwarn = warning => {
    // Silence circular dependency warning for moment package
    if (warning.code === 'CIRCULAR_DEPENDENCY')
        return

    console.warn(`(!) ${warning.message}`)
}

gulp.task('buildJs', () => {
    return tsProject.src()
        .pipe(tsProject({
            declaration: true
        }))
        .pipe(gulp.dest('./build'));
})

gulp.task('cleanJs', () => {
    return gulp
        .src('./build/**/*.js', { read: false })
        .pipe(clean('*.js'));
});

gulp.task("rollup", async function() {
    let config = {
        input: "build/FairyGUI.js",
        external: ['three'],
        output: {
            file: 'dist/FairyGUI.js',
            format: 'esm',
            extend: true,
            name: 'fgui',
            globals: { three: 'three' }
        },
        plugins: [
            resolve(),
            commonjs({
                'namedExports': {
                    'src/encoding/index.js': ['TextDecoder']
                }
            })
        ]
    };
    const subTask2 = await rollup.rollup(config);
    await subTask2.write(config);
});

gulp.task("uglify", function() {
    return gulp.src("dist/FairyGUI.js")
        // .pipe(rename({ suffix: '.min' }))
        .pipe(uglify( /* options */ ))
        .pipe(gulp.dest("dist/"));
});

gulp.task('build', gulp.series(
    gulp.parallel('buildJs'),
    gulp.parallel('rollup'),
    gulp.parallel('cleanJs'),
    gulp.parallel('uglify')
))