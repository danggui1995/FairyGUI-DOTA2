import { DOTAHeroImage } from "./DOTAHeroImage";
import { GComponent } from "../ui/GComponent";

export class GDOTAHeroImage extends GComponent {
    protected _element: DOTAHeroImage;

    constructor(name ?: string) {
        super(name);
    }

    protected createElement(): void {
        this._element = new DOTAHeroImage();
        this._element.$owner = this;
        this._element.init();
    }

    public get element(): DOTAHeroImage {
        return this._element;
    }
}
