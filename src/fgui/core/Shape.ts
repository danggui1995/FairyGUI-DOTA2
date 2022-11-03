import { UIElement } from "./UIElement";
import { Color } from "../math/Color";

export class Shape extends UIElement {
    public init() {
        super.init();

        this.initElement();
        this.setNotInteractable();
    }

    public drawRect(lineWidth: number, lineColor: Color, fillColor: Color) {
        this.setType(1);
        if (lineColor.a != 0)
            this.nativePanel.style.border = lineWidth + "px solid " + lineColor.toStyleString();
        else
            this.nativePanel.style.border = "";
        this._color = fillColor.getHex();
        if (fillColor.a != 0)
            this.nativePanel.style.backgroundColor = fillColor.toStyleString();
        else
            this.nativePanel.style.backgroundColor = "transparent";
    }

    public drawRoundRect(lineWidth: number, lineColor: Color, fillColor: Color,
        topLeftRadius: number, topRightRadius: number, bottomLeftRadius: number, bottomRightRadius: number) {
        this.setType(2);
        this.nativePanel.style.border = lineWidth + "px solid " + lineColor.toStyleString();
        this.nativePanel.style.borderRadius = topLeftRadius + "px " + topRightRadius + "px " + bottomRightRadius + "px " + bottomLeftRadius + "px";
        this._color = fillColor.getHex();
        if (fillColor.a != 0)
            this.nativePanel.style.backgroundColor = fillColor.toStyleString();
        else
            this.nativePanel.style.backgroundColor = "transparent";
    }

    public drawEllipse(lineWidth: number, lineColor: Color, fillColor: Color, startDegree?: number, endDegree?: number) {
        this.setType(3);
        this.nativePanel.style.border = lineWidth + "px solid " + lineColor.toStyleString();
        this.nativePanel.style.borderRadius = this._contentRect.width + "px / " + this._contentRect.height + "px";
        this._color = fillColor.getHex();
        if (fillColor.a != 0)
            this.nativePanel.style.backgroundColor = fillColor.toStyleString();
        else
            this.nativePanel.style.backgroundColor = "transparent";
    }

    public drawPolygon(points: Array<number>, fillColor: Color, lineWidth?: number, lineColor?: Color) {
        this.setType(4);
    }

    public drawRegularPolygon(sides: number, lineWidth: number, centerColor: Color, lineColor: Color,
        fillColor: Color, rotation: number, distances: Array<number>) {
        this.setType(5);
    }

    public clear() {
        this.setType(0);
    }

    protected onSizeChanged(): void {
        this.nativePanel.style.width = this._contentRect.width + "px";
        this.nativePanel.style.height = this._contentRect.height + "px";
    }
}