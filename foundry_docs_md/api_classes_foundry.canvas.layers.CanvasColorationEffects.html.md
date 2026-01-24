# CanvasColorationEffects | Foundry Virtual Tabletop - API Documentation - Version 13

A CanvasLayer for displaying coloration visual effects

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.CanvasColorationEffects)  

- *CanvasLayer*  
- **CanvasColorationEffects**

## Properties

### filter  
**Type:** `VisualEffectsMaskingFilter`  

The filter used to mask visual effects on this layer.

### interactiveChildren  
**Type:** `boolean` = `false`  

Whether this event target has any children that need UI events. This can be used to optimize event propagation.  
Inherited from [CanvasLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#interactivechildren).

### options  
**Type:** `{ name: string }` = ...  

Options for this layer instance.  
Inherited from [CanvasLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#options).

## Accessors

### hookName  
```typescript
get hookName(): string
```
The name used by hooks to construct their hook string.  
**Note:** You should override this getter if hookName should not return the class constructor name.  
Returns: `string`  
Inherited from CanvasLayer.hookName.

### name  
```typescript
get name(): string
```
The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.  

**Example:**  
`canvas.lighting.name -> "LightingLayer"`  
Inherited from CanvasLayer.name.

### instance  
```typescript
static get instance(): CanvasLayer
```
Return a reference to the active instance of this canvas layer.  
Returns: [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)  
Inherited from CanvasLayer.instance.

### layerOptions  
```typescript
static get layerOptions(): { name: string }
```
Customize behaviors of this CanvasLayer by modifying some behaviors at a class level.  
Returns: `{ name: string }`  
Inherited from CanvasLayer.layerOptions.

## Methods

### _draw  
```typescript
_draw(options: any): Promise<void>
```
Overrides [CanvasLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_draw).

**Parameters:**  
- **options**: `any`  

**Returns:**  
Promise that resolves to void.

### _tearDown  
```typescript
_tearDown(options: any): Promise<void>
```
Overrides [CanvasLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_teardown).

**Parameters:**  
- **options**: `any`  

**Returns:**  
Promise that resolves to void.

### clear  
```typescript
clear(): void
```
Clear coloration effects container.  

**Returns:** void.

### draw  
```typescript
draw(options?: object): Promise<CanvasLayer>
```
Draw the canvas layer, rendering its internal components and returning a Promise.  
The Promise resolves to the drawn layer once its contents are successfully rendered.

**Parameters:**  
- **options?**: `object` = `{}`  
  Options which configure how the layer is drawn.

**Returns:**  
Promise that resolves to [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html).  
Inherited from [CanvasLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#draw).

### tearDown  
```typescript
tearDown(options?: object): Promise<CanvasLayer>
```
Deconstruct data used in the current layer in preparation to re-draw the canvas.

**Parameters:**  
- **options?**: `object` = `{}`  
  Options which configure how the layer is deconstructed.

**Returns:**  
Promise that resolves to [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html).  
Inherited from [CanvasLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#teardown).