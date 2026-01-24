# CanvasBackgroundAlterationEffects

A layer of background alteration effects which change the appearance of the primary group render texture.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas /](https://foundryvtt.com/api/modules/foundry.canvas.html) [layers](https://foundryvtt.com/api/modules/foundry.canvas.layers.html) /  
[CanvasBackgroundAlterationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasBackgroundAlterationEffects.html)

## Hierarchy  
(View Summary, Expand)  
- _CanvasLayer_  
- **CanvasBackgroundAlterationEffects**

---

## Properties

### interactiveChildren
**Type:** `boolean`  
**Default:** `false`  

Whether this event target has any children that need UI events. This can be used to optimize event propagation.  
Inherited from [CanvasLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#interactivechildren).

### lighting
**Type:** `Container<DisplayObject>`  

A collection of effects which provide other background alterations.

### options
**Type:** `{ name: string }`  
**Default:** `...` (inherited options)

Options for this layer instance.  
Inherited from [CanvasLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#options).

### vision
**Type:** `Container<DisplayObject>`  

A collection of effects which provide background vision alterations.

### visionPreferred
**Type:** `Container<DisplayObject>`  

A collection of effects which provide background preferred vision alterations.

---

## Accessors

### get hookName(): string

The name used by hooks to construct their hook string.  
Note: You should override this getter if `hookName` should not return the class constructor name.  

**Returns:** `string`  
Inherited from CanvasLayer.hookName

### get name(): string

The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.

**Returns:** `string`

**Example:**  
```ts
canvas.lighting.name -> "LightingLayer"
```
Inherited from CanvasLayer.name

### static get instance(): CanvasLayer

Return a reference to the active instance of this canvas layer.

**Returns:** `CanvasLayer`  
Inherited from CanvasLayer.instance

### static get layerOptions(): { name: string }

Customize behaviors of this CanvasLayer by modifying some behaviors at a class level.

**Returns:**  
```ts
{ name: string }
```
Inherited from CanvasLayer.layerOptions

---

## Methods

### _draw(options: any): Promise<void>

Overrides [CanvasLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_draw).

**Parameters:**  
- **options**: `any`

**Returns:**  
`Promise<void>`

### _tearDown(options: any): Promise<void>

Overrides [CanvasLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_teardown).

**Parameters:**  
- **options**: `any`

**Returns:**  
`Promise<void>`

### clear(): void

Clear background alteration effects vision and lighting containers.

**Returns:** `void`

### draw(options?: object): Promise<CanvasLayer>

Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

**Parameters (optional):**  
- **options**: `object = {}`  
  Options which configure how the layer is drawn.

**Returns:**  
`Promise<CanvasLayer>`  
Inherited from [CanvasLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#draw)

### tearDown(options?: object): Promise<CanvasLayer>

Deconstruct data used in the current layer in preparation to re-draw the canvas.

**Parameters (optional):**  
- **options**: `object = {}`  
  Options which configure how the layer is deconstructed.

**Returns:**  
`Promise<CanvasLayer>`  
Inherited from [CanvasLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#teardown)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)