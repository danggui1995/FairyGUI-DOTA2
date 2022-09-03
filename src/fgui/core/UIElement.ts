import { EventPool } from "../event/Event";
import { Rect } from "../math/Rect";
import { Vec2 } from "../math/Vec2";
import { CssTween } from "../tween/GTweener";
import { FlipType } from "../ui/FieldTypes";
import { GObject, PanelEventSet } from "../ui/GObject";
import { DotaPanel } from "./DotaPanel";
import { IStage } from "./IStage";

export class UIElement extends DotaPanel {
    public $owner ?: GObject;

    protected _alpha: number;
    protected _touchable: boolean;
    protected _touchDisabled?: boolean;
    protected _visible: boolean;
    protected _grayed : boolean;
    protected _opaque: boolean;
    protected _pos: Vec2;
    protected _contentRect: Rect;
    protected _scale: Vec2;
    protected _rot: number;
    protected _pivot: Vec2;
    protected _clipping ?: boolean;
    protected _parent ?: UIElement;
    protected _children: Array<UIElement>;
    protected _flipX?: boolean;
    protected _flipY?: boolean;
    protected _cursor : string;

    protected _notFocusable?: boolean;
    protected _tabStop: boolean;
    protected _tabStopChildren: boolean;

    /** @internal */
    public _lastFocus?: UIElement;
    /** @internal */
    public _isRoot ?: boolean;
    public forbidStyleModify : boolean;

    private _gTouchable : boolean;

    private _tweenQueue : CssTween[];
    private _tweenRunning : Map<string, CssTween[]>;
    private _tweenInit : boolean;

    public constructor() {
        super();

        this._children = [];

        this._pos = new Vec2();
        this._scale = new Vec2(1, 1);
        this._rot = 0;
        this._pivot = new Vec2();
        this._contentRect = new Rect();
        this._alpha = 1;
        this._touchable = true;
        this._visible = true;
        this._opaque = true;
        this._cursor = "";
        this._grayed = false;
        this._tabStop = false;
        this._tabStopChildren = false;
        this._gTouchable = undefined;
        this.forbidStyleModify = false;

        this._tweenQueue = [];
        this._tweenRunning = new Map;
        this._tweenInit = false;
    }

    public initElement()
    {
        this.nativePanel = $.CreatePanel( "Panel", $('#HiddenRoot'), this.$owner.name);
    }

    public get name(): string {
        return this.id;
    }
    public set name(value: string) {
        this.id = value;
    }

    public get x(): number {
        return this._pos.x;
    }
    public set x(value: number) {
        this.setPosition(value, this._pos.y);
    }

    public get y(): number {
        return this._pos.y;
    }
    public set y(value: number) {
        this.setPosition(this._pos.x, value);
    }

    public setPosition(x: number, y: number): void {
        // if (this._pos.x != x || this._pos.y != y) {
            this._pos.set(x, y);

            if (this.forbidStyleModify == false)
            {
                this.nativePanel.style.marginLeft = x + "px";
                this.nativePanel.style.marginTop = y + "px";
            }
        // }
    }

    public appendTween(tween: CssTween):void
    {
        if (this._tweenInit == false)
        {
            this._tweenInit = true;
            this.$owner.RegisterEventHandler('PropertyTransitionEnd', this.nativePanel, (_: any, propName: string)=>{
                $.Msg(propName);
                let runningTweens = this._tweenRunning.get(propName)
                if (runningTweens)
                {
                    this._tweenRunning.delete(propName);
                    for(let i = this._tweenQueue.length - 1; i >= 0 ; i--)
                    {
                        for(const rt of runningTweens)
                        {
                            if (rt == this._tweenQueue[i])
                            {
                                this._tweenQueue.splice(i, 1);
                                break;
                            }
                        }
                    }
                    this.checkPlayTween();
                }
            });
        }
        // this.forbidStyleModify = true;
        this._tweenQueue.push(tween);
        this.checkPlayTween();
    }

    protected checkPlayTween(): void
    {
        let keylist = [];
        let valuemap: Map<string, string[]> = new Map;

        //之前没播完的要加回来
        for(let [propType, tweenArr] of this._tweenRunning)
        {
            for(let tween of tweenArr)
            {
                if (tween.duration > 0)
                {
                    let propKey = `${propType} ${tween.duration}s ${tween.ease} ${tween.delay}s`;
                    keylist.push(propKey);
                    let valuemapArr = valuemap.get(propType);
                    if (valuemapArr)
                    {
                        valuemapArr.push(tween.propValue);
                    }
                    else
                    {
                        valuemap.set(propType, [tween.propValue]);
                    }
                }   
            }
        }

        for(let i = 0; i < this._tweenQueue.length; i++)
        {
            let tween = this._tweenQueue[i];
            let propType = tween.propType;
            let propKey = `${propType} ${tween.duration}s ${tween.ease} ${tween.delay}s`;
            let propValue = tween.propValue;
            let unique = tween.unique;
            let runningTweens = this._tweenRunning.get(propType);
            if (!runningTweens)
            {
                this._tweenRunning.set(propType, [tween]);
                keylist.push(propKey);
                valuemap.set(propType, [propValue]);
            }
            else
            {
                let find = true;
                for(const t of runningTweens)
                {
                    if (t.priority == tween.priority)
                    {
                        find = false;
                        break;
                    }
                }
                if (find)
                {
                    runningTweens.push(tween);
                    let valuemapArr = valuemap.get(propType);
                    valuemapArr.push(propValue);
                }
            }
        }
        
        if (keylist.length > 0)
        {
            this.nativePanel.style.transition = keylist.join(',');
            for(let [k, v] of valuemap)
            {
                (this.nativePanel.style as any)[k] = v.join(' ');
            }
        }
    }

    public removeTween(action: number):void
    {
        // this.forbidStyleModify = false;
        // this._tweenSettings.delete(action);
    }

    public get width(): number {
        return this._contentRect.width;
    }
    public set width(value: number) {
        if (this._contentRect.width != value) {
            this._contentRect.width = value;
            this.onSizeChanged();
        }
    }

    public get height(): number {
        return this._contentRect.height;
    }
    public set height(value: number) {
        if (this._contentRect.height != value) {
            this._contentRect.height = value;
            this.onSizeChanged();
        }
    }

    public setSize(wv: number, hv: number): void {
        if (wv != this._contentRect.width || hv != this._contentRect.height) {
            this._contentRect.width = wv;
            this._contentRect.height = hv;
            this.onSizeChanged();
        }
    }

    protected onSizeChanged(): void {
        if (this.forbidStyleModify == false)
        {
            this.nativePanel.style.width = this._contentRect.width + "px";
            this.nativePanel.style.height = this._contentRect.height + "px";
        }
    }

    public get pivotX(): number {
        return this._pivot.x;
    }
    public set pivotX(value: number) {
        this.setPivot(value, this._pivot.y);
    }

    public get pivotY(): number {
        return this._pivot.y;
    }
    public set pivotY(value: number) {
        this.setPosition(this._pivot.x, value);
    }

    public setPivot(xv: number, yv: number): void {
        // if (this._pivot.x != xv || this._pivot.y != yv) {
            this._pivot.set(xv, yv);
            if (this.forbidStyleModify == false)
            {
                this.nativePanel.style.transformOrigin = `${this._pivot.x * 100}% ${this._pivot.y * 100}%`;
            }
        // }
    }

    public get flip(): FlipType {
        if (this._flipX)
            return this._flipY ? FlipType.Both : FlipType.Horizontal;
        else if (this._flipY)
            return this._flipX ? FlipType.Both : FlipType.Vertical;
        else
            return FlipType.None;
    }
    public set flip(value: FlipType) {
        let a: boolean = value == FlipType.Both || value == FlipType.Horizontal;
        let b: boolean = value == FlipType.Both || value == FlipType.Vertical;
        if (a != this._flipX || b != this._flipY)
            this._flipX = a;
        this._flipY = b;

        this.updateTransform();
    }

    public get cursor(): string {
        return this._cursor;
    }

    public set cursor(value: string) {
        this._cursor = value;
    }

    private updateTransform(): void {
        // let str: Array<string> = [];
        // if (this._scale.x != 1 || this._flipX || this._scale.y != 1 || this._flipY)
        // {
        //     str.push("scale3d(");
        //     str.push("" + this._scale.x * (this._flipX ? -1 : 1));
        //     str.push("," + this._scale.x * (this._flipX ? -1 : 1));
        //     str.push(",1) ");
        // }
        
        // if (this._rot != 0) {
        //     str.push("rotateZ(");
        //     str.push("" + this._rot);
        //     str.push("deg) ");
        // }

        // if (str.length > 0) {
        //     this.nativePanel.style.transform = str.join("");
        //     if (this._flipX || this._flipY)
        //         this.nativePanel.style.transformOrigin = "50% 50%";
        //     else
        //         this.nativePanel.style.transformOrigin = (this._pivot.x * 100) + "% " + (this._pivot.y * 100) + "%";
        // }
        // else
        // {
        //     this.nativePanel.style.transform = "none";
        // }
    }

    protected updateFilters(): void {
        let filter = "";
        if (this._grayed)
            filter += "grayscale(100%)";

        // this.nativePanel.style.filter = filter;
        //TODO 置灰
    }

    public get scaleX(): number {
        return this._scale.x;
    }
    public set scaleX(value: number) {
        this.setScale(value, this._scale.y);
    }

    public get scaleY(): number {
        return this._scale.y;
    }
    public set scaleY(value: number) {
        this.setScale(this._scale.x, value);
    }

    public setScale(xv: number, yv: number) {
        if (this._scale.x != xv || this._scale.y != yv) {
            this._scale.set(xv, yv);
            this.updateTransform();
        }
    }

    public get rotation(): number {
        return this._rot;
    }
    public set rotation(value: number) {
        if (this._rot != value) {
            this._rot = value;
            // this.updateTransform();
        }
    }

    public get parent(): UIElement | undefined {
        return this._parent;
    }

    public get alpha(): number {
        return this._alpha;
    }
    public set alpha(value: number) {
        if (this._alpha != value) {
            this._alpha = value;
            if (this.forbidStyleModify == false)
            {
                this.nativePanel.style.opacity = this._alpha.toFixed(3);
            }
        }
    }

    public get touchable(): boolean {
        return this._touchable;
    }
    public set touchable(value: boolean) {
        if (this._touchable != value) {
            this._touchable = value;

            this.updateTouchableFlag();
        }
    }

    public get opaque(): boolean {
        return this._opaque;
    }
    public set opaque(value: boolean) {
        if (this._opaque != value) {
            this._opaque = value;

            this.updateTouchableFlag();
        }
    }

    protected updateTouchableFlag(): void {
        let tc: boolean = true;
        if (!this._touchable || !this._opaque || this._touchDisabled)
            tc = false;
        else if (this.parent && !this.parent._opaque)
            tc = true

        if (this._gTouchable != tc) {
            this._gTouchable = tc;
            this.nativePanel.hittest = tc;

            const children = this._children;
            for (let i = 0, l = children.length; i < l; i++) {
                children[i].updateTouchableFlag();
            }
        }


    }

    public setNotInteractable(): void {
        this._touchDisabled = true;
        // this.nativePanel.style.pointerEvents = "none";
    }

    public get grayed(): boolean {
        return this._grayed;
    }
    public set grayed(value: boolean) {
        if (this._grayed != value) {
            this._grayed = value;
            if (value)
            {
                this.nativePanel.AddClass("FGUI_Gray");
            }
            else
            {
                this.nativePanel.RemoveClass("FGUI_Gray");
            }
        }
    }

    // public get blendMode(): Blending {
    //     return this._graphics ? this._graphics.material.blending : NormalBlending;
    // }

    // public set blendMode(value: Blending) {
    //     if (this._graphics)
    //         this._graphics.material.blending = value;
    // }

    public get focusable(): boolean {
        return !this._notFocusable;
    }

    public set focusable(value: boolean) {
        this._notFocusable = !value;
    }

    public get focused(): boolean {
        return this.nativePanel.BHasKeyFocus();
        // return this.stage.focusedElement == this || this.isAncestorOf(this.stage.focusedElement);
        // return false;
    }

    public get tabStop(): boolean {
        return this._tabStop;
    }

    public set tabStop(value: boolean) {
        if (this._tabStop != value) {
            this._tabStop = value;
            if (value) {
                this.nativePanel.tabindex = 0;
                // this.addEventListener("focus", () => { if (this._tabStop) this.stage.setFocus(this, true); });
            }
            else
                this.nativePanel.tabindex = null;
        }
    }

    public get tabStopChildren(): boolean {
        return this._tabStopChildren;
    }

    public set tabStopChildren(value: boolean) {
        this._tabStopChildren = value;
    }

    public get onStage(): boolean {
        return true;
    }

    public get stage(): IStage {
        let p: DotaPanel | undefined = this;
        while (p != undefined) {
            if ((<any>p).is_stage)
                return <IStage><any>p;

            p = p.parentElement;
        }

        // return window.fguiStage;
    }

    public globalToLocal(x: number, y: number, result?: Vec2): Vec2 {
        let radio = $.UIObjectFactory.getAspectRadio();
        x *= radio;
        y *= radio;
        var globalVec = this.localToGlobal(this.x, this.y);
        if (!result)
        {
            result = new Vec2();
        }
        result.x = x - globalVec.x;
        result.y = y - globalVec.y;
        return result;
    }

    public localToGlobal(x: number, y: number, result?: Vec2): Vec2 {
        if (!result)
        {
            result = new Vec2(x, y);
        }
        else
        {
            result.set(x, y);
        }
        var p = this.parent;
        while ( p != undefined )
        {
            result.x += p.x;
            result.y += p.y;
            p = p.parent;
        }
        return result
    }

    public addChild(child: UIElement): void {
        this.addChildAt(child, Number.POSITIVE_INFINITY);
    }

    public addChildAt(child: UIElement, index: number) {
        if (child._parent == this)
            this.setChildIndex(child, index);
        else {
            if (index > this._children.length - 1) {
                this.appendChild(child);
            }
            else {
                let refNode = this._children[index];
                this.insertBefore(child, refNode);
            }
            this._children.splice(index, 0, child);
            child._parent = this;
            child.updateTouchableFlag();
        }

        child.broadcastEvent("added_to_stage");
    }

    public removeChild<T extends DotaPanel>(child: T): T {
        if (child instanceof UIElement) {
            let index = this._children.indexOf(child);
            if (index == -1)
            {
                $.Msg(new Error().stack);
                throw 'not a child';
            }

            this.removeChildAt(index);
        }
        else
            super.removeChild(child);
        return child;
    }

    public removeChildAt(index: number) {
        let child: UIElement = this._children[index];

        child.broadcastEvent("removed_from_stage");

        this._children.splice(index, 1);
        super.removeChild(child);
        child._parent = null;
    }

    public setChildIndex(child: UIElement, index: number) {
        let oldIndex = this._children.indexOf(child);
        if (oldIndex == index) return;
        if (oldIndex == -1) throw 'Not a child';
        this._children.splice(oldIndex, 1);
        if (index >= this._children.length - 1) {
            this._children.push(child);
            this.appendChild(child);
        }
        else {
            this._children.splice(index, 0, child);
            let refNode = this._children[index + 1];
            this.insertBefore(child, refNode);
        }
    }

    public getIndex(child: UIElement): number {
        return this._children.indexOf(child);
    }

    public get numChildren(): number {
        return this._children.length;
    }

    // public isAncestorOf(child: UIElement): boolean {
    //     if (child == null)
    //         return false;

    //     var p: UIElement = child.parent;
    //     while (p) {
    //         if (p == this)
    //             return true;

    //         p = p.parent;
    //     }
    //     return false;
    // }

    public get clipping(): boolean {
        return this._clipping;
    }

    public set clipping(value: boolean) {
        if (this._clipping != value) {
            this._clipping = value;

            if (this._clipping)
                this.nativePanel.style.overflow = "clip";
            else
                this.nativePanel.style.overflow = "noclip";
        }
    }

    public init() {

    }

    public dispose() {
        this.nativePanel.RemoveAndDeleteChildren();
        for(const evt of PanelEventSet)
        {
            this.nativePanel.ClearPanelEvent(evt as PanelEvent);
        }
        this.nativePanel.DeleteAsync(1);
    }

    public traverseVisible(callback: (obj: UIElement) => void): void {
        if (!this._visible) return;

        callback(this);

        const children = this._children;
        for (let i = 0, l = children.length; i < l; i++) {
            children[i].traverseVisible(callback);
        }
    }

    public traverseAncestors(callback: (obj: UIElement) => void): void {
        const parent = this._parent;

        if (parent) {
            callback(parent);
            parent.traverseAncestors(callback);
        }
    }

    public broadcastEvent(type: string, data?: any): void {
        let ev = EventPool.borrow();
        ev._type = type;
        ev.data = data;
        ev._initiator = this;
        let arr = ev._callChain;

        this.traverseVisible(obj => {
            if (obj.$owner)
                arr.push(obj.$owner);
        });

        arr.forEach(obj => {
            obj._dispatchDirect(type, ev);
        });

        arr.length = 0;
        EventPool.returns(ev);
    }
}