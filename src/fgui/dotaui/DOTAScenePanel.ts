
import { UIElement } from "../core/UIElement";


export class DOTAScenePanel extends UIElement {
    public nativePanel: Panel;
    public scenePanel: ScenePanel;
    public effectPanel : EffectPanel;
    public light : string;
    public antialias : boolean;
    public renderdeferred : boolean;
    public camera : string;
    public map: string;
    public postProcessMaterial : string;
    public rotateonmousemove : boolean;
    public yawmin : number;
    public yawmax : number; 
    public pitchmin : number; 
    public pitchmax : number;
    public deferredalpha : boolean;
    public unit : string;

    //effect
    public particleName : string;
    public startActive : boolean;
    public cameraOrigin : string;
    public lookAt : string;
    public fov : number;
    public squarePixels : boolean;
    

    constructor() {
        super();

        //model
        this.light = "global_light"; 
        this.antialias = true; 
        this.renderdeferred = false; 

        //effect
        this.startActive = true;
        this.cameraOrigin = "0 0 100";
        this.lookAt = "0 0 0";
        this.fov = 60;
        this.squarePixels = true;

        this.scenePanel = undefined;
        this.effectPanel = undefined;
    }

    /**
     * 
     * @param effectPath 
     * @param properties 
     * {
     *      particleName : this.particleName,
            startActive : this.startActive,
            cameraOrigin : this.cameraOrigin,
            lookAt : this.lookAt,
            fov : this.fov,
            squarePixels : this.squarePixels,
            particleonly : true
     * }
     */
    public SetEffectWithParams(effectPath : string, squarePixels ?: boolean, height ?: number, fov ?: number)
    {
        if (this.effectPanel != undefined)
        {
            this.effectPanel.DeleteAsync(0);
        }
        this.effectPanel = $.CreatePanelWithProperties('DOTAParticleScenePanel', this.nativePanel, this.$owner.panelName, {
            particleName : effectPath,
            startActive : true,
            cameraOrigin : "0 0 " + ((height != undefined) ? height : this.width),
            lookAt : "0 0 0",
            fov : ((fov != undefined) ? fov : 60),
            squarePixels : squarePixels,
            camera : "camera_1",
            particleonly : true
        });
        this.effectPanel.style.width = "100%";
        this.effectPanel.style.height = "100%";
        // this.effectPanel.style.overflow = "noclip";
        // this.effectPanel.style.marginLeft = -this.width / 2 + "px";
        // this.effectPanel.style.marginTop = -this.height / 2 + "px";
    }

    /**
     * 
     * @param unitName 
     * @param properties 
     * {
            light : this.light,
            antialias : this.antialias,
            renderdeferred : this.renderdeferred,
            camera : this.camera,
            particleonly : false,
            map : this.map,
            postProcessMaterial : this.postProcessMaterial,
            rotateonmousemove : this.rotateonmousemove,
            yawmin : this.yawmin,
            yawmax : this.yawmax, 
            pitchmin : this.pitchmin, 
            pitchmax : this.pitchmax,
            deferredalpha : this.deferredalpha,
            unit : this.unit
        }
     */
    public setModelWithParams(unitName : string)
    {
        if (this.scenePanel != undefined)
        {
            this.scenePanel.DeleteAsync(0);
        }
        this.scenePanel = $.CreatePanelWithProperties('DOTAScenePanel', this.nativePanel, this.$owner.panelName, {
            light : this.light,
            antialias : this.antialias,
            renderdeferred : this.renderdeferred,
            camera : "camera_1",
            particleonly : false,
            // map : this.map,
            // postProcessMaterial : this.postProcessMaterial,
            // rotateonmousemove : this.rotateonmousemove,
            // yawmin : this.yawmin,
            // yawmax : this.yawmax, 
            // pitchmin : this.pitchmin, 
            // pitchmax : this.pitchmax,
            // deferredalpha : this.deferredalpha,
            unit : unitName
        });
        this.scenePanel.style.width = "100%";
        this.scenePanel.style.height = "100%";
        // this.scenePanel.style.marginLeft = -this.width / 2 + "px";
        // this.scenePanel.style.marginTop = -this.height / 2 + "px";
    }

    public init() {
        this.nativePanel = $.CreatePanel( "Panel", $('#HiddenRoot'), this.$owner.panelName);
    }

    public FireEntityInput(entityID: string, inputName: string, value: string): void
    {
        this.scenePanel.FireEntityInput(entityID, inputName, value);
    }
    public PlayEntitySoundEvent(arg1: any, arg2: any): number
    {
        return this.scenePanel.PlayEntitySoundEvent(arg1, arg2);
    }
    public SetUnit(unitName: string, environment: string, drawBackground: boolean): void
    {
        this.scenePanel.SetUnit(unitName, environment, drawBackground);
    }
    public GetPanoramaSurfacePanel(): Panel | null
    {
        return this.scenePanel.GetPanoramaSurfacePanel();
    }
    public SetRotateParams(yawMin: number, yawMax: number, pitchMin: number, pitchMax: number): void
    {
        this.scenePanel.SetRotateParams(yawMin, yawMax, pitchMin, pitchMax);
    }
    public SpawnHeroInScenePanelByPlayerSlot(unknown1: string, unknown2: number, unknown3: string): boolean
    {
        return this.scenePanel.SpawnHeroInScenePanelByPlayerSlot(unknown1, unknown2, unknown3);
    }
    public SpawnHeroInScenePanelByHeroId(unknown1: number, unknown2: string, unknown3: number): boolean
    {
        return this.scenePanel.SpawnHeroInScenePanelByHeroId(unknown1, unknown2, unknown3);
    }
    public SetScenePanelToPlayerHero(heroName: string, player: PlayerID): boolean
    {
        return this.scenePanel.SetScenePanelToPlayerHero(heroName, player);
    }
    public SetScenePanelToLocalHero(heroId: HeroID): boolean
    {
        return this.scenePanel.SetScenePanelToLocalHero(heroId);
    }
    public SetPostProcessFade(value: number): void
    {
        this.scenePanel.SetPostProcessFade(value);
    }
    /**
     * @example
     * scenePanel.SetCustomPostProcessMaterial("materials/dev/deferred_post_process_graphic_ui.vmat")
     */
    public SetCustomPostProcessMaterial(material: string): void
    {
        this.scenePanel.SetCustomPostProcessMaterial(material);
    }
    public SpawnHeroInScenePanelByPlayerSlotWithFullBodyView(heroName: string, player: PlayerID): boolean
    {
        return this.scenePanel.SpawnHeroInScenePanelByPlayerSlotWithFullBodyView(heroName, player);
    }

    public LerpToCameraEntity(unknown1: string, unknown2: number): void
    {
        this.scenePanel.LerpToCameraEntity(unknown1, unknown2);
    }
}