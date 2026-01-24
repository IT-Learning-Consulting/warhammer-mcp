# DoorMesh | Foundry Virtual Tabletop - API Documentation - Version 13

A special subclass of `PrimarySpriteMesh` used to render an interactive door.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.containers.DoorMesh), Expand

- *PrimarySpriteMesh*  
- **DoorMesh**

---

## Constructors

### constructor

```typescript
new DoorMesh(
    options?: PrimarySpriteMeshConstructorOptions & DoorAnimationConfiguration & {
        style: DoorStyle;
    }, 
): DoorMesh
```

Construct a `DoorMesh` by providing `PrimarySpriteMesh` constructor options and specific door configuration.

**Parameters**

- **options**: `PrimarySpriteMeshConstructorOptions` & `DoorAnimationConfiguration` &  
  `{ style: DoorStyle; }` = {}

**Returns**  
`DoorMesh`

Overrides [PrimarySpriteMesh.constructor](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#constructor)

---

## Properties

### indices

**Type:** `Uint16Array`

The indices of the geometry.

Inherited from [PrimarySpriteMesh.indices](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#indices)

---

### textureAlphaThreshold

**Type:** `number = 0`

The texture alpha threshold used for point containment tests. If set to a value larger than 0, the texture alpha data is extracted from the texture at 25% resolution.

Inherited from [PrimarySpriteMesh.textureAlphaThreshold](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#texturealphathreshold)

---

### texturePadding

**Type:** `number = 0`

An amount of pixel padding surrounding the door texture.

---

### _anchor (protected)

**Type:** `ObservablePoint<any>`

The anchor point defines the normalized coordinates in the texture that map to the position of this sprite.

By default, this is `(0,0)` (or `texture.defaultAnchor` if you have modified that), which means the position `(x,y)` of this `Sprite` will be the top-left corner.

Note: Updating `texture.defaultAnchor` after constructing a `Sprite` does *not* update its anchor.

[More info](https://docs.cocos2d-x.org/cocos2d-x/en/sprites/manipulation.html)

Inherited from [PrimarySpriteMesh._anchor](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_anchor)

---

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

Inherited from [PrimarySpriteMesh._batchData](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_batchdata)

---

### _cachedTint (protected)

**Type:** `[red: number, green: number, blue: number, alpha: number] = ...`

Cached tint value so we can tell when the tint is changed.

Inherited from [PrimarySpriteMesh._cachedTint](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_cachedtint)

---

### _height (protected)

**Type:** `number = 0`

The height of the sprite (this is initially set by the texture)

Inherited from [PrimarySpriteMesh._height](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_height)

---

### _paddingX (protected)

**Type:** `number`

Inherited from [PrimarySpriteMesh._paddingX](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_paddingx)

---

### _paddingY (protected)

**Type:** `number`

Inherited from [PrimarySpriteMesh._paddingY](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_paddingy)

---

### _shader (protected)

**Type:** [BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html)

The shader bound to this mesh.

Inherited from [PrimarySpriteMesh._shader](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_shader)

---

### _texture (protected)

**Type:** `Texture<Resource>`

The texture that the sprite is using.

Inherited from [PrimarySpriteMesh._texture](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_texture)

---

### _textureAlphaData (protected)

**Type:** `any = null`

The texture alpha data.

Inherited from [PrimarySpriteMesh._textureAlphaData](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_texturealphadata)

---

### _textureID (protected)

**Type:** `number = -1`

The texture ID.

Inherited from [PrimarySpriteMesh._textureID](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_textureid)

---

### _textureTrimmedID (protected)

**Type:** `number = -1`

The texture trimmed ID.

Inherited from [PrimarySpriteMesh._textureTrimmedID](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_texturetrimmedid)

---

### _textureUvs (protected)

**Type:** `null | TextureUvs = null`

An instance of a texture uvs used for padded SpriteMesh. Instanced only when padding becomes non-zero.

Inherited from [PrimarySpriteMesh._textureUvs](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_textureuvs)

---

### _tintAlphaDirty (protected)

**Type:** `boolean = true`

Used to track a tint or alpha change to execute a recomputation of _cachedTint.

Inherited from [PrimarySpriteMesh._tintAlphaDirty](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_tintalphadirty)

---

### _tintColor (protected)

**Type:** `Color = ...`

The tint applied to the sprite. This is a hex value. A value of `0xFFFFFF` will remove any tint effect.

Inherited from [PrimarySpriteMesh._tintColor](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_tintcolor)

---

### _tintRGB (protected)

**Type:** `number = 0xFFFFFF`

The tint applied to the sprite. This is a RGB value. A value of `0xFFFFFF` will remove any tint effect.

Inherited from [PrimarySpriteMesh._tintRGB](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_tintrgb)

---

### _width (protected)

**Type:** `number = 0`

The width of the sprite (this is initially set by the texture).

Inherited from [PrimarySpriteMesh._width](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_width)

---

### uvs (protected)

**Type:** `Float32Array`

This is used to store the uvs data of the sprite, assigned at the same time as the vertexData in `calculateVertices()`.

Inherited from [PrimarySpriteMesh.uvs](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#uvs)

---

### vertexData (protected)

**Type:** `Float32Array`

This is used to store the vertex data of the sprite (basically a quad).

Inherited from [PrimarySpriteMesh.vertexData](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#vertexdata)

---

### vertexTrimmedData (protected)

**Type:** `null | Float32Array = null`

This is used to calculate the bounds of the object IF it is a trimmed sprite.

Inherited from [PrimarySpriteMesh.vertexTrimmedData](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#vertextrimmeddata)

---

## Accessors

### Static - DOOR_STYLES

```typescript
readonly DOOR_STYLES: Readonly<{
    DOUBLE_LEFT: "doubleL";
    DOUBLE_RIGHT: "doubleR";
    SINGLE: "single";
}> = ...
```

The possible rendering styles for a door mesh.

---

### alphaMode

```typescript
get alphaMode(): ALPHA_MODES
```

Used to force an alpha mode on this sprite mesh. If this property is non null, this value will replace the texture alphaMode when computing color channels. Affects how tint, worldAlpha and alpha are computed each others.

**Returns**  
`ALPHA_MODES`

Inherited from PrimarySpriteMesh.alphaMode

---

### anchor

```typescript
get anchor(): ObservablePoint<any>
```

The anchor sets the origin point of the sprite. The default value is taken from the texture and passed to the constructor.

- The default is `(0,0)`, meaning the sprite's origin is the top left.
- Setting the anchor to `(0.5,0.5)` centers the sprite's origin.
- Setting the anchor to `(1,1)` makes the origin the bottom right corner.

If you pass only single parameter, it will set both x and y to the same value.

**Returns**  
`ObservablePoint<any>`

Inherited from PrimarySpriteMesh.anchor

---

### animationId

```typescript
get animationId(): string
```

The identifier for this door animation.

**Returns**  
`string`

---

### blendMode

```typescript
set blendMode(value: BLEND_MODES): void
```

The blend mode applied to the `SpriteMesh`.

**Parameters**

- **value**: `BLEND_MODES`

**Returns**  
`void`

**Default Value**  
`PIXI.BLEND_MODES.NORMAL`

Inherited from PrimarySpriteMesh.blendMode

---

### height

```typescript
get height(): number
set height(height: number): void
```

- **Getter:** Returns the height of the container.

- **Setter:** Sets the height of the container; this modifies the scale to achieve the desired height.

**Parameters**

- **height**: `number`

**Returns**  
`number` (getter)  
`void` (setter)

Inherited from PrimarySpriteMesh.height

---

### isVideo

```typescript
get isVideo(): boolean
```

Is this `SpriteMesh` rendering a video texture?

**Returns**  
`boolean`

Inherited from PrimarySpriteMesh.isVideo

---

### padding

```typescript
get padding(): number
```

The maximum x/y padding in pixels (must be a non-negative value).

**Returns**  
`number`

Inherited from PrimarySpriteMesh.padding

---

### paddingX

```typescript
get paddingX(): number
```

The x padding in pixels (must be a non-negative value).

**Returns**  
`number`

Inherited from PrimarySpriteMesh.paddingX

---

### paddingY

```typescript
get paddingY(): number
```

The y padding in pixels (must be a non-negative value).

**Returns**  
`number`

Inherited from PrimarySpriteMesh.paddingY

---

### pluginName

```typescript
get pluginName(): null | string
```

Returns the `SpriteMesh` associated batch plugin. By default, the returned plugin is that of the associated shader. If a plugin is forced, it will return the forced plugin. A null value means that this `SpriteMesh` has no associated plugin.

**Returns**  
`null | string`

Inherited from PrimarySpriteMesh.pluginName

---

### roundPixels

```typescript
set roundPixels(value: boolean): void
```

If true, PixiJS will `Math.round()` x/y values when rendering, stopping pixel interpolation. Advantages can include sharper image quality (like text) and faster rendering on canvas. The main disadvantage is movement of objects may appear less smooth.

To set the global default, change `PIXI.settings.ROUND_PIXELS`.

**Parameters**

- **value**: `boolean`

**Returns**  
`void`

Default Value: `PIXI.settings.ROUND_PIXELS`

Inherited from PrimarySpriteMesh.roundPixels

---

### shader

```typescript
get shader(): BaseSamplerShader
```

The shader bound to this mesh.

**Returns**  
`BaseSamplerShader`

Inherited from PrimarySpriteMesh.shader

---

### sourceElement

```typescript
get sourceElement(): null | HTMLImageElement | HTMLVideoElement
```

The HTML source element for this `SpriteMesh` texture.

**Returns**  
`null | HTMLImageElement | HTMLVideoElement`

Inherited from PrimarySpriteMesh.sourceElement

---

### texture

```typescript
get texture(): Texture<Resource>
```

The texture that the sprite is using.

**Returns**  
`Texture<Resource>`

Inherited from PrimarySpriteMesh.texture

---

### tint

```typescript
get tint(): number
```

The tint applied to the sprite. This is a hex value. A value of `0xFFFFFF` will remove any tint effect.

**Returns**  
`number`

Default Value: `0xFFFFFF`

Inherited from PrimarySpriteMesh.tint

---

### width

```typescript
get width(): number
set width(width: number): void
```

- **Getter:** Returns the width of the container.

- **Setter:** Sets the width of the container; this modifies the scale to achieve the desired width.

**Parameters**

- **width**: `number`

**Returns**  
`number` (getter)  
`void` (setter)

Inherited from PrimarySpriteMesh.width

---

## Methods

### _calculateBounds()

```typescript
_calculateBounds(): void
```

**Returns**  
`void`

Inherited from [PrimarySpriteMesh._calculateBounds](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_calculatebounds)

---

### _calculateCanvasBounds()

```typescript
_calculateCanvasBounds(): void
```

**Returns**  
`void`

Inherited from [PrimarySpriteMesh._calculateCanvasBounds](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_calculatecanvasbounds)

---

### _onTextureUpdate()

```typescript
_onTextureUpdate(): void
```

When the texture is updated, this event fires to update the scale and frame.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh._onTextureUpdate](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_ontextureupdate)

---

### _render(renderer: any)

```typescript
_render(renderer: any): void
```

**Parameters**

- **renderer**: `any`

**Returns**  
`void`

Inherited from [PrimarySpriteMesh._render](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_render)

---

### _updateBatchData()

```typescript
_updateBatchData(): void
```

Update the batch data object.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh._updateBatchData](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_updatebatchdata)

---

### animate(open: boolean)

```typescript
animate(open: boolean): Promise<void>
```

Animate the door to its current rendered state.

**Parameters**

- **open**: `boolean`  
  Is the door now open or closed?

**Returns**  
`Promise<void>`

---

### calculateTrimmedVertices()

```typescript
calculateTrimmedVertices(): void
```

Calculates `worldTransform * vertices` for a non-texture with a trim. Stores it in `vertexTrimmedData`.

This is used to ensure that the true width and height of a trimmed texture is respected.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.calculateTrimmedVertices](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#calculatetrimmedvertices)

---

### calculateVertices()

```typescript
calculateVertices(): void
```

Calculates `worldTransform * vertices`, stores it in `vertexData`.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.calculateVertices](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#calculatevertices)

---

### containsCanvasPoint(point: IPointData, textureAlphaThreshold?: number)

```typescript
containsCanvasPoint(point: IPointData, textureAlphaThreshold?: number): boolean
```

Is the given point in canvas space contained in this object?

**Parameters**

- **point**: `IPointData`  
  The point in canvas space.

- **textureAlphaThreshold?**: `number`  
  The minimum texture alpha required for containment. Optional.

**Returns**  
`boolean`

Inherited from [PrimarySpriteMesh.containsCanvasPoint](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#containscanvaspoint)

---

### containsPoint(point: IPointData, textureAlphaThreshold?: number)

```typescript
containsPoint(point: IPointData, textureAlphaThreshold?: number): boolean
```

Is the given point in world space contained in this object?

**Parameters**

- **point**: `IPointData`  
  The point in world space.

- **textureAlphaThreshold?**: `number`  
  The minimum texture alpha required for containment. Optional.

**Returns**  
`boolean`

Inherited from [PrimarySpriteMesh.containsPoint](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#containspoint)

---

### destroy(options: any)

```typescript
destroy(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.destroy](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#destroy)

---

### getLocalBounds(rect: any)

```typescript
getLocalBounds(rect: any): Rectangle
```

**Parameters**

- **rect**: `any`

**Returns**  
`Rectangle`

Inherited from [PrimarySpriteMesh.getLocalBounds](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#getlocalbounds)

---

### initialize(animation: DoorAnimationConfiguration)

```typescript
initialize(animation: DoorAnimationConfiguration): void
```

Configure and initialize the `DoorMesh`. This is called automatically upon construction but may be called manually later to update the `DoorMesh`.

**Parameters**

- **animation**: `DoorAnimationConfiguration`

**Returns**  
`void`

---

### renderDepthData(renderer: any)

```typescript
renderDepthData(renderer: any): void
```

**Parameters**

- **renderer**: `any`

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.renderDepthData](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#renderdepthdata)

---

### resize(baseWidth: number, baseHeight: number, options?: { fit?: "height" | "width" | "fill" | "contain" | "cover"; scaleX?: number; scaleY?: number; }): void

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

An all-in-one helper method: Resizing the `PCO` according to desired dimensions and options. This helper computes the width and height based on:

- The ratio of texture width and base width.
- The ratio of texture height and base height.

It takes into account the desired fit options:

- (default) `"fill"` computes the exact width and height ratio.
- `"cover"` takes the maximum ratio of width and height and applies it to both.
- `"contain"` takes the minimum ratio of width and height and applies it to both.
- `"width"` applies the width ratio to both width and height.
- `"height"` applies the height ratio to both width and height.

You can also apply optional `scaleX` and `scaleY` options to both width and height. The scale is applied after fitting.

**Important:** By using this helper, you don't need to set the height, width, and scale properties of the DisplayObject.

**Note:** This is a helper method. Alternatively, you could assign properties as you would with a PIXI DisplayObject.

**Parameters**

- **baseWidth**: `number`  
  The base width used for computations.

- **baseHeight**: `number`  
  The base height used for computations.

- **options?**:  
  - **fit?**: `"height"` | `"width"` | `"fill"` | `"contain"` | `"cover"`  
    The fit type.  
  - **scaleX?**: `number`  
    The scale on X axis.  
  - **scaleY?**: `number`  
    The scale on Y axis.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.resize](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#resize)

---

### setShaderClass(shaderClass: any)

```typescript
setShaderClass(shaderClass: any): void
```

Initialize shader based on the shader class type.

**Parameters**

- **shaderClass**: `any`  
  The shader class.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.setShaderClass](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#setshaderclass)

---

### updateTransform()

```typescript
updateTransform(): void
```

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.updateTransform](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#updatetransform)

---

### updateUvs()

```typescript
updateUvs(): void
```

Update uvs and push vertices and uv buffers on GPU if necessary.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh.updateUvs](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#updateuvs)

---

### _onAnchorUpdate() (protected)

```typescript
_onAnchorUpdate(): void
```

Called when the anchor position updates.

**Returns**  
`void`

Inherited from [PrimarySpriteMesh._onAnchorUpdate](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#_onanchorupdate)

---

### Static Methods

---

#### animateAscend(...this: any, open: boolean): CanvasAnimationAttribute[]

```typescript
animateAscend(...this: any, open: boolean): CanvasAnimationAttribute[]
```

Configure the "ascend" animation.

**Parameters**

- **...this**: `any`  
- **open**: `boolean`

**Returns**  
`CanvasAnimationAttribute[]`

---

#### animateDescend(...this: any, open: boolean): CanvasAnimationAttribute[]

```typescript
animateDescend(...this: any, open: boolean): CanvasAnimationAttribute[]
```

Configure the "descend" animation.

**Parameters**

- **...this**: `any`  
- **open**: `boolean`

**Returns**  
`CanvasAnimationAttribute[]`

---

#### animateSlide(...this: any, open: boolean): CanvasAnimationAttribute[]

```typescript
animateSlide(...this: any, open: boolean): CanvasAnimationAttribute[]
```

Configure the "slide" animation.

**Parameters**

- **...this**: `any`  
- **open**: `boolean`

**Returns**  
`CanvasAnimationAttribute[]`

---

#### animateSwing(...this: any, open: boolean): CanvasAnimationAttribute[]

```typescript
animateSwing(...this: any, open: boolean): CanvasAnimationAttribute[]
```

Configure the "swing" animation.

**Parameters**

- **...this**: `any`  
- **open**: `boolean`

**Returns**  
`CanvasAnimationAttribute[]`

---

#### from(source: string | Texture<Resource> | HTMLVideoElement | HTMLCanvasElement, textureOptions?: object, shaderClass?: BaseSamplerShader): SpriteMesh

```typescript
from(
    source: string | Texture<Resource> | HTMLVideoElement | HTMLCanvasElement,
    textureOptions?: object,
    shaderClass?: BaseSamplerShader,
): SpriteMesh
```

Create a `SpriteMesh` from another source. You can specify texture options and a specific shader class derived from `BaseSamplerShader`.

**Parameters**

- **source**: `string` | `Texture<Resource>` | `HTMLVideoElement` | `HTMLCanvasElement`  
  Source to create texture from.

- **textureOptions?**: `object`  
  See PIXI.BaseTexture's constructor for options.

- **shaderClass?**: `BaseSamplerShader`  
  The shader class to use. `BaseSamplerShader` by default.

**Returns**  
`SpriteMesh`

Inherited from [PrimarySpriteMesh.from](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html#from)

---

#### initializeDescend(...this: any, open: boolean): void

```typescript
initializeDescend(...this: any, open: boolean): void
```

Special initialization needed for descending door types.

**Parameters**

- **...this**: `any`  
- **open**: `boolean`

**Returns**  
`void`

---

#### postAnimateDescend(...this: any, open: boolean): Promise<void>

```typescript
postAnimateDescend(...this: any, open: boolean): Promise<void>
```

When opening a descending door, shift its elevation to the background after animation.

**Parameters**

- **...this**: `any`  
- **open**: `boolean`

**Returns**  
`Promise<void>`

---

#### preAnimateDescend(...this: any, open: boolean): Promise<void>

```typescript
preAnimateDescend(...this: any, open: boolean): Promise<void>
```

When closing a descending door, shift its elevation to the foreground before animation.

**Parameters**

- **...this**: `any`  
- **open**: `boolean`

**Returns**  
`Promise<void>`

---

For the full [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.containers.DoorMesh.html).