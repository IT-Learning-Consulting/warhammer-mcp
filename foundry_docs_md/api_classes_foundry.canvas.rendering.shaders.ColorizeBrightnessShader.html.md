# ColorizeBrightnessShader | Foundry Virtual Tabletop - API Documentation - Version 13

A colorization shader which keeps brightness contrary to "normal tinting"

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.shaders.ColorizeBrightnessShader), Expand  

- *BaseSamplerShader*  
- **ColorizeBrightnessShader**

## Properties

### initialUniforms
Type: `object`  
The initial values of the shader uniforms.  
Inherited from [BaseSamplerShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#initialuniforms)

### batchDefaultUniforms
Type: `object | (maxTextures: number) => object` = `{}`  
Returns default uniforms associated with the batched version of this sampler.  
Inherited from [BaseSamplerShader.batchDefaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchdefaultuniforms)

### batchFragmentShader
Type: `string`  
The batch fragment shader source.  
Inherited from [BaseSamplerShader.batchFragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchfragmentshader)

### batchGeometry
Type:  
```typescript
| typeof BatchGeometry
| { id: string; normalized: boolean; size: number; type: TYPES }[] = PIXI.BatchGeometry
```
Batch geometry associated with this sampler.  
Inherited from [BaseSamplerShader.batchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchgeometry)

### batchRendererClass
Type: `typeof BatchRenderer = BatchRenderer`  
The batch renderer to use.  
Inherited from [BaseSamplerShader.batchRendererClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchrendererclass)

### batchShaderGeneratorClass
Type: `typeof BatchShaderGenerator = BatchShaderGenerator`  
The batch generator to use.  
Inherited from [BaseSamplerShader.batchShaderGeneratorClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchshadergeneratorclass)

### batchVertexShader
Type: `string`  
The batch vertex shader source.  
Inherited from [BaseSamplerShader.batchVertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchvertexshader)

### batchVertexSize
Type: `number` = 6  
The size of a vertice with all its packed attributes.  
Inherited from [BaseSamplerShader.batchVertexSize](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#batchvertexsize)

### classPluginName
Type: `null`  
Overrides [BaseSamplerShader.classPluginName](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#classpluginname)

### CONTRAST
Type: `string`  
Contrast adjustment  
Inherited from [BaseSamplerShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#contrast)

### defaultUniforms
Type:  
```typescript
{
  grey: boolean;
  intensity: number;
  sampler: null;
  screenDimensions: number[];
  tintAlpha: number[];
  tintLinear: number[];
} = ...
```
The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.  
Overrides [BaseSamplerShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#defaultuniforms)

### EXPOSURE
Type: `string`  
Exposure adjustment.  
Inherited from [BaseSamplerShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#exposure)

### fragmentShader
Type: `string`  
Overrides [BaseSamplerShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#fragmentshader)

### pausable
Type: `boolean` = `true`  
Is this shader pausable or not?  
Inherited from [BaseSamplerShader.pausable](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#pausable)

### reservedTextureUnits
Type: `number` = 0  
The number of reserved texture units for this shader that cannot be used by the batch renderer.  
Inherited from [BaseSamplerShader.reservedTextureUnits](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#reservedtextureunits)

### SATURATION
Type: `string`  
Saturation adjustment  
Inherited from [BaseSamplerShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#saturation)

### vertexShader
Type: `string`  
Overrides [BaseSamplerShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#vertexshader)

### _packInterleavedGeometry
Type: `undefined | Function`  
Pack interleaved geometry custom function.  
Inherited from [BaseSamplerShader._packInterleavedGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_packinterleavedgeometry)

### _preRenderBatch
Type: `(batchRenderer: BatchRenderer) => undefined | void`  
A prerender function happening just before the batch renderer is flushed.  
Inherited from [BaseSamplerShader._preRenderBatch](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_prerenderbatch)

## Accessors

### enabled
```typescript
get enabled(): boolean
```
Activate or deactivate this sampler. If set to false, the batch rendering is redirected to `"batch"`. Otherwise, the batch rendering is directed toward the instance `pluginName` (might be `null`).  
Returns: `boolean`  
Inherited from `BaseSamplerShader.enabled`

### paused
```typescript
get paused(): boolean
```
Pause or Unpause this sampler. If set to true, the shader is disabled. Otherwise, it is enabled. Contrary to `enabled`, a shader might decide to refuse a pause, to continue to render animations for example.  
Returns: `boolean`  
Inherited from `BaseSamplerShader.paused`

### pluginName
```typescript
get pluginName(): null | string
```
The plugin name associated for this instance, if any. Returns `"batch"` if the shader is disabled.  
Returns: `null | string`  
Inherited from `BaseSamplerShader.pluginName`

### ADJUSTMENTS
```typescript
static get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders.  
Returns: `string`  
Inherited from `BaseSamplerShader.ADJUSTMENTS`

## Methods

### _preRender
```typescript
_preRender(mesh: any, renderer: any): void
```
Inherited from [BaseSamplerShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_prerender)

**Parameters:**

- **mesh**: `any`  
- **renderer**: `any`  

Returns: `void`

### reset
```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
Returns: `void`  
Inherited from [BaseSamplerShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#reset)

### _configure
```typescript
protected _configure(): void
```
A one-time initialization performed on creation.  
Returns: `void`  
Inherited from [BaseSamplerShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#_configure)

### create
```typescript
static create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`  

Returns: [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)  
Inherited from [BaseSamplerShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#create)

### createPlugin
```typescript
static createPlugin(): any
```
Create a batch plugin for this sampler class.  
Returns: `any` The batch plugin class linked to this sampler class.  
Inherited from [BaseSamplerShader.createPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#createplugin)

### initializeBatchGeometry
```typescript
static initializeBatchGeometry(): void
```
Initialize the batch geometry with custom properties.  
Returns: `void`  
Inherited from [BaseSamplerShader.initializeBatchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#initializebatchgeometry)

### registerPlugin
```typescript
static registerPlugin(options?: { force?: object }): void
```
Register the plugin for this sampler.

**Parameters:**

- **options** (Optional):  
  - **force**?: `object` — Override the plugin of the same name that is already registered?

Returns: `void`  
Inherited from [BaseSamplerShader.registerPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html#registerplugin)