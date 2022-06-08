import { convertToHtmlColor } from "../utils/ToolSet";
import { defaultParser } from "../utils/UBBParser";
import { UIElement } from "./UIElement";
import { TextFormat } from "./TextFormat";
import { UIConfig } from "../ui/UIConfig";

type InputElement = TextEntry;

export var isAnyEditing: boolean = false;

export class InputTextField extends UIElement {
    protected _promptText: string;
    protected _textFormat: TextFormat;
    protected _text: string;
    protected _singleLine: boolean;
    protected _password: boolean;

    private _input: InputElement;
    private _skipEvent : boolean;
    private _oldText : string;

    constructor() {
        super();

        this._textFormat = new TextFormat();
        this._text = "";

        this._singleLine = true;
    }

    public init() {
        super.init();

        this._input = $.CreatePanel( "TextEntry", $('#HiddenRoot'), this.$owner.panelName);
        if (this._singleLine) {
            this._input.style.whiteSpace = "nowrap";
        } else {
            this._input.style.whiteSpace = "normal";
        }
        this.nativePanel = this._input;


        this._input.SetPanelEvent('onfocus', function(){
            isAnyEditing = true; 
            // this.stage.setFocus(this, true);
        });

        this._input.SetPanelEvent('oncancel', function(){
            isAnyEditing = false;
        });

        this._input.SetPanelEvent('ontextentrychange', ()=>{
            if (this._skipEvent == true)
            {
                this._skipEvent = false;
                return;
            }
            this._text = this._input.text;
            this.$owner.emit("changed");
            // this.onTextUpdate();
        });

        this.onTextUpdate();
    }

    //处理密码类型的
    private onTextUpdate() : void
    {
        
        this._skipEvent = true;
        this._oldText = this._input.text;
        // if (this._password)
        // {
        //     var passstr = "";
        //     for (var i = 0; i < this._text.length; i++) {
        //         passstr += '*';
        //     }
        //     this._input.text = passstr;
        // }
        // else
        {
            this._input.text = this._text;
        }
    }

    public get textFormat(): TextFormat {
        return this._textFormat;
    }

    public applyFormat(): void {
        let fontName: string = this._textFormat.font;
        if (!fontName)
            fontName = UIConfig.defaultFont;

        if (this._textFormat.align != undefined)
            this._input.style.textAlign = this._textFormat.align;
        this._input.style.verticalAlign = this._textFormat.verticalAlign;
        this._input.style.fontSize = this._textFormat.size + "px";
        this._input.style.fontFamily = fontName;
        this._input.style.color = convertToHtmlColor(this._textFormat.color);
    }

    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        this._text = value;
        this.onTextUpdate();
    }

    public get singleLine(): boolean {
        return this._singleLine;
    }

    public set singleLine(value: boolean) {
        if (this._singleLine != value) {
            this._singleLine = value;

            // if (this._singleLine) {
            //     this.nativePanel.style.whiteSpace = "nowrap";
            // } else {
            //     this.nativePanel.style.whiteSpace = "normal";
            // }
        }
    }

    protected updateTouchableFlag(): void {
        super.updateTouchableFlag();

        // if (isAnyEditing)
        //     this._input.setSelectionRange(0, 0);
        // this._input.disabled = this.nativePanel.style.pointerEvents == "none";
    }

    public setPromptText(value: string) {
        this._input.placeholder = defaultParser.parse(value, true);
    }

    public setMaxLength(value: number) {
        if (value > 0)
            this._input.SetMaxChars(value);
    }

    public setKeyboardType(keyboardType: string) {
    }

    public setRestrict(value: string) {
    }

    public get editable(): boolean {
        // return !this._input.readOnly;
        return true;
    }

    public set editable(value: boolean) {
        // this._input.readOnly = !value;
    }

    public get password(): boolean {
        return this._password;
    }

    public set password(value: boolean) {
        if (this._password != value) {
            this._password = value;
            this.onTextUpdate();
        }
    }

    public setSelection(start: number, end: number): void {
        // this._input.setSelectionRange(start, end);
    }
}
