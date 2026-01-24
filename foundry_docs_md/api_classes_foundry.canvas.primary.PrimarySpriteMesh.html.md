# PrimarySpriteMesh | Foundry Virtual Tabletop - API Documentation - Version 13

A basic PCO sprite mesh which is handling occlusion and depth.

Mixes:  
- PrimaryOccludableObjectMixin  
- PrimaryCanvasObjectMixin

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.primary.PrimarySpriteMesh)):  
<i>SpriteMesh</i><this>  
PrimarySpriteMesh  
[DoorMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.DoorMesh.html)

---

## Constructor

```typescript
new PrimarySpriteMesh(
    options?: Texture<Resource> | PrimarySpriteMeshConstructorOptions,
    shaderClass: typeof PrimaryBaseSamplerShader,
): PrimarySpriteMesh
```

**Parameters**  
- **options?**: `Texture<Resource>` | [`PrimarySpriteMeshConstructorOptions`](https://foundryvtt.com/api/interfaces/foundry.PrimarySpriteMeshConstructorOptions.html)  
  Constructor options or a Texture  
- **shaderClass**: `typeof PrimaryBaseSamplerShader`  
  A shader class for the sprite

**Returns**  
`PrimarySpriteMesh`

Overrides `PrimaryOccludableObjectMixin(SpriteMesh).constructor`

---

## Properties

### indices

`indices: Uint16Array`  
The indices of the geometry.  
Inherited from [SpriteMesh.indices](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#indices)

### textureAlphaThreshold

`textureAlphaThreshold: number = 0`  
The texture alpha threshold used for point containment tests. If set to a value larger than 0,  
the texture alpha data is extracted from the texture at 25% resolution.

### _anchor (protected)

`_anchor: ObservablePoint<any>`  
The anchor point defines the normalized coordinates in the texture that map to the position of this sprite.  
By default, this is (0,0) (or `texture.defaultAnchor` if modified), which means the position (x,y) of this Sprite will be the top-left corner.  
**Note:** Updating `texture.defaultAnchor` after constructing a Sprite does **not** update its anchor.  
[Anchor documentation](https://docs.cocos2d-x.org/cocos2d-x/en/sprites/manipulation.html)  
Inherited from [SpriteMesh._anchor](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_anchor)

### _batchData (protected)

```typescript
_batchData: {
    _texture: Texture;
    _tintRGB: number;
    blendMode: BLEND_MODES;
    indices: number[];
    uvs: number[];
    vertexData: number[];
    worldAlpha: number;
} = ...
```

Snapshot of some parameters of this display object to render in batched mode.  
Inherited from [SpriteMesh._batchData](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_batchdata)

### _cachedTint (protected)

`_cachedTint: [red: number, green: number, blue: number, alpha: number] = ...`  
Cached tint value so we can tell when the tint is changed.  
Inherited from [SpriteMesh._cachedTint](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_cachedtint)

### _height (protected)

`_height: number = 0`  
The height of the sprite (initially set by the texture)  
Inherited from [SpriteMesh._height](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_height)

### _paddingX (protected)

`_paddingX: number`  
Inherited from [SpriteMesh._paddingX](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_paddingx)

### _paddingY (protected)

`_paddingY: number`  
Inherited from [SpriteMesh._paddingY](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_paddingy)

### _shader (protected)

`_shader: BaseSamplerShader`  
The shader bound to this mesh.  
Inherited from [SpriteMesh._shader](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_shader)

### _texture (protected)

`_texture: Texture<Resource>`  
The texture that the sprite is using.  
Inherited from [SpriteMesh._texture](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_texture)

### _textureAlphaData (protected)

`_textureAlphaData: any = null`  
The texture alpha data.

### _textureID (protected)

`_textureID: number = -1`  
The texture ID.  
Inherited from [SpriteMesh._textureID](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_textureid)

### _textureTrimmedID (protected)

`_textureTrimmedID: number = -1`  
The texture trimmed ID.  
Inherited from [SpriteMesh._textureTrimmedID](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_texturetrimmedid)

### _textureUvs (protected)

`_textureUvs: null | TextureUvs = null`  
An instance of texture UVs used for padded SpriteMesh. Instanced only when padding becomes non-zero.  
Inherited from [SpriteMesh._textureUvs](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_textureuvs)

### _tintAlphaDirty (protected)

`_tintAlphaDirty: boolean = true`  
Used to track a tint or alpha change to execute a recomputation of _cachedTint.  
Inherited from [SpriteMesh._tintAlphaDirty](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_tintalphadirty)

### _tintColor (protected)

`_tintColor: Color = ...`  
The tint applied to the sprite. This is a hex value. A value of 0xFFFFFF will remove any tint effect.  
Inherited from [SpriteMesh._tintColor](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_tintcolor)

### _tintRGB (protected)

`_tintRGB: number = 0xFFFFFF`  
The tint applied to the sprite as a RGB value. A value of 0xFFFFFF will remove any tint effect.  
Inherited from [SpriteMesh._tintRGB](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_tintrgb)

### _width (protected)

`_width: number = 0`  
The width of the sprite (initially set by the texture).  
Inherited from [SpriteMesh._width](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_width)

### uvs (protected)

`uvs: Float32Array`  
Used to store the UVs data of the sprite, assigned at the same time as the vertexData in `calculateVertices()`.  
Inherited from [SpriteMesh.uvs](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#uvs)

### vertexData (protected)

`vertexData: Float32Array`  
Used to store the vertex data of the sprite (basically a quad).  
Inherited from [SpriteMesh.vertexData](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#vertexdata)

### vertexTrimmedData (protected)

`vertexTrimmedData: null | Float32Array = null`  
Used to calculate the bounds of the object IF it is a trimmed sprite.  
Inherited from [SpriteMesh.vertexTrimmedData](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#vertextrimmeddata)

---

## Accessors

### alphaMode

```typescript
get alphaMode(): ALPHA_MODES
```

Used to force an alpha mode on this sprite mesh. If this property is non-null, this value will replace the texture alphaMode when computing color channels. Affects how tint, worldAlpha, and alpha are computed relative to each other.

Returns `ALPHA_MODES`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).alphaMode`

### anchor

```typescript
get anchor(): ObservablePoint<any>
```

The anchor sets the origin point of the sprite. The default value is taken from the texture and passed to the constructor.

- Default is `(0,0)`, origin is the top left.
- `(0.5,0.5)` centers the origin.
- `(1,1)` sets origin to bottom right corner.
- If a single parameter is passed, both `x` and `y` are set to that value.

Returns `ObservablePoint<any>`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).anchor`

### blendMode

```typescript
set blendMode(value: BLEND_MODES): void
```

The blend mode applied to the SpriteMesh.

**Parameters**  
- **value**: `BLEND_MODES`

Returns `void`

Default Value: `PIXI.BLEND_MODES.NORMAL`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).blendMode`

### height

```typescript
get height(): number
set height(height: number): void
```

The height of the Container. Setting this will modify the scale to achieve the set value.

**Parameters (setter)**  
- **height**: `number`

Returns `number` (getter), `void` (setter)

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).height`

### isVideo

```typescript
get isVideo(): boolean
```

Is this SpriteMesh rendering a video texture?

Returns `boolean`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).isVideo`

### padding

```typescript
get padding(): number
```

The maximum x/y padding in pixels (must be a non-negative value).

Returns `number`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).padding`

### paddingX

```typescript
get paddingX(): number
```

The x padding in pixels (must be a non-negative value).

Returns `number`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).paddingX`

### paddingY

```typescript
get paddingY(): number
```

The y padding in pixels (must be a non-negative value).

Returns `number`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).paddingY`

### pluginName

```typescript
get pluginName(): null | string
```

Returns the SpriteMesh associated batch plugin. By default, the returned plugin is that of the associated shader. If a plugin is forced, it returns the forced plugin. A null value means this SpriteMesh has no associated plugin.

Returns `null | string`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).pluginName`

### roundPixels

```typescript
set roundPixels(value: boolean): void
```

If true, PixiJS will `Math.round()` x/y values when rendering, stopping pixel interpolation. Advantages include sharper image quality (like text) and faster rendering on canvas. The main disadvantage is movement of objects may appear less smooth. To set the global default, change `PIXI.settings.ROUND_PIXELS`.

**Parameters**  
- **value**: `boolean`

Returns `void`

Default Value: `PIXI.settings.ROUND_PIXELS`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).roundPixels`

### shader

```typescript
get shader(): BaseSamplerShader
```

The shader bound to this mesh.

Returns `BaseSamplerShader`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).shader`

### sourceElement

```typescript
get sourceElement(): null | HTMLImageElement | HTMLVideoElement
```

The HTML source element for this SpriteMesh texture.

Returns `null | HTMLImageElement | HTMLVideoElement`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).sourceElement`

### texture

```typescript
get texture(): Texture<Resource>
```

The texture that the sprite is using.

Returns `Texture<Resource>`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).texture`

### tint

```typescript
get tint(): number
```

The tint applied to the sprite as a hex value. A value of 0xFFFFFF will remove any tint effect.

Returns `number`

Default Value: `0xFFFFFF`

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).tint`

### width

```typescript
get width(): number
set width(width: number): void
```

The width of the Container. Setting this will modify the scale to achieve the set value.

**Parameters (setter)**  
- **width**: `number`

Returns `number` (getter), `void` (setter)

Inherited from `PrimaryOccludableObjectMixin(SpriteMesh).width`

---

## Methods

### _calculateBounds

```typescript
_calculateBounds(): void
```

Returns `void`

Inherited from [SpriteMesh._calculateBounds](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_calculatebounds)

### _calculateCanvasBounds

```typescript
_calculateCanvasBounds(): void
```

Returns `void`

### _onTextureUpdate

```typescript
_onTextureUpdate(): void
```

When the texture is updated, this event fires to update the scale and frame.

Returns `void`

Overrides [SpriteMesh._onTextureUpdate](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_ontextureupdate)

### _render

```typescript
_render(renderer: any): void
```

**Parameters**  
- **renderer**: `any`

Returns `void`

Inherited from [SpriteMesh._render](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_render)

### _updateBatchData

```typescript
_updateBatchData(): void
```

Update the batch data object.

Returns `void`

Overrides [SpriteMesh._updateBatchData](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_updatebatchdata)

### calculateTrimmedVertices

```typescript
calculateTrimmedVertices(): void
```

Calculates `worldTransform * vertices` for a non-texture with a trim. Stores it in `vertexTrimmedData`.  
This ensures the true width and height of a trimmed texture is respected.

Returns `void`

Inherited from [SpriteMesh.calculateTrimmedVertices](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#calculatetrimmedvertices)

### calculateVertices

```typescript
calculateVertices(): void
```

Calculates `worldTransform * vertices`, stores in `vertexData`.

Returns `void`

Inherited from [SpriteMesh.calculateVertices](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#calculatevertices)

### containsCanvasPoint

```typescript
containsCanvasPoint(point: IPointData, textureAlphaThreshold?: number): boolean
```

Is the given point in canvas space contained in this object?

**Parameters**  
- **point**: `IPointData` - The point in canvas space  
- **textureAlphaThreshold?**: `number` - The minimum texture alpha required for containment (optional)

Returns `boolean`

### containsPoint

```typescript
containsPoint(point: IPointData, textureAlphaThreshold?: number): boolean
```

Is the given point in world space contained in this object?

**Parameters**  
- **point**: `IPointData` - The point in world space  
- **textureAlphaThreshold?**: `number` - The minimum texture alpha required for containment (optional)

Returns `boolean`

Overrides [SpriteMesh.containsPoint](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#containspoint)

### destroy

```typescript
destroy(options: any): void
```

**Parameters**  
- **options**: `any`

Returns `void`

Inherited from [SpriteMesh.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#destroy)

### getLocalBounds

```typescript
getLocalBounds(rect: any): Rectangle
```

**Parameters**  
- **rect**: `any`

Returns `Rectangle`

Inherited from [SpriteMesh.getLocalBounds](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#getlocalbounds)

### renderDepthData

```typescript
renderDepthData(renderer: any): void
```

**Parameters**  
- **renderer**: `any`

Returns `void`

### resize

```typescript
resize(
    baseWidth: number,
    baseHeight: number,
    options?: {
        fit?: "height" | "width" | "fill" | "contain" | "cover";
        scaleX?: number;
        scaleY?: number;
    },
): void
```

An all-in-one helper method: resizing the PCO according to desired dimensions and options.  
This helper computes width and height based on these factors:  
- The ratio of texture width and base width.  
- The ratio of texture height and base height.

**Fit options:**  
- (default) `"fill"` computes the exact width and height ratio.  
- `"cover"` takes the maximum ratio of width and height and applies it to both.  
- `"contain"` takes the minimum ratio of width and height and applies it to both.  
- `"width"` applies the width ratio to both width and height.  
- `"height"` applies the height ratio to both width and height.

Optional scaleX and scaleY options scale after fitting.

**Important:** Using this helper means you don't need to set the height, width, and scale properties of the DisplayObject.  
Note: Alternatively, you could assign properties as with a PIXI DisplayObject.

**Parameters**  
- **baseWidth**: `number` - The base width used for computations.  
- **baseHeight**: `number` - The base height used for computations.  
- **options?**: Object (optional)  
  - **fit?**: `"height" | "width" | "fill" | "contain" | "cover"`  
  - **scaleX?**: `number`  
  - **scaleY?**: `number`

Returns `void`

### setShaderClass

```typescript
setShaderClass(shaderClass: any): void
```

Initialize shader based on the shader class type.

**Parameters**  
- **shaderClass**: `any` - The shader class

Returns `void`

Overrides [SpriteMesh.setShaderClass](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#setshaderclass)

### updateTransform

```typescript
updateTransform(): void
```

Returns `void`

Inherited from [SpriteMesh.updateTransform](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#updatetransform)

### updateUvs

```typescript
updateUvs(): void
```

Update UVs and push vertices and UV buffers on GPU if necessary.

Returns `void`

Inherited from [SpriteMesh.updateUvs](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#updateuvs)

### _onAnchorUpdate (protected)

```typescript
_onAnchorUpdate(): void
```

Called when the anchor position updates.

Returns `void`

Inherited from [SpriteMesh._onAnchorUpdate](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#_onanchorupdate)

---

## Static Methods

### from

```typescript
static from(
    source: string | Texture<Resource> | HTMLVideoElement | HTMLCanvasElement,
    textureOptions?: object,
    shaderClass?: BaseSamplerShader,
): SpriteMesh
```

Create a `SpriteMesh` from another source. You can specify texture options and a specific shader class derived from `BaseSamplerShader`.

**Parameters**  
- **source**: `string | Texture<Resource> | HTMLVideoElement | HTMLCanvasElement`  
  Source to create texture from.  
- **textureOptions?**: `object` (optional)  
  See PIXI.BaseTexture's constructor for options.  
- **shaderClass?**: `BaseSamplerShader` (optional)  
  The shader class to use. Defaults to `BaseSamplerShader`.

**Returns**  
`SpriteMesh`

Inherited from [SpriteMesh.from](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html#from)