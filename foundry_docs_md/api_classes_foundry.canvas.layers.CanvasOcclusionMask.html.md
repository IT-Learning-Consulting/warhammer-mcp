# CanvasOcclusionMask | Foundry Virtual Tabletop - API Documentation - Version 13

The occlusion mask which contains radial occlusion and vision occlusion from tokens.  
Red channel: Fade occlusion. Green channel: Radial occlusion. Blue channel: Vision occlusion.

## Hierarchy
- [CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html)
- **CanvasOcclusionMask**

---

## Properties

### autoRender

`autoRender: boolean = false`  
Overrides [CachedContainer.autoRender](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#autorender)

---

### clearColor

`clearColor: number[] = ...`  
Overrides [CachedContainer.clearColor](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clearcolor)

---

### displayed

`displayed: boolean = false`  
Should our Container also be displayed on screen, in addition to being drawn to the cached RenderTexture?  
Inherited from [CachedContainer.displayed](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#displayed)

---

### renderDirty

`renderDirty: boolean = true`  
Does the Container need to be rendered? Set to false after the Container is rendered.  
Inherited from [CachedContainer.renderDirty](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#renderdirty)

---

## Accessors

### tokens

`tokens: LegacyGraphics`  
Graphics in which token radial and vision occlusion shapes are drawn.

---

### _renderPaths (protected)

`_renderPaths: Map<RenderTexture, { clearColor: number[]; renderFunction: Function }>`  
A map of render textures, linked to their render function and an optional RGBA clear color.  
Inherited from [CachedContainer._renderPaths](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#_renderpaths)

---

### textureConfiguration (static)

```typescript
textureConfiguration: {
    format: FORMATS;
    multisample: MSAA_QUALITY;
    scaleMode: SCALE_MODES;
} = ...
```
Overrides [CachedContainer.textureConfiguration](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#textureconfiguration)

---

### set alphaMode(mode: ALPHA_MODES): void

Set the alpha mode of the cached container render texture.

- **Parameters**
  - `mode: ALPHA_MODES`

Returns: `void`  
Inherited from CachedContainer.alphaMode

---

### get occluded(): Set<PrimaryCanvasObject>

The set of currently occluded canvas objects.

Returns: `Set<PrimaryCanvasObject>`

---

### get renderTexture(): RenderTexture

The primary render texture bound to this cached container.

Returns: `RenderTexture`  
Inherited from [CachedContainer.renderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#rendertexture)

---

### get sprite(): SpriteMesh | Sprite

A PIXI.Sprite or SpriteMesh which is bound to this CachedContainer. The RenderTexture from this Container is associated with the Sprite which is automatically rendered.

Returns: `SpriteMesh | Sprite`  
Inherited from [CachedContainer.sprite](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#sprite)

---

### get vision(): boolean

Is vision occlusion active?

Returns: `boolean`

---

## Methods

### clear(): void

Clear the occlusion mask.

Returns: `void`  
Overrides [CachedContainer.clear](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clear)

```typescript
clear(): void
```

---

### createRenderTexture(
  options?: { clearColor?: number[]; renderFunction?: Function },
): RenderTexture

Create a render texture, provide a render method and an optional clear color.

- **Parameters**  
  - `options` (optional): Object containing optional parameters  
    - `clearColor?`: `number[]` — An optional clear color to clear the RT before rendering into it.  
    - `renderFunction?`: `Function` — Render function that will be called to render into the RT.

Returns: `RenderTexture` — A reference to the created render texture.  
Inherited from [CachedContainer.createRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#createrendertexture)

```typescript
createRenderTexture(
  options?: { clearColor?: number[]; renderFunction?: Function },
): RenderTexture
```

---

### destroy(options: any): void

- **Parameters**  
  - `options: any`

Returns: `void`  
Inherited from [CachedContainer.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#destroy)

```typescript
destroy(options: any): void
```

---

### mapElevation(elevation: number): number

Map an elevation to a value in the range [0, 1] with 8-bit precision. The radial and vision shapes are drawn with these values into the render texture.

- **Parameters**  
  - `elevation: number` — The elevation in distance units

Returns: `number` — The value for this elevation in the range [0, 1] with 8-bit precision

```typescript
mapElevation(elevation: number): number
```

---

### removeRenderTexture(renderTexture: RenderTexture, destroy?: boolean): void

Remove a previously created render texture.

- **Parameters**  
  - `renderTexture: RenderTexture` — The render texture to remove  
  - `destroy` (optional): `boolean = true` — Should the render texture be destroyed?

Returns: `void`  
Inherited from [CachedContainer.removeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#removerendertexture)

```typescript
removeRenderTexture(renderTexture: RenderTexture, destroy?: boolean): void
```

---

### render(renderer: any): void

- **Parameters**  
  - `renderer: any`

Returns: `void`  
Inherited from [CachedContainer.render](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#render)

```typescript
render(renderer: any): void
```

---

### updateOcclusion(): void

Update the set of occludable Tokens, redraw the occlusion mask, and update the occluded state of all occludable objects.

Returns: `void`

```typescript
updateOcclusion(): void
```

---

### _identifyOccludedObjects(tokens: Token[]): Set<PrimaryCanvasObjectMixin>

**Protected**  
Determine the set of objects which should be currently occluded by a Token.

- **Parameters**  
  - `tokens: Token[]` — The set of currently controlled Token objects

Returns: `Set<PrimaryCanvasObjectMixin>` — The PCO objects which should be currently occluded

```typescript
protected _identifyOccludedObjects(tokens: Token[]): Set<PrimaryCanvasObjectMixin>
```

---

### #bind(renderer: Renderer, tex: RenderTexture, clearColor?: number[]): void

**Protected**  
Bind a render texture to this renderer. Must be called after bindPrimaryBuffer and before bindInitialBuffer.

- **Parameters**  
  - `renderer: Renderer` — The active canvas renderer  
  - `tex: RenderTexture` — The texture to bind  
  - `clearColor` (optional): `number[]` — A custom clear color

Returns: `void`  
Inherited from [CachedContainer.#bind](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#bind)

```typescript
protected #bind(renderer: Renderer, tex: RenderTexture, clearColor?: number[]): void
```

---

### #renderSecondary(renderer: Renderer): void

**Protected**  
Custom rendering for secondary render textures

- **Parameters**  
  - `renderer: Renderer` — The active canvas renderer

Returns: `void`  
Inherited from [CachedContainer.#renderSecondary](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#rendersecondary)

```typescript
protected #renderSecondary(renderer: Renderer): void
```

---

### resizeRenderTexture(renderer: Renderer, rt: RenderTexture): void

**Static**  
Resize a render texture passed as a parameter with the renderer.

- **Parameters**  
  - `renderer: Renderer` — The active canvas renderer  
  - `rt: RenderTexture` — The render texture to resize

Returns: `void`  
Inherited from [CachedContainer.resizeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#resizerendertexture)

```typescript
static resizeRenderTexture(renderer: Renderer, rt: RenderTexture): void
```

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)