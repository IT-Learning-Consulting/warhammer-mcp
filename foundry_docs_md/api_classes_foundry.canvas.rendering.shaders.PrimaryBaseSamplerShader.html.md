# PrimaryBaseSamplerShader | Foundry Virtual Tabletop - API Documentation - Version 13

The base shader class of [foundry.canvas.primary.PrimarySpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html).

## Hierarchy
- _[OccludableSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html)_
- **PrimaryBaseSamplerShader**
- _[TokenRingSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.TokenRingSamplerShader.html)_

---

## Properties

### initialUniforms

Type: `object`  
The initial values of the shader uniforms.  
Inherited from [OccludableSamplerShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#initialuniforms).

### Static Properties

#### batchGeometry

Type: `{ id: string; normalized: boolean; size: number; type: TYPES }[]`  
Inherited from [OccludableSamplerShader.batchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#batchgeometry).

#### batchRendererClass

Type: `typeof BatchRenderer = BatchRenderer`  
The batch renderer to use.  
Inherited from [OccludableSamplerShader.batchRendererClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#batchrendererclass).

#### batchShaderGeneratorClass

Type: `typeof BatchShaderGenerator = BatchShaderGenerator`  
The batch generator to use.  
Inherited from [OccludableSamplerShader.batchShaderGeneratorClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#batchshadergeneratorclass).

#### batchVertexSize

Type: `number = 7`  
Inherited from [OccludableSamplerShader.batchVertexSize](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#batchvertexsize).

#### classPluginName

Type: `string = "batchOcclusion"`  
Inherited from [OccludableSamplerShader.classPluginName](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#classpluginname).

#### CONTRAST

Type: `string`  
Contrast adjustment.  
Inherited from [OccludableSamplerShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#contrast).

#### defaultUniforms

Type:
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
Inherited from [OccludableSamplerShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#defaultuniforms).

#### depthShaderClass

Type: `typeof DepthSamplerShader = DepthSamplerShader`  
The depth shader class associated with this shader.

#### EXPOSURE

Type: `string`  
Exposure adjustment.  
Inherited from [OccludableSamplerShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#exposure).

#### pausable

Type: `boolean = true`  
Is this shader pausable or not?  
Inherited from [OccludableSamplerShader.pausable](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#pausable).

#### reservedTextureUnits

Type: `number = 1`  
Inherited from [OccludableSamplerShader.reservedTextureUnits](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#reservedtextureunits).

#### SATURATION

Type: `string`  
Saturation adjustment.  
Inherited from [OccludableSamplerShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#saturation).

#### Protected Static Properties

##### _batchFragmentShader

Type: `string`  
The batch fragment shader source. Subclasses can override it.  
Inherited from [OccludableSamplerShader._batchFragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_batchfragmentshader).

##### _batchVertexShader

Type: `string`  
The batch vertex shader source. Subclasses can override it.  
Inherited from [OccludableSamplerShader._batchVertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_batchvertexshader).

##### _fragmentShader

Type: `string`  
The fragment shader source. Subclasses can override it.  
Inherited from [OccludableSamplerShader._fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_fragmentshader).

##### _vertexShader

Type: `string`  
The vertex shader source. Subclasses can override it.  
Inherited from [OccludableSamplerShader._vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_vertexshader).

---

## Accessors

### depthShader

```typescript
get depthShader(): DepthSamplerShader
```
The depth shader associated with this shader. The depth shader is lazily constructed.  
**Returns:** `DepthSamplerShader`

### enabled

```typescript
get enabled(): boolean
```
Activate or deactivate this sampler. If set to false, the batch rendering is redirected to `"batch"`. Otherwise, the batch rendering is directed toward the instance `pluginName` (might be null).  
**Returns:** `boolean`  
Inherited from OccludableSamplerShader.enabled

### paused

```typescript
get paused(): boolean
```
Pause or Unpause this sampler. If set to true, the shader is disabled. Otherwise, it is enabled. Contrary to `enabled`, a shader might decide to refuse a pause, to continue to render animations for example.  
**Returns:** `boolean`  
Inherited from OccludableSamplerShader.paused

### pluginName

```typescript
get pluginName(): null | string
```
The plugin name associated for this instance, if any. Returns `"batch"` if the shader is disabled.  
**Returns:** `null | string`  
Inherited from OccludableSamplerShader.pluginName

### Static Accessors

#### ADJUSTMENTS

```typescript
get ADJUSTMENTS(): string
```
The adjustments made into fragment shaders.  
**Returns:** `string`  
Inherited from OccludableSamplerShader.ADJUSTMENTS

#### batchFragmentShader

```typescript
get batchFragmentShader(): string
```
**Returns:** `string`  
Inherited from OccludableSamplerShader.batchFragmentShader

#### batchVertexShader

```typescript
get batchVertexShader(): string
```
**Returns:** `string`  
Inherited from OccludableSamplerShader.batchVertexShader

#### fragmentShader

```typescript
get fragmentShader(): string
```
**Returns:** `string`  
Inherited from OccludableSamplerShader.fragmentShader

#### vertexShader

```typescript
get vertexShader(): string
```
**Returns:** `string`  
Inherited from OccludableSamplerShader.vertexShader

---

## Methods

### _preRender

```typescript
_preRender(mesh: any, renderer: any): void
```
Inherited from [OccludableSamplerShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_prerender).

**Parameters:**

- **mesh**: `any`  
- **renderer**: `any`  

**Returns:** `void`

### reset

```typescript
reset(): void
```
Reset the shader uniforms back to their initial values.  
Inherited from [OccludableSamplerShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#reset).

**Returns:** `void`

### Protected Methods

#### _configure

```typescript
_configure(): void
```
A one-time initialization performed on creation.  
Inherited from [OccludableSamplerShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_configure).

**Returns:** `void`

#### _configureDepthShader

```typescript
_configureDepthShader(depthShader: DepthSamplerShader): void
```
One-time configuration that is called when the depth shader is created.

**Parameters:**

- **depthShader**: [DepthSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.DepthSamplerShader.html) - The depth shader

**Returns:** `void`  
Inherited from [OccludableSamplerShader._configureDepthShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_configuredepthshader).

### Static Methods

#### _packInterleavedGeometry

```typescript
_packInterleavedGeometry(
  element: any,
  attributeBuffer: any,
  indexBuffer: any,
  aIndex: any,
  iIndex: any,
): void
```
Inherited from [OccludableSamplerShader._packInterleavedGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_packinterleavedgeometry).

**Parameters:**

- **element**: `any`  
- **attributeBuffer**: `any`  
- **indexBuffer**: `any`  
- **aIndex**: `any`  
- **iIndex**: `any`  

**Returns:** `void`

#### _preRenderBatch

```typescript
_preRenderBatch(batchRenderer: any): void
```
Inherited from [OccludableSamplerShader._preRenderBatch](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#_prerenderbatch).

**Parameters:**

- **batchRenderer**: `any`  

**Returns:** `void`

#### batchDefaultUniforms

```typescript
batchDefaultUniforms(
  maxTex: any,
): { occlusionTexture: any; screenDimensions: number[] }
```
Inherited from [OccludableSamplerShader.batchDefaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#batchdefaultuniforms).

**Parameters:**

- **maxTex**: `any`

**Returns:**

- `occlusionTexture`: `any`
- `screenDimensions`: `number[]`

#### create

```typescript
create(initialUniforms: object): AbstractBaseShader
```
A factory method for creating the shader using its defined default values  
Inherited from [OccludableSamplerShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#create).

**Parameters:**

- **initialUniforms**: `object`

**Returns:** [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)

#### createPlugin

```typescript
createPlugin(): any
```
Create a batch plugin for this sampler class.  
Inherited from [OccludableSamplerShader.createPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#createplugin).

**Returns:** `any`  
The batch plugin class linked to this sampler class.

#### initializeBatchGeometry

```typescript
initializeBatchGeometry(): void
```
Initialize the batch geometry with custom properties.  
Inherited from [OccludableSamplerShader.initializeBatchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#initializebatchgeometry).

**Returns:** `void`

#### registerPlugin

```typescript
registerPlugin(options?: { force?: object }): void
```
Register the plugin for this sampler.

**Parameters (optional):**

- **options**?:  
  - **force**?: `object`  
    Override the plugin of the same name that is already registered?

**Returns:** `void`  
Inherited from [OccludableSamplerShader.registerPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.OccludableSamplerShader.html#registerplugin).

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).