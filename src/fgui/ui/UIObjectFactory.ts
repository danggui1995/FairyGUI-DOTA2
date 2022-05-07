import { ObjectType, PackageItemType } from "./FieldTypes";
import { GButton } from "./GButton";
import { GComboBox } from "./GComboBox";
import { GComponent } from "./GComponent";
import { GGraph } from "./GGraph";
import { GGroup } from "./GGroup";
import { GImage } from "./GImage";
import { GLabel } from "./GLabel";
import { GList } from "./GList";
import { GLoader } from "./GLoader";
import { GMovieClip } from "./GMovieClip";
import { GObject } from "./GObject";
import { GProgressBar } from "./GProgressBar";
import { GRichTextField } from "./GRichTextField";
import { GScrollBar } from "./GScrollBar";
import { GSlider } from "./GSlider";
import { GTextField } from "./GTextField";
import { GTextInput } from "./GTextInput";
import { GTree } from "./GTree";
import { PackageItem } from "./PackageItem";
import { UIPackage } from "./UIPackage";
import { GLoader3D } from "./GLoader3D";
import { UIConfig } from "./UIConfig";
import {GDOTAAbilityImage, GDOTAHeroImage, GDOTAItemImage, GDOTAAvatarImage, GDOTAScenePanel, GDOTAUserName } from "../FairyGUI";

export class UIObjectFactory {
    public static extensions: { [index: string]: new () => GComponent } = {};
    public static loaderType: new (name ?: string) => GLoader;
    public static screenRadio = 0;
    public static setExtension(url: string, type: new () => GComponent): void {
        if (url == null)
            throw new Error("Invaild url: " + url);

        var pi: PackageItem = UIPackage.getItemByURL(url);
        if (pi)
            pi.extensionType = type;

        UIObjectFactory.extensions[url] = type;
    }

    public static setExtensionWithPkg(pkgName : string, resName : string, type: new () => GComponent) : void
    {
        var url = UIPackage.getItemRawURL(pkgName, resName);
        this.setExtension(url, type);
    }

    public static setLoaderExtension(type: new (name ?: string) => GLoader): void {
        UIObjectFactory.loaderType = type;
    }

    public static resolveExtension(pi: PackageItem): void {
        var extensionType = UIObjectFactory.extensions["ui://" + pi.owner.id + pi.id];
        if (!extensionType)
            extensionType = UIObjectFactory.extensions["ui://" + pi.owner.name + "/" + pi.name];

        if (extensionType)
            pi.extensionType = extensionType;
    }

    public static checkDOTAType(name : string) : GComponent
    {
        if (name == "DOTAAbilityImage")
        {
            return new GDOTAAbilityImage(name); 
        }
        else if (name == "DOTAItemImage")
        {
            return new GDOTAItemImage(name); 
        }
        else if (name == "DOTAHeroImage")
        {
            return new GDOTAHeroImage(name); 
        }
        else if (name == "DOTAAvatarImage")
        {
            return new GDOTAAvatarImage(name); 
        }
        else if (name == "DOTAEffect" || name == "DOTAModel")
        {
            return new GDOTAScenePanel(name); 
        }
        else if (name == "DOTAUserName")
        {
            return new GDOTAUserName(name); 
        }
        return null;
    }

    public static getAspectRadio()
    {
        if (UIObjectFactory.screenRadio == 0)
        {
            UIObjectFactory.screenRadio = 1080 / Game.GetScreenHeight();
        }
        return UIObjectFactory.screenRadio;
    }

    public static openURL(url : string)
    {
        
    }

    public static newObject(type: number | PackageItem, userClass?: new () => GObject, name ?: string): GObject {
        var obj: GObject;

        if (typeof type === 'number') {
            switch (type) {
                case ObjectType.Image:
                    return new GImage(name);

                case ObjectType.MovieClip:
                    return new GMovieClip(name);

                case ObjectType.Component:
                {
                    var dtp = UIObjectFactory.checkDOTAType(name);
                    if (dtp)
                    {
                        return dtp;
                    }
                    
                    return new GComponent(name);
                }
                    

                case ObjectType.Text:
                    return new GTextField(name);

                case ObjectType.RichText:
                    return new GRichTextField(name);

                case ObjectType.InputText:
                    return new GTextInput(name);

                case ObjectType.Group:
                    return new GGroup(name);

                case ObjectType.List:
                    return new GList(name);

                case ObjectType.Graph:
                    return new GGraph(name);

                case ObjectType.Loader:
                    if (UIObjectFactory.loaderType)
                        return new UIObjectFactory.loaderType(name);
                    else
                        return new GLoader(name);

                case ObjectType.Button:
                    return new GButton(name);

                case ObjectType.Label:
                    return new GLabel(name);

                case ObjectType.ProgressBar:
                    return new GProgressBar(name);

                case ObjectType.Slider:
                    return new GSlider(name);

                case ObjectType.ScrollBar:
                    return new GScrollBar(name);

                case ObjectType.ComboBox:
                    return new GComboBox(name);

                case ObjectType.Tree:
                    return new GTree(name);

                case ObjectType.Loader3D:
                    return new GLoader3D(name);

                default:
                    return null;
            }
        }
        else {
            if (type.type == PackageItemType.Component) {
                if (userClass)
                    obj = new userClass();
                else if (type.extensionType)
                    obj = new type.extensionType();
                else
                    obj = UIObjectFactory.newObject(type.objectType, null, type.name);
            }
            else
                obj = UIObjectFactory.newObject(type.objectType, null, type.name);

            if (obj)
                obj.packageItem = type;
        }

        return obj;
    }
}

$.UIObjectFactory = UIObjectFactory;