import { GObject } from "../FairyGUI";
import { GTweener } from "./GTweener";
import { TweenManager } from "./TweenManager";
import { ActionType } from "./TweenValue";

export class GTween {
    public static catchCallbackExceptions: boolean = true;

    public static to(start: number, end: number, duration: number, actionType?: ActionType): GTweener {
        return TweenManager.createTween()._to(start, end, duration, actionType);
    }

    public static to2(start: number, start2: number, end: number, end2: number, duration: number, actionType?: ActionType): GTweener {
        return TweenManager.createTween()._to2(start, start2, end, end2, duration, actionType);
    }

    public static to3(start: number, start2: number, start3: number,
        end: number, end2: number, end3: number, duration: number, actionType?: ActionType): GTweener {
        return TweenManager.createTween()._to3(start, start2, start3, end, end2, end3, duration, actionType);
    }

    public static to4(start: number, start2: number, start3: number, start4: number,
        end: number, end2: number, end3: number, end4: number, duration: number, actionType?: ActionType): GTweener {
        return TweenManager.createTween()._to4(start, start2, start3, start4, end, end2, end3, end4, duration, actionType);
    }

    public static toColor(start: number, end: number, duration: number, actionType?: ActionType): GTweener {
        return TweenManager.createTween()._toColor(start, end, duration, actionType);
    }

    public static delayedCall(delay: number): GTweener {
        return TweenManager.createTween().setDelay(delay);
    }

    public static shake(startX: number, startY: number, amplitude: number, duration: number, actionType?: ActionType): GTweener {
        return TweenManager.createTween()._shake(startX, startY, amplitude, duration, actionType);
    }

    public static isTweening(target: any, propType?: any): Boolean {
        return TweenManager.isTweening(target, propType);
    }

    public static kill(target: any, complete?: boolean, propType?: any): void {
        TweenManager.killTweens(target, complete, propType);
    }

    public static getTween(target: any, propType?: any): GTweener {
        return TweenManager.getTween(target, propType);
    }
}

