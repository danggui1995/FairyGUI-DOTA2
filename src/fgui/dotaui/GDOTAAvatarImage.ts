import { DOTAAvatarImage } from "./DOTAAvatarImage";
import { GComponent } from "../ui/GComponent";

export class GDOTAAvatarImage extends GComponent {
    protected _element: DOTAAvatarImage;

    constructor(name ?: string) {
        super(name);
    }

    protected createElement(): void {
        this._element = new DOTAAvatarImage();
        this._element.$owner = this;
        this._element.init();
    }

    public get element(): DOTAAvatarImage {
        return this._element;
    }
}
