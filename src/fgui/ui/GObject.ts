import { UIElement } from "../core/UIElement";
import { EventType } from "../event/Event";
import { EventDispatcher } from "../event/EventDispatcher";
import { GearAnimation } from "../gears/GearAnimation";
import { GearBase } from "../gears/GearBase";
import { GearColor } from "../gears/GearColor";
import { GearDisplay } from "../gears/GearDisplay";
import { GearDisplay2 } from "../gears/GearDisplay2";
import { GearFontSize } from "../gears/GearFontSize";
import { GearIcon } from "../gears/GearIcon";
import { GearLook } from "../gears/GearLook";
import { GearSize } from "../gears/GearSize";
import { GearText } from "../gears/GearText";
import { GearXY } from "../gears/GearXY";
import { Rect } from "../math/Rect";
import { Vec2 } from "../math/Vec2";
import { ByteBuffer } from "../utils/ByteBuffer";
import { Controller } from "./Controller";
import { ObjectPropID, RelationType } from "./FieldTypes";
import { GComponent } from "./GComponent";
import { GGroup } from "./GGroup";
import { GTreeNode } from "./GTreeNode";
import { PackageItem } from "./PackageItem";
import { Relations } from "./Relations";
import { UIConfig } from "./UIConfig";

export const PanelEventSet = new Set<string>([
    "onactivate",
    "oncancel",
    "oncontextmenu",
    "ondblclick",
    "ondeselect",
    "oneconsetloaded",
    "onfilled",
    "onfindmatchend",
    "onfindmatchstart",
    "onfocus",
    "onblur",
    "ondescendantfocus",
    "ondescendantblur",
    "oninputsubmit",
    "onload",
    "onmouseactivate",
    "onmouseout",
    "onmouseover",
    "onmousemove",
    "onmovedown",
    "onmoveleft",
    "onmoveright",
    "onmoveup",
    "onnotfilled",
    "onpagesetupsuccess",
    "onpopupsdismissed",
    "onselect",
    "ontabforward",
    "ontabbackward",
    "ontextentrychange",
    "ontextentrysubmit",
    "onscrolledtobottom",
    "onscrolledtorightedge",
    "ontooltiploaded",
    "onvaluechanged"
]);

export const MouseOverStyle = "TouchHolder";

export class GObject extends EventDispatcher {
    public data?: any;
    public packageItem?: PackageItem;
    public static draggingObject: GObject;
    private static s_AllUpdateObj : Set<GObject>;
    public static mouseCallback ?: Function;

    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private _alpha: number = 1;
    private _visible: boolean = true;
    private _touchable: boolean = true;
    private _grayed: boolean;
    private _draggable: boolean;
    private _scaleX: number = 1;
    private _scaleY: number = 1;
    private _skewX: number = 0;
    private _skewY: number = 0;
    private _pivotX: number = 0;
    private _pivotY: number = 0;
    private _pivotStr : string;
    private _pivotAsAnchor: boolean;
    private _sortingOrder: number = 0;
    private _internalVisible: boolean = true;
    private _handlingController?: boolean;
    private _tooltips: string;
    private _updateRegisted : boolean;

    private _relations: Relations;
    private _group: GGroup;
    private _gears: GearBase[];

    protected _element?: UIElement;

    public minWidth: number = 0;
    public minHeight: number = 0;
    public maxWidth: number = 0;
    public maxHeight: number = 0;
    public sourceWidth: number = 0;
    public sourceHeight: number = 0;
    public initWidth: number = 0;
    public initHeight: number = 0;

    /** @internal */
    public _parent: GComponent;
    /** @internal */
    public _width: number = 0;
    /** @internal */
    public _height: number = 0;
    /** @internal */
    public _rawWidth: number = 0;
    /** @internal */
    public _rawHeight: number = 0;
    /** @internal */
    public _id: string;
    /** @internal */
    public _name: string;
    /** @internal */
    public _underConstruct: boolean;
    /** @internal */
    public _gearLocked: boolean;
    /** @internal */
    public _sizePercentInGroup: number = 0;
    /** @internal */
    public _treeNode?: GTreeNode;

    
    public panelName : string;
    public touchAction : 0 | 1;
    
    constructor(name ?: string) {
        super();
        this._id = "" + gInstanceCounter++;
        this._name = "";
        
        this.panelName = name;

        this.createElement();
        this._element.$owner = this;

        this._relations = new Relations(this);
        this._gears = new Array<GearBase>(10);
        this.touchAction = 0;
        this._updateRegisted = false;
        this._pivotStr = "0% 0%";
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this.setPosition(value, this._y);
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this.setPosition(this._x, value);
    }

    public get z(): number {
        return this._z;
    }

    public set z(value: number) {
        this.setPosition(this._x, this._y, value);
    }

    public setPosition(xv: number, yv: number, zv?: number): void {
        if (this._x != xv || this._y != yv) {
            var dx: number = xv - this._x;
            var dy: number = yv - this._y;
            this._x = xv;
            this._y = yv;
            if (zv != null)
                this._z = zv;

            this.handlePositionChanged();
            if (this instanceof GGroup)
                this.moveChildren(dx, dy);

            this.updateGear(1);

            if (this._parent && !("setVirtual" in this._parent)/*not list*/) {
                this._parent.setBoundsChangedFlag();
                if (this._group)
                    this._group.setBoundsChangedFlag(true);
                this.emit.call(this, "pos_changed");
            }
        }
    }

    public get xMin(): number {
        return this._pivotAsAnchor ? (this._x - this._width * this._pivotX) : this._x;
    }

    public set xMin(value: number) {
        if (this._pivotAsAnchor)
            this.setPosition(value + this._width * this._pivotX, this._y);
        else
            this.setPosition(value, this._y);
    }

    public get yMin(): number {
        return this._pivotAsAnchor ? (this._y - this._height * this._pivotY) : this._y;
    }

    public set yMin(value: number) {
        if (this._pivotAsAnchor)
            this.setPosition(this._x, value + this._height * this._pivotY);
        else
            this.setPosition(this._x, value);
    }

    public center(restraint?: boolean): void {
        var r: GComponent = this._parent;

        this.setPosition(Math.floor((r.width - this.width) / 2), Math.floor((r.height - this.height) / 2));
        if (restraint) {
            this.addRelation(r, RelationType.Center_Center);
            this.addRelation(r, RelationType.Middle_Middle);
        }
    }

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        this.setSize(value, this._rawHeight);
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        this.setSize(this._rawWidth, value);
    }

    public setFullScreen()
    {
        var radio = $.UIObjectFactory.getAspectRadio();
        this.width = Game.GetScreenWidth() * radio;
        this.height = Game.GetScreenHeight() * radio;
    }

    public setSize(wv: number, hv: number, ignorePivot?: boolean): void {
        if (this._rawWidth != wv || this._rawHeight != hv) {
            this._rawWidth = wv;
            this._rawHeight = hv;
            if (wv < this.minWidth)
                wv = this.minWidth;
            if (hv < this.minHeight)
                hv = this.minHeight;
            if (this.maxWidth > 0 && wv > this.maxWidth)
                wv = this.maxWidth;
            if (this.maxHeight > 0 && hv > this.maxHeight)
                hv = this.maxHeight;
            var dWidth: number = wv - this._width;
            var dHeight: number = hv - this._height;
            this._width = wv;
            this._height = hv;

            this.handleSizeChanged();
            if (this._pivotX != 0 || this._pivotY != 0) {
                if (!this._pivotAsAnchor) {
                    if (!ignorePivot)
                        this.setPosition(this.x - this._pivotX * dWidth, this.y - this._pivotY * dHeight);
                    else
                        this.handlePositionChanged();
                }
                else
                    this.handlePositionChanged();
            }

            if (this instanceof GGroup)
                this.resizeChildren(dWidth, dHeight);

            this.updateGear(2);

            if (this._parent) {
                this._relations.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !ignorePivot);
                this._parent.setBoundsChangedFlag();
                if (this._group)
                    this._group.setBoundsChangedFlag();
            }

            this.emit.call(this, "size_changed");
        }
    }

    protected setSizeDirectly(wv: number, hv: number) {
        this._rawWidth = wv;
        this._rawHeight = hv;
        if (wv < 0)
            wv = 0;
        if (hv < 0)
            hv = 0;
        this._width = wv;
        this._height = hv;
    }

    public get actualWidth(): number {
        return this.width * Math.abs(this._scaleX);
    }

    public get actualHeight(): number {
        return this.height * Math.abs(this._scaleY);
    }

    public get scaleX(): number {
        return this._scaleX;
    }

    public set scaleX(value: number) {
        this.setScale(value, this._scaleY);
    }

    public get scaleY(): number {
        return this._scaleY;
    }

    public set scaleY(value: number) {
        this.setScale(this._scaleX, value);
    }

    public setScale(sx: number, sy: number): void {
        if (this._scaleX != sx || this._scaleY != sy) {
            this._scaleX = sx;
            this._scaleY = sy;
            this.handleScaleChanged();

            this.updateGear(2);
        }
    }

    public get skewX(): number {
        return this._skewX;
    }

    public set skewX(value: number) {
        this.setSkew(value, this._skewY);
    }

    public get skewY(): number {
        return this._skewY;
    }

    public set skewY(value: number) {
        this.setSkew(this._skewX, value);
    }

    public setSkew(sx: number, sy: number): void {
        if (this._skewX != sx || this._skewY != sy) {
            this._skewX = sx;
            this._skewY = sy;
            //todo skew 好像没啥实现的必要
        }
    }

    public get pivotX(): number {
        return this._pivotX;
    }

    public set pivotX(value: number) {
        this.setPivot(value, this._pivotY);
    }

    public get pivotY(): number {
        return this._pivotY;
    }

    public set pivotY(value: number) {
        this.setPivot(this._pivotX, value);
    }

    public setPivot(xv: number, yv: number, asAnchor?: boolean): void {
        asAnchor = asAnchor || false;
        if (this._pivotX != xv || this._pivotY != yv || this._pivotAsAnchor != asAnchor) {
            this._pivotX = xv;
            this._pivotY = yv;
            this._pivotAsAnchor = asAnchor;
            this._pivotStr = `${xv * 100}% ${yv * 100}%`;
            this._element.setPivot(xv, yv);
            this.handlePositionChanged();
        }
    }

    public getPivotPercent(): string
    {
        return this._pivotStr;
    }

    public get pivotAsAnchor(): boolean {
        return this._pivotAsAnchor;
    }

    public get touchable(): boolean {
        return this._touchable;
    }

    public set touchable(value: boolean) {
        if (this._touchable != value) {
            this._touchable = value;
            this.handleTouchableChanged();
            this.updateGear(3);
        }
    }

    public get grayed(): boolean {
        return this._grayed;
    }

    public set grayed(value: boolean) {
        if (this._grayed != value) {
            this._grayed = value;
            this.handleGrayedChanged();
            this.updateGear(3);
        }
    }

    public get enabled(): boolean {
        return !this._grayed && this._touchable;
    }

    public set enabled(value: boolean) {
        this.grayed = !value;
        this.touchable = value;
    }

    public get rotation(): number {
        return this._element.rotation;
    }

    public set rotation(value: number) {
        if (this._element.rotation != value) {
            this._element.rotation = value;
            this.updateGear(3);
        }
    }

    public get alpha(): number {
        return this._alpha;
    }

    public set alpha(value: number) {
        if (this._alpha != value) {
            this._alpha = value;
            this.handleAlphaChanged();
            this.updateGear(3);
        }
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        if (this._visible != value) {
            this._visible = value;
            this.handleVisibleChanged();
            if (this._parent)
                this._parent.setBoundsChangedFlag();
            if (this._group && this._group.excludeInvisibles)
                this._group.setBoundsChangedFlag();
        }
    }

    public get internalVisible(): boolean {
        return this._internalVisible && (!this._group || this._group.internalVisible);
    }

    public get internalVisible2(): boolean {
        return this._visible && (!this._group || this._group.internalVisible2);
    }

    public get internalVisible3(): boolean {
        return this._internalVisible && this._visible;
    }

    public get sortingOrder(): number {
        return this._sortingOrder;
    }

    public set sortingOrder(value: number) {
        if (value < 0)
            value = 0;
        if (this._sortingOrder != value) {
            var old: number = this._sortingOrder;
            this._sortingOrder = value;
            if (this._parent)
                this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
        }
    }
    
    public get focusable(): boolean {
        return this._element.focusable;
    }

    public set focusable(value: boolean) {
        this._element.focusable = value;
    }

    public get tabStop(): boolean {
        return this._element.tabStop;
    }

    public set tabStop(value: boolean) {
        this._element.tabStop = value;
    }

    public get focused(): boolean {
        return this._element.focused;
    }

    public requestFocus(byKey?: boolean) {
        if (this.onStage)
            this._element.stage.setFocus(this._element, byKey);
    }

    public get cursor(): string {
        return this._element.cursor;
    }

    public set cursor(value: string) {
        this._element.cursor = value;
    }

    public get onStage(): boolean {
        return this._element.onStage;
    }

    public get resourceURL(): string {
        if (this.packageItem)
            return UIConfig.ouputDir + this.packageItem.owner.name + "/" + this.packageItem.owner.id + this.packageItem.id;
        else
            return null;
    }

    public set group(value: GGroup) {
        if (this._group != value) {
            if (this._group)
                this._group.setBoundsChangedFlag();
            this._group = value;
            if (this._group)
                this._group.setBoundsChangedFlag();
        }
    }

    public get group(): GGroup {
        return this._group;
    }

    public getGear(index: number): GearBase {
        var gear: GearBase = this._gears[index];
        if (gear == null)
            this._gears[index] = gear = createGear(this, index);
        return gear;
    }

    protected updateGear(index: number): void {
        if (this._underConstruct || this._gearLocked)
            return;
        var gear: GearBase = this._gears[index];
        if (gear && gear.controller)
            gear.updateState();
    }

    public checkGearController(index: number, c: Controller): boolean {
        return this._gears[index] && this._gears[index].controller == c;
    }

    public updateGearFromRelations(index: number, dx: number, dy: number): void {
        if (this._gears[index])
            this._gears[index].updateFromRelations(dx, dy);
    }

    public addDisplayLock(): number {
        var gearDisplay: GearDisplay = <GearDisplay>(this._gears[0]);
        if (gearDisplay && gearDisplay.controller) {
            var ret: number = gearDisplay.addLock();
            this.checkGearDisplay();

            return ret;
        }
        else
            return 0;
    }

    public releaseDisplayLock(token: number): void {
        var gearDisplay: GearDisplay = <GearDisplay>(this._gears[0]);
        if (gearDisplay && gearDisplay.controller) {
            gearDisplay.releaseLock(token);
            this.checkGearDisplay();
        }
    }

    private checkGearDisplay(): void {
        if (this._handlingController)
            return;

        var connected: boolean = this._gears[0] == null || (<GearDisplay>(this._gears[0])).connected;
        if (this._gears[8])
            connected = (<GearDisplay2>this._gears[8]).evaluate(connected);

        if (connected != this._internalVisible) {
            this._internalVisible = connected;
            if (this._parent) {
                this._parent.childStateChanged(this);
                if (this._group && this._group.excludeInvisibles)
                    this._group.setBoundsChangedFlag();
            }
        }
    }

    public get relations(): Relations {
        return this._relations;
    }

    public addRelation(target: GObject, relationType: number, usePercent?: boolean): void {
        this._relations.add(target, relationType, usePercent);
    }

    public removeRelation(target: GObject, relationType: number): void {
        this._relations.remove(target, relationType);
    }

    public get element(): UIElement {
        return this._element;
    }

    public get parent(): GComponent {
        return this._parent;
    }

    public set parent(val: GComponent) {
        this._parent = val;
    }

    public removeFromParent(dispose ?: boolean): void {
        if (this._parent)
        {
            this._parent.removeChild(this, dispose);
        }
        else
        {
            //已经被移除过了 直接native delete
            if (dispose)
            {
                this.dispose();
            }
        }
    }

    public get asCom(): GComponent {
        return <GComponent><any>this;
    }

    public get text(): string {
        return null;
    }

    public set text(value: string) {
    }

    public get icon(): string {
        return null;
    }

    public set icon(value: string) {
    }

    public get treeNode(): GTreeNode {
        return this._treeNode;
    }

    public get isDisposed(): boolean {
        return this._element == null;
    }

    protected clearAllPanelEvent()
    {
        if (this._updateRegisted)
        {
            this._updateRegisted = false;
            GObject.UnregisterUpdate(this);
        }
    }

    public clearTouchEvent()
    {
        this.clearAllPanelEvent();
    }

    public dispose(): void {
        this.clearTouchEvent();
        this._relations.dispose();
        this._element.dispose();
        this._element = null;
        for (let i: number = 0; i < 10; i++) {
            let gear: GearBase = this._gears[i];
            if (gear)
                gear.dispose();
        }
    }

    public get draggable(): boolean {
        return this._draggable;
    }

    public set draggable(value: boolean) {
        if (this._draggable != value) {
            this._draggable = value;
            this.initDrag();
        }
    }

    public localToGlobal(ax?: number, ay?: number, result?: Vec2): Vec2 {
        ax = ax || 0;
        ay = ay || 0;

        if (this._pivotAsAnchor) {
            ax += this._pivotX * this._width;
            ay += this._pivotY * this._height;
        }

        return this._element.localToGlobal(ax, ay, result);
    }

    public globalToLocal(ax?: number, ay?: number, result?: Vec2): Vec2 {
        ax = ax || 0;
        ay = ay || 0;

        result = this._element.globalToLocal(ax, ay, result);

        if (this._pivotAsAnchor) {
            result.x -= this._pivotX * this._width;
            result.y -= this._pivotY * this._height;
        }

        return result;
    }

    public localToGlobalRect(ax: number, ay: number, aWidth: number, aHeight: number, result?: Rect): Rect {
        if (!result)
            result = new Rect();

        this.localToGlobal(ax, ay, s_vec2);
        result.x = s_vec2.x;
        result.y = s_vec2.y;
        this.localToGlobal(ax + aWidth, ay + aHeight, s_vec2);
        result.xMax = s_vec2.x;
        result.yMax = s_vec2.y;
        return result;
    }

    public globalToLocalRect(ax: number, ay: number, aWidth: number, aHeight: number, result?: Rect): Rect {
        if (!result)
            result = new Rect();

        this.globalToLocal(ax, ay, s_vec2);
        result.x = s_vec2.x;
        result.y = s_vec2.y;
        this.globalToLocal(ax + aWidth, ay + aHeight, s_vec2);
        result.xMax = s_vec2.x;
        result.yMax = s_vec2.y;
        return result;
    }

    public transformRect(ax: number, ay: number, aWidth: number, aHeight: number, targetSpace?: GObject, result?: Rect): Rect {
        if (!result)
            result = new Rect();

        this.localToGlobal(ax, ay, s_vec2);
        targetSpace.globalToLocal(s_vec2.x, s_vec2.y, s_vec2);
        result.x = s_vec2.x;
        result.y = s_vec2.y;

        this.localToGlobal(ax + aWidth, ay + aHeight, s_vec2);
        targetSpace.globalToLocal(s_vec2.x, s_vec2.y, s_vec2);
        result.xMax = s_vec2.x;
        result.yMax = s_vec2.y;

        return result;
    }

    public handleControllerChanged(c: Controller): void {
        this._handlingController = true;
        for (var i: number = 0; i < 10; i++) {
            var gear: GearBase = this._gears[i];
            if (gear && gear.controller == c)
                gear.apply();
        }
        this._handlingController = false;

        this.checkGearDisplay();
    }

    protected createElement(): void {
        this._element = new UIElement();
        this._element.$owner = this;
        this._element.initElement();
    }

    protected handlePositionChanged(): void {
        var xv: number = this._x;
        var yv: number = this._y;
        if (this._pivotAsAnchor) {
            xv -= this._pivotX * this._width;
            yv -= this._pivotY * this._height;
        }

        this._element.setPosition(xv, yv);
    }

    protected handleSizeChanged(): void {
        this._element.setSize(this._width, this._height);
    }

    protected handleScaleChanged(): void {
        this._element.setScale(this._scaleX, this._scaleY);
    }

    protected handleGrayedChanged(): void {
        this._element.grayed = this._grayed;
    }

    protected handleAlphaChanged(): void {
        this._element.alpha = this._alpha;
    }

    protected handleTouchableChanged(): void {
        this._element.touchable = this._touchable;
    }

    public handleVisibleChanged(): void {
        this._element.visible = this.internalVisible2;
    }

    public getProp(index: number): any {
        switch (index) {
            case ObjectPropID.Text:
                return this.text;
            case ObjectPropID.Icon:
                return this.icon;
            case ObjectPropID.Color:
                return null;
            case ObjectPropID.OutlineColor:
                return null;
            case ObjectPropID.Playing:
                return false;
            case ObjectPropID.Frame:
                return 0;
            case ObjectPropID.DeltaTime:
                return 0;
            case ObjectPropID.TimeScale:
                return 1;
            case ObjectPropID.FontSize:
                return 0;
            case ObjectPropID.Selected:
                return false;
            default:
                return undefined;
        }
    }

    public setProp(index: number, value: any): void {
        switch (index) {
            case ObjectPropID.Text:
                this.text = value;
                break;

            case ObjectPropID.Icon:
                this.icon = value;
                break;
        }
    }

    public constructFromResource(): void {

    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        buffer.seek(beginPos, 0);
        buffer.skip(5);

        var f1: number;
        var f2: number;

        this._id = buffer.readS();
        this._name = buffer.readS();

        f1 = buffer.readInt();
        f2 = buffer.readInt();
        this.setPosition(f1, f2);

        if (buffer.readBool()) {
            this.initWidth = buffer.readInt();
            this.initHeight = buffer.readInt();
            this.setSize(this.initWidth, this.initHeight, true);
        }

        if (buffer.readBool()) {
            this.minWidth = buffer.readInt();
            this.maxWidth = buffer.readInt();
            this.minHeight = buffer.readInt();
            this.maxHeight = buffer.readInt();
        }

        if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setScale(f1, f2);
        }

        if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setSkew(f1, f2);
        }

        if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setPivot(f1, f2, buffer.readBool());
        }
        
        f1 = buffer.readFloat();
        if (f1 != 1)
            this.alpha = f1;

        f1 = buffer.readFloat();
        if (f1 != 0)
            this.rotation = f1;

        if (!buffer.readBool())
            this.visible = false;
        if (!buffer.readBool())
            this.touchable = false;
        if (buffer.readBool())
            this.grayed = true;
        var bm: number = buffer.readByte();
        //this.blendMode = BlendModeTranslate[bm] || NormalBlending;

        var filter: number = buffer.readByte();
        if (filter == 1) {
            //todo set filter
            // ToolSet.setColorFilter(this._element,
            //     [buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat()]);
        }

        var str: string = buffer.readS();
        if (str != null)
            this.data = str;
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        buffer.seek(beginPos, 1);

        var str: string = buffer.readS();
        var groupId: number = buffer.readShort();
        if (groupId >= 0)
            this.group = <GGroup>this.parent.getChildAt(groupId);

        buffer.seek(beginPos, 2);

        var cnt: number = buffer.readShort();
        for (var i: number = 0; i < cnt; i++) {
            var nextPos: number = buffer.readShort();
            nextPos += buffer.pos;

            var gear: GearBase = this.getGear(buffer.readByte());
            gear.setup(buffer);

            buffer.pos = nextPos;
        }
    }

    public GetNativePanel() : Panel
    {
        if (this.element != null)
        {
            return this.element.nativePanel;
        }
    }

    //drag support
    //-------------------------------------------------------------------

    private initDrag(): void {
        var nativePanel : Panel = this.GetNativePanel();
        if (this._draggable) {
            nativePanel.SetDraggable(true);
            $.RegisterEventHandler( 'DragEnter', nativePanel, (panelID: string, dragged: Panel) => {
                this.emit.call(this, 'drag_enter');
                return true;
            });
            $.RegisterEventHandler( 'DragDrop', nativePanel,  (panelID: string, dragged: Panel) => {
                this.emit.call(this, 'drag_drop');
                return true;
            });
            $.RegisterEventHandler( 'DragLeave', nativePanel, (panelID: string, dragged: Panel) => {
                this.emit.call(this, 'drag_leave');
                return true;
            });
            $.RegisterEventHandler( 'DragStart', nativePanel, (panelID: string, settings: DragSettings) => {
                settings.displayPanel = nativePanel;
                GObject.draggingObject = this;
                
                this.data = settings;
                this.emit.call(this, 'drag_start');
                return true;
            });
            $.RegisterEventHandler( 'DragEnd', nativePanel, (panelID: string, dragged: Panel) => {
                this.data = dragged;
                this.emit.call(this, 'drag_end');
                GObject.draggingObject = null;
                return true;
            });
        }
        else {
            nativePanel.SetDraggable(false);
            //TODO  不知道这里有没有释放绑定的function
        }
    }

    public setPanelEvent(evt : PanelEvent, callback: any)
    {
        this.element.nativePanel.ClearPanelEvent(evt);
        this.element.nativePanel.SetPanelEvent(evt, callback);
    }

    public clearPanelEvent(evt : PanelEvent)
    {
        this.element.nativePanel.ClearPanelEvent(evt);
    }

    protected addEvent(evt : EventType, callback : Function, caller : any)
    {
        this.on(evt, callback, caller);
        if (evt == "onTouchBegin" || evt == "onTouchMove" || evt == "onTouchEnd")
        {
            if (this._updateRegisted == false)
            {
                this._updateRegisted = true;
                GObject.RegisterUpdate(this);

                let nativePanel = this.GetNativePanel();
                if (nativePanel)
                {
                    nativePanel.AddClass(MouseOverStyle);
                }
            }
        }
        else if (PanelEventSet.has(evt))
        {
            //直接this.emit分发
            this.element.nativePanel.SetPanelEvent(evt as PanelEvent, this.emit.bind(caller, evt));
        }
    }

    protected removeEvent(evt : EventType, callback : Function, caller : any) : void
    {
        this.off(evt, callback, caller);
    }

    //同一对象 同一事件最多绑定一个函数
    public onEvent(evt : EventType, callback : Function, caller ?: any) : void
    {
        this.addEvent(evt, callback.bind(caller, this), this);
    }

    public offEvent(evt : EventType, callback : Function, caller ?: any) : void
    {
        this.removeEvent(evt, callback, caller);
    }

    private callEvent(evt : EventType, arg ?: any)
    {
        this.emit(evt, arg);
    }

    protected isInsideObject(gpos ?: any) : boolean
    {
        let nativePanel = this.GetNativePanel();
        if (nativePanel && nativePanel.BHasHoverStyle())
        {
            return true;
        }
        return false;
    }

    public SetNativeParent(panel : Panel): void{
        this._element.nativePanel.SetParent(panel);
    }

    public SetParent(obj : GComponent)
    {
        if (this.parent)
            this.parent.removeChild(this);
        obj.addChild(this);
    }

    public processUpdate(isLeftDown : boolean) : void
    {
        if (isLeftDown)
        {
            if (this.touchAction == 1)
            {
                this.callEvent('onTouchMove');
            }
            if (this.isInsideObject())
            {
                if (this.touchAction == 0)
                {
                    this.touchAction = 1;
                    this.callEvent('onTouchBegin');
                }
            }
        }
        else
        {
            if (this.touchAction == 1)
            {
                this.callEvent('onTouchEnd');
                this.touchAction = 0;
            }
        }
    }

    public AddClass(clsName : string) : void
    {
        if (this._element && this._element.nativePanel)
        {
            this._element.nativePanel.RemoveClass(clsName);
            this._element.nativePanel.AddClass(clsName);
        }
    }

    public RemoveClass(clsName : string) : void
    {
        if (this._element && this._element.nativePanel)
        {
            this._element.nativePanel.RemoveClass(clsName);
        }
    }

    public static RegisterUpdate(thisobj : GObject)
    {
        GObject.s_AllUpdateObj.add(thisobj);
    }

    public static UnregisterUpdate(thisobj : GObject)
    {
        GObject.s_AllUpdateObj.delete(thisobj);
    }

    protected static OnGlobalUpdate()
    {
        $.Schedule(0.01, GObject.OnGlobalUpdate);
        if (GObject.s_AllUpdateObj.size == 0)
        {
            return;
        }

        let isLeftDown = GameUI.IsMouseDown(0);
        for(let obj of GObject.s_AllUpdateObj)
        {
            obj.processUpdate(isLeftDown);
        }
    }

    public static InitGlobalUpdate() : void
    {
        GObject.s_AllUpdateObj = new Set<GObject>()

        GObject.OnGlobalUpdate();

        GameUI.SetMouseCallback((eventName : MouseEvent, arg : MouseButton | MouseScrollDirection) => {
            if (GObject.s_AllUpdateObj.size == 0)
            {
                return;
            }

            let wheelScroll = 0;
            if (eventName == 'wheeled')
            {
                wheelScroll = arg;
            }

            if (wheelScroll != 0)
            {
                for(let obj of GObject.s_AllUpdateObj)
                {
                    obj.callEvent('onMouseWheel', wheelScroll);
                }
            }
            
            let captureMouse = false;
            if (GObject.mouseCallback)
            {
                var ret : boolean = GObject.mouseCallback(eventName, arg);
                captureMouse = (captureMouse || ret);
            }

            return captureMouse;
        });
    }
}

let GearClasses: Array<typeof GearBase> = [
    GearDisplay, GearXY, GearSize, GearLook, GearColor,
    GearAnimation, GearText, GearIcon, GearDisplay2, GearFontSize
];

function createGear(owner: GObject, index: number): GearBase {
    let ret = new (GearClasses[index])();
    ret._owner = owner;
    return ret;
}

var s_vec2: Vec2 = new Vec2();

export var gInstanceCounter: number = 0;
export var constructingDepth: { n: number } = { n: 0 };

GObject.InitGlobalUpdate();