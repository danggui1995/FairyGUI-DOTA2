import { Timers } from "../utils/Timers";
import { GTweener } from "./GTweener";
import { Pool } from "../utils/Pool";
import { UIConfig } from "../FairyGUI";

export class TweenManager {
    private static _tmpTweens : GTweener[] = [];
    private static _delayTimer : ScheduleID;
    private static _elementSet : Set<any> = new Set;

    public static createTween(): GTweener {
        var tweener: GTweener = _tweenerPool.borrow();
        if (UIConfig.useNativeTransition == false)
        {
            if (!_inited) {
                Timers.addUpdate(TweenManager.update);
                _inited = true;
            }
            _activeTweens[_totalActiveTweens++] = tweener;
        }
        else
        {
            TweenManager._tmpTweens.push(tweener);
            if (!TweenManager._delayTimer)
            {
                TweenManager._delayTimer = $.Schedule(0.01, TweenManager.DelayPlayTween);
            }
        }
        return tweener;
    }

    protected static DelayPlayTween()
    {
        TweenManager._delayTimer = null;
        for(const tweener of TweenManager._tmpTweens)
        {
            tweener.playNative();
            let element;
            if (tweener.target && tweener.target.element) {
                element = tweener.target.element;
            }
            else if (tweener.target.target && tweener.target.target.element) {
                element = tweener.target.target.element;
            }
            if (element && !TweenManager._elementSet.has(element))
            {
                TweenManager._elementSet.add(element);
            }
        }
        for(const element of TweenManager._elementSet)
        {
            element.playTweenComposed();
        }
        TweenManager._elementSet.clear();
        TweenManager._tmpTweens = [];
    }

    public static isTweening(target: any, propType?: any): boolean {
        if (target == null)
            return false;

        var anyType: boolean = !propType;
        for (var i: number = 0; i < _totalActiveTweens; i++) {
            var tweener: GTweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed
                && (anyType || tweener._propType == propType))
                return true;
        }

        return false;
    }

    public static killTweens(target: any, completed?: boolean, propType?: any): boolean {
        if (target == null)
            return false;

        var flag: boolean = false;
        var cnt: number = _totalActiveTweens;
        var anyType: boolean = !propType;
        for (var i: number = 0; i < cnt; i++) {
            var tweener: GTweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed
                && (anyType || tweener._propType == propType)) {
                tweener.kill(completed);
                flag = true;
            }
        }

        return flag;
    }

    public static getTween(target: any, propType?: any): GTweener {
        if (target == null)
            return null;

        var cnt: number = _totalActiveTweens;
        var anyType: boolean = !propType;
        for (var i: number = 0; i < cnt; i++) {
            var tweener: GTweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed
                && (anyType || tweener._propType == propType)) {
                return tweener;
            }
        }

        return null;
    }

    public static update(): void {
        var dt: number = Timers.deltaTime;

        var cnt: number = _totalActiveTweens;
        var freePosStart: number = -1;
        for (var i: number = 0; i < cnt; i++) {
            var tweener: GTweener = _activeTweens[i];
            if (tweener == null) {
                if (freePosStart == -1)
                    freePosStart = i;
            }
            else if (tweener._killed) {
                _tweenerPool.returns(tweener);
                _activeTweens[i] = null;

                if (freePosStart == -1)
                    freePosStart = i;
            }
            else {
                if (tweener._target && ('isDisposed' in tweener._target) && tweener._target.isDisposed)
                    tweener._killed = true;
                else if (!tweener._paused)
                    tweener._update(dt);

                if (freePosStart != -1) {
                    _activeTweens[freePosStart] = tweener;
                    _activeTweens[i] = null;
                    freePosStart++;
                }
            }
        }

        if (freePosStart >= 0) {
            if (_totalActiveTweens != cnt) //new tweens added
            {
                var j: number = cnt;
                cnt = _totalActiveTweens - cnt;
                for (i = 0; i < cnt; i++)
                    _activeTweens[freePosStart++] = _activeTweens[j++];
            }
            _totalActiveTweens = freePosStart;
        }
    }

    public static returnTween(tween: GTweener): void
    {
        _tweenerPool.returns(tween);
    }
}

var _activeTweens: GTweener[] = new Array();
var _tweenerPool: Pool<GTweener> = new Pool<GTweener>(GTweener, e => e._init(), e => e._reset());
var _totalActiveTweens: number = 0;
var _inited: boolean = false;