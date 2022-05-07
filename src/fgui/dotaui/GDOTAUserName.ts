import { DOTAUserName } from "./DOTAUserName";
import { GComponent } from "../ui/GComponent";

export class GDOTAUserName extends GComponent {
    protected _element: DOTAUserName;

    constructor(name ?: string) {
        super(name);
    }

    protected createElement(): void {
        this._element = new DOTAUserName();
        this._element.$owner = this;
        this._element.init();
    }

    public get element(): DOTAUserName {
        return this._element;
    }
}
