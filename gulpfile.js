const gulp = require('gulp')
const rollup = require('rollup')
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json', { declaration: true });
const clean = require('gulp-clean')

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
        output: {
            file: 'FairyGUI.js',
            format: 'umd',
            extend: true,
            name: 'fgui'
        },
        plugins: [
            // resolve()
        ]
    };
    const subTask2 = await rollup.rollup(config);
    await subTask2.write(config);
});

gulp.task("movejs", function() {
    return gulp.src("FairyGUI.js")
        .pipe(gulp.dest('../panorama-fgui-types/fgui'));
});

gulp.task("move", function() {
    return gulp.src("build/**")
        .pipe(gulp.dest('../panorama-fgui-types/fgui'));
});

gulp.task("movetypes", function() {
    return gulp.src("mymodule/panorama-types/types/**")
        .pipe(gulp.dest('../panorama-fgui-types/types'));
});

gulp.task('build', gulp.series(
    gulp.parallel('buildJs'),
    gulp.parallel('rollup'),
    gulp.parallel('cleanJs'),
    gulp.parallel('move'),
    gulp.parallel('movejs'),
    gulp.parallel('movetypes'),
))