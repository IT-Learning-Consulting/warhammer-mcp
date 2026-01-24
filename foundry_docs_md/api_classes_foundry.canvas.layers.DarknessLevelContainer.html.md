# DarknessLevelContainer | Foundry Virtual Tabletop - API Documentation - Version 13

Cached container used for dynamic darkness level. Display objects (of any type) added to this cached container will contribute to computing the darkness level of the masked area. Only the red channel is utilized, which corresponds to the desired darkness level. Other channels are ignored.

## Hierarchy

- [CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html)
- **DarknessLevelContainer**

---

## Properties

### clearColor

`clearColor: number[] = ...`

An RGBA array used to define the clear color of the RenderTexture.

*Inherited from [CachedContainer.clearColor](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clearcolor)*

---

### displayed

`displayed: boolean = false`

Should our Container also be displayed on screen, in addition to being drawn to the cached RenderTexture?

*Inherited from [CachedContainer.displayed](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#displayed)*

---

### renderDirty

`renderDirty: boolean = true`

Does the Container need to be rendered? Set to false after the Container is rendered.

*Inherited from [CachedContainer.renderDirty](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#renderdirty)*

---

### _renderPaths  *(Protected)*

```typescript
_renderPaths: Map<
    RenderTexture,
    { clearColor: number[]; renderFunction: Function },
> = ...
```

A map of render textures, linked to their render function and an optional RGBA clear color.

*Inherited from [CachedContainer._renderPaths](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#_renderpaths)*

---

## Accessors

### Static: textureConfiguration

```typescript
textureConfiguration: {
    format: FORMATS;
    mipmap: MIPMAP_MODES;
    multisample: MSAA_QUALITY;
    scaleMode: SCALE_MODES;
} = ...
```

Overrides [CachedContainer.textureConfiguration](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#textureconfiguration)

---

### alphaMode

```typescript
set alphaMode(mode: ALPHA_MODES): void
```

Set the alpha mode of the cached container render texture.

**Parameters**

- **mode**: `ALPHA_MODES`

**Returns** `void`

*Inherited from CachedContainer.alphaMode*

---

### renderTexture

```typescript
get renderTexture(): RenderTexture
```

The primary render texture bound to this cached container.

**Returns** `RenderTexture`

*Inherited from CachedContainer.renderTexture*

---

### sprite

```typescript
get sprite(): SpriteMesh | Sprite
```

A PIXI.Sprite or SpriteMesh which is bound to this CachedContainer. The RenderTexture from this Container is associated with the Sprite which is automatically rendered.

**Returns** `SpriteMesh | Sprite`

*Inherited from CachedContainer.sprite*

---

## Methods

### clear

```typescript
clear(destroy?: boolean): CachedContainer
```

Clear the cached container, removing its current contents.

**Parameters**

- Optional  
- **destroy**: `boolean = true`  
  Tell children that we should destroy texture as well.

**Returns** `CachedContainer`  
A reference to the cleared container for chaining.

*Inherited from [CachedContainer.clear](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#clear)*

---

### createRenderTexture

```typescript
createRenderTexture(
    options?: { clearColor?: number[]; renderFunction?: Function },
): RenderTexture
```

Create a render texture, provide a render method and an optional clear color.

**Parameters**

- Optional  
- **options**:  
  - Optional  
    - **clearColor**?: `number[]`  
      An optional clear color to clear the RT before rendering into it.  
  - Optional  
    - **renderFunction**?: `Function`  
      Render function that will be called to render into the RT.

**Returns** `RenderTexture`  
A reference to the created render texture.

*Inherited from [CachedContainer.createRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#createrendertexture)*

---

### destroy

```typescript
destroy(options: any): void
```

**Parameters**

- **options**: `any`

**Returns** `void`

*Inherited from [CachedContainer.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#destroy)*

---

### removeRenderTexture

```typescript
removeRenderTexture(renderTexture: RenderTexture, destroy?: boolean): void
```

Remove a previously created render texture.

**Parameters**

- **renderTexture**: `RenderTexture`  
  The render texture to remove.
- Optional  
- **destroy**: `boolean = true`  
  Should the render texture be destroyed?

**Returns** `void`

*Inherited from [CachedContainer.removeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#removerendertexture)*

---

### render

```typescript
render(renderer: any): void
```

**Parameters**

- **renderer**: `any`

**Returns** `void`

*Inherited from [CachedContainer.render](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#render)*

---

### #bind *(Protected)*

```typescript
#bind(renderer: Renderer, tex: RenderTexture, clearColor?: number[]): void
```

Bind a render texture to this renderer. Must be called after bindPrimaryBuffer and before bindInitialBuffer.

**Parameters**

- **renderer**: `Renderer`  
  The active canvas renderer.
- **tex**: `RenderTexture`  
  The texture to bind.
- Optional  
- **clearColor**: `number[]`  
  A custom clear color.

**Returns** `void`

*Inherited from [CachedContainer.#bind](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#bind)*

---

### #renderSecondary *(Protected)*

```typescript
#renderSecondary(renderer: Renderer): void
```

Custom rendering for secondary render textures

**Parameters**

- **renderer**: `Renderer`  
  The active canvas renderer.

**Returns** `void`

*Inherited from [CachedContainer.#renderSecondary](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#rendersecondary)*

---

### Static: resizeRenderTexture

```typescript
resizeRenderTexture(renderer: Renderer, rt: RenderTexture): void
```

Resize a render texture passed as a parameter with the renderer.

**Parameters**

- **renderer**: `Renderer`  
  The active canvas renderer.
- **rt**: `RenderTexture`  
  The render texture to resize.

**Returns** `void`

*Inherited from [CachedContainer.resizeRenderTexture](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html#resizerendertexture)*

---

For complete documentation, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.layers.DarknessLevelContainer.html).