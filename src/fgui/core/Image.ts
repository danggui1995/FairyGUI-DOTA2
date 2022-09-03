import { FillMethod } from "../ui/FieldTypes";
import { UIElement } from "./UIElement";
import { Vec2 } from "../math/Vec2";
import { Margin, MarginType } from "../math/Margin";

export const GridStyleTemplate = new Map<string, any>([
    ["cornerStyle", {
        "background-size": `100%`,
        "background-repeat": `no-repeat`,
    }],
    ["horizontalBorderStyle", {
        "width": `100%`,
        "background-repeat": `repeat-x`,
    }],
    ["verticalBorderStyle", {
        "height": `100%`,
        "background-repeat": `repeat-y`,
    }],
    ["centerStyle", {
        "width": `100%`,
        "height": `100%`,
        "background-size": `100%`,
        "background-repeat": `repeat`,
    }]
]);

export const GridStyleParams : any[][] = [
    ["width", MarginType.W11, "height", MarginType.H11], ["margin-left", MarginType.W11, "margin-right", MarginType.W13, "height", MarginType.H12], ["width", MarginType.W13, "height", MarginType.H13],
    ["margin-top", MarginType.H11, "margin-bottom", MarginType.H31, "width", MarginType.W21], ["margin-left", MarginType.W12, "margin-right", MarginType.W32, "margin-top", MarginType.H12, "margin-bottom", MarginType.H32], ["margin-top", MarginType.H13, "margin-bottom", MarginType.H33, "width", MarginType.W23],
    ["width", MarginType.W31, "height", MarginType.H31], ["margin-left", MarginType.W11, "margin-right", MarginType.W33, "height", MarginType.H32], ["width", MarginType.W33, "height", MarginType.H33],
];

export const GridStyleMap : string[][] = [
    ["tl", "left top", "cornerStyle"],      ["tc", "center top", "horizontalBorderStyle"],        ["tr", "right top", "cornerStyle"],
    ["ml", "left center", "verticalBorderStyle"],   ["mc", "center center", "centerStyle"],     ["mr", "right center", "verticalBorderStyle"],
    ["bl", "left bottom", "cornerStyle"],   ["bc", "center bottom", "horizontalBorderStyle"],     ["br", "right bottom", "cornerStyle"],
];

export class Image extends UIElement {
    protected _src: string;
    protected _color: number;

    protected _scaleByTile: boolean;
    protected _scale9Grid: Margin;
    protected _scale9Panels : Panel[];

    protected _textureScale: Vec2;
    protected _tileGridIndice: number = 0;
    nativePanel : ImagePanel;

    constructor() {
        super();

        this._color = 0xFFFFFF;
        this._textureScale = new Vec2(1, 1);
        this._scale9Panels = [];

    }

    public init() {
        this.nativePanel = $.CreatePanel( "Image", $('#HiddenRoot'), this.$owner.name);
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
        
        if (this._scaleByTile) {
            if (this._textureScale.x != 1 || this._textureScale.y != 1)
                this.nativePanel.style.backgroundSize = (this._textureScale.x * 100) + "% " + (this._textureScale.y * 100) + "%";
            else
                this.nativePanel.style.backgroundSize = "auto";
            this.nativePanel.style.backgroundRepeat = "repeat";
            this.nativePanel.SetImage(this._src);
        }
        else if (this._scale9Grid) {
            this.nativePanel.style.backgroundRepeat = "no-repeat";

            if (this._textureScale.x != 1 || this._textureScale.y != 1)
            {
                this.nativePanel.style.backgroundSize = (this._textureScale.x * 100) + "% " + (this._textureScale.y * 100) + "%";
            }
            else
            {
                this.nativePanel.style.backgroundSize = "auto";
            }
                
            if (this._scale9Panels.length == 0)
            {
                var urlDir;
                var urlExt;
                var totalLen = this._src.length - 1;
                for(var i = totalLen; i >= 0; i--)
                {
                    if (this._src[i] == '.')
                    {
                        urlDir = this._src.substring(0, i);
                        urlExt = this._src.substring(i + 1, totalLen + 1);
                        break;
                    }
                }

                for(var i = 0; i < GridStyleMap.length; i++)
                {
                    var gridArray = GridStyleMap[i];
                    var gridPos = gridArray[0];
                    var gridAlign = gridArray[1];
                    var gridStyleName = gridArray[2];
                    var gridPath = `url('${urlDir}_${gridPos}.${urlExt}')`;
                    var styleType = GridStyleTemplate.get(gridStyleName);
                    var styleImplement : any = Object.assign({
                        "align": `${gridAlign}`,
                        "background-image": `${gridPath}`,
                    }, styleType);
 
                    var gridpanel = $.CreatePanel("Image", this.nativePanel, gridPos) as any;
                    for(const k in styleImplement)
                    {
                        gridpanel.style[k] = styleImplement[k];
                    }
                    var GridStyleParam = GridStyleParams[i];
                    for(var j = 0; j < GridStyleParam.length; j += 2)
                    {
                        var key = GridStyleParam[j];
                        var value = GridStyleParam[j + 1];
                        gridpanel.style[key] = this._scale9Grid.getMargin(value);
                    }
                    
                    this._scale9Panels.push(gridpanel);
                }
            }
        }
        else {
            this.nativePanel.style.backgroundSize = "100% 100%";
            this.nativePanel.style.backgroundRepeat = "no-repeat";
            this.nativePanel.SetImage(this._src);
        }
    }
}