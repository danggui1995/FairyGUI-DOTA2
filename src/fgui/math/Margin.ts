export enum MarginType
{
    W11,H11, W12,H12, W13,H13,
    W21,H21, W22,H22, W23,H23,
    W31,H31, W32,H32, W33,H33,
}
export class Margin {
    public left: number = 0;
    public right: number = 0;
    public top: number = 0;
    public bottom: number = 0;
    //中间的宽度
    public width: number = 0;
    //中间的高度
    public height: number = 0;

    public copy(source: Margin): void {
        this.top = source.top;
        this.bottom = source.bottom;
        this.left = source.left;
        this.right = source.right;
        this.width = source.width;
        this.height = source.height;
    }

    public getMargin(m : MarginType) : string
    {
        switch(m)
        {
            //horizontal
            case MarginType.W11:
            case MarginType.W21:
            case MarginType.W31:
            {
                return `${this.left}px`;
            }

            case MarginType.W12:
            {
                return `${this.left}px`;
            }
            case MarginType.W32:
            {
                return `${this.right}px`;
            }

            case MarginType.W13:
            case MarginType.W23:
            case MarginType.W33:
            {
                return `${this.right}px`;
            }

            //vertival
            case MarginType.H11:
            case MarginType.H12:
            case MarginType.H13:
            {
                return `${this.top}px`;
            }
            case MarginType.H21:
            case MarginType.H23:
            {
                return `${this.height}px`;
            }
            case MarginType.H31:
            case MarginType.H32:
            case MarginType.H33:
            {
                return `${this.bottom}px`;
            }

            case MarginType.W22:
            {
                return `${this.left}px`;
            }
            case MarginType.H22:
            {
                return `${this.right}px`;
            }
            default:
            {
                return `0px`;
            }
        }
    }
}
