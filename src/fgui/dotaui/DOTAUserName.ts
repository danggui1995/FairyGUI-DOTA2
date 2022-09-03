import { UIElement } from "../core/UIElement";

export class DOTAUserName extends UIElement {
    private _steamid: string;
    private _accountid: string;
    public nativePanel: UserName;
    constructor() {
        super();
    }

    public init() {
        this.nativePanel = $.CreatePanel( "DOTAUserName", $('#HiddenRoot'), this.$owner.name);
    }

    public get steamid(): string {
        return this._steamid;
    }

    public set steamid(value: string) {
        if (this._steamid != value) {
            this._steamid = value;
            this.nativePanel.steamid = value;
        }
    }

    public get accountid(): string {
        return this._accountid;
    }
    public set accountid(value: string) {
        if (this._accountid != value) {
            this._accountid = value;
            this.nativePanel.accountid = value;
        }
    }
}