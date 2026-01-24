# CanvasDarknessEffects | Foundry Virtual Tabletop - API Documentation - Version 13

A layer of background alteration effects which change the appearance of the primary group render texture.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.CanvasDarknessEffects)  
Expand

- *CanvasLayer*  
- **CanvasDarknessEffects**

---

## Properties

### interactiveChildren

`interactiveChildren: boolean = false`

Whether this event target has any children that need UI events. This can be used to optimize event propagation.  
Inherited from [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html).

### options

`options: { name: string } = ...`

Options for this layer instance.  
Inherited from [CanvasLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#options).

---

## Accessors

### hookName

```typescript
get hookName(): string
```

The name used by hooks to construct their hook string.  
**Note:** You should override this getter if `hookName` should not return the class constructor name.  
Returns: `string`  
Inherited from [CanvasLayer.hookName](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html).

### name

```typescript
get name(): string
```

The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.  
**Example:**  
`canvas.lighting.name -> "LightingLayer"`  
Returns: `string`  
Inherited from [CanvasLayer.name](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html).

---

## Methods

### instance

```typescript
static get instance(): CanvasLayer
```

Return a reference to the active instance of this canvas layer.  
Returns: [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)  
Inherited from [CanvasLayer.instance](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html).

### layerOptions

```typescript
static get layerOptions(): { name: string }
```

Customize behaviors of this CanvasLayer by modifying some behaviors at a class level.  
Returns:  
```typescript
{ name: string }
```
Inherited from [CanvasLayer.layerOptions](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html).

### _draw

```typescript
_draw(options: any): Promise<void>
```

Overrides [CanvasLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_draw)

**Parameters:**  
- **options**: `any`

**Returns:**  
`Promise<void>`

### clear

```typescript
clear(): void
```

Clear coloration effects container.

**Returns:** `void`

### draw

```typescript
draw(options?: object): Promise<CanvasLayer>
```

Draw the canvas layer, rendering its internal components and returning a Promise.  
The Promise resolves to the drawn layer once its contents are successfully rendered.

**Parameters:**  
- **options** (optional): `object` = {}

Options which configure how the layer is drawn.

**Returns:**  
`Promise<CanvasLayer>`

Inherited from [CanvasLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#draw).

### tearDown

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```

Deconstruct data used in the current layer in preparation to re-draw the canvas.

**Parameters:**  
- **options** (optional): `object` = {}

Options which configure how the layer is deconstructed.

**Returns:**  
`Promise<CanvasLayer>`

Inherited from [CanvasLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#teardown).

### _tearDown

```typescript
protected _tearDown(options: object): Promise<void>
```

The inner _tearDown method which may be customized by each CanvasLayer subclass.

**Parameters:**  
- **options**: `object`

Options which configure how the layer is deconstructed.

**Returns:**  
`Promise<void>`

Inherited from [CanvasLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_teardown).