# OccludableSamplerShader

The occlusion sampler shader.

Part of the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html)

Located in the module path: [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [OccludableSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html)

---

## Hierarchy

- _BaseSamplerShader_  
- **OccludableSamplerShader**  
- _PrimaryBaseSamplerShader_

---

## Properties

### initialUniforms  
Type: `object`  
The initial values of the shader uniforms.  
Inherited from [BaseSamplerShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#initialuniforms)

### Static Properties

- **batchGeometry**  
  Type: `{ id: string; normalized: boolean; size: number; type: TYPES }[]`  
  Overrides [BaseSamplerShader.batchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchgeometry)

- **batchRendererClass**  
  Type: `typeof BatchRenderer = BatchRenderer`  
  The batch renderer to use.  
  Inherited from [BaseSamplerShader.batchRendererClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchrendererclass)  
  See [BatchRenderer](https://foundryvtt.com/api/classes/foundry.canvas.rendering.batching.BatchRenderer.html)

- **batchShaderGeneratorClass**  
  Type: `typeof BatchShaderGenerator = BatchShaderGenerator`  
  The batch generator to use.  
  Inherited from [BaseSamplerShader.batchShaderGeneratorClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchshadergeneratorclass)  
  See [BatchShaderGenerator](https://foundryvtt.com/api/classes/foundry.canvas.rendering.batching.BatchShaderGenerator.html)

- **batchVertexSize**  
  Type: `number = 7`  
  Overrides [BaseSamplerShader.batchVertexSize](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchvertexsize)

- **classPluginName**  
  Type: `string = "batchOcclusion"`  
  Overrides [BaseSamplerShader.classPluginName](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#classpluginname)

- **CONTRAST**  
  Type: `string`  
  Contrast adjustment.  
  Inherited from [BaseSamplerShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#contrast)

- **defaultUniforms**  
  ```typescript
  {
    fadeOcclusion: number;
    occludedAlpha: number;
    occlusionElevation: number;
    occlusionTexture: null;
    radialOcclusion: number;
    sampler: null;
    screenDimensions: number[];
    tintAlpha: number[];
    unoccludedAlpha: number;
    visionOcclusion: number;
  }
  ```  
  Overrides [BaseSamplerShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#defaultuniforms)

- **EXPOSURE**  
  Type: `string`  
  Exposure adjustment.  
  Inherited from [BaseSamplerShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#exposure)

- **pausable**  
  Type: `boolean = true`  
  Is this shader pausable or not?  
  Inherited from [BaseSamplerShader.pausable](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#pausable)

- **reservedTextureUnits**  
  Type: `number = 1`  
  Overrides [BaseSamplerShader.reservedTextureUnits](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#reservedtextureunits)

- **SATURATION**  
  Type: `string`  
  Saturation adjustment  
  Inherited from [BaseSamplerShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#saturation)

---

## Protected Static Properties

- **_batchFragmentShader**  
  Type: `string`  
  The batch fragment shader source. Subclasses can override it.

- **_batchVertexShader**  
  Type: `string`  
  The batch vertex shader source. Subclasses can override it.

- **_fragmentShader**  
  Type: `string`  
  The fragment shader source. Subclasses can override it.

- **_vertexShader**  
  Type: `string`  
  The vertex shader source. Subclasses can override it.

---

## Accessors

### enabled  
```typescript
get enabled(): boolean
```
Activate or deactivate this sampler.  
If set to `false`, the batch rendering is redirected to `"batch"`. Otherwise, the batch rendering is directed toward the instance `pluginName` (might be `null`).  
Returns `boolean`  
Inherited from [BaseSamplerShader.enabled](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#enabled)

### paused  
```typescript
get paused(): boolean
```
Pause or unpause this sampler. If set to `true`, the shader is disabled; otherwise, it is enabled.  
Contrary to `enabled`, a shader might decide to refuse a pause, to continue rendering animations for example.  
Returns `boolean`  
Inherited from [BaseSamplerShader.paused](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#paused)

### pluginName  
```typescript
get pluginName(): null | string
```
The plugin name associated with this instance, if any. Returns `"batch"` if the shader is disabled.  
Returns `null` | `string`  
Inherited from [BaseSamplerShader.pluginName](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#pluginname)

### Static ADJUSTMENTS  
```typescript
static get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders.  
Returns `string`  
Inherited from [BaseSamplerShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#ADJUSTMENTS)

### Static batchFragmentShader  
```typescript
static get batchFragmentShader(): string
```
Returns `string`  
Overrides [BaseSamplerShader.batchFragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchFragmentShader)

### Static batchVertexShader  
```typescript
static get batchVertexShader(): string
```
Returns `string`  
Overrides [BaseSamplerShader.batchVertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchVertexShader)

### Static fragmentShader  
```typescript
static get fragmentShader(): string
```
Returns `string`  
Overrides [BaseSamplerShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#fragmentShader)

### Static vertexShader  
```typescript
static get vertexShader(): string
```
Returns `string`  
Overrides [BaseSamplerShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#vertexShader)

---

## Methods

### _preRender  
```typescript
_preRender(mesh: any, renderer: any): void
```
Overrides [_BaseSamplerShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_preRender)

**Parameters**

- **mesh**: `any`  
- **renderer**: `any`

**Returns** `void`

---

### reset  
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
Inherited from [BaseSamplerShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#reset)

**Returns** `void`

---

### _configure  
```typescript
protected _configure(): void
```
A one-time initialization performed on creation.  
Inherited from [BaseSamplerShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_configure)

**Returns** `void`

---

### Static _packInterleavedGeometry  
```typescript
static _packInterleavedGeometry(
  element: any, 
  attributeBuffer: any, 
  indexBuffer: any, 
  aIndex: any, 
  iIndex: any
): void
```
Overrides [BaseSamplerShader._packInterleavedGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_packInterleavedGeometry)

**Parameters**

- **element**: `any`  
- **attributeBuffer**: `any`  
- **indexBuffer**: `any`  
- **aIndex**: `any`  
- **iIndex**: `any`

**Returns** `void`

---

### Static _preRenderBatch  
```typescript
static _preRenderBatch(batchRenderer: any): void
```
Overrides [BaseSamplerShader._preRenderBatch](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_preRenderBatch)

**Parameters**

- **batchRenderer**: `any`

**Returns** `void`

---

### Static batchDefaultUniforms  
```typescript
static batchDefaultUniforms(maxTex: any): { occlusionTexture: any; screenDimensions: number[] }
```
Overrides [BaseSamplerShader.batchDefaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchDefaultUniforms)

**Parameters**

- **maxTex**: `any`

**Returns**  
```typescript
{
  occlusionTexture: any;
  screenDimensions: number[];
}
```

---

### Static create  
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.  
Inherited from [BaseSamplerShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#create)

**Parameters**

- **initialUniforms**: `object`

**Returns**  
[`AbstractBaseShader`](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)

---

### Static createPlugin  
```typescript
static createPlugin(): any
```
Create a batch plugin for this sampler class.  
Inherited from [BaseSamplerShader.createPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#createplugin)

**Returns** `any`  
The batch plugin class linked to this sampler class.

---

### Static initializeBatchGeometry  
```typescript
static initializeBatchGeometry(): void
```
Initialize the batch geometry with custom properties.  
Inherited from [BaseSamplerShader.initializeBatchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#initializebatchgeometry)

**Returns** `void`

---

### Static registerPlugin  
```typescript
static registerPlugin(options?: { force?: object }): void
```
Register the plugin for this sampler.

**Parameters (Optional)**

- **options**: `{ force?: object } = {}`  
  The options.

- **force?**: `object`  
  Override the plugin of the same name that is already registered?

**Returns** `void`  
Inherited from [BaseSamplerShader.registerPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#registerplugin)