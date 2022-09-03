import { UIElement } from "../core/UIElement";

export class DOTAHeroImage extends UIElement {
    private _heroid: HeroID;
    private _heroname: string;
    private _heroimagestyle: 'icon' | 'portrait' | 'landscape';
    public nativePanel: HeroImage;
    constructor() {
        super();
    }

    public init() {
        this.nativePanel = $.CreatePanel( "DOTAHeroImage", $('#HiddenRoot'), this.$owner.name);
    }

    public get heroid(): HeroID {
        return this._heroid;
    }

    public set heroid(value: HeroID) {
        if (this._heroid != value) {
            this._heroid = value;
            this.nativePanel.heroid = value;
        }
    }

    public get heroname(): string {
        return this._heroname;
    }
    public set heroname(value: string) {
        if (this._heroname != value) {
            this._heroname = value;
            this.nativePanel.heroname = value;
        }
    }

    public get heroimagestyle(): 'icon' | 'portrait' | 'landscape' {
        return this._heroimagestyle;
    }
    public set heroimagestyle(value: 'icon' | 'portrait' | 'landscape') {
        if (this._heroimagestyle != value) {
            this._heroimagestyle = value;
            this.nativePanel.heroimagestyle = value;
        }
    }
}