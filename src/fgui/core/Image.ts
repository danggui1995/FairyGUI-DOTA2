import { FillMethod } from "../ui/FieldTypes";
import { UIElement } from "./UIElement";
import { Vec2 } from "../math/Vec2";
import { Margin } from "../math/Margin";

export class Image extends UIElement {
    protected _src: string;
    protected _color: number;
    protected _scaleByTile: boolean;
    protected _scale9Grid: Margin;
    protected _textureScale: Vec2;
    protected _tileGridIndice: number = 0;

    private _timerID_1: number = 0;

    constructor() {
        super();

        this._color = 0xFFFFFF;
        this._textureScale = new Vec2(1, 1);

    }

    public init() {
        this.nativePanel = $.CreatePanel( "Image", $('#HiddenRoot'), this.$owner.panelName);
    }

    public get src(): string {
        return this._src;
    }

    public set src(value: string) {
        if (this._src != value) {
            this._src = value;
            this._textureScale.set(1, 1);
            this.refresh();
        }
    }

    public get color(): number {
        return this._color;
    }
    public set color(value: number) {
        if (this._color != value) {
            this._color = value;
            this.updateFilters();
        }
    }

    public get textureScale(): Vec2 {
        return this._textureScale;
    }

    public set textureScale(value: Vec2) {
        if (!this._textureScale.equals(value)) {
            this._textureScale.copy(value);
            this.refresh();
        }
    }

    public get scale9Grid(): Margin {
        return this._scale9Grid;
    }

    public set scale9Grid(value: Margin) {
        if (this._scale9Grid != value) {
            this._scale9Grid = value;
            this.refresh();
        }
    }

    public get scaleByTile(): boolean {
        return this._scaleByTile;
    }

    public set scaleByTile(value: boolean) {
        if (this._scaleByTile != value) {
            this._scaleByTile = value;
            this.refresh();
        }
    }

    public get tileGridIndice(): number {
        return this._tileGridIndice;
    }

    public set tileGridIndice(value: number) {
        if (this._tileGridIndice != value) {
            this._tileGridIndice = value;
            this.refresh();
        }
    }

    public get fillMethod(): number {
        return FillMethod.None;
    }

    public set fillMethod(value: number) {

    }

    public get fillOrigin(): number {
        return 0;
    }

    public set fillOrigin(value: number) {
    }

    public get fillClockwise(): boolean {
        return true;
    }

    public set fillClockwise(value: boolean) {
    }

    public get fillAmount(): number {
        return 0;
    }

    public set fillAmount(value: number) {
    }

    protected updateFilters(): void {

        // this.nativePanel.style.filter = filter;
    }

    protected refresh(): void {
        if (!this._src) {
            this.nativePanel.style.backgroundImage = "none";
            return;
        }
        this.nativePanel.style.backgroundImage = "url('" + this._src + "')";
        if (this._scaleByTile) {
            if (this._textureScale.x != 1 || this._textureScale.y != 1)
                this.nativePanel.style.backgroundSize = (this._textureScale.x * 100) + "% " + (this._textureScale.y * 100) + "%";
            else
                this.nativePanel.style.backgroundSize = "auto";
            this.nativePanel.style.backgroundRepeat = "repeat";
        }
        // else if (this._scale9Grid) {
        //     this.nativePanel.style.backgroundRepeat = "round round";

        //     if (this._textureScale.x != 1 || this._textureScale.y != 1)
        //     {
        //         this.nativePanel.style.backgroundSize = (this._textureScale.x * 100) + "% " + (this._textureScale.y * 100) + "%";
        //     }
        //     else
        //         this.nativePanel.style.backgroundSize = "auto";
                
        //     this.nativePanel.style.borderTopWidth = this._scale9Grid.top + "px";
        //     this.nativePanel.style.borderBottomWidth = this._scale9Grid.bottom + "px";
        //     this.nativePanel.style.borderLeftWidth = this._scale9Grid.left + "px";
        //     this.nativePanel.style.borderRightWidth = this._scale9Grid.right + "px";

        //     // if ((this._tileGridIndice & 0xF) != 0)
        //     //     this.nativePanel.style.backgroundRepeat = "repeat";
        //     // else
        //     //     this.nativePanel.style.backgroundRepeat = null;
        // }
        else {
            this.nativePanel.style.backgroundSize = "100% 100%";
            this.nativePanel.style.backgroundRepeat = "no-repeat";
        }
    }
}