# WeatherEffectConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface WeatherEffectConfiguration {
    blendMode?: BLEND_MODES;
    config?: object;
    effectClass: typeof ParticleEffect | typeof WeatherShaderEffect;
    id: string;
    performanceLevel?: number;
    shaderClass?: typeof AbstractWeatherShader;
}
```

## Properties

### **blendMode?**
- Type: `BLEND_MODES`
- Optional blend mode used for rendering the weather effect.

### **config?**
- Type: `object`
- Optional configuration object for additional settings.

### **effectClass**
- Type: `typeof [ParticleEffect](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html) | typeof [WeatherShaderEffect](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.WeatherShaderEffect.html)`
- The class implementing the weather effect. This can be either a ParticleEffect or a WeatherShaderEffect.

### **id**
- Type: `string`
- Unique identifier for the weather effect.

### **performanceLevel?**
- Type: `number`
- Optional numeric value denoting the performance level of the weather effect.

### **shaderClass?**
- Type: `typeof [AbstractWeatherShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractWeatherShader.html)`
- Optional shader class used for rendering the weather effect.