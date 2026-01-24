# CachedContainer | Foundry Virtual Tabletop - API Documentation - Version 13

A special type of `PIXI.Container` which draws its contents to a cached `RenderTexture`. This is accomplished by overriding the `Container#render` method to draw to our own special `RenderTexture`.

## Hierarchy  
- Container  
- **CachedContainer**  
  - [PrimaryCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.PrimaryCanvasGroup.html)  
  - [DarknessLevelContainer](https://foundryvtt.com/api/classes/foundry.canvas.layers.DarknessLevelContainer.html)  
  - [CanvasDepthMask](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasDepthMask.html)  
  - [CanvasOcclusionMask](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasOcclusionMask.html)  
  - [CanvasVisionMask](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasVisionMask.html)  

---

## Constructors

### constructor

```typescript
new CachedContainer(sprite?: SpriteMesh | Sprite): CachedContainer
```

Construct a CachedContainer.

**Parameters**  
- **sprite**: `SpriteMesh | Sprite` (Optional)  
  A specific sprite to bind to this CachedContainer and its renderTexture.

**Returns**  
`CachedContainer`  
Overrides `PIXI.Container.constructor`.

---

## Properties

### autoRender

```typescript
autoRender: boolean = true
```

If true, the Container is rendered every frame. If false, the Container is rendered only if [CachedContainer#renderDirty](#renderDirty) is true.

---

### clearColor

```typescript
clearColor: number[]
```

An RGBA array used to define the clear color of the RenderTexture.

---

### displayed

```typescript
displayed: boolean = false
```

Should our Container also be displayed on screen, in addition to being drawn to the cached RenderTexture?

---

### renderDirty

```typescript
renderDirty: boolean = true
```

Does the Container need to be rendered? Set to false after the Container is rendered.

---

### _renderPaths

```typescript
_renderPaths: Map<
  RenderTexture,
  {
    clearColor: number[];
    renderFunction: Function;
  }
>
```

A map of render textures, linked to their render function and an optional RGBA clear color.

---

### textureConfiguration

```typescript
textureConfiguration: {
  format: FORMATS;
  mipmap: MIPMAP_MODES;
  multisample: MSAA_QUALITY;
  scaleMode: SCALE_MODES;
} = {}
```

The texture configuration to use for this cached container.

---

## Accessors

### alphaMode

```typescript
set alphaMode(mode: ALPHA_MODES): void
```

Set the alpha mode of the cached container render texture.

**Parameters**  
- **mode**: `ALPHA_MODES`

**Returns**  
`void`

---

### renderTexture

```typescript
get renderTexture(): RenderTexture
```

The primary render texture bound to this cached container.

**Returns**  
`RenderTexture`

---

### sprite

```typescript
get sprite(): SpriteMesh | Sprite
```

A `PIXI.Sprite` or `SpriteMesh` which is bound to this CachedContainer. The RenderTexture from this Container is associated with the Sprite which is automatically rendered.

**Returns**  
`SpriteMesh | Sprite`

---

## Methods

### clear

```typescript
clear(destroy?: boolean): CachedContainer
```

Clear the cached container, removing its current contents.

**Parameters**  
- **destroy**: `boolean` = `true` (Optional)  
  Tell children that we should destroy texture as well.

**Returns**  
`CachedContainer`  
A reference to the cleared container for chaining.

---

### createRenderTexture

```typescript
createRenderTexture(
  options?: { clearColor?: number[]; renderFunction?: Function }
): RenderTexture
```

Create a render texture, provide a render method and an optional clear color.

**Parameters**  
- **options**: {  
  &nbsp;&nbsp;**clearColor**?: `number[]` (Optional)  
  &nbsp;&nbsp;&nbsp;&nbsp;An optional clear color to clear the RT before rendering into it.  
  &nbsp;&nbsp;**renderFunction**?: `Function` (Optional)  
  &nbsp;&nbsp;&nbsp;&nbsp;Render function that will be called to render into the RT.  
} = {}

**Returns**  
`RenderTexture`  
A reference to the created render texture.

---

### destroy

```typescript
destroy(options: any): void
```

Overrides `PIXI.Container.destroy`.

**Parameters**  
- **options**: `any`

**Returns**  
`void`

---

### removeRenderTexture

```typescript
removeRenderTexture(renderTexture: RenderTexture, destroy?: boolean): void
```

Remove a previously created render texture.

**Parameters**  
- **renderTexture**: `RenderTexture`  
  The render texture to remove.  
- **destroy**: `boolean` = `true` (Optional)  
  Should the render texture be destroyed?

**Returns**  
`void`

---

### render

```typescript
render(renderer: any): void
```

Overrides `PIXI.Container.render`.

**Parameters**  
- **renderer**: `any`

**Returns**  
`void`

---

### #bind (Protected)

```typescript
"#bind"(renderer: Renderer, tex: RenderTexture, clearColor?: number[]): void
```

Bind a render texture to this renderer. Must be called after `bindPrimaryBuffer` and before `bindInitialBuffer`.

**Parameters**  
- **renderer**: `Renderer`  
  The active canvas renderer.  
- **tex**: `RenderTexture`  
  The texture to bind.  
- **clearColor**: `number[]` (Optional)  
  A custom clear color.

**Returns**  
`void`

---

### #renderSecondary (Protected)

```typescript
"#renderSecondary"(renderer: Renderer): void
```

Custom rendering for secondary render textures.

**Parameters**  
- **renderer**: `Renderer`  
  The active canvas renderer.

**Returns**  
`void`

---

### resizeRenderTexture (Static)

```typescript
resizeRenderTexture(renderer: Renderer, rt: RenderTexture): void
```

Resize a render texture passed as a parameter with the renderer.

**Parameters**  
- **renderer**: `Renderer`  
  The active canvas renderer.  
- **rt**: `RenderTexture`  
  The render texture to resize.

**Returns**  
`void`

---

For the full documentation, visit the [Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html).