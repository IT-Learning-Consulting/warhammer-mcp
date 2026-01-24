# LightSourceAnimationConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
type LightSourceAnimationConfig = Record<
  string,
  {
    animation: Function;
    backgroundShader?: typeof import("https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveBackgroundShader.html").AdaptiveBackgroundShader;
    colorationShader: typeof import("https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveColorationShader.html").AdaptiveColorationShader;
    illuminationShader?: typeof import("https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveIlluminationShader.html").AdaptiveIlluminationShader;
    label: string;
  }
>;
```

A light source animation configuration object.

---

**See also:** [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)