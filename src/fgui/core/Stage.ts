
import { UIElement } from "./UIElement";
import { lastInput } from "../event/Event";
import { EventDispatcher } from "../event/EventDispatcher";
import { Vec2 } from "../math/Vec2";
import { isAnyEditing } from "./InputTextField";
import { IStage } from "./IStage";

const clickTestThreshold = 10;
const maxPointer = 10;

var anyPointerInput: number = 0;

export class Stage extends UIElement implements IStage {
    private _window: Window;
    private _touchscreen: boolean;
    private _electron: boolean;
    private _pointers: Array<PointerInfo> = [];
    private _touchTarget: UIElement;
    private _pointerPos: Vec2 = new Vec2();
    private _touchCount: number = 0;
    private _rollOverChain: Array<UIElement> = [];
    private _rollOutChain: Array<UIElement> = [];
    private _lastPointerId: number;
    private _nextCursor: string;
    private _focused: UIElement;
    private _nextFocus: UIElement;
    private _focusOutChain: Array<UIElement> = [];
    private _focusInChain: Array<UIElement> = [];
    private _focusHistory: Array<UIElement> = [];

    public static get anyInput(): boolean {
        return anyPointerInput > 0 || isAnyEditing;
    }

    public constructor() {
        super();

        (<any>this).is_stage = true;
        
    }

    public setWindow(rootNode: Panel) {
        this.nativePanel.SetParent(rootNode);

        this._touchscreen = true;

        this._electron = false;

        for (let i = 0; i < maxPointer; i++)
            this._pointers.push(new PointerInfo());

        // rootNode.SetPanelEvent('pointerdown', ev => this.handlePointer(ev, 0), { passive: false });
        // rootNode.SetPanelEvent('pointerup', ev => this.handlePointer(ev, 1), { passive: false });
        // rootNode.SetPanelEvent('pointermove', ev => this.handlePointer(ev, 2), { passive: false });
        // rootNode.SetPanelEvent('pointercancel', ev => this.handlePointer(ev, 3), { passive: false });
        // rootNode.SetPanelEvent('oncontextmenu', ev => this.handleContextMenu(ev));

        // rootNode.SetPanelEvent('dragend', ev => this.handlePointer(ev, 1), { passive: false });
        // rootNode.SetPanelEvent('dragover', ev => this.handlePointer(ev, 2), { passive: false });
        // rootNode.SetPanelEvent('wheel', ev => this.handleWheel(ev), { passive: false });

        // rootNode.insertAdjacentHTML("afterbegin",
        //     `<style>
        //     .fgui-link { color:#3A67CC }
        //     .fgui-link:hover { color:#3A67CC }

        //     .fgui-stage {
        //         -moz-user-select: none;
        //         -khtml-user-select: none;
        //         -webkit-user-select: none; 
        //         -ms-user-select:none;
        //     }

        //     .fgui-stage div:focus {
        //         outline: none;
        //     }

        //     .fgui-stage input[type=text] {
        //         resize : none;
        //         overflow : scroll;
        //         outline : none;
        //         border : 0px;
        //         margin : 0px;
        //         background : transparent;
        //         width : 100%;
        //         height : 100%;
        //     }

        //     .fgui-stage input[type=text]:focus {
        //         outline : none;
        //     }

        //     .fgui-stage textarea {
        //         resize : none;
        //         overflow : scroll;
        //         outline : none;
        //         border : 0px;
        //         padding : 0px 4px 0px 4px;
        //         margin : 0px;
        //         background : transparent;
        //         width : 100%;
        //         height : 100%;
        //     }

        //     .fgui-stage textarea:focus {
        //         outline: none;
        //     }

        //     .fgui-stage textarea::-webkit-scrollbar {
        //         display: none;
        //     }
        // </style>`
        // );
        this.className = "fgui-stage";

        // ownerWindow.SetPanelEvent('keydown', this.onKeydown.bind(this));
        // ownerWindow.SetPanelEvent('keyup', this.onKeyup.bind(this));

        // ownerWindow.requestAnimationFrame(this.checkNextFocus.bind(this));
    }

    public get window(): Window {
        return this._window;
    }

    public get pointerPos(): Vec2 {
        return this._pointerPos;
    }

    public get touchScreen(): boolean {
        return this._touchscreen;
    }

    public get touchTarget(): UIElement {
        return this._touchTarget;
    }

    public get touchCount(): number {
        return this._touchCount;
    }

    public getPointerPos(pointerId?: number, ret?: Vec2): Vec2 {
        if (!ret)
            ret = new Vec2();
        if (pointerId == null || pointerId == -1)
            ret.copy(this._pointerPos);
        else {
            // let pointer = this.getPointer(pointerId);
            // if (pointer)
            //     ret.set(pointer.x, pointer.y);
            // else
            //     ret.copy(this._pointerPos);
        }
        return ret;
    }

    public addPointerMonitor(pointerId: number, target: EventDispatcher) {
        // if (pointerId == null || pointerId == -1)
        //     pointerId = this._lastPointerId;

        // let pointer: PointerInfo = this.getPointer(pointerId);
        // if (pointer.captors.indexOf(target) == -1)
        //     pointer.captors.push(target);
    }

    public removePointerMonitor(target: EventDispatcher) {
        for (let j = 0; j < maxPointer; j++) {
            let pointer = this._pointers[j];
            let i = pointer.captors.indexOf(target);
            if (i != -1) {
                pointer.captors[i] = null;
            }
        }
    }

    public cancelClick(pointerId: number) {
        for (let j = 0; j < maxPointer; j++) {
            let pointer = this._pointers[j];
            if (pointer.pointerId == pointerId)
                pointer.clickCancelled = true;
        }
    }
    //Focus Manage -----------------

    public get focusedElement(): UIElement {
        if (this._focused != null) {
            if (!this._focused.onStage)
                this._focused = null;
        }
        else {
            this.checkNextFocus();
        }

        return this._focused;
    }

    public validateFocus(container: UIElement, child: UIElement) {
        // if (child == this._focused || child.isAncestorOf(this._focused))
        //     this.onFocusRemoving(container);
    }

    public setFocus(newFocus: UIElement, byKey?: boolean) {
        if (newFocus == this)
            newFocus = null;

        this._nextFocus = null;

        if (this._focused == newFocus)
            return;

        let navRoot = null;
        let element = newFocus;
        while (element != null) {
            if (!element.focusable)
                return;
            else if (element.tabStopChildren) {
                if (navRoot == null)
                    navRoot = element;
            }

            element = element.parent;
        }

        let oldFocus = this._focused;
        this._focused = newFocus;

        if (navRoot != null) {
            navRoot._lastFocus = this._focused;
            let pos = this._focusHistory.indexOf(navRoot);
            if (pos != -1) {
                if (pos < this._focusHistory.length - 1)
                    this._focusHistory.splice(pos + 1, this._focusHistory.length - pos - 1);
            }
            else {
                this._focusHistory.push(navRoot);
                if (this._focusHistory.length > 10)
                    this._focusHistory.shift();
            }
        }

        this._focusInChain.length = 0;
        this._focusOutChain.length = 0;

        element = oldFocus;
        while (element != null) {
            if (element.focusable)
                this._focusOutChain.push(element);
            element = element.parent;
        }

        element = this._focused;
        let i: number;
        while (element != null) {
            i = this._focusOutChain.indexOf(element);
            if (i != -1) {
                this._focusOutChain.splice(i, this._focusOutChain.length - i);
                break;
            }
            if (element.focusable)
                this._focusInChain.push(element);

            element = element.parent;
        }

        let cnt = this._focusOutChain.length;
        if (cnt > 0) {
            for (i = 0; i < cnt; i++) {
                element = this._focusOutChain[i];
                if (element.onStage && element.$owner) {
                    element.$owner.emit("focus_out");
                    if (this._focused != newFocus) //focus changed in event
                        return;
                }
            }
            this._focusOutChain.length = 0;
        }

        cnt = this._focusInChain.length;
        if (cnt > 0) {
            for (i = 0; i < cnt; i++) {
                element = this._focusInChain[i];
                if (element.onStage && element.$owner) {
                    element.$owner.emit("focus_in", byKey ? "key" : null);
                    if (this._focused != newFocus) //focus changed in event
                        return;
                }
            }
            this._focusInChain.length = 0;
        }

        // if (newFocus instanceof InputTextField)
        //     this.nativePanel.style.cursor = "auto";
    }

    private onFocusRemoving(sender: UIElement) {
        this._nextFocus = sender;
        if (this._focusHistory.length > 0) {
            let i = this._focusHistory.length - 1;
            let test = this._focusHistory[i];
            let element = this._focused;
            while (element != null && element != sender) {
                if (element.tabStopChildren && element == test) {
                    i--;
                    if (i < 0)
                        break;

                    test = this._focusHistory[i];
                }

                element = element.parent;
            }

            if (i != this._focusHistory.length - 1) {
                this._focusHistory.splice(i + 1, this._focusHistory.length - i - 1);
                if (this._focusHistory.length > 0)
                    this._nextFocus = this._focusHistory[this._focusHistory.length - 1];
            }
        }

        this._focused = null;
    }

    private checkNextFocus() {
        // if (this._nextFocus != null) {
        //     let nextFocus = this._nextFocus;
        //     this._nextFocus = null;
        //     if (nextFocus.onStage) {
        //         if (nextFocus.tabStopChildren) {
        //             if (nextFocus._lastFocus != null && nextFocus.(nextFocus._lastFocus))
        //                 this.setFocus(nextFocus._lastFocus);
        //             else
        //                 this.setFocus(nextFocus);
        //         }
        //         else
        //             this.setFocus(nextFocus);
        //     }
        // }
    }
}

class PointerInfo {
    public x: number = 0;
    public y: number = 0;
    public pointerId: number = -1;
    public clickCount: number = 0;
    public mouseWheelDelta: number = 0;
    public button: number = -1;
    public shiftKey: boolean = false;
    public altKey: boolean = false;
    public ctrlKey: boolean = false;
    public commandKey: boolean = false;

    public downX: number = 0;
    public downY: number = 0;
    public downTime: number = 0;
    public downFrame: number = 0;
    public began: boolean = false;
    public clickCancelled: boolean = false;
    public lastClickTime: number = 0;
    public lastClickX: number = 0;
    public lastClickY: number = 0;
    public lastClickButton: number = 0;
    public holdTime: number = 0;
    public target: UIElement = null;
    public downTargets: UIElement[] = new Array<UIElement>();
    public lastRollOver: UIElement = null;
    public captors: Array<EventDispatcher> = new Array<EventDispatcher>();
}
