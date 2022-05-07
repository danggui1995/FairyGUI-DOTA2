import { DOTAItemImage } from "./DOTAItemImage";
import { GComponent } from "../ui/GComponent";

export class GDOTAItemImage extends GComponent {
    protected _element: DOTAItemImage;

    constructor(name ?: string) {
        super(name);
    }

    protected createElement(): void {
        this._element = new DOTAItemImage();
        this._element.$owner = this;
        this._element.init();
    }

    public get element(): DOTAItemImage {
        return this._element;
    }
}
