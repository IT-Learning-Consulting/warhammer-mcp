# CanvasDepthMask

The depth mask which contains a mapping of elevation. Needed to know if we must render objects according to depth.  
- **Red channel:** Lighting occlusion (top)  
- **Green channel:** Lighting occlusion (bottom)  
- **Blue channel:** Weather occlusion.

Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.CanvasDepthMask)

## Properties

### autoRender

**Type:** `boolean`  
**Default:** `true`  

If true, the Container is rendered every frame. If false, the Container is rendered only if [CachedContainer#renderDirty is true](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#renderdirty).  

Inherited from [CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#autorender)

### clearColor

**Type:** `number[]`  
**Default:** `...`  

Overrides [CachedContainer.clearColor](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clearcolor)

### displayed

**Type:** `boolean`  
**Default:** `false`  

Should our Container also be displayed on screen, in addition to being drawn to the cached RenderTexture?  

Inherited from [CachedContainer.displayed](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#displayed)

### renderDirty

**Type:** `boolean`  
**Default:** `true`  

Does the Container need to be rendered? Set to false after the Container is rendered.  

Inherited from [CachedContainer.renderDirty](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#renderdirty)

### roofs

**Type:** `Container<DisplayObject>`  

Container in which roofs are rendered with depth data.

### _renderPaths  _(Protected)_

**Type:** `Map<RenderTexture, { clearColor: number[]; renderFunction: Function }>`  
**Default:** `...`  

A map of render textures, linked to their render function and an optional RGBA clear color.  

Inherited from [CachedContainer._renderPaths](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#_renderpaths)

### textureConfiguration  _(Static)_

```typescript
{
  format: FORMATS;
  multisample: MSAA_QUALITY;
  scaleMode: SCALE_MODES;
} = ...
```

Overrides [CachedContainer.textureConfiguration](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#textureconfiguration)

## Accessors

### alphaMode

```typescript
set alphaMode(mode: ALPHA_MODES): void
```

Set the alpha mode of the cached container render texture.

**Parameters**

- **mode**: `ALPHA_MODES`

**Returns:** `void`  

Inherited from CachedContainer.alphaMode

### renderTexture

```typescript
get renderTexture(): RenderTexture
```

The primary render texture bound to this cached container.

**Returns:** `RenderTexture`  

Inherited from CachedContainer.renderTexture

### sprite

```typescript
get sprite(): SpriteMesh | Sprite
```

A PIXI.Sprite or SpriteMesh which is bound to this CachedContainer. The RenderTexture from this Container is associated with the Sprite which is automatically rendered.

**Returns:** `SpriteMesh | Sprite`  

Inherited from CachedContainer.sprite

## Methods

### clear

```typescript
clear(): void
```

Clear the depth mask.

**Returns:** `void`  

Overrides [CachedContainer.clear](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clear)

### createRenderTexture

```typescript
createRenderTexture(
  options?: { clearColor?: number[]; renderFunction?: Function },
): RenderTexture
```

Create a render texture, provide a render method and an optional clear color.

**Parameters**

- **options?**:  
  - **clearColor?**: `number[]` — An optional clear color to clear the RT before rendering into it.  
  - **renderFunction?**: `Function` — Render function that will be called to render into the RT.

**Returns:** `RenderTexture`  

Inherited from [CachedContainer.createRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#createrendertexture)

### destroy

```typescript
destroy(options: any): void
```

**Parameters**

- **options**: `any`

**Returns:** `void`  

Inherited from [CachedContainer.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#destroy)

### mapElevation

```typescript
mapElevation(elevation: number): number
```

Map an elevation to a value in the range [0, 1] with 8-bit precision. The depth-rendered object are rendered with these values into the render texture.

**Parameters**

- **elevation**: `number` — The elevation in distance units

**Returns:** `number` — The value for this elevation in the range [0, 1] with 8-bit precision

### removeRenderTexture

```typescript
removeRenderTexture(renderTexture: RenderTexture, destroy?: boolean): void
```

Remove a previously created render texture.

**Parameters**

- **renderTexture**: `RenderTexture` — The render texture to remove.  
- **destroy?**: `boolean` = `true` — Should the render texture be destroyed?

**Returns:** `void`  

Inherited from [CachedContainer.removeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#removerendertexture)

### render

```typescript
render(renderer: any): void
```

**Parameters**

- **renderer**: `any`

**Returns:** `void`  

Inherited from [CachedContainer.render](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#render)

### #bind  _(Protected)_

```typescript
#bind(renderer: Renderer, tex: RenderTexture, clearColor?: number[]): void
```

Bind a render texture to this renderer. Must be called after bindPrimaryBuffer and before bindInitialBuffer.

**Parameters**

- **renderer**: `Renderer` — The active canvas renderer.  
- **tex**: `RenderTexture` — The texture to bind.  
- **clearColor?**: `number[]` — A custom clear color.

**Returns:** `void`  

Inherited from [CachedContainer.#bind](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#bind)

### #renderSecondary  _(Protected)_

```typescript
#renderSecondary(renderer: Renderer): void
```

Custom rendering for secondary render textures.

**Parameters**

- **renderer**: `Renderer` — The active canvas renderer.

**Returns:** `void`  

Inherited from [CachedContainer.#renderSecondary](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#rendersecondary)

### resizeRenderTexture  _(Static)_

```typescript
resizeRenderTexture(renderer: Renderer, rt: RenderTexture): void
```

Resize a render texture passed as a parameter with the renderer.

**Parameters**

- **renderer**: `Renderer` — The active canvas renderer.  
- **rt**: `RenderTexture` — The render texture to resize.

**Returns:** `void`  

Inherited from [CachedContainer.resizeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#resizerendertexture)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)