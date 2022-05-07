import { DOTAScenePanel } from "./DOTAScenePanel";
import { GComponent } from "../ui/GComponent";

export class GDOTAScenePanel extends GComponent {
    protected _element: DOTAScenePanel;

    constructor(name ?: string) {
        super(name);
    }

    protected createElement(): void {
        this._element = new DOTAScenePanel();
        this._element.$owner = this;
        this._element.init();
    }

    public get element(): DOTAScenePanel {
        return this._element;
    }
}
