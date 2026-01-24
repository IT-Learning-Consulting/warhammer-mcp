# ColorAdjustmentsSamplerShader

A color adjustment shader.

## Hierarchy
- [BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html)  
- ColorAdjustmentsSamplerShader  
- [AmplificationSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AmplificationSamplerShader.html)  

---

## Properties

### initialUniforms
- Type: `object`  
- Description: The initial values of the shader uniforms.  
- Inherited from [BaseSamplerShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#initialuniforms)

---

#### Static Properties

### batchDefaultUniforms
- Type: `object | (maxTextures: number) => object = {}`  
- Description: Returns default uniforms associated with the batched version of this sampler.  
- Inherited from [BaseSamplerShader.batchDefaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchdefaultuniforms)

### batchFragmentShader
- Type: `string = ...`  
- Description: The batch fragment shader source.  
- Inherited from [BaseSamplerShader.batchFragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchfragmentshader)

### batchGeometry
- Type:  
  ```typescript
  | typeof BatchGeometry
  | { id: string; normalized: boolean; size: number; type: TYPES }[] = PIXI.BatchGeometry
  ```
- Description: Batch geometry associated with this sampler.  
- Inherited from [BaseSamplerShader.batchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchgeometry)

### batchRendererClass
- Type: `typeof BatchRenderer = BatchRenderer`  
- Description: The batch renderer to use.  
- Inherited from [BaseSamplerShader.batchRendererClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchrendererclass)

### batchShaderGeneratorClass
- Type: `typeof BatchShaderGenerator = BatchShaderGenerator`  
- Description: The batch generator to use.  
- Inherited from [BaseSamplerShader.batchShaderGeneratorClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchshadergeneratorclass)

### batchVertexShader
- Type: `string = ...`  
- Description: The batch vertex shader source.  
- Inherited from [BaseSamplerShader.batchVertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchvertexshader)

### batchVertexSize
- Type: `number = 6`  
- Description: The size of a vertice with all its packed attributes.  
- Inherited from [BaseSamplerShader.batchVertexSize](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchvertexsize)

### classPluginName
- Type: `null`  
- Description: Overrides BaseSamplerShader.classPluginName  
- Inherited from [BaseSamplerShader.classPluginName](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#classpluginname)

### CONTRAST
- Type: `string = ...`  
- Description: Contrast adjustment.  
- Inherited from [BaseSamplerShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#contrast)

### defaultUniforms
- Type:
  ```typescript
  {
    contrast: number;
    darknessLevelTexture: null;
    exposure: number;
    linkedToDarknessLevel: boolean;
    sampler: null;
    saturation: number;
    screenDimensions: number[];
    tint: number[];
    tintAlpha: number[];
  } = ...
  ```
- Description: The default uniform values for the shader. A subclass of AbstractBaseShader must implement the defaultUniforms static field.  
- Overrides [BaseSamplerShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#defaultuniforms)

### EXPOSURE
- Type: `string = ...`  
- Description: Exposure adjustment.  
- Inherited from [BaseSamplerShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#exposure)

### fragmentShader
- Type: `string = ...`  
- Description: Overrides BaseSamplerShader.fragmentShader  
- Inherited from [BaseSamplerShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#fragmentshader)

### pausable
- Type: `boolean = true`  
- Description: Is this shader pausable or not?  
- Inherited from [BaseSamplerShader.pausable](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#pausable)

### reservedTextureUnits
- Type: `number = 0`  
- Description: The number of reserved texture units for this shader that cannot be used by the batch renderer.  
- Inherited from [BaseSamplerShader.reservedTextureUnits](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#reservedtextureunits)

### SATURATION
- Type: `string = ...`  
- Description: Saturation adjustment.  
- Inherited from [BaseSamplerShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#saturation)

---

## Accessors

### vertexShader
- Type: `string = ...`  
- Description: Overrides BaseSamplerShader.vertexShader  
- Inherited from [BaseSamplerShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#vertexshader)

### _packInterleavedGeometry
- Type: `undefined | Function`  
- Description: Pack interleaved geometry custom function.  
- Inherited from [BaseSamplerShader._packInterleavedGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_packinterleavedgeometry)

### _preRenderBatch
- Type: `(batchRenderer: BatchRenderer) => undefined | void`  
- Description: A prerender function happening just before the batch renderer is flushed.  
- Inherited from [BaseSamplerShader._preRenderBatch](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_prerenderbatch)

### enabled
- Returns: `boolean`  
- Description:  
  Activate or deactivate this sampler. If set to false, the batch rendering is redirected to "batch". Otherwise, the batch rendering is directed toward the instance pluginName (might be null).  
- Inherited from BaseSamplerShader.enabled

### paused
- Returns: `boolean`  
- Description:  
  Pause or unpause this sampler. If set to true, the shader is disabled. Otherwise, it is enabled.  
  Contrary to `enabled`, a shader might decide to refuse a pause, to continue rendering animations for example.  
- Inherited from BaseSamplerShader.paused

### pluginName
- Returns: `null | string`  
- Description: The plugin name associated with this instance, if any. Returns "batch" if the shader is disabled.  
- Inherited from BaseSamplerShader.pluginName

### ADJUSTMENTS
- Static Getter  
- Returns: `string`  
- Description: The adjustments made into fragment shaders.  
- Inherited from BaseSamplerShader.ADJUSTMENTS

---

## Methods

### _preRender

```typescript
_preRender(mesh: any, renderer: any): void
```

- Parameters:
  - **mesh**: `any`
  - **renderer**: `any`
- Returns: `void`  
- Description:  
  Inherited from [BaseSamplerShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_prerender)

---

### reset

```typescript
reset(): void
```

- Returns: `void`  
- Description: Reset the shader uniforms back to their initial values.  
- Inherited from [BaseSamplerShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#reset)

---

### _configure

```typescript
protected _configure(): void
```

- Returns: `void`  
- Description:  
  A one-time initialization performed on creation.  
- Inherited from [BaseSamplerShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_configure)

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

- Parameters:
  - **initialUniforms**: `object`
- Returns: `AbstractBaseShader`  
- Description:  
  A factory method for creating the shader using its defined default values.  
- Inherited from [BaseSamplerShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#create)

---

### createPlugin

```typescript
static createPlugin(): any
```

- Returns: `any`  
- Description: Creates a batch plugin for this sampler class. The batch plugin class linked to this sampler class.  
- Inherited from [BaseSamplerShader.createPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#createplugin)

---

### initializeBatchGeometry

```typescript
static initializeBatchGeometry(): void
```

- Returns: `void`  
- Description: Initialize the batch geometry with custom properties.  
- Inherited from [BaseSamplerShader.initializeBatchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#initializebatchgeometry)

---

### registerPlugin

```typescript
static registerPlugin(options?: { force?: object }): void
```

- Parameters:
  - **options?**: Optional  
    - **force?**: `object` - Override the plugin of the same name that is already registered?
- Returns: `void`  
- Description: Register the plugin for this sampler.  
- Inherited from [BaseSamplerShader.registerPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#registerplugin)

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html).