# AmplificationSamplerShader

A light amplification shader.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [shaders](https://foundryvtt.com/api/modules/foundry.canvas.rendering.shaders.html) / [AmplificationSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AmplificationSamplerShader.html)

## Hierarchy

- *[ColorAdjustmentsSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html)*
- **AmplificationSamplerShader**

## Properties

### initialUniforms

- Type: `object`

The initial values of the shader uniforms.

Inherited from [ColorAdjustmentsSamplerShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#initialuniforms).

---

### Static Properties

#### batchDefaultUniforms

- Signature: `batchDefaultUniforms: object | (maxTextures: number) => object = {}`

Returns default uniforms associated with the batched version of this sampler.

Inherited from [ColorAdjustmentsSamplerShader.batchDefaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#batchdefaultuniforms).

#### batchFragmentShader

- Type: `string`

The batch fragment shader source.

Inherited from [ColorAdjustmentsSamplerShader.batchFragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#batchfragmentshader).

#### batchGeometry

- Type:

```typescript
| typeof BatchGeometry
| { id: string; normalized: boolean; size: number; type: TYPES }[]
```

Batch geometry associated with this sampler.

Inherited from [ColorAdjustmentsSamplerShader.batchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#batchgeometry).

#### batchRendererClass

- Type: `typeof BatchRenderer = BatchRenderer`

The batch renderer to use.

Inherited from [ColorAdjustmentsSamplerShader.batchRendererClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#batchrendererclass).

#### batchShaderGeneratorClass

- Type: `typeof BatchShaderGenerator = BatchShaderGenerator`

The batch generator to use.

Inherited from [ColorAdjustmentsSamplerShader.batchShaderGeneratorClass](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#batchshadergeneratorclass).

#### batchVertexShader

- Type: `string`

The batch vertex shader source.

Inherited from [ColorAdjustmentsSamplerShader.batchVertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#batchvertexshader).

#### batchVertexSize

- Type: `number = 6`

The size of a vertice with all its packed attributes.

Inherited from [ColorAdjustmentsSamplerShader.batchVertexSize](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#batchvertexsize).

#### classPluginName

- Type: `null`

Overrides [ColorAdjustmentsSamplerShader.classPluginName](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#classpluginname).

#### CONTRAST

- Type: `string`

Contrast adjustment.

Inherited from [ColorAdjustmentsSamplerShader.CONTRAST](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#contrast).

#### defaultUniforms

- Type:

```typescript
{
    brightness: number;
    darknessLevelTexture: null;
    enable: boolean;
    screenDimensions: number[];
    tint: number[];
    tintAlpha: number[];
} = ...
```

The default uniform values for the shader. A subclass of AbstractBaseShader must implement the `defaultUniforms` static field.

Overrides [ColorAdjustmentsSamplerShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#defaultuniforms).

#### EXPOSURE

- Type: `string`

Exposure adjustment.

Inherited from [ColorAdjustmentsSamplerShader.EXPOSURE](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#exposure).

#### fragmentShader

- Type: `string`

Overrides [ColorAdjustmentsSamplerShader.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#fragmentshader).

#### pausable

- Type: `boolean = true`

Is this shader pausable or not?

Inherited from [ColorAdjustmentsSamplerShader.pausable](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#pausable).

#### reservedTextureUnits

- Type: `number = 0`

The number of reserved texture units for this shader that cannot be used by the batch renderer.

Inherited from [ColorAdjustmentsSamplerShader.reservedTextureUnits](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#reservedtextureunits).

#### SATURATION

- Type: `string`

Saturation adjustment.

Inherited from [ColorAdjustmentsSamplerShader.SATURATION](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#saturation).

#### vertexShader

- Type: `string`

Overrides [ColorAdjustmentsSamplerShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#vertexshader).

#### _packInterleavedGeometry

- Type: `undefined | Function`

Pack interleaved geometry custom function.

Inherited from [ColorAdjustmentsSamplerShader._packInterleavedGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#_packinterleavedgeometry).

#### _preRenderBatch

- Signature: `(batchRenderer: BatchRenderer) => undefined | void`

A prerender function happening just before the batch renderer is flushed.

Inherited from [ColorAdjustmentsSamplerShader._preRenderBatch](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#_prerenderbatch).

#### ADJUSTMENTS

- Accessor: `get ADJUSTMENTS(): string`

The adjustments made into fragment shaders.

Inherited from [ColorAdjustmentsSamplerShader.ADJUSTMENTS](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#ADJUSTMENTS).

## Accessors

### brightness

- Accessor: `get brightness(): number`

Brightness controls the luminosity.

**Returns:** `number`

---

### colorTint

- Accessor: `get colorTint(): number[]`

Tint color applied to Light Amplification.

**Returns:** `number[]`

---

### enabled

- Accessor: `get enabled(): boolean`

Activate or deactivate this sampler. If set to false, the batch rendering is redirected to `"batch"`. Otherwise, the batch rendering is directed toward the instance `pluginName` (might be `null`).

**Returns:** `boolean`

Inherited from ColorAdjustmentsSamplerShader.enabled.

---

### paused

- Accessor: `get paused(): boolean`

Pause or Unpause this sampler. If set to true, the shader is disabled. Otherwise, it is enabled. Contrary to `enabled`, a shader might decide to refuse a pause, to continue to render animations for example.

**Returns:** `boolean`

See: Inherited from ColorAdjustmentsSamplerShader.paused.

---

### pluginName

- Accessor: `get pluginName(): null | string`

The plugin name associated for this instance, if any. Returns `"batch"` if the shader is disabled.

**Returns:** `null | string`

Inherited from ColorAdjustmentsSamplerShader.pluginName.

## Methods

### _preRender

```typescript
_preRender(mesh: any, renderer: any): void
```

**Parameters:**

- **mesh**: `any`
- **renderer**: `any`

**Returns:** `void`

Inherited from [ColorAdjustmentsSamplerShader._preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#_prerender).

---

### reset

```typescript
reset(): void
```

Reset the shader uniforms back to their initial values.

**Returns:** `void`

Inherited from [ColorAdjustmentsSamplerShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#reset).

---

### _configure

```typescript
protected _configure(): void
```

Protected. A one-time initialization performed on creation.

**Returns:** `void`

Inherited from [ColorAdjustmentsSamplerShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#_configure).

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

A factory method for creating the shader using its defined default values.

**Parameters:**

- **initialUniforms**: `object`

**Returns:** [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)

Inherited from [ColorAdjustmentsSamplerShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#create).

---

### createPlugin

```typescript
static createPlugin(): any
```

Create a batch plugin for this sampler class.

**Returns:** `any`  
The batch plugin class linked to this sampler class.

Inherited from [ColorAdjustmentsSamplerShader.createPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#createplugin).

---

### initializeBatchGeometry

```typescript
static initializeBatchGeometry(): void
```

Initialize the batch geometry with custom properties.

**Returns:** `void`

Inherited from [ColorAdjustmentsSamplerShader.initializeBatchGeometry](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#initializebatchgeometry).

---

### registerPlugin

```typescript
static registerPlugin(options?: { force?: object }): void
```

Register the plugin for this sampler.

**Parameters (Optional):**

- **options**: `{ force?: object } = {}`  
  The options.

- **force?**: `object`  
  Override the plugin of the same name that is already registered?

**Returns:** `void`

Inherited from [ColorAdjustmentsSamplerShader.registerPlugin](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader.html#registerplugin).