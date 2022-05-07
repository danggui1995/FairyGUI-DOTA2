import { UIElement } from "../core/UIElement";

export class DOTAAvatarImage extends UIElement {
    /**
     * 64-bit Steam ID number.
     */
    private _steamid: string;
    /**
     * 32-bit Steam ID number.
     */
    private _accountid: string;
    public nativePanel : AvatarImage;

    constructor() {
        super();
    }

    public init() {
        this.nativePanel = $.CreatePanel( "DOTAAvatarImage", $('#HiddenRoot'), this.$owner.panelName);
    }

    public SetAccountID(accountid: number): void
    {
        this.nativePanel.SetAccountID(accountid);
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