import { GTween, GTweener, UIConfig } from "../FairyGUI";
import { ObjectPropID } from "../ui/FieldTypes";
import { ByteBuffer } from "../utils/ByteBuffer";
import { GearBase } from "./GearBase";

export class GearColor extends GearBase {
    private _storage: { [index: string]: GearColorValue };
    private _default: GearColorValue;

    protected init(): void {
        this._default = {
            color: this._owner.getProp(ObjectPropID.Color),
            strokeColor: this._owner.getProp(ObjectPropID.OutlineColor)
        };
        this._storage = {};
    }

    protected addStatus(pageId: string, buffer: ByteBuffer): void {
        var gv: GearColorValue;
        if (!pageId)
            gv = this._default;
        else {
            gv = {};
            this._storage[pageId] = gv;
        }

        gv.color = buffer.readColor();
        gv.strokeColor = buffer.readColor();
    }

    private apply2(): void
    {
        var gv: GearColorValue = this._storage[this._controller.selectedPageId] || this._default;
        this._owner._gearLocked = true;

        this._owner.setProp(ObjectPropID.Color, gv.color);
        this._owner.setProp(ObjectPropID.OutlineColor, gv.strokeColor);

        this._owner._gearLocked = false;
    }

    public apply(): void {
        // if (UIConfig.useNativeTransition && this.allowTween)
        // {   
        //     var gv: GearColorValue = this._storage[this._controller.selectedPageId] || this._default;
        //     if (this._tweenConfig._tweener) {
        //         if (this._tweenConfig._tweener.endValue.color != gv.color) {
        //             this._tweenConfig._tweener.kill(true);
        //             this._tweenConfig._tweener = null;
        //         }
        //         else
        //             return;
        //     }

        //     var ox: number = this._owner.color;

        //     if (ox != gv.color) {
        //         if (this._owner.checkGearController(0, this._controller))
        //             this._tweenConfig._displayLockToken = this._owner.addDisplayLock();

        //         this._tweenConfig._tweener = GTween.toColor(ox, gv.color, this._tweenConfig.duration)
        //             .setDelay(this._tweenConfig.delay)
        //             .setEase(this._tweenConfig.easeType)
        //             .setTarget(this._owner)
        //             .onComplete(this.__tweenComplete, this);
        //     }
        // }
        // else 
        {
            this.apply2();
        }
    }

    private __tweenComplete(): void {
        if (this._tweenConfig._displayLockToken != 0) {
            this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
            this._tweenConfig._displayLockToken = 0;
        }
        this._tweenConfig._tweener = null;
    }

    public updateState(): void {
        var gv: GearColorValue = this._storage[this._controller.selectedPageId];
        if (!gv) {
            gv = this._default;
            this._storage[this._controller.selectedPageId] = gv;
        }
    }
}

interface GearColorValue {
    color?: number;
    strokeColor?: number;
}
