import { AutoSizeType } from "../ui/FieldTypes";
import { UIConfig } from "../ui/UIConfig";
import { convertToHtmlColor } from "../utils/ToolSet";
import { UIElement } from "./UIElement";
import { TextFormat } from "./TextFormat";
import { Vec2 } from "../math/Vec2";
import { Timers } from "../FairyGUI";


class MeasureTup
{
    public span : Panel;
    public label : LabelPanel;

    constructor(panel : Panel)
    {
        this.span = panel;
        this.label = panel.FindChild('Label') as LabelPanel;
    }
}

//在main.xml有snippet可供加载   坑bV蛇，要下一帧才能知道大小
class MeasurePool{
    private static _poolItems : MeasureTup[] = [];
    private static _index : number = 0;
    private static maxCntInPool : number = 10;
    private static needUpdate : boolean = true;

    public static Get() : MeasureTup
    {
        if (this.needUpdate == true && this._poolItems.length > this.maxCntInPool)
        {
            this.needUpdate = false;
            Timers.add(5, -1, this.CheckPool, this);
        }
        if (this._poolItems.length > 0)
        {
            var tup = this._poolItems.pop();
            tup.span.visible = true;
            return tup;
        }
        else
        {
            var panel = $.CreatePanel('Panel', $('#MeasureRoot'), "MeasurePool" + this._index);
            panel.BLoadLayoutSnippet("TextMeasure");
            var tup : MeasureTup = new MeasureTup(panel);
            this._index ++;
            return tup;
        }
    }

    private static CheckPool()
    {
        var len = this._poolItems.length;
        if (len > this.maxCntInPool)
        {
            for(var i = len; i >= this.maxCntInPool; i--)
            {
                var nativePanel = this._poolItems.pop();
                nativePanel.span.DeleteAsync(0);
            }
        }
    }

    public static Back(tup : MeasureTup)
    {
        this._poolItems.push(tup);
        tup.span.visible = false;
    }
}

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

    private _scheduleId : boolean;
    private _lastHeight : number;
    private _measureTup : MeasureTup;

    public _label_style_fontSize : any;
    public _label_style_fontFamily : any;
    public _label_style_lineHeight : any;
    public _label_style_fontWeight : any;
    public _label_style_fontStyle : any;
    public _label_style_textDecoration : any;
    public _label_style_textAlign : any;

    private _measureCount : number = 0;

    constructor() {
        super();

        this._textFormat = new TextFormat();
        this._text = "";
        this._textSize = new Vec2();
        this._scheduleId = false;
    }

    public init() {
        super.init();

        this._label = $.CreatePanel( "Label", $('#HiddenRoot'), this.$owner.panelName);
        this.nativePanel = this._label;
    }

    private clearPool()
    {
        this._scheduleId = false;
        MeasurePool.Back(this._measureTup);
        this._measureTup = null;
        Timers.remove(this.delayUpdate, this);
    }

    private delayUpdate() : void
    {
        if (!this._label.IsValid()) {
            this.clearPool();
            return;
        }

        this._measureCount ++ ;
        if (this._measureCount > 3)
        {
            //超过3次就不继续了  防止死循环
            this.clearPool();
            return;
        }
        var height = Math.floor(this._measureTup.span.contentheight / this._measureTup.span.actualuiscale_y);
        if (this._lastHeight == height)
        {
            return;
        }

        var width = this._measureTup.span.contentwidth / this._measureTup.span.actualuiscale_x;
        this._lastHeight = height;
        this.clearPool();
        
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

        this._label.style.width = this._contentRect.width + "px";
        if (this._textFormat.verticalAlign == "top")
            this._label.style.paddingTop = "0px";
        else if (this._textFormat.verticalAlign == "middle")
            this._label.style.paddingTop = Math.max(0, Math.floor((this._contentRect.height - this._textSize.y) * 0.5)) + "px";
        else
            this._label.style.paddingTop = Math.max(0, this._contentRect.height - this._textSize.y) + "px";

        this._updatingSize = false;
    }

    public get textFormat(): TextFormat {
        return this._textFormat;
    }

    public applyFormat(): void {
        let fontName: string = this._textFormat.font;
        if (!fontName)
            fontName = UIConfig.defaultFont;
        this._label.style.color = convertToHtmlColor(this._textFormat.color);

        this._label_style_fontSize = this._textFormat.size + "px";
        this._label_style_fontFamily = fontName;
        this._label_style_lineHeight = (this._textFormat.size + this._textFormat.lineSpacing) + "px";
        this._label_style_fontWeight = this._textFormat.bold ? "bold" : "normal";
        this._label_style_fontStyle = this._textFormat.italic ? "italic" : "normal";
        this._label_style_textDecoration = this._textFormat.underline ? "underline" : "none";
        this._label_style_textAlign = (this._textFormat.align == undefined) ? null : this._textFormat.align;// 对于中文和Localize的文本有效  直接设置一堆字符是不支持的

        this._label.style.fontSize = this._label_style_fontSize;
        this._label.style.fontFamily = this._label_style_fontFamily;
        this._label.style.lineHeight = this._label_style_lineHeight;
        this._label.style.fontWeight = this._label_style_fontWeight;
        this._label.style.fontStyle = this._label_style_fontStyle;
        this._label.style.textDecoration = this._label_style_textDecoration;
        this._label.style.textAlign = this._label_style_textAlign;

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

        if (this._measureTup == null)
        {
            this._measureTup = MeasurePool.Get();
        }

        this._measureTup.label.style.overflow = this._label.style.overflow;
        this._measureTup.label.style.textOverflow = this._label.style.textOverflow;
        this._measureTup.label.style.width = this._label.style.width;
        // this._measureTup.label.style.height = this._label.style.height;
        this._measureTup.label.style.fontSize = this._label_style_fontSize;
        this._measureTup.label.style.fontFamily = this._label_style_fontFamily;
        this._measureTup.label.style.lineHeight = this._label_style_lineHeight;
        this._measureTup.label.style.fontWeight = this._label_style_fontWeight;
        this._measureTup.label.style.fontStyle = this._label_style_fontStyle;
        this._measureTup.label.style.textDecoration = this._label_style_textDecoration;
        this._measureTup.label.style.textAlign = this._label_style_textAlign;
        this._measureTup.label.html = this._html;
        this._measureTup.label.text = this.text;
        
        if (this._scheduleId == false)
        {
            this._scheduleId = true;
            Timers.add(50, -1, this.delayUpdate, this);
        }
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
                this._label.style.overflow = "noclip";
            }
            else if (this._autoSize == AutoSizeType.Height) {
                this._label.style.overflow = "noclip";
            }
            else
                this._label.style.overflow = "clip";

            if (this._autoSize == AutoSizeType.Ellipsis)
                this._label.style.textOverflow = "ellipsis";
            else if(this._autoSize == AutoSizeType.Shrink)
                this._label.style.textOverflow = "shrink";
            else
                this._label.style.textOverflow = "clip";
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

    protected onSizeChanged() {
        super.onSizeChanged();

        if (!this._updatingSize) {
            if (this._autoSize != AutoSizeType.Both) {
                this._label.style.maxWidth = this._contentRect.width + "px";
                this._label.style.width = this._contentRect.width + "px";
            }
        }
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