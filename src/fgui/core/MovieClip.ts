import { Image } from "./Image";
import { Timers } from "../utils/Timers";

export interface Frame {
    addDelay?: number;
}

export class MovieClip extends Image {
    public interval: number = 0;
    public swing: boolean = false;
    public repeatDelay: number = 0;
    public timeScale: number = 1;

    private _playing: boolean = true;
    private _frameCount: number = 0;
    private _frames: Frame[];
    private _frame: number = 0;
    private _start: number = 0;
    private _end: number = 0;
    private _times: number = 0;
    private _endAt: number = 0;
    private _status: number = 0; //0-none, 1-next loop, 2-ending, 3-ended

    private _frameElapsed: number = 0; //当前帧延迟
    private _reversed: boolean = false;
    private _repeatedCount: number = 0;

    constructor() {
        super();

        this.setPlaySettings();
    }

    public init()
    {
        super.init();
        
        this.$owner.onEvent("added_to_stage", this.__addToStage, this);
        this.$owner.onEvent("removed_from_stage", this.__removeFromStage, this);
    }

    public get frames(): Frame[] {
        return this._frames;
    }

    public set frames(value: Frame[]) {
        this._frames = value;
        this._scaleByTile = false;
        this._scale9Grid = null;

        if (this._frames) {
            this._frameCount = this._frames.length;

            if (this._end == -1 || this._end > this._frameCount - 1)
                this._end = this._frameCount - 1;
            if (this._endAt == -1 || this._endAt > this._frameCount - 1)
                this._endAt = this._frameCount - 1;

            if (this._frame < 0 || this._frame > this._frameCount - 1)
                this._frame = this._frameCount - 1;

            this._frameElapsed = 0;
            this._repeatedCount = 0;
            this._reversed = false;
        }
        else
            this._frameCount = 0;

        this.drawFrame();
        this.checkTimer();
    }

    public get frameCount(): number {
        return this._frameCount;
    }

    public get frame(): number {
        return this._frame;
    }

    public set frame(value: number) {
        if (this._frame != value) {
            if (this._frames && value >= this._frameCount)
                value = this._frameCount - 1;

            this._frame = value;
            this._frameElapsed = 0;
            this.drawFrame();
        }
    }

    public get playing(): boolean {
        return this._playing;
    }

    public set playing(value: boolean) {
        if (this._playing != value) {
            this._playing = value;
            this.checkTimer();
        }
    }

    //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
    public rewind(): void {
        this._frame = 0;
        this._frameElapsed = 0;
        this._reversed = false;
        this._repeatedCount = 0;

        this.drawFrame();
    }

    public syncStatus(anotherMc: MovieClip): void {
        this._frame = anotherMc._frame;
        this._frameElapsed = anotherMc._frameElapsed;
        this._reversed = anotherMc._reversed;
        this._repeatedCount = anotherMc._repeatedCount;

        this.drawFrame();
    }

    public advance(timeInMiniseconds: number): void {
        var beginFrame: number = this._frame;
        var beginReversed: boolean = this._reversed;
        var backupTime: number = timeInMiniseconds;
        while (true) {
            var tt: number = this.interval + (this._frames[this._frame].addDelay || 0);
            if (this._frame == 0 && this._repeatedCount > 0)
                tt += this.repeatDelay;
            if (timeInMiniseconds < tt) {
                this._frameElapsed = 0;
                break;
            }

            timeInMiniseconds -= tt;

            if (this.swing) {
                if (this._reversed) {
                    this._frame--;
                    if (this._frame <= 0) {
                        this._frame = 0;
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                }
                else {
                    this._frame++;
                    if (this._frame > this._frameCount - 1) {
                        this._frame = Math.max(0, this._frameCount - 2);
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                }
            }
            else {
                this._frame++;
                if (this._frame > this._frameCount - 1) {
                    this._frame = 0;
                    this._repeatedCount++;
                }
            }

            if (this._frame == beginFrame && this._reversed == beginReversed) //走了一轮了
            {
                var roundTime: number = backupTime - timeInMiniseconds; //这就是一轮需要的时间
                timeInMiniseconds -= Math.floor(timeInMiniseconds / roundTime) * roundTime; //跳过
            }
        }

        this.drawFrame();
    }

    //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
    public setPlaySettings(start?: number, end?: number, times?: number, endAt?: number): void {
        this._start = start || 0;
        this._end = end || -1;
        if (this._end == -1 || this._end > this._frameCount - 1)
            this._end = this._frameCount - 1;
        this._times = times || 0;
        this._endAt = endAt || -1;
        if (this._endAt == -1)
            this._endAt = this._end;
        this._status = 0;
        this.frame = this._start;
    }

    private onTimer(): void {
        if (!this._playing || this._frameCount == 0 || this._status == 3)
            return;

        var dt: number = Timers.deltaTime;
        if (dt > 100)
            dt = 100;
        if (this.timeScale != 1)
            dt *= this.timeScale;

        this._frameElapsed += dt;
        var tt: number = this.interval + (this._frames[this._frame].addDelay || 0);
        if (this._frame == 0 && this._repeatedCount > 0)
            tt += this.repeatDelay;
        if (this._frameElapsed < tt)
            return;

        this._frameElapsed -= tt;
        if (this._frameElapsed > this.interval)
            this._frameElapsed = this.interval;

        if (this.swing) {
            if (this._reversed) {
                this._frame--;
                if (this._frame <= 0) {
                    this._frame = 0;
                    this._repeatedCount++;
                    this._reversed = !this._reversed;
                }
            }
            else {
                this._frame++;
                if (this._frame > this._frameCount - 1) {
                    this._frame = Math.max(0, this._frameCount - 2);
                    this._repeatedCount++;
                    this._reversed = !this._reversed;
                }
            }
        }
        else {
            this._frame++;
            if (this._frame > this._frameCount - 1) {
                this._frame = 0;
                this._repeatedCount++;
            }
        }

        if (this._status == 1) //new loop
        {
            this._frame = this._start;
            this._frameElapsed = 0;
            this._status = 0;
        }
        else if (this._status == 2) //ending
        {
            this._frame = this._endAt;
            this._frameElapsed = 0;
            this._status = 3; //ended

            if(this.$owner)
                this.$owner.emit("play_end");
        }
        else {
            if (this._frame == this._end) {
                if (this._times > 0) {
                    this._times--;
                    if (this._times == 0)
                        this._status = 2;  //ending
                    else
                        this._status = 1; //new loop
                }
                else {
                    this._status = 1; //new loop
                }
            }
        }

        this.drawFrame();
    }

    private drawFrame(): void {
        // if (this._frameCount > 0 && this._frame < this._frames.length) {
        //     var frame: Frame = this._frames[this._frame];
        //     this._graphics.texture = frame.texture;
        // }
        // else
        //     this._graphics.texture = null;
    }

    private checkTimer(): void {
        if (this._playing && this._frameCount > 0 && this.onStage)
            Timers.addUpdate(this.onTimer, this);
        else
            Timers.remove(this.onTimer, this);
    }

    private __addToStage(): void {
        if (this._playing && this._frameCount > 0)
            Timers.addUpdate(this.onTimer, this);
    }

    private __removeFromStage(): void {
        Timers.remove(this.onTimer, this);
    }
}