# CanvasIlluminationEffects | Foundry Virtual Tabletop - API Documentation - Version 13

A `CanvasLayer` for displaying illumination visual effects.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.CanvasIlluminationEffects), Expand

- *CanvasLayer* [(source)](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)  
- **CanvasIlluminationEffects**

---

## Properties

### `baselineMesh`

- Type: [`SpriteMesh`](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html)  
- Description: The base line mesh.

---

### `darknessLevelMeshes`

- Type: [`CachedContainer`](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html)  
- Description: The cached container holding the illumination meshes.

---

### `filter`

- Type: `VisualEffectsMaskingFilter`  
- Description: The filter used to mask visual effects on this layer.

---

### `interactiveChildren`

- Type: `boolean` = `false`  
- Description: Whether this event target has any children that need UI events. This can be used to optimize event propagation.  

Inherited from [CanvasLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#interactivechildren).

---

### `lights`

- Type: `Container<DisplayObject>`  
- Description: The container holding the lights.

---

## Accessors

### `options`

- Type: `{ name: string }`  
- Description: Options for this layer instance.

Inherited from [CanvasLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#options).

---

### `hasDynamicDarknessLevel`

```typescript
get hasDynamicDarknessLevel(): boolean
```

- Description: To know if dynamic darkness level is active on this scene.
- Returns: `boolean`

---

### `hookName`

```typescript
get hookName(): string
```

- Description: The name used by hooks to construct their hook string.  
  Note: You should override this getter if `hookName` should not return the class constructor name.
- Returns: `string`  

Inherited from `CanvasLayer.hookName`.

---

### `name`

```typescript
get name(): string
```

- Description:  
  The canonical name of the `CanvasLayer` is the name of the constructor that is the immediate child of the defined baseClass for the layer type.
- Returns: `string`  
- Example:  
  ```typescript
  canvas.lighting.name  // "LightingLayer"
  ```

---

### `renderTexture`

```typescript
get renderTexture(): RenderTexture
```

- Description: The illumination render texture.  
- Returns: `RenderTexture`

---

### `instance` (static)

```typescript
static get instance(): CanvasLayer
```

- Description: Return a reference to the active instance of this canvas layer.  
- Returns: [`CanvasLayer`](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)

Inherited from `CanvasLayer.instance`.

---

### `layerOptions` (static)

```typescript
static get layerOptions(): { name: string }
```

- Description: Customize behaviors of this `CanvasLayer` by modifying some behaviors at a class level.  
- Returns: `{ name: string }`

Inherited from `CanvasLayer.layerOptions`.

---

## Methods

### `_draw`

```typescript
_draw(options: any): Promise<void>
```

- Parameters:  
  - **options**: `any`
- Returns: `Promise<void>`  
- Description: Overrides [`CanvasLayer._draw`](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_draw)

---

### `_tearDown`

```typescript
_tearDown(options: any): Promise<void>
```

- Parameters:  
  - **options**: `any`
- Returns: `Promise<void>`  
- Description: Overrides [`CanvasLayer._tearDown`](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_teardown)

---

### `clear`

```typescript
clear(): void
```

- Description: Clear illumination effects container.  
- Returns: `void`

---

### `draw`

```typescript
draw(options?: object): Promise<CanvasLayer>
```

- Parameters (Optional):  
  - **options**: `object` = `{}`  
    Options which configure how the layer is drawn.
- Returns: `Promise<CanvasLayer>`  
- Description: Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

Inherited from [CanvasLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#draw).

---

### `invalidateDarknessLevelContainer`

```typescript
invalidateDarknessLevelContainer(force?: boolean): void
```

- Parameters (Optional):  
  - **force**: `boolean` = `false`  
    Force cached container invalidation?
- Returns: `void`  
- Description: Invalidate the cached container state to trigger a render pass.

---

### `tearDown`

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```

- Parameters (Optional):  
  - **options**: `object` = `{}`  
    Options which configure how the layer is deconstructed.
- Returns: `Promise<CanvasLayer>`  
- Description: Deconstruct data used in the current layer in preparation to re-draw the canvas.

Inherited from [CanvasLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#teardown).

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasIlluminationEffects.html).