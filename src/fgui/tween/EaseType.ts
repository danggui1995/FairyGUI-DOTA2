
export enum EaseType {
    Linear = 0,
    SineIn = 1,
    SineOut = 2,
    SineInOut = 3,
    QuadIn = 4,
    QuadOut = 5,
    QuadInOut = 6,
    CubicIn = 7,
    CubicOut = 8,
    CubicInOut = 9,
    QuartIn = 10,
    QuartOut = 11,
    QuartInOut = 12,
    QuintIn = 13,
    QuintOut = 14,
    QuintInOut = 15,
    ExpoIn = 16,
    ExpoOut = 17,
    ExpoInOut = 18,
    CircIn = 19,
    CircOut = 20,
    CircInOut = 21,
    ElasticIn = 22,
    ElasticOut = 23,
    ElasticInOut = 24,
    BackIn = 25,
    BackOut = 26,
    BackInOut = 27,
    BounceIn = 28,
    BounceOut = 29,
    BounceInOut = 30,
    Custom = 31,
}

export function getEasePanorama(easeType : EaseType): string
{
    switch(easeType)
    {
        case EaseType.BackIn:
        case EaseType.BounceIn:
        case EaseType.CircIn:
        case EaseType.CubicIn:
        case EaseType.ElasticIn:
        case EaseType.QuadIn:
        case EaseType.QuartIn:
        case EaseType.QuintIn:
        case EaseType.SineIn:
        case EaseType.ExpoIn:
        {
            return "ease-in";
        }

        case EaseType.BackOut:
        case EaseType.BounceOut:
        case EaseType.CircOut:
        case EaseType.CubicOut:
        case EaseType.ElasticOut:
        case EaseType.QuadOut:
        case EaseType.QuartOut:
        case EaseType.QuintOut:
        case EaseType.SineOut:
        case EaseType.ExpoOut:
        {
            return "ease-out";
        }

        case EaseType.BackInOut:
        case EaseType.BounceInOut:
        case EaseType.CircInOut:
        case EaseType.CubicInOut:
        case EaseType.ElasticInOut:
        case EaseType.QuadInOut:
        case EaseType.QuartInOut:
        case EaseType.QuintInOut:
        case EaseType.SineInOut:
        case EaseType.ExpoInOut:
        {
            return "ease-in-out";
        }

        case EaseType.Linear:
        {
            return "linear";
        }
        case EaseType.Custom:
        {
            // return `cubic-bezier(${})`;
            //TODO 不知道这里怎么对应  后续有时间再看看
            return "ease";
        }
    }
}
