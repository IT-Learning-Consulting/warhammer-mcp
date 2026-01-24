# RenderedEffectSource

An abstract class which extends the base `PointSource` to provide common functionality for rendering. This class is extended by both the `LightSource` and `VisionSource` subclasses.

## Hierarchy
- _[BaseEffectSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html)_
- **RenderedEffectSource**
- _[BaseLightSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html)_

---

## Constructors

```typescript
new RenderedEffectSource(
    options?: BaseEffectSourceOptions,
): RenderedEffectSource
```
An effect source is constructed by providing configuration options.

**Parameters**
- **options**?: `BaseEffectSourceOptions` = `{}`  
  Options which modify the base effect source instance.

**Returns**  
`RenderedEffectSource`

Inherited from [BaseEffectSource.constructor](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#constructor)

---

## Properties

### animation

`animation: RenderedEffectSourceAnimationConfig = {}`  
The animation configuration applied to this source.

### colorRGB

`colorRGB: null | [number, number, number] = null`  
The color of the source as an RGB vector.

### data

`data: BaseEffectSourceData & RenderedEffectSourceData`  
The data of this source.

Inherited from [BaseEffectSource.data](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#data)

### layers

```typescript
layers: {
    background: RenderedEffectSourceLayer;
    coloration: RenderedEffectSourceLayer;
    illumination: RenderedEffectSourceLayer;
} 
```
Track the status of rendering layers.

### object

`object: null | object`  
Some other object which is responsible for this source.

Inherited from [BaseEffectSource.object](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#object)

### shape

`shape: Polygon`  
The geometric shape of the effect source which is generated later.

Inherited from [BaseEffectSource.shape](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#shape)

### sourceId

`sourceId: string`  
The source id linked to this effect source.

Inherited from [BaseEffectSource.sourceId](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#sourceid)

### suppression

`suppression: Record<string, boolean> = {}`  
Records of suppression strings with a boolean value. If any of this record is true, the source is suppressed.

Inherited from [BaseEffectSource.suppression](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#suppression)

### _flags (protected)

`_flags: Record<string, number | boolean> = {}`  
A collection of boolean flags which control rendering and refresh behavior for the source.

Inherited from [BaseEffectSource._flags](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_flags)

### _geometry (protected)

`_geometry: null | Geometry = null`  
PIXI Geometry generated to draw meshes.

### defaultData (static)

```typescript
defaultData: {
    animation: {};
    color: null;
    disabled: boolean;
    elevation: number;
    preview: boolean;
    seed: null;
    x: number;
    y: number;
}
```
Effect source default data.

**Type declaration:**

- `animation`: {}
- `color`: null
- `disabled`: boolean  
  Whether or not the source is disabled.
- `elevation`: number  
  The elevation of the point source.
- `preview`: boolean
- `seed`: null
- `x`: number  
  The x-coordinate of the source location.
- `y`: number  
  The y-coordinate of the source location.

Overrides [BaseEffectSource.defaultData](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#defaultdata)

### EDGE_OFFSET (static)

`EDGE_OFFSET: number = -8`  
The offset in pixels applied to create soft edges.

### effectsCollection (static, abstract)

`effectsCollection: string`  
The target collection into the effects canvas group.

Inherited from [BaseEffectSource.effectsCollection](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#effectscollection)

### sourceType (static, accessor)

`sourceType: string`  
The type of source represented by this data structure. Each subclass must implement this attribute.

Inherited from [BaseEffectSource.sourceType](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#sourcetype)

---

## Accessors

### active

```typescript
get active(): boolean
```
Is this source currently active? A source is active if it is attached to an effect collection and is not disabled or suppressed.

**Returns**  
`boolean`

Inherited from `BaseEffectSource.active`

---

### attached

```typescript
get attached(): boolean
```
Is this source attached to an effect collection?

**Returns**  
`boolean`

Inherited from `BaseEffectSource.attached`

---

### background

```typescript
get background(): PointSourceMesh
```
A convenience accessor to the background layer mesh.

**Returns**  
`PointSourceMesh`

---

### coloration

```typescript
get coloration(): PointSourceMesh
```
A convenience accessor to the coloration layer mesh.

**Returns**  
`PointSourceMesh`

---

### effectsCollection

```typescript
get effectsCollection(): Collection<
    string, 
    BaseEffectSource<BaseEffectSourceData, Polygon>
>
```
The EffectsCanvasGroup collection linked to this effect source.

**Returns**  
`Collection<string, BaseEffectSource<BaseEffectSourceData, Polygon>>`

Inherited from [BaseEffectSource.effectsCollection](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#effectscollection)

---

### elevation

```typescript
get elevation(): number
```
The elevation bound to this source.

**Returns**  
`number`

Inherited from `BaseEffectSource.elevation`

---

### hasActiveLayer

```typescript
get hasActiveLayer(): boolean
```
Has the rendered source at least one active layer?

**Returns**  
`boolean`

---

### illumination

```typescript
get illumination(): PointSourceMesh
```
A convenience accessor to the illumination layer mesh.

**Returns**  
`PointSourceMesh`

---

### isAnimated

```typescript
get isAnimated(): boolean
```
Is the rendered source animated?

**Returns**  
`boolean`

---

### isPreview

```typescript
get isPreview(): boolean
```
Is this RenderedEffectSource a temporary preview?

**Returns**  
`boolean`

---

### suppressed

```typescript
get suppressed(): boolean
```
Is this source temporarily suppressed?

**Returns**  
`boolean`

Inherited from `BaseEffectSource.suppressed`

---

### updateId

```typescript
get updateId(): number
```
Returns the update ID associated with this source. The update ID is increased whenever the shape of the source changes.

**Returns**  
`number`

Inherited from `BaseEffectSource.updateId`

---

### x

```typescript
get x(): number
```
The x-coordinate of the point source origin.

**Returns**  
`number`

Inherited from `BaseEffectSource.x`

---

### y

```typescript
get y(): number
```
The y-coordinate of the point source origin.

**Returns**  
`number`

Inherited from `BaseEffectSource.y`

---

## Methods

### _layers (protected static)

```typescript
get _layers(): Record<string, RenderedEffectLayerConfig>
```
Layers handled by this rendered source.

**Returns**  
`Record<string, RenderedEffectLayerConfig>`

---

### _configure

```typescript
_configure(changes: any): void
```
Overrides [BaseEffectSource._configure](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_configure).

**Parameters**
- **changes**: `any`

**Returns**  
`void`

---

### _destroy

```typescript
_destroy(): void
```
Overrides [BaseEffectSource._destroy](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_destroy).

**Returns**  
`void`

---

### _initialize

```typescript
_initialize(data: any): void
```
Subclass specific data initialization steps.

Overrides [BaseEffectSource._initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_initialize).

**Parameters**
- **data**: `any`  
  Provided data for configuration.

**Returns**  
`void`

---

### _refresh

```typescript
_refresh(): void
```
Overrides [BaseEffectSource._refresh](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_refresh).

**Returns**  
`void`

---

### add

```typescript
add(): void
```
Add this BaseEffectSource instance to the active collection.

**Returns**  
`void`

Inherited from [BaseEffectSource.add](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#add)

---

### animate

```typescript
animate(dt: number): any
```
Animate the PointSource, if an animation is enabled and if it currently has rendered containers.

**Parameters**
- **dt**: `number`  
  Delta time.

**Returns**  
`any`

---

### animateTime

```typescript
animateTime(
    dt: number,
    options?: {
        intensity?: number;
        reverse?: boolean;
        speed?: number;
    },
): void
```
Generic time-based animation used for Rendered Point Sources.

**Parameters**
- **dt**: `number`  
  Delta time.
- **options**?:  
  Options which affect the time animation.
  - **intensity**?: `number`  
    The animation intensity, from 1 to 10.
  - **reverse**?: `boolean`  
    Reverse the animation direction.
  - **speed**?: `number`  
    The animation speed, from 0 to 10.

**Returns**  
`void`

---

### destroy

```typescript
destroy(): void
```
Steps that must be performed when the source is destroyed.

**Returns**  
`void`

Inherited from [BaseEffectSource.destroy](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#destroy)

---

### drawMeshes

```typescript
drawMeshes(): Record<string, null | Mesh<MeshMaterial>>
```
Render the containers used to represent this light source within the LightingLayer.

**Returns**  
`Record<string, null | Mesh<MeshMaterial>>`

---

### initialize

```typescript
initialize(
    data?: Partial<BaseEffectSourceData & RenderedEffectSourceData>,
    options?: { reset?: boolean },
): BaseEffectSource<BaseEffectSourceData, Polygon>
```
Initialize and configure the source using provided data.

**Parameters**
- **data**: `Partial<BaseEffectSourceData & RenderedEffectSourceData>` = `{}`  
  Provided data for configuration.
- **options**?: `{ reset?: boolean }` = `{}`  
  Additional options which modify source initialization.
  - **reset**?: `boolean`  
    Should source data be reset to default values before applying changes?

**Returns**  
`BaseEffectSource<BaseEffectSourceData, Polygon>`

Inherited from [BaseEffectSource.initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#initialize)

---

### refresh

```typescript
refresh(): void
```
Refresh the state and uniforms of the source. Only active sources are refreshed.

**Returns**  
`void`

Inherited from [BaseEffectSource.refresh](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#refresh)

---

### remove

```typescript
remove(): void
```
Remove this BaseEffectSource instance from the active collection.

**Returns**  
`void`

Inherited from [BaseEffectSource.remove](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#remove)

---

### testPoint

```typescript
testPoint(point: ElevatedPoint): boolean
```
Test whether the point is contained within the shape of the source.

**Parameters**
- **point**: `ElevatedPoint`  
  The point to test.

**Returns**  
`boolean` - Is inside the source?

Inherited from [BaseEffectSource.testPoint](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#testpoint)

---

### _configureLayer (protected)

```typescript
_configureLayer(layer: object, layerId: string): void
```
Specific configuration for a layer.

**Parameters**
- **layer**: `object`
- **layerId**: `string`

**Returns**  
`void`

---

### _configureShaders (protected)

```typescript
_configureShaders(): Record<string, typeof AdaptiveLightingShader>
```
Configure which shaders are used for each rendered layer.

**Returns**  
`Record<string, typeof AdaptiveLightingShader>`  
An object whose keys are layer identifiers and whose values are shader classes.

---

### _createShapes (protected, abstract)

```typescript
_createShapes(): void
```
Create the polygon shape (or shapes) for this source using configured data.

**Returns**  
`void`

Inherited from [BaseEffectSource._createShapes](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_createshapes)

---

### _drawMesh (protected)

```typescript
_drawMesh(layerId: string): null | Mesh<MeshMaterial>
```
Create a Mesh for a certain rendered layer of this source.

**Parameters**
- **layerId**: `string`  
  The layer key in layers to draw.

**Returns**  
`null | Mesh<MeshMaterial>` - The drawn mesh for this layer, or null if no mesh is required.

---

### _initializeSoftEdges (protected)

```typescript
_initializeSoftEdges(): void
```
Decide whether to render soft edges with a blur.

**Returns**  
`void`

---

### _updateBackgroundUniforms (protected)

```typescript
_updateBackgroundUniforms(): void
```
Update shader uniforms used for the background layer.

**Returns**  
`void`

---

### _updateColorationUniforms (protected)

```typescript
_updateColorationUniforms(): void
```
Update shader uniforms used for the coloration layer.

**Returns**  
`void`

---

### _updateCommonUniforms (protected)

```typescript
_updateCommonUniforms(shader: AbstractBaseShader): void
```
Update shader uniforms used by every rendered layer.

**Parameters**
- **shader**: `AbstractBaseShader`

**Returns**  
`void`

---

### _updateGeometry (protected, abstract)

```typescript
_updateGeometry(): void
```
Create the geometry for the source shape that is used in shaders and compute its bounds for culling purpose. Triangulate the form and create buffers.

**Returns**  
`void`

---

### _updateIlluminationUniforms (protected)

```typescript
_updateIlluminationUniforms(): void
```
Update shader uniforms used for the illumination layer.

**Returns**  
`void`

---

## Static Methods

### getCorrectedColor

```typescript
static getCorrectedColor(
    level: LightingLevel,
    colorDim: Color,
    colorBright: Color,
    colorBackground?: Color,
): Color
```
Get corrected color according to level, dim color, bright color and background color.

**Parameters**
- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))
- **colorDim**: `Color`
- **colorBright**: `Color`
- **colorBackground**?: `Color`

**Returns**  
`Color`

---

### getCorrectedLevel

```typescript
static getCorrectedLevel(level: LightingLevel): number
```
Get corrected level according to level and active vision mode data.

**Parameters**
- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))

**Returns**  
`number`

---

# Links

- API Documentation Home: [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)
- [BaseEffectSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html)
- [PointSourceMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.PointSourceMesh.html)
- [AdaptiveLightingShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AdaptiveLightingShader.html)
- [LightingLevel](https://foundryvtt.com/api/types/CONST.LightingLevel.html)
- [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)
- [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)
- [BaseEffectSourceOptions](https://foundryvtt.com/api/interfaces/foundry.BaseEffectSourceOptions.html)