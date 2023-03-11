import { DOTAScenePanel } from "./DOTAScenePanel";
import { GComponent } from "../ui/GComponent";

export class GDOTAEffectPanel extends GComponent {
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

    public GetNativePanel(): Panel
    {
        return this._element.effectPanel;
    }
}
