
type EventHandler = () => void;
export class DotaPanel {
    children?: DotaPanel[];
    dangerouslyCreateChildren?: string;
    dialogVariables?: Record<string, string | number | Date>;

    id : string;
    className?: string;
    acceptsfocus?: boolean;
    draggable?: boolean;
    parentElement ?: DotaPanel;
    isConnected ?: boolean;
    // TODO: sectionpos?: 'auto';?

    onload?: EventHandler;
    onfocus?: EventHandler;
    onactivate?: EventHandler;
    onmouseactivate?: EventHandler;
    ondblclick?: EventHandler;
    oncontextmenu?: EventHandler;
    onmouseover?: EventHandler;
    onmouseout?: EventHandler;
    onmovedown?: EventHandler;
    onmoveleft?: EventHandler;
    onmoveright?: EventHandler;
    onmoveup?: EventHandler;
    oncancel?: EventHandler;
    ontabforward?: EventHandler;

    nativePanel : Panel;

    public set visible(bool : boolean)
    {
        this.nativePanel.visible = bool;
    }
    public get visible():boolean
    {
        return this.nativePanel.visible;
    }

    constructor() {

    }

    public removeChild<T extends DotaPanel>(child : T)
    {
        this.removeNativeChild(child.nativePanel);
    }

    public appendChild<T extends DotaPanel>(child : T)
    {
        this.addNativeChild(child.nativePanel);
    }

    public addNativeChild(child : Panel)
    {
        child.SetParent(this.nativePanel);
    }

    public removeNativeChild(child : Panel)
    {
        if (!child.IsValid())
        {
            return;
        }
        child.SetParent($('#HiddenRoot'));
        // child.SetParent(null);
        // child.DeleteAsync(0);
    }

    public insertBefore<T extends DotaPanel>(child : T, refNode : T)
    {
        if (!child.nativePanel.IsValid() || !refNode.nativePanel.IsValid() || !this.nativePanel.IsValid())
        {
            return;
        }
        child.nativePanel.SetParent(this.nativePanel);
        this.nativePanel.MoveChildBefore(child.nativePanel ,refNode.nativePanel);
    }
}