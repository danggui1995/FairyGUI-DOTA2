import { GComponent } from "./GComponent";
import { GObject } from "./GObject";
import { ScrollPane } from "./ScrollPane";
import { ByteBuffer } from "../utils/ByteBuffer";
import { Event } from "../event/Event";
import { Vec2 } from "../math/Vec2";

var s_vec2: Vec2 = new Vec2();

export class GScrollBar extends GComponent {
    private _grip: GObject;
    private _arrowButton1: GObject;
    private _arrowButton2: GObject;
    private _bar: GObject;
    private _target: ScrollPane;

    private _vertical: boolean;
    private _scrollPerc: number;
    private _fixedGripSize: boolean;

    private _dragOffset: Vec2;
    private _gripDragging: boolean;

    constructor(name ?: string) {
        super(name);
        this._dragOffset = new Vec2();
        this._scrollPerc = 0;
    }

    public setScrollPane(target: ScrollPane, vertical: boolean): void {
        this._target = target;
        this._vertical = vertical;
    }

    public setDisplayPerc(value: number) {
        if (this._vertical) {
            if (!this._fixedGripSize)
                this._grip.height = Math.floor(value * this._bar.height);
            this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;

        }
        else {
            if (!this._fixedGripSize)
                this._grip.width = Math.floor(value * this._bar.width);
            this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
        }
        this._grip.visible = value != 0 && value != 1;
    }

    public setScrollPerc(val: number) {
        this._scrollPerc = val;
        if (this._vertical)
            this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
        else
            this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
    }

    public get minSize(): number {
        if (this._vertical)
            return (this._arrowButton1 ? this._arrowButton1.height : 0) + (this._arrowButton2 ? this._arrowButton2.height : 0);
        else
            return (this._arrowButton1 ? this._arrowButton1.width : 0) + (this._arrowButton2 ? this._arrowButton2.width : 0);
    }

    public get gripDragging(): boolean {
        return this._gripDragging;
    }

    protected constructExtension(buffer: ByteBuffer): void {
        buffer.seek(0, 6);

        this._fixedGripSize = buffer.readBool();

        this._grip = this.getChild("grip");
        if (!this._grip) {
            $.Msg("需要定义grip");
            return;
        }

        this._bar = this.getChild("bar");
        if (!this._bar) {
            $.Msg("需要定义bar");
            return;
        }

        this._arrowButton1 = this.getChild("arrow1");
        this._arrowButton2 = this.getChild("arrow2");

        this._grip.onEvent("onTouchBegin", this.__gripTouchBegin, this);
        this._grip.onEvent("onTouchMove", this.__gripTouchMove, this);
        this._grip.onEvent("onTouchEnd", this.__gripTouchEnd, this);

        this.onEvent("onactivate", this.__barTouchBegin, this);

        if (this._arrowButton1)
            this._arrowButton1.onEvent("onactivate", this.__arrowButton1Click, this);
        if (this._arrowButton2)
            this._arrowButton2.onEvent("onactivate", this.__arrowButton2Click, this);
    }

    private __gripTouchBegin(): void {
        if (this._bar == null)
            return;

        this._gripDragging = true;
        this._target.updateScrollBarVisible();

        var gpos = GameUI.GetCursorPosition();
        this.globalToLocal(gpos[0], gpos[1], this._dragOffset);
        this._dragOffset.x -= this._grip.x;
        this._dragOffset.y -= this._grip.y;
    }

    private __gripTouchMove(): void {
        if (!this.onStage)
            return;
        
        if (ScrollPane.draggingPane || (GObject.draggingObject && GObject.draggingObject != this))
        {
            return;
        }
        GObject.draggingObject = this;
        var gpos = GameUI.GetCursorPosition();
        var pt: Vec2 = this.globalToLocal(gpos[0], gpos[1], s_vec2);
        if (this._vertical) {
            let curY: number = pt.y - this._dragOffset.y;
            let diff = this._bar.height - this._grip.height;
            if (diff == 0)
                this._target.percY = 0;
            else
                this._target.percY = (curY - this._bar.y) / diff;
        }
        else {
            let curX: number = pt.x - this._dragOffset.x;
            let diff = this._bar.width - this._grip.width;
            if (diff == 0)
                this._target.percX = 0;
            else
                this._target.percX = (curX - this._bar.x) / (this._bar.width - this._grip.width);
        }
    }

    private __gripTouchEnd(): void {
        if (GObject.draggingObject == this)
        {
            GObject.draggingObject = null;
        }
        this._gripDragging = false;
        this._target.updateScrollBarVisible();
    }

    private __arrowButton1Click(): void {
        if (this._vertical)
            this._target.scrollUp();
        else
            this._target.scrollLeft();
    }

    private __arrowButton2Click(): void {
        if (this._vertical)
            this._target.scrollDown();
        else
            this._target.scrollRight();
    }

    private __barTouchBegin(): void {
        var cpos = GameUI.GetCursorPosition();
        var pt: Vec2 = this._grip.globalToLocal(cpos[0], cpos[1], s_vec2);
        if (this._vertical) {
            if (pt.y < 0)
                this._target.scrollUp(4);
            else
                this._target.scrollDown(4);
        }
        else {
            if (pt.x < 0)
                this._target.scrollLeft(4);
            else
                this._target.scrollRight(4);
        }
    }
}
