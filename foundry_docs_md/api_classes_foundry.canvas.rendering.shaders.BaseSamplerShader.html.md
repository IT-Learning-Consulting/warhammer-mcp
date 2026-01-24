# BaseSamplerShader | Foundry Virtual Tabletop - API Documentation - Version 13

**Class BaseSamplerShader**  
The base sampler shader exposes a simple sprite shader and all the framework to handle:

- Batched shaders and plugin subscription  
- `configure` method (for special processing done once or punctually)  
- `update` method (pre-binding, normally done each frame)  

All other sampler shaders (batched or not) should extend `BaseSamplerShader`.

## Hierarchy  
- [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)  
- **BaseSamplerShader**  
  - [BaselineIlluminationSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaselineIlluminationSamplerShader.html)  
  - [ColorAdjustmentsSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html)  
  - [FogSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.FogSamplerShader.html)  
  - [ColorizeBrightnessShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorizeBrightnessShader.html)  
  - [OccludableSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html)  
  - [DepthSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.DepthSamplerShader.html)  

---

## Properties

### initialUniforms  
`initialUniforms: object`  
The initial values of the shader uniforms.  
Inherited from [AbstractBaseShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#initialuniforms).

---

## Static Properties

### batchDefaultUniforms  
`batchDefaultUniforms: object | (maxTextures: number) => object = {}`  
Returns default uniforms associated with the batched version of this sampler.

### batchFragmentShader  
`batchFragmentShader: string = ...`  
The batch fragment shader source.

### batchGeometry  
```typescript
batchGeometry: typeof BatchGeometry | { id: string; normalized: boolean; size: number; type: TYPES }[] = PIXI.BatchGeometry
```
Batch geometry associated with this sampler.

### batchRendererClass  
`batchRendererClass: typeof BatchRenderer = BatchRenderer`  
The batch renderer to use.  
[BatchRenderer](https://foundryvtt.com/api/classes/foundry.canvas.rendering.batching.BatchRenderer.html)

### batchShaderGeneratorClass  
`batchShaderGeneratorClass: typeof BatchShaderGenerator = BatchShaderGenerator`  
The batch generator to use.  
[BatchShaderGenerator](https://foundryvtt.com/api/classes/foundry.canvas.rendering.batching.BatchShaderGenerator.html)

### batchVertexShader  
`batchVertexShader: string = ...`  
The batch vertex shader source.

### batchVertexSize  
`batchVertexSize: number = 6`  
The size of a vertice with all its packed attributes.

### classPluginName  
`classPluginName: null | string = "batch"`  
The named batch sampler plugin that is used by this shader, or null if no batching is used.

### CONTRAST  
`CONTRAST: string = ...`  
Contrast adjustment string literal shader code.

### defaultUniforms  
```typescript
defaultUniforms: { sampler: number; tintAlpha: number[] } = ...
```
The default uniform values for the shader.  
A subclass of `AbstractBaseShader` must implement the `defaultUniforms` static field.  
Overrides [AbstractBaseShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#defaultuniforms).

### EXPOSURE  
`EXPOSURE: string = ...`  
Exposure adjustment shader code.

### fragmentShader  
`fragmentShader: string = ...`  
Overrides [AbstractBaseShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#fragmentshader).

### pausable  
`pausable: boolean = true`  
Is this shader pausable or not?

### reservedTextureUnits  
`reservedTextureUnits: number = 0`  
The number of reserved texture units for this shader that cannot be used by the batch renderer.

### SATURATION  
`SATURATION: string = ...`  
Saturation adjustment shader code.

### vertexShader  
`vertexShader: string = ...`  
Overrides [AbstractBaseShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#vertexshader).

### _packInterleavedGeometry  
```typescript
_packInterleavedGeometry: undefined | Function
```
Pack interleaved geometry custom function.

### _preRenderBatch  
```typescript
_preRenderBatch: (batchRenderer: BatchRenderer) => undefined | void
```
A prerender function happening just before the batch renderer is flushed.

---

## Accessors

### enabled  
```typescript
get enabled(): boolean
```
Activate or deactivate this sampler.  
If set to false, the batch rendering is redirected to `"batch"`. Otherwise, the batch rendering is directed toward the instance `pluginName` (may be null).

**Returns:** `boolean`

### paused  
```typescript
get paused(): boolean
```
Pause or unpause this sampler.  
If set to true, the shader is disabled. Otherwise, it is enabled.  
Contrary to `enabled`, a shader might refuse a pause in order to continue rendering animations, for example.

**Returns:** `boolean`

### pluginName  
```typescript
get pluginName(): null | string
```
The plugin name associated with this instance, if any. Returns `"batch"` if the shader is disabled.

**Returns:** `null | string`

---

## Methods

### ADJUSTMENTS  
```typescript
static get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders.

**Returns:** `string`

### _preRender  
```typescript
_preRender(mesh: any, renderer: any): void
```
Overrides [AbstractBaseShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_prerender).

**Parameters:**  
- **mesh**: `any`  
- **renderer**: `any`  

**Returns:** `void`

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
Inherited from [AbstractBaseShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#reset).

**Returns:** `void`

### _configure  
```typescript
protected _configure(): void
```
A one-time initialization performed on creation.  
Inherited from [AbstractBaseShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_configure).

**Returns:** `void`

### create  
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.  
Inherited from [AbstractBaseShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#create).

**Parameters:**  
- **initialUniforms**: `object`

**Returns:** `AbstractBaseShader`

### createPlugin  
```typescript
static createPlugin(): any
```
Create a batch plugin for this sampler class.

**Returns:** `any`  
The batch plugin class linked to this sampler class.

### initializeBatchGeometry  
```typescript
static initializeBatchGeometry(): void
```
Initialize the batch geometry with custom properties.

**Returns:** `void`

### registerPlugin  
```typescript
static registerPlugin(options?: { force?: object }): void
```
Register the plugin for this sampler.

**Parameters (optional):**  
- **options**: `{ force?: object } = {}`   
  - **force**?: `object` — Override the plugin of the same name that is already registered?

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)