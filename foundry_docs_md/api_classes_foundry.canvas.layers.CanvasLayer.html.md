# CanvasLayer | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract pattern for primary layers of the game canvas to implement.

## Hierarchy  
- Container  
- **CanvasLayer**  
- [InteractionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html)  
- [CanvasBackgroundAlterationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasBackgroundAlterationEffects.html)  
- [CanvasColorationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasColorationEffects.html)  
- [CanvasDarknessEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasDarknessEffects.html)  
- [CanvasIlluminationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasIlluminationEffects.html)  
- [GridLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.GridLayer.html)

---

## Properties

### interactiveChildren  
**interactiveChildren**: *boolean* = false  
Whether this event target has any children that need UI events. This can be used to optimize event propagation.  
Overrides `PIXI.Container.interactiveChildren`.

### options  
**options**: { name: *string* } = ...  
Options for this layer instance.

---

## Accessors

### hookName  
```typescript
get hookName(): string
```  
The name used by hooks to construct their hook string.  
**Note:** You should override this getter if `hookName` should not return the class constructor name.  
**Returns:** *string*

### name  
```typescript
get name(): string
```  
The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.  
Overrides `PIXI.Container.name`.  
**Example:**  
`canvas.lighting.name -> "LightingLayer"`  
**Returns:** *string*

---

## Methods

### Static instance  
```typescript
get instance(): CanvasLayer
```  
Return a reference to the active instance of this canvas layer.  
**Returns:** [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)

### Static layerOptions  
```typescript
get layerOptions(): { name: string }
```  
Customize behaviors of this CanvasLayer by modifying some behaviors at a class level.  
**Returns:** { **name**: *string* }

### draw  
```typescript
draw(options?: object): Promise<CanvasLayer>
```  
Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

- **Parameters:**  
  - **options?**: *object* = {}  
    Options which configure how the layer is drawn.

- **Returns:** Promise<[CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)>

### tearDown  
```typescript
tearDown(options?: object): Promise<CanvasLayer>
```  
Deconstruct data used in the current layer in preparation to re-draw the canvas.

- **Parameters:**  
  - **options?**: *object* = {}  
    Options which configure how the layer is deconstructed.

- **Returns:** Promise<[CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)>

---

## Protected Methods

### Abstract _draw  
```typescript
protected _draw(options: object): Promise<void>
```  
The inner _draw method which must be defined by each CanvasLayer subclass.

- **Parameters:**  
  - **options**: *object*  
    Options which configure how the layer is drawn.

- **Returns:** Promise<void>

### _tearDown  
```typescript
protected _tearDown(options: object): Promise<void>
```  
The inner _tearDown method which may be customized by each CanvasLayer subclass.

- **Parameters:**  
  - **options**: *object*  
    Options which configure how the layer is deconstructed.

- **Returns:** Promise<void>

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)