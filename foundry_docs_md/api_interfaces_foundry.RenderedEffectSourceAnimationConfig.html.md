# RenderedEffectSourceAnimationConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface RenderedEffectSourceAnimationConfig {
    animation?: Function;
    backgroundShader?: AdaptiveBackgroundShader;
    colorationShader?: AdaptiveColorationShader;
    darknessShader?: AdaptiveDarknessShader;
    illuminationShader?: AdaptiveIlluminationShader;
    label?: string;
    seed?: number;
    time?: number;
}
```

## Properties

### animation?  
- **Type:** `Function`  
- **Description:** The animation function that runs every frame

### backgroundShader?  
- **Type:** [AdaptiveBackgroundShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveBackgroundShader.html)  
- **Description:** A custom background shader used by this animation

### colorationShader?  
- **Type:** [AdaptiveColorationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html)  
- **Description:** A custom coloration shader used by this animation

### darknessShader?  
- **Type:** [AdaptiveDarknessShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveDarknessShader.html)  
- **Description:** A custom darkness shader used by this animation

### illuminationShader?  
- **Type:** [AdaptiveIlluminationShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html)  
- **Description:** A custom illumination shader used by this animation

### label?  
- **Type:** `string`  
- **Description:** The human-readable (localized) label for the animation

### seed?  
- **Type:** `number`  
- **Description:** The animation seed

### time?  
- **Type:** `number`  
- **Description:** The animation time