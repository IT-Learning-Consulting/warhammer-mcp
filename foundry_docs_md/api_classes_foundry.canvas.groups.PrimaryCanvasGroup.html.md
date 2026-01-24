# PrimaryCanvasGroup

The primary Canvas group which generally contains tangible physical objects which exist within the Scene. This group is a [foundry.canvas.containers.CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html) which is rendered to the Scene as a [foundry.canvas.containers.SpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html). This allows the rendered result of the Primary Canvas Group to be affected by a [foundry.canvas.rendering.shaders.BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html).

---
**Mixes**  
CanvasGroupMixin

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.groups.PrimaryCanvasGroup), Expand)

- CachedContainer<this>  
- **PrimaryCanvasGroup**

---

## Properties

- **autoRender**: `boolean` = `true`  
  If true, the Container is rendered every frame. If false, the Container is rendered only if [CachedContainer#renderDirty](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#renderdirty) is true.  
  *Inherited from* [CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#autorender).

- **background**: [PrimarySpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html)  
  The primary background image configured for the Scene, rendered as a SpriteMesh.

- **clearColor**: `number[]` = ...  
  Overrides [CachedContainer#clearColor](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clearcolor).

- **displayed**: `boolean` = `false`  
  Should our Container also be displayed on screen, in addition to being drawn to the cached RenderTexture?  
  *Inherited from* [CachedContainer#displayed](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#displayed).

- **drawings**: `Collection<string, PrimaryGraphics>`  
  The collection of PrimaryDrawingContainer objects which are rendered in the Scene.

- **foreground**: [PrimarySpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html)  
  The primary foreground image configured for the Scene, rendered as a SpriteMesh.

- **hoverFadeElevation**: `number` = `0`  
  Occludable objects above this elevation are faded on hover.

- **quadtree**: [CanvasQuadtree](https://foundryvtt.com/api/classes/foundry.canvas.geometry.CanvasQuadtree.html)  
  A Quadtree which partitions and organizes primary canvas objects.

- **renderDirty**: `boolean` = `true`  
  Does the Container need to be rendered? Set to false after the Container is rendered.  
  *Inherited from* [CachedContainer#renderDirty](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#renderdirty).

- **tiles**: `Collection<string, PrimarySpriteMesh>`  
  The collection of SpriteMesh objects which are rendered in the Scene.

- **tokens**: `Collection<string, PrimarySpriteMesh>`  
  The collection of SpriteMesh objects which are rendered in the Scene.

- **videoMeshes**: `Set<PrimarySpriteMesh>`  
  Track the set of HTMLVideoElements which are currently playing as part of this group.

- **_renderPaths** (Protected): `Map<RenderTexture, { clearColor: number[]; renderFunction: Function }>`  
  A map of render textures, linked to their render function and an optional RGBA clear color.  
  *Inherited from* [CachedContainer#_renderPaths](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#_renderpaths).

- **BACKGROUND_ELEVATION** (Static): `number` = 0  
  Allow API users to override the default elevation of the background layer. This is a temporary solution until more formal support for scene levels is added in a future release.

- **groupName** (Static): `string` = `"primary"`

- **SORT_LAYERS** (Static): `Readonly<{ DRAWINGS: 600; SCENE: 0; TILES: 500; TOKENS: 700; WEATHER: 1000; }>`  
  Sort order to break ties on the group/layer level.

---

## Accessors

- **textureConfiguration** (Static):  
  ```typescript
  {
    format: FORMATS;
    multisample: MSAA_QUALITY;
    scaleMode: SCALE_MODES;
  }
  ```
  *Inherited from* [CachedContainer#textureConfiguration](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#textureconfiguration).

- **alphaMode**:  
  ```typescript
  set alphaMode(mode: ALPHA_MODES): void
  ```
  Set the alpha mode of the cached container render texture.

  **Parameters:**
  - **mode**: `ALPHA_MODES`

  *Inherited from* CanvasGroupMixin(CachedContainer).alphaMode.

- **backgroundSource**:  
  ```typescript
  get backgroundSource(): null | HTMLImageElement | HTMLVideoElement
  ```
  Return the base HTML image or video element which provides the background texture.

- **foregroundSource**:  
  ```typescript
  get foregroundSource(): null | HTMLImageElement | HTMLVideoElement
  ```
  Return the base HTML image or video element which provides the foreground texture.

- **renderTexture**:  
  ```typescript
  get renderTexture(): RenderTexture
  ```
  The primary render texture bound to this cached container.  
  *Inherited from* CanvasGroupMixin(CachedContainer).renderTexture.

- **sprite**:  
  ```typescript
  get sprite(): SpriteMesh | Sprite
  ```
  A PIXI.Sprite or SpriteMesh which is bound to this CachedContainer. The RenderTexture from this Container is associated with the Sprite which is automatically rendered.  
  *Inherited from* CanvasGroupMixin(CachedContainer).sprite.

---

## Methods

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters:**
- **options**: `any`

*Inherit Doc*

---

### _render

```typescript
_render(renderer: any): void
```

**Parameters:**
- **renderer**: `any`

*Overrides* CanvasGroupMixin(CachedContainer)._render.

---

### _tearDown

```typescript
_tearDown(options: any): Promise<void>
```

**Parameters:**
- **options**: `any`

*Inherit Doc*

---

### addDrawing

```typescript
addDrawing(drawing: Drawing): PrimaryGraphics
```

Add a PrimaryGraphics to the group.

**Parameters:**
- **drawing**: `Drawing`  
  The Drawing being added.

**Returns:**  
The created [PrimaryGraphics](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimaryGraphics.html) instance.

---

### addTile

```typescript
addTile(tile: Tile): PrimarySpriteMesh
```

Draw the SpriteMesh for a specific Tile object.

**Parameters:**
- **tile**: `Tile`  
  The Tile being added.

**Returns:**  
The added [PrimarySpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html).

---

### addToken

```typescript
addToken(token: Token): PrimarySpriteMesh
```

Draw the SpriteMesh for a specific Token object.

**Parameters:**
- **token**: `Token`  
  The Token being added.

**Returns:**  
The added [PrimarySpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.primary.PrimarySpriteMesh.html).

---

### clear

```typescript
clear(destroy?: boolean): CachedContainer
```

Clear the cached container, removing its current contents.

**Parameters (Optional):**
- **destroy**: `boolean` = `true`  
  Tell children that we should destroy texture as well.

**Returns:**  
A reference to the cleared container for chaining.  
*Inherited from* [CachedContainer#clear](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clear).

---

### createRenderTexture

```typescript
createRenderTexture(
  options?: { clearColor?: number[]; renderFunction?: Function }
): RenderTexture
```

Create a render texture, provide a render method and an optional clear color.

**Parameters (Optional):**
- **options**: `{ clearColor?: number[]; renderFunction?: Function }` = `{}`  
  Optional parameters.
  - **clearColor**? `number[]` - An optional clear color to clear the RenderTexture before rendering into it.
  - **renderFunction**? `Function` - Render function that will be called to render into the RenderTexture.

**Returns:**  
A reference to the created render texture.  
*Inherited from* [CachedContainer#createRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#createrendertexture).

---

### destroy

```typescript
destroy(options: any): void
```

**Parameters:**
- **options**: `any`

*Inherit Doc*  
*Inherited from* [CachedContainer#destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#destroy).

---

### refreshPrimarySpriteMesh

```typescript
refreshPrimarySpriteMesh(): void
```

Refresh the primary mesh.

---

### removeDrawing

```typescript
removeDrawing(drawing: Drawing): void
```

Remove a PrimaryGraphics from the group.

**Parameters:**
- **drawing**: `Drawing`  
  The Drawing being removed.

---

### removeRenderTexture

```typescript
removeRenderTexture(renderTexture: RenderTexture, destroy?: boolean): void
```

Remove a previously created render texture.

**Parameters:**
- **renderTexture**: `RenderTexture`  
  The render texture to remove.
- **destroy** (Optional): `boolean` = `true`  
  Should the render texture be destroyed?

*Inherited from* [CachedContainer#removeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#removerendertexture).

---

### removeTile

```typescript
removeTile(tile: Tile): void
```

Remove a Tile from the group.

**Parameters:**
- **tile**: `Tile`  
  The Tile being removed.

---

### removeToken

```typescript
removeToken(token: Token): void
```

Remove a TokenMesh from the group.

**Parameters:**
- **token**: `Token`  
  The Token being removed.

---

### render

```typescript
render(renderer: any): void
```

**Parameters:**
- **renderer**: `any`

*Inherit Doc*  
*Inherited from* [CachedContainer#render](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#render).

---

### sortChildren

```typescript
sortChildren(): void
```

Override the default PIXI.Container behavior for how objects in this container are sorted.

*Overrides* CanvasGroupMixin(CachedContainer).sortChildren.

---

### update

```typescript
update(): void
```

Update this group. Calculates the canvas transform and bounds of all its children and updates the quadtree.

---

### #bind (Protected)

```typescript
#bind(renderer: Renderer, tex: RenderTexture, clearColor?: number[]): void
```

Bind a render texture to this renderer. Must be called after bindPrimaryBuffer and before bindInitialBuffer.

**Parameters:**
- **renderer**: `Renderer`  
  The active canvas renderer.
- **tex**: `RenderTexture`  
  The texture to bind.
- **clearColor** (Optional): `number[]`  
  A custom clear color.

*Inherited from* [CachedContainer#bind](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#bind).

---

### #renderSecondary (Protected)

```typescript
#renderSecondary(renderer: Renderer): void
```

Custom rendering for secondary render textures.

**Parameters:**
- **renderer**: `Renderer`  
  The active canvas renderer.

*Inherited from* [CachedContainer#renderSecondary](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#rendersecondary).

---

### resizeRenderTexture (Static)

```typescript
resizeRenderTexture(renderer: Renderer, rt: RenderTexture): void
```

Resize a render texture passed as a parameter with the renderer.

**Parameters:**
- **renderer**: `Renderer`  
  The active canvas renderer.
- **rt**: `RenderTexture`  
  The render texture to resize.

*Inherited from* [CachedContainer#resizeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#resizerendertexture).