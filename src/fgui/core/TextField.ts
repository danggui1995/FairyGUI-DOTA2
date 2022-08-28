import { AutoSizeType } from "../ui/FieldTypes";
import { UIConfig } from "../ui/UIConfig";
import { convertToHtmlColor } from "../utils/ToolSet";
import { UIElement } from "./UIElement";
import { TextFormat } from "./TextFormat";
import { Vec2 } from "../math/Vec2";

export class TextField extends UIElement {
    protected _textFormat: TextFormat;
    protected _text: string;
    protected _autoSize: AutoSizeType;
    protected _singleLine: boolean;
    protected _html: boolean;
    protected _maxWidth: number = 0;
    protected _updatingSize: boolean;
    protected _textSize: Vec2;
    protected _layoutStyleChanged: boolean = true;
    protected _label : LabelPanel;
    protected _container : Panel;
    protected _delayUpdateFunc : any;

    constructor() {
        super();

        this._textFormat = new TextFormat();
        this._text = "";
        this._textSize = new Vec2();
        this._delayUpdateFunc = ()=>{
            this.DelayUpdate();
        };
    }

    public init() {
        super.init();

        this._container = $.CreatePanel( "Panel", $('#HiddenRoot'), this.$owner.panelName);
        this._label = $.CreatePanel( "Label", this._container, this.$owner.panelName);
        this.nativePanel = this._container;
    }

    public get textFormat(): TextFormat {
        return this._textFormat;
    }

    public applyFormat(): void {
        let fontName: string = this._textFormat.font;
        if (!fontName)
            fontName = UIConfig.defaultFont;
        this._label.style.color = convertToHtmlColor(this._textFormat.color);

        this._label.style.fontSize = this._textFormat.size + "px";
        this._label.style.fontFamily = fontName;
        this._label.style.fontWeight = this._textFormat.bold ? "bold" : "normal";
        this._label.style.fontStyle = this._textFormat.italic ? "italic" : "normal";
        this._label.style.textDecoration = this._textFormat.underline ? "underline" : "none";
        if (this._textFormat.align != undefined)
        {
            this._label.style.textAlign = this._textFormat.align;
        }
        if (this._textFormat.verticalAlign != undefined)
        {
            this._label.style.verticalAlign = this._textFormat.verticalAlign;
        }

        // 其实不是正宗的描边
        if (this._textFormat.outline > 0)
        {
            var arr = [];
            for(var i = 0; i< 3;i++)
            {
                arr.push(this._textFormat.outline + "px");
            }
            arr.push(this._textFormat.outline);
            arr.push(convertToHtmlColor(this._textFormat.outlineColor));
            
            this._label.style.textShadow = arr.join(' ');
        }
        else
            this._label.style.boxShadow = null;
    }

    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        if (!this._layoutStyleChanged && this._text.length < 20 && this._text == value && !this._html)
            return;

        this._text = value;
        this._html = false;
        this.applyText();
    }

    public get htmlText(): string {
        return this._text;
    }

    public set htmlText(value: string) {
        if (this._text.length < 20 && this._text == value && this._html)
            return;

        this._text = value;
        this._html = true;
        this.applyText();
    }

    private applyText(): void {
        
        this._updatingSize = true;
        let tmpChangWrapping: boolean;
        if (this._autoSize == AutoSizeType.Both) {
            this._label.style.width = null;

            if (this._maxWidth > 0) {
                this.updateWrapping();
                tmpChangWrapping = true;
            }
        }

        this._label.html = this._html;
        this._label.text = this.text;
        
        if (tmpChangWrapping && this._contentRect.width > this._maxWidth) {
            this._label.style.width = this._maxWidth + "px";
            this.updateWrapping(true);
        }

        $.Schedule(0.01, this._delayUpdateFunc);
    }

    public DelayUpdate(): void
    {
        if (!this._label.IsSizeValid())
        {
            $.Schedule(0.01, this._delayUpdateFunc);
            return;
        }
        var height = Math.floor(this._label.contentheight / this._label.actualuiscale_y);
        var width = Math.floor(this._label.contentwidth / this._label.actualuiscale_x);
        
        this._textSize.set(width, height);
        if (this._autoSize == AutoSizeType.Both) {
            this._contentRect.width = this._textSize.x;
            this._contentRect.height = this._textSize.y;
            if (this.$owner)
                this.$owner.setSize(this._textSize.x, this._textSize.y);
        }
        else if (this._autoSize == AutoSizeType.Height) {
            this._contentRect.height = this._textSize.y;
            if (this.$owner)
                this.$owner.height = this._textSize.y;
        }

        this._container.style.width = this._contentRect.width + "px";
        this._updatingSize = false;
    }

    public get autoSize(): AutoSizeType {
        return this._autoSize;
    }

    public set autoSize(value: AutoSizeType) {
        if (this._autoSize != value) {
            this._autoSize = value;
            this.updateWrapping();

            if (this._autoSize == AutoSizeType.Both) {
                this._label.style.width = null;
                this._label.style.textOverflow = "noclip";
            }
            else if (this._autoSize == AutoSizeType.Height) {
                this._label.style.textOverflow = "noclip";
            }
            else if (this._autoSize == AutoSizeType.Ellipsis)
                this._label.style.textOverflow = "ellipsis";
            else if(this._autoSize == AutoSizeType.Shrink)
                this._label.style.textOverflow = "shrink";
            else
                this._label.style.textOverflow = null;
        }
    }

    public get singleLine(): boolean {
        return this._singleLine;
    }

    public set singleLine(value: boolean) {
        if (this._singleLine != value) {
            this._singleLine = value;
            this.updateWrapping();
        }
    }

    public get maxWidth(): number {
        return this._maxWidth;
    }

    public set maxWidth(value: number) {
        if (this._maxWidth != value) {
            this._maxWidth = value;
        }
    }

    public get textWidth(): number {
        return this._textSize.x;
    }

    private updateWrapping(forceWrap?: boolean) {
        if ((this._autoSize == AutoSizeType.Both || this._singleLine) && !forceWrap) {
            this._label.style.whiteSpace = "nowrap";
        }
        else {
            this._label.style.whiteSpace = "normal";
        }
    }
}