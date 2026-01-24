# TokenRingSamplerShader

The shader definition which powers the TokenRing.

## Hierarchy
- [PrimaryBaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html)
- TokenRingSamplerShader

---

## Properties

### initialUniforms
Type: `object`

The initial values of the shader uniforms.

Inherited from [PrimaryBaseSamplerShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#initialuniforms)

### _batchFragmentShader
Type: `string` = ...

Overrides [PrimaryBaseSamplerShader._batchFragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_batchfragmentshader)

### _batchVertexShader
Type: `string` = ...

Overrides [PrimaryBaseSamplerShader._batchVertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_batchvertexshader)

### batchGeometry
Type: `{ id: string; normalized: boolean; size: number; type: TYPES }[]` = ...

Overrides [PrimaryBaseSamplerShader.batchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#batchgeometry)

### batchRendererClass
Type: `typeof BatchRenderer` = BatchRenderer

The batch renderer to use.

Inherited from [PrimaryBaseSamplerShader.batchRendererClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#batchrendererclass)

### batchShaderGeneratorClass
Type: `typeof BatchShaderGenerator` = BatchShaderGenerator

The batch generator to use.

Inherited from [PrimaryBaseSamplerShader.batchShaderGeneratorClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#batchshadergeneratorclass)

### batchVertexSize
Type: `number` = ...

Overrides [PrimaryBaseSamplerShader.batchVertexSize](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#batchvertexsize)

### classPluginName
Type: `string` = `"tokenRingBatch"`

Overrides [PrimaryBaseSamplerShader.classPluginName](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#classpluginname)

### CONTRAST
Type: `string` = ...

Contrast adjustment

Inherited from [PrimaryBaseSamplerShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#contrast)

### defaultUniforms
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
= ...

Inherited from [PrimaryBaseSamplerShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#defaultuniforms)

### depthShaderClass
Type: `typeof DepthSamplerShader` = DepthSamplerShader

The depth shader class associated with this shader.

Inherited from [PrimaryBaseSamplerShader.depthShaderClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#depthshaderclass)

### EXPOSURE
Type: `string` = ...

Exposure adjustment.

Inherited from [PrimaryBaseSamplerShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#exposure)

### nullUvs
Type: `Float32Array` = ...

A null UVs array used for nulled texture position.

### pausable
Type: `boolean` = false

Overrides [PrimaryBaseSamplerShader.pausable](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#pausable)

### reservedTextureUnits
Type: `number` = ...

Overrides [PrimaryBaseSamplerShader.reservedTextureUnits](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#reservedtextureunits)

### SATURATION
Type: `string` = ...

Saturation adjustment

Inherited from [PrimaryBaseSamplerShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#saturation)

### _fragmentShader
Type: `string` = ...

The fragment shader source. Subclasses can override it.

Inherited from [PrimaryBaseSamplerShader._fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_fragmentshader)

### _vertexShader
Type: `string` = ...

The vertex shader source. Subclasses can override it.

Inherited from [PrimaryBaseSamplerShader._vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_vertexshader)

---

## Accessors

### depthShader
```
get depthShader(): DepthSamplerShader
```

The depth shader associated with this shader. The depth shader is lazily constructed.

**Returns:**  
`DepthSamplerShader`  

Inherited from `PrimaryBaseSamplerShader.depthShader`

### enabled
```
get enabled(): boolean
```

Activate or deactivate this sampler. If set to false, the batch rendering is redirected to "batch". Otherwise, the batch rendering is directed toward the instance pluginName (might be null).

**Returns:**  
`boolean`

Inherited from `PrimaryBaseSamplerShader.enabled`

### paused
```
get paused(): boolean
```

Pause or Unpause this sampler. If set to true, the shader is disabled. Otherwise, it is enabled. Contrary to enabled, a shader might decide to refuse a pause, to continue to render animations per example.

**Returns:**  
`boolean`

Inherited from `PrimaryBaseSamplerShader.paused`

### pluginName
```
get pluginName(): null | string
```

The plugin name associated for this instance, if any. Returns "batch" if the shader is disabled.

**Returns:**  
`null` | `string`

Inherited from `PrimaryBaseSamplerShader.pluginName`

### ADJUSTMENTS
```
static get ADJUSTMENTS(): string
```

The adjustments made into fragment shaders.

**Returns:**  
`string`

Inherited from `PrimaryBaseSamplerShader.ADJUSTMENTS`

### batchFragmentShader
```
static get batchFragmentShader(): string
```

**Returns:**  
`string`

Inherited from `PrimaryBaseSamplerShader.batchFragmentShader`

### batchVertexShader
```
static get batchVertexShader(): string
```

**Returns:**  
`string`

Inherited from `PrimaryBaseSamplerShader.batchVertexShader`

### fragmentShader
```
static get fragmentShader(): string
```

**Returns:**  
`string`

Inherited from `PrimaryBaseSamplerShader.fragmentShader`

### vertexShader
```
static get vertexShader(): string
```

**Returns:**  
`string`

Inherited from `PrimaryBaseSamplerShader.vertexShader`

---

## Methods

### _preRender
```typescript
_preRender(mesh: any, renderer: any): void
```

**Parameters:**

- **mesh**: `any`
- **renderer**: `any`

**Returns:**  
`void`

Inherited from [PrimaryBaseSamplerShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_prerender)

### reset
```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:**  
`void`

Inherited from [PrimaryBaseSamplerShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#reset)

### _configure
```typescript
protected _configure(): void
```

Protected  
A one time initialization performed on creation.

**Returns:**  
`void`

Inherited from [PrimaryBaseSamplerShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_configure)

### _configureDepthShader
```typescript
protected _configureDepthShader(depthShader: DepthSamplerShader): void
```

Protected  
One-time configuration that is called when the depth shader is created.

**Parameters:**

- **depthShader**: [DepthSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.DepthSamplerShader.html) - The depth shader

**Returns:**  
`void`

Inherited from [PrimaryBaseSamplerShader._configureDepthShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_configuredepthshader)

### _packInterleavedGeometry
```typescript
static _packInterleavedGeometry(
  element: any,
  attributeBuffer: any,
  indexBuffer: any,
  aIndex: any,
  iIndex: any
): void
```

**Parameters:**

- **element**: `any`
- **attributeBuffer**: `any`
- **indexBuffer**: `any`
- **aIndex**: `any`
- **iIndex**: `any`

**Returns:**  
`void`

Overrides [PrimaryBaseSamplerShader._packInterleavedGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_packinterleavedgeometry)

### _preRenderBatch
```typescript
static _preRenderBatch(batchRenderer: any): void
```

**Parameters:**

- **batchRenderer**: `any`

**Returns:**  
`void`

Overrides [PrimaryBaseSamplerShader._preRenderBatch](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#_prerenderbatch)

### batchDefaultUniforms
```typescript
static batchDefaultUniforms(maxTex: any): {
  occlusionTexture: any;
  screenDimensions: number[];
  time: number;
  tokenRingTexture: any;
}
```

**Parameters:**

- **maxTex**: `any`

**Returns:**  
An object with:
- **occlusionTexture**: `any`
- **screenDimensions**: `number[]`
- **time**: `number`
- **tokenRingTexture**: `any`

Overrides [PrimaryBaseSamplerShader.batchDefaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#batchdefaultuniforms)

### create
```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:**  
[AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)

Inherited from [PrimaryBaseSamplerShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#create)

### createPlugin
```typescript
static createPlugin(): any
```

Create a batch plugin for this sampler class.

**Returns:**  
The batch plugin class linked to this sampler class.

Inherited from [PrimaryBaseSamplerShader.createPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#createplugin)

### initializeBatchGeometry
```typescript
static initializeBatchGeometry(): void
```

Initialize the batch geometry with custom properties.

**Returns:**  
`void`

Inherited from [PrimaryBaseSamplerShader.initializeBatchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#initializebatchgeometry)

### registerPlugin
```typescript
static registerPlugin(options?: { force?: object }): void
```

Register the plugin for this sampler.

**Parameters:**

- **options** (optional): `{ force?: object } = {}`  
  The options.

- **force** (optional): `object`  
  Override the plugin of the same name that is already registered?

**Returns:**  
`void`

Inherited from [PrimaryBaseSamplerShader.registerPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.PrimaryBaseSamplerShader.html#registerplugin)

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.TokenRingSamplerShader.html).