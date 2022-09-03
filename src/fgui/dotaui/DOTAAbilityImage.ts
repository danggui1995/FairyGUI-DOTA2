import { UIElement } from "../core/UIElement";

export class DOTAAbilityImage extends UIElement {
    private _abilityname: string;
    private _contextEntityIndex: AbilityEntityIndex;
    public nativePanel : AbilityImage;

    constructor() {
        super();
    }

    public init() {
        this.nativePanel = $.CreatePanel( "DOTAAbilityImage", $('#HiddenRoot'), this.$owner.name);
    }

    public get abilityname(): string {
        return this._abilityname;
    }

    public set abilityname(value: string) {
        if (this._abilityname != value) {
            this._abilityname = value;
            this.nativePanel.abilityname = value;
        }
    }

    public get contextEntityIndex(): AbilityEntityIndex {
        return this._contextEntityIndex;
    }
    public set contextEntityIndex(value: AbilityEntityIndex) {
        if (this._contextEntityIndex != value) {
            this._contextEntityIndex = value;
            this.nativePanel.contextEntityIndex = value;
        }
    }
}