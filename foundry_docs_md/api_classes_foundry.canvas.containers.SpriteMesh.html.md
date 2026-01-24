# SpriteMesh | Foundry Virtual Tabletop - API Documentation - Version 13

An extension of `PIXI.Mesh` which emulates a `PIXI.Sprite` with a specific shader.

**Param: texture**  
Texture bound to this sprite mesh.

**Param: shaderClass**  
Shader class used by this sprite mesh.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.containers.SpriteMesh))  
*Container*  
**SpriteMesh**  
*[PrimarySpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html)*

---

## Properties

### indices  
`indices: Uint16Array`  
The indices of the geometry.

### _anchor  
`_anchor: ObservablePoint<any>`  
The anchor point defines the normalized coordinates in the texture that map to the position  
of this sprite.  
By default, this is (0,0) (or `texture.defaultAnchor` if you have modified that), which means  
the position (x,y) of this `Sprite` will be the top-left corner.  
Note: Updating `texture.defaultAnchor` after constructing a `Sprite` does *not* update its anchor.  
[Reference](https://docs.cocos2d-x.org/cocos2d-x/en/sprites/manipulation.html)

### _batchData  
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

### _cachedTint  
`_cachedTint: [red: number, green: number, blue: number, alpha: number] = ...`  
Cached tint value so we can tell when the tint is changed.

### _height  
`_height: number = 0`  
The height of the sprite (this is initially set by the texture)  
Overrides `PIXI.Container._height`.

### _paddingX  
`_paddingX: number`

### _paddingY  
`_paddingY: number`

### _shader  
`_shader: [BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html)`  
The shader bound to this mesh.

### _texture  
`_texture: Texture<Resource>`  
The texture that the sprite is using.

### _textureID  
`_textureID: number = -1`  
The texture ID.

### _textureTrimmedID  
`_textureTrimmedID: number = -1`  
The texture trimmed ID.

### _textureUvs  
`_textureUvs: null | TextureUvs = null`  
An instance of a texture uvs used for padded SpriteMesh. Instanced only when padding  
becomes non-zero.

### _tintAlphaDirty  
`_tintAlphaDirty: boolean = true`  
Used to track a tint or alpha change to execute a recomputation of `_cachedTint`.

### _tintColor  
`_tintColor: Color = ...`  
The tint applied to the sprite. This is a hex value. A value of `0xFFFFFF` will remove any tint  
effect.

### _tintRGB  
`_tintRGB: number = 0xFFFFFF`

### _width  
`_width: number = 0`  
The width of the sprite (this is initially set by the texture).  
Overrides `PIXI.Container._width`.

### uvs  
`uvs: Float32Array`  
This is used to store the uvs data of the sprite, assigned at the same time as the vertexData in  
`calculateVertices()`.

### vertexData  
`vertexData: Float32Array`  
This is used to store the vertex data of the sprite (basically a quad).

### vertexTrimmedData  
`vertexTrimmedData: null | Float32Array = null`  
This is used to calculate the bounds of the object IF it is a trimmed sprite.

---

## Accessors

### alphaMode  
`get alphaMode(): ALPHA_MODES`  
Used to force an alpha mode on this sprite mesh. If this property is non null, this value will  
replace the texture alphaMode when computing color channels. Affects how tint, worldAlpha  
and alpha are computed with each other.  

**Returns:** `ALPHA_MODES`

### anchor  
`get anchor(): ObservablePoint<any>`  
The anchor sets the origin point of the sprite. The default value is taken from the texture and  
passed to the constructor.  
The default is (0,0), meaning the sprite's origin is the top left.  
Setting the anchor to (0.5, 0.5) means the sprite's origin is centered.  
Setting the anchor to (1,1) means the sprite's origin point will be the bottom right corner.  
If you pass only a single parameter, it will set both x and y to the same value.  

**Returns:** `ObservablePoint<any>`

### blendMode  
```typescript
set blendMode(value: BLEND_MODES): void
```
The blend mode applied to the SpriteMesh.

- **Parameters:**
  - **value**: `BLEND_MODES`

- **Returns:** `void`  
- **Default Value:** `PIXI.BLEND_MODES.NORMAL`

### height  
```typescript
get height(): number
set height(height: number): void
```
Overrides `PIXI.Container.height`

- **Get Returns:** `number`

- **Set Parameters:**
  - **height**: `number`  
    The height of the Container, setting this will actually modify the scale to achieve the value set.

- **Set Returns:** `void`

### isVideo  
`get isVideo(): boolean`  
Is this SpriteMesh rendering a video texture?  

**Returns:** `boolean`

### padding  
`get padding(): number`  
The maximum x/y padding in pixels (must be a non-negative value).  

**Returns:** `number`

### paddingX  
`get paddingX(): number`  
The x padding in pixels (must be a non-negative value).  

**Returns:** `number`

### paddingY  
`get paddingY(): number`  
The y padding in pixels (must be a non-negative value).  

**Returns:** `number`

### pluginName  
`get pluginName(): null | string`  
Returns the SpriteMesh associated batch plugin. By default the returned plugin is that of the  
associated shader. If a plugin is forced, it will return the forced plugin. A null value means  
that this SpriteMesh has no associated plugin.  

**Returns:** `null | string`

### roundPixels  
```typescript
set roundPixels(value: boolean): void
```
If true PixiJS will `Math.round()` x/y values when rendering, stopping pixel interpolation.  
Advantages can include sharper image quality (like text) and faster rendering on canvas. The  
main disadvantage is movement of objects may appear less smooth. To set the global  
default, change `PIXI.settings.ROUND_PIXELS`.

- **Parameters:**
  - **value**: `boolean`

- **Returns:** `void`

- **Default Value:** `PIXI.settings.ROUND_PIXELS`

### shader  
`get shader(): [BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html)`  
The shader bound to this mesh.  

**Returns:** `BaseSamplerShader`

### sourceElement  
`get sourceElement(): null | HTMLImageElement | HTMLVideoElement`  
The HTML source element for this SpriteMesh texture.  

**Returns:** `null | HTMLImageElement | HTMLVideoElement`

### texture  
`get texture(): Texture<Resource>`  
The texture that the sprite is using.  

**Returns:** `Texture<Resource>`

### tint  
`get tint(): number`  
The tint applied to the sprite. This is a hex value.  
A value of `0xFFFFFF` will remove any tint effect.  

**Returns:** `number`

### width  
```typescript
get width(): number
set width(width: number): void
```
Overrides `PIXI.Container.width`

- **Get Returns:** `number`

- **Set Parameters:**
  - **width**: `number`  
    The width of the Container, setting this will actually modify the scale to achieve the value set.

- **Set Returns:** `void`

---

## Methods

### _calculateBounds  
```typescript
_calculateBounds(): void
```
Overrides `PIXI.Container._calculateBounds`

- **Returns:** `void`

### _render  
```typescript
_render(renderer: any): void
```
Overrides `PIXI.Container._render`

- **Parameters:**
  - **renderer**: `any`

- **Returns:** `void`

### calculateTrimmedVertices  
```typescript
calculateTrimmedVertices(): void
```
Calculates `worldTransform * vertices` for a non-texture with a trim. Stores it in `vertexTrimmedData`.  
This is used to ensure that the true width and height of a trimmed texture is respected.

- **Returns:** `void`

### calculateVertices  
```typescript
calculateVertices(): void
```
Calculates `worldTransform * vertices`, stores it in `vertexData`.

- **Returns:** `void`

### containsPoint  
```typescript
containsPoint(point: Point): boolean
```
Check to see if a point is contained within this SpriteMesh Quad.

- **Parameters:**
  - **point**: `Point` — Point to check if it's contained.

- **Returns:** `boolean` — true if the point is contained within geometry.

### destroy  
```typescript
destroy(options: any): void
```
Overrides `PIXI.Container.destroy`

- **Parameters:**
  - **options**: `any`

- **Returns:** `void`

### getLocalBounds  
```typescript
getLocalBounds(rect: any): Rectangle
```
Overrides `PIXI.Container.getLocalBounds`

- **Parameters:**
  - **rect**: `any`

- **Returns:** `Rectangle`

### setShaderClass  
```typescript
setShaderClass(shaderClass: typeof BaseSamplerShader): void
```
Initialize shader based on the shader class type.

- **Parameters:**
  - **shaderClass**: `typeof [BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html)` — The shader class.

- **Returns:** `void`

### updateTransform  
```typescript
updateTransform(): void
```
Overrides `PIXI.Container.updateTransform`

- **Returns:** `void`

### updateUvs  
```typescript
updateUvs(): void
```
Update uvs and push vertices and uv buffers on GPU if necessary.

- **Returns:** `void`

### _onAnchorUpdate  
```typescript
_onAnchorUpdate(): void
```
Protected  
Called when the anchor position updates.

- **Returns:** `void`

### _onTextureUpdate  
```typescript
_onTextureUpdate(): void
```
Protected  
When the texture is updated, this event will fire to update the scale and frame.

- **Returns:** `void`

### _updateBatchData  
```typescript
_updateBatchData(): void
```
Protected  
Update the batch data object.

- **Returns:** `void`

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
Create a `SpriteMesh` from another source. You can specify texture options and a specific  
shader class derived from `BaseSamplerShader`.

- **Parameters:**
  - **source**: `string | Texture<Resource> | HTMLVideoElement | HTMLCanvasElement`  
    Source to create texture from.

  - **textureOptions?**: `object`  
    See `PIXI.BaseTexture`'s constructor for options.

  - **shaderClass?**: `[BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html)`  
    The shader class to use. `BaseSamplerShader` by default.

- **Returns:** `SpriteMesh`