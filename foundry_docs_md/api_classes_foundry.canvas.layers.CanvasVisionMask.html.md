# CanvasVisionMask

The vision mask which contains the current line-of-sight texture.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [layers](https://foundryvtt.com/api/modules/foundry.canvas.layers.html) / [CanvasVisionMask](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasVisionMask.html)

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.CanvasVisionMask)  

- [CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html)  
- CanvasVisionMask  

---

## Constructors

```typescript
new CanvasVisionMask(sprite?: SpriteMesh | Sprite): CanvasVisionMask
```

Construct a CachedContainer.

**Parameters**

- **sprite**: *SpriteMesh | Sprite* (Optional)  
  A specific sprite to bind to this CachedContainer and its renderTexture.

**Returns**  
*CanvasVisionMask*  

Inherited from [CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html) constructor.

---

## Properties

### autoRender

```typescript
autoRender: boolean = false
```

Overrides [CachedContainer.autoRender](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#autorender).

---

### blurFilter

```typescript
blurFilter: AlphaBlurFilter
```

The BlurFilter which applies to the vision mask texture. This filter applies a NORMAL blend mode to the container.

---

### clearColor

```typescript
clearColor: number[] = ...
```

Overrides [CachedContainer.clearColor](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clearcolor).

---

### displayed

```typescript
displayed: boolean = false
```

Should our Container also be displayed on screen, in addition to being drawn to the cached RenderTexture?

Inherited from [CachedContainer.displayed](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#displayed).

---

### renderDirty

```typescript
renderDirty: boolean = true
```

Does the Container need to be rendered? Set to false after the Container is rendered.

Inherited from [CachedContainer.renderDirty](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#renderdirty).

---

### vision

```typescript
vision: CanvasVisionContainer
```

The current vision Container.

---

### _renderPaths

```typescript
protected _renderPaths: Map<
    RenderTexture,
    { clearColor: number[]; renderFunction: Function }
> = ...
```

A map of render textures, linked to their render function and an optional RGBA clear color.

Inherited from [CachedContainer._renderPaths](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#_renderpaths).

---

### textureConfiguration

```typescript
static textureConfiguration: {
    format: FORMATS;
    multisample: MSAA_QUALITY;
    scaleMode: SCALE_MODES;
} = ...
```

Overrides [CachedContainer.textureConfiguration](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#textureconfiguration).

---

## Accessors

### alphaMode

```typescript
set alphaMode(mode: ALPHA_MODES): void
```

Set the alpha mode of the cached container render texture.

**Parameters**

- **mode**: *ALPHA_MODES*

**Returns**  
*void*  

Inherited from CachedContainer.alphaMode.

---

### renderTexture

```typescript
get renderTexture(): RenderTexture
```

The primary render texture bound to this cached container.

**Returns**  
*RenderTexture*  

Inherited from CachedContainer.renderTexture.

---

### sprite

```typescript
get sprite(): SpriteMesh | Sprite
```

A PIXI.Sprite or SpriteMesh which is bound to this CachedContainer. The RenderTexture from this Container is associated with the Sprite which is automatically rendered.

**Returns**  
*SpriteMesh | Sprite*  

Inherited from CachedContainer.sprite.

---

## Methods

### attachVision

```typescript
attachVision(vision: Container<DisplayObject>): CanvasVisionContainer
```

Initialize the vision mask with the line-of-sight (los) and the field-of-view (fov) graphics objects.

**Parameters**

- **vision**: *Container<DisplayObject>*  
  The vision container to attach.

**Returns**  
*CanvasVisionContainer*

---

### clear

```typescript
clear(destroy?: boolean): CachedContainer
```

Clear the cached container, removing its current contents.

**Parameters**

- **destroy**: *boolean* = `true` (Optional)  
  Tell children that we should destroy texture as well.

**Returns**  
*CachedContainer* - A reference to the cleared container for chaining.

Inherited from [CachedContainer.clear](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clear).

---

### createRenderTexture

```typescript
createRenderTexture(
  options?: { clearColor?: number[]; renderFunction?: Function },
): RenderTexture
```

Create a render texture, provide a render method and an optional clear color.

**Parameters**

- **options**: *object* = `{}` (Optional)
  - **clearColor**?: *number[]* (Optional)  
    An optional clear color to clear the RenderTexture before rendering into it.
  - **renderFunction**?: *Function* (Optional)  
    Render function that will be called to render into the RenderTexture.

**Returns**  
*RenderTexture* - A reference to the created render texture.

Inherited from [CachedContainer.createRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#createrendertexture).

---

### destroy

```typescript
destroy(options: any): void
```

**Parameters**

- **options**: *any*

**Returns**  
*void*

Inherited from [CachedContainer.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#destroy).

---

### detachVision

```typescript
detachVision(): CanvasVisionContainer
```

Detach the vision mask from the cached container.

**Returns**  
*CanvasVisionContainer* - The detached vision container.

---

### removeRenderTexture

```typescript
removeRenderTexture(renderTexture: RenderTexture, destroy?: boolean): void
```

Remove a previously created render texture.

**Parameters**

- **renderTexture**: *RenderTexture*  
  The render texture to remove.
- **destroy**: *boolean* = `true` (Optional)  
  Should the render texture be destroyed?

**Returns**  
*void*

Inherited from [CachedContainer.removeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#removerendertexture).

---

### render

```typescript
render(renderer: any): void
```

**Parameters**

- **renderer**: *any*

**Returns**  
*void*

Inherited from [CachedContainer.render](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#render).

---

### #bind (Protected)

```typescript
protected "#bind"(renderer: Renderer, tex: RenderTexture, clearColor?: number[]): void
```

Bind a render texture to this renderer. Must be called after `bindPrimaryBuffer` and before `bindInitialBuffer`.

**Parameters**

- **renderer**: *Renderer*  
  The active canvas renderer.
- **tex**: *RenderTexture*  
  The texture to bind.
- **clearColor**: *number[]* (Optional)  
  A custom clear color.

**Returns**  
*void*

Inherited from [CachedContainer.#bind](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#bind).

---

### #renderSecondary (Protected)

```typescript
protected "#renderSecondary"(renderer: Renderer): void
```

Custom rendering for secondary render textures.

**Parameters**

- **renderer**: *Renderer*  
  The active canvas renderer.

**Returns**  
*void*

Inherited from [CachedContainer.#renderSecondary](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#rendersecondary).

---

### resizeRenderTexture (Static)

```typescript
static resizeRenderTexture(renderer: Renderer, rt: RenderTexture): void
```

Resize a render texture passed as a parameter with the renderer.

**Parameters**

- **renderer**: *Renderer*  
  The active canvas renderer.
- **rt**: *RenderTexture*  
  The render texture to resize.

**Returns**  
*void*

Inherited from [CachedContainer.resizeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#resizerendertexture).