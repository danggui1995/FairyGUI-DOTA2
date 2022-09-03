import { Timers } from "../utils/Timers";
import { GTweener } from "./GTweener";
import { Pool } from "../utils/Pool";
import { GObject, UIConfig } from "../FairyGUI";

export class TweenManager {
    private static _tmpTweens : GTweener[] = [];

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
        
        return tweener;
    }

    protected static transformCompare(a:any, b:any)
    {
        if (a[1] < b[1])
        {
            return -1;
        }
        return 1;
    }

    public static composeTransition(target?: GObject): void
    {
        if (!target || !target.element)
        {
            return;
        }

        let tweenMap : any = [];
        for(let i = this._tmpTweens.length - 1; i >= 0; i--)
        {
            
            // if (propertyType && arr)
            // {
            //     if (!tweenMap[propertyType])
            //     {
            //        tweenMap[propertyType] = [];
            //     }
            //     tweenMap[propertyType].push(arr);
            // }
            
            this._tmpTweens.pop();
        }

        // if (!target || !target.element)
        // {
        //     return;
        // }

        // for (const [propertyType, arr] of tweenMap)
        // {
        //     if (arr.length > 1)
        //     {
        //         arr.sort(this.transformCompare);
        //     }

        //     let sortedSArr :any = [];
        //     let maxDuration = 0;
        //     for(let i = 0; i < arr.length; i++)
        //     {
        //         sortedSArr.push(arr[i][2]);
        //         if (arr[i][3] > maxDuration)
        //         {
        //             maxDuration = arr[i][3];
        //         }
        //     }
        //     let propertyValue = sortedSArr.join(' ');
        //     let propertyKey = `${propertyType} ${maxDuration}s ${arr[0][0]} 0s`;
        //     target.element.appendTween(propertyType, propertyKey, propertyValue);
        // }
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

        $.Schedule(0.01, TweenManager.update);
    }
}

var _activeTweens: GTweener[] = new Array();
var _tweenerPool: Pool<GTweener> = new Pool<GTweener>(GTweener, e => e._init(), e => e._reset());
var _totalActiveTweens: number = 0;
var _inited: boolean = false;