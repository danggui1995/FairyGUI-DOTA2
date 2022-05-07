import { DOTAAbilityImage } from "./DOTAAbilityImage";
import { GComponent } from "../ui/GComponent";

export class GDOTAAbilityImage extends GComponent {
    protected _element: DOTAAbilityImage;

    constructor(name ?: string) {
        super(name);
    }

    protected createElement(): void {
        this._element = new DOTAAbilityImage();
        this._element.$owner = this;
        this._element.init();
    }

    public get element(): DOTAAbilityImage {
        return this._element;
    }
}
