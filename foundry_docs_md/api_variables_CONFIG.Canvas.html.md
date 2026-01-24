# Canvas | Foundry Virtual Tabletop - API Documentation - Version 13

## Variable Canvas Const

Configuration settings for the Canvas and its contained layers and objects:

```typescript
Canvas: {
    blurQuality: number;
    blurStrength: number;
    brightestColor: number;
    chatBubblesClass: typeof ChatBubbles;
    darknessAnimations: DarknessSourceAnimationConfig;
    darknessColor: number;
    darknessLightPenalty: number;
    darknessSourceClass: typeof PointDarknessSource;
    darknessSourcePaddingMultiplier: number;
    darknessToDaylightAnimationMS: number;
    daylightColor: number;
    daylightToDarknessAnimationMS: number;
    detectionModes: Record<string, DetectionMode>;
    dispositionColors: {
        CONTROLLED: number;
        FRIENDLY: number;
        HOSTILE: number;
        INACTIVE: number;
        NEUTRAL: number;
        PARTY: number;
        SECRET: number;
    };
    doorControlClass: typeof DoorControl;
    dragSpeedModifier: number;
    elevationSnappingPrecision: number;
    exploredColor: number;
    fogManager: typeof FogManager;
    globalLightSourceClass: typeof GlobalLightSource;
    gridStyles: {
        dashedLines: {
            label: string;
            shaderClass: typeof GridShader;
            shaderOptions: { style: number };
        };
        diamondPoints: {
            label: string;
            shaderClass: typeof GridShader;
            shaderOptions: { style: number };
        };
        dottedLines: {
            label: string;
            shaderClass: typeof GridShader;
            shaderOptions: { style: number };
        };
        roundPoints: {
            label: string;
            shaderClass: typeof GridShader;
            shaderOptions: { style: number };
        };
        solidLines: {
            label: string;
            shaderClass: typeof GridShader;
            shaderOptions: { style: number };
        };
        squarePoints: {
            label: string;
            shaderClass: typeof GridShader;
            shaderOptions: { style: number };
        };
    };
    groups: {
        effects: { groupClass: typeof EffectsCanvasGroup; parent: string };
        environment: { groupClass: typeof EnvironmentCanvasGroup; parent: string };
        hidden: { groupClass: typeof HiddenCanvasGroup; parent: string };
        interface: {
            groupClass: typeof InterfaceCanvasGroup;
            parent: string;
            zIndexDrawings: number;
            zIndexScrollingText: number;
        };
        overlay: { groupClass: typeof OverlayCanvasGroup; parent: string };
        primary: { groupClass: typeof PrimaryCanvasGroup; parent: string };
        rendered: { groupClass: typeof RenderedCanvasGroup; parent: string };
        visibility: { groupClass: typeof CanvasVisibility; parent: string };
    };
    hoverFade: object;
    layers: {
        controls: { group: string; layerClass: typeof ControlsLayer };
        drawings: { group: string; layerClass: typeof DrawingsLayer };
        grid: { group: string; layerClass: typeof GridLayer };
        lighting: { group: string; layerClass: typeof LightingLayer };
        notes: { group: string; layerClass: typeof NotesLayer };
        regions: { group: string; layerClass: typeof RegionLayer };
        sounds: { group: string; layerClass: typeof SoundsLayer };
        templates: { group: string; layerClass: typeof TemplateLayer };
        tiles: { group: string; layerClass: typeof TilesLayer };
        tokens: { group: string; layerClass: typeof TokenLayer };
        walls: { group: string; layerClass: typeof WallsLayer };
        weather: { group: string; layerClass: typeof WeatherEffects };
    };
    lightAnimations: LightSourceAnimationConfig;
    lightLevels: {
        bright: number;
        dark: number;
        dim: number;
        halfdark: number;
    };
    lightSourceClass: typeof PointLightSource;
    managedScenes: Record<string, typeof SceneManager>;
    maxZoom: number;
    minZoom: undefined;
    objectBorderThickness: number;
    pings: {
        pullSpeed: number;
        styles: {
            alert: {
                class: typeof AlertPing;
                color: string;
                duration: number;
                size: number;
            };
            arrow: {
                class: typeof ArrowPing;
                duration: number;
                size: number;
            };
            chevron: {
                class: typeof ChevronPing;
                duration: number;
                size: number;
            };
            pulse: {
                class: typeof PulsePing;
                duration: number;
                size: number;
            };
        };
        types: {
            ALERT: string;
            ARROW: string;
            PULL: string;
            PULSE: string;
        };
    };
    polygonBackends: {
        darkness: typeof ClockwiseSweepPolygon;
        light: typeof ClockwiseSweepPolygon;
        move: typeof ClockwiseSweepPolygon;
        sight: typeof ClockwiseSweepPolygon;
        sound: typeof ClockwiseSweepPolygon;
    };
    rulerClass: typeof Ruler;
    soundSourceClass: typeof PointSoundSource;
    targeting: { size: number };
    unexploredColor: number;
    visibilityFilter: typeof VisibilityFilter;
    visionModes: Record<string, VisionMode>;
    visionSourceClass: typeof PointVisionSource;
    visualEffectsMaskingFilter: typeof VisualEffectsMaskingFilter;
}
```

### Parameters Description

- **blurQuality**: *number*  
- **blurStrength**: *number*  
- **brightestColor**: *number*  
- **chatBubblesClass**: *typeof* [ChatBubbles](https://foundryvtt.com/api/classes/foundry.canvas.animation.ChatBubbles.html)  
- **darknessAnimations**: [DarknessSourceAnimationConfig](https://foundryvtt.com/api/types/CONFIG.DarknessSourceAnimationConfig.html)  
- **darknessColor**: *number*  
- **darknessLightPenalty**: *number*  
- **darknessSourceClass**: *typeof* [PointDarknessSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointDarknessSource.html)  
- **darknessSourcePaddingMultiplier**: *number*  
- **darknessToDaylightAnimationMS**: *number*  
- **daylightColor**: *number*  
- **daylightToDarknessAnimationMS**: *number*  
- **detectionModes**: *Record<string, DetectionMode>*  
  The set of [DetectionMode](https://foundryvtt.com/api/classes/foundry.canvas.perception.DetectionMode.html) definitions which are available to be used for visibility detection.
- **dispositionColors**:  
  - CONTROLLED: *number*  
  - FRIENDLY: *number*  
  - HOSTILE: *number*  
  - INACTIVE: *number*  
  - NEUTRAL: *number*  
  - PARTY: *number*  
  - SECRET: *number*  
- **doorControlClass**: *typeof* [DoorControl](https://foundryvtt.com/api/classes/foundry.canvas.containers.DoorControl.html)  
  The class used to render door control icons.
- **dragSpeedModifier**: *number*  
- **elevationSnappingPrecision**: *number*  
- **exploredColor**: *number*  
- **fogManager**: *typeof* [FogManager](https://foundryvtt.com/api/classes/foundry.canvas.perception.FogManager.html)  
- **globalLightSourceClass**: *typeof* [GlobalLightSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.GlobalLightSource.html)  
- **gridStyles**:  
  - **dashedLines**:  
    - label: *string*  
    - shaderClass: *typeof* [GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)  
    - shaderOptions: { style: *number* }  
  - **diamondPoints**:  
    - label: *string*  
    - shaderClass: *typeof* [GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)  
    - shaderOptions: { style: *number* }  
  - **dottedLines**:  
    - label: *string*  
    - shaderClass: *typeof* [GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)  
    - shaderOptions: { style: *number* }  
  - **roundPoints**:  
    - label: *string*  
    - shaderClass: *typeof* [GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)  
    - shaderOptions: { style: *number* }  
  - **solidLines**:  
    - label: *string*  
    - shaderClass: *typeof* [GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)  
    - shaderOptions: { style: *number* }  
  - **squarePoints**:  
    - label: *string*  
    - shaderClass: *typeof* [GridShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)  
    - shaderOptions: { style: *number* }  
- **groups**:  
  - **effects**: { groupClass: *typeof* [EffectsCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.EffectsCanvasGroup.html); parent: *string* }  
  - **environment**: { groupClass: *typeof* [EnvironmentCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.EnvironmentCanvasGroup.html); parent: *string* }  
  - **hidden**: { groupClass: *typeof* [HiddenCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.HiddenCanvasGroup.html); parent: *string* }  
  - **interface**: {  
    groupClass: *typeof* [InterfaceCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.InterfaceCanvasGroup.html);  
    parent: *string*;  
    zIndexDrawings: *number*;  
    zIndexScrollingText: *number*;  
    }  
  - **overlay**: { groupClass: *typeof* [OverlayCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.OverlayCanvasGroup.html); parent: *string* }  
  - **primary**: { groupClass: *typeof* [PrimaryCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.PrimaryCanvasGroup.html); parent: *string* }  
  - **rendered**: { groupClass: *typeof* [RenderedCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.RenderedCanvasGroup.html); parent: *string* }  
  - **visibility**: { groupClass: *typeof* [CanvasVisibility](https://foundryvtt.com/api/classes/foundry.canvas.groups.CanvasVisibility.html); parent: *string* }  
- **hoverFade**: *object*  
  The hover-fading configuration.
- **layers**:  
  - controls: { group: *string*; layerClass: *typeof* [ControlsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.ControlsLayer.html) }  
  - drawings: { group: *string*; layerClass: *typeof* [DrawingsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.DrawingsLayer.html) }  
  - grid: { group: *string*; layerClass: *typeof* [GridLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.GridLayer.html) }  
  - lighting: { group: *string*; layerClass: *typeof* [LightingLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.LightingLayer.html) }  
  - notes: { group: *string*; layerClass: *typeof* [NotesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.NotesLayer.html) }  
  - regions: { group: *string*; layerClass: *typeof* [RegionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.RegionLayer.html) }  
  - sounds: { group: *string*; layerClass: *typeof* [SoundsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.SoundsLayer.html) }  
  - templates: { group: *string*; layerClass: *typeof* [TemplateLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TemplateLayer.html) }  
  - tiles: { group: *string*; layerClass: *typeof* [TilesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TilesLayer.html) }  
  - tokens: { group: *string*; layerClass: *typeof* [TokenLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TokenLayer.html) }  
  - walls: { group: *string*; layerClass: *typeof* [WallsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.WallsLayer.html) }  
  - weather: { group: *string*; layerClass: *typeof* [WeatherEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.WeatherEffects.html) }  
- **lightAnimations**: [LightSourceAnimationConfig](https://foundryvtt.com/api/types/CONFIG.LightSourceAnimationConfig.html)  
- **lightLevels**: { bright: number; dark: number; dim: number; halfdark: number; }  
- **lightSourceClass**: *typeof* [PointLightSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointLightSource.html)  
- **managedScenes**: *Record<string, typeof SceneManager>*  
  A registry of Scenes which are managed by a specific [SceneManager](https://foundryvtt.com/api/classes/foundry.canvas.SceneManager.html) class.  
- **maxZoom**: *number*  
- **minZoom**: *undefined*  
- **objectBorderThickness**: *number*  
- **pings**:  
  - pullSpeed: *number*  
  - styles:  
    - alert: {  
      class: *typeof* [AlertPing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.AlertPing.html);  
      color: *string*;  
      duration: *number*;  
      size: *number*;  
      }  
    - arrow: {  
      class: *typeof* [ArrowPing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.ArrowPing.html);  
      duration: *number*;  
      size: *number*;  
      }  
    - chevron: {  
      class: *typeof* [ChevronPing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.ChevronPing.html);  
      duration: *number*;  
      size: *number*;  
      }  
    - pulse: {  
      class: *typeof* [PulsePing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html);  
      duration: *number*;  
      size: *number*;  
      }  
  - types: { ALERT: string; ARROW: string; PULL: string; PULSE: string }  
- **polygonBackends**:  
  - darkness: *typeof* [ClockwiseSweepPolygon](https://foundryvtt.com/api/classes/foundry.canvas.geometry.ClockwiseSweepPolygon.html)  
  - light: *typeof* ClockwiseSweepPolygon  
  - move: *typeof* ClockwiseSweepPolygon  
  - sight: *typeof* ClockwiseSweepPolygon  
  - sound: *typeof* ClockwiseSweepPolygon  
- **rulerClass**: *typeof* [Ruler](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ruler.html)  
- **soundSourceClass**: *typeof* [PointSoundSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointSoundSource.html)  
- **targeting**: { size: number }  
- **unexploredColor**: *number*  
- **visibilityFilter**: *typeof* [VisibilityFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.VisibilityFilter.html)  
- **visionModes**: *Record<string, VisionMode>*  
  The set of [VisionMode](https://foundryvtt.com/api/classes/foundry.canvas.perception.VisionMode.html) definitions which are available to be used for Token vision.  
- **visionSourceClass**: *typeof* [PointVisionSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html)  
- **visualEffectsMaskingFilter**: *typeof* [VisualEffectsMaskingFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.VisualEffectsMaskingFilter.html)