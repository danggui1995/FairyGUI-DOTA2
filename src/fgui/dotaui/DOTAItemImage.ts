import { UIElement } from "../core/UIElement";

export class DOTAItemImage extends UIElement {
    private _itemname: string;
    private _contextEntityIndex: ItemEntityIndex;
    public nativePanel: ItemImage;
    constructor() {
        super();
    }

    public init() {
        this.nativePanel = $.CreatePanel( "DOTAItemImage", $('#HiddenRoot'), this.$owner.panelName);
    }

    public get itemname(): string {
        return this._itemname;
    }

    public set itemname(value: string) {
        if (this._itemname != value) {
            this._itemname = value;
            this.nativePanel.itemname = value;
        }
    }

    public get contextEntityIndex(): ItemEntityIndex {
        return this._contextEntityIndex;
    }
    public set contextEntityIndex(value: ItemEntityIndex) {
        if (this._contextEntityIndex != value) {
            this._contextEntityIndex = value;
            this.nativePanel.contextEntityIndex = value;
        }
    }
}