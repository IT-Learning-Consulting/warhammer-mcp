# InteractionLayer | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of `CanvasLayer` which provides support for user interaction with its contained objects.

---

## Hierarchy  
(View [Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.InteractionLayer), Expand)

- [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html) *<i>base class</i>*
- **InteractionLayer**
- [PlaceablesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html)  
- [ControlsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.ControlsLayer.html)

---

## Properties

### `eventMode`

`eventMode: string = "passive"`

Overrides `CanvasLayer.eventMode`

---

### `interactiveChildren`

`interactiveChildren: boolean = false`

Whether this event target has any children that need UI events. This can be used to optimize event propagation.

---

### `options`

`options: { name: string }`

Options for this layer instance.  
Inherited from [CanvasLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#options).

---

## Accessors

### `active`

```typescript
get active(): boolean
```
Is this layer currently active?  
**Returns:** `boolean`

---

### `hookName`

```typescript
get hookName(): string
```
The name used by hooks to construct their hook string.  
*Note:* You should override this getter if `hookName` should not return the class constructor name.  
Inherited from `CanvasLayer.hookName`  
**Returns:** `string`

---

### `name`

```typescript
get name(): string
```
The canonical name of the `CanvasLayer` is the name of the constructor that is the immediate child of the defined base class for the layer type.

**Example:**  
`canvas.lighting.name -> "LightingLayer"`

**Returns:** `string`

---

### `instance` (Static)

```typescript
static get instance(): CanvasLayer
```
Return a reference to the active instance of this canvas layer.  
Inherited from [CanvasLayer.instance](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#instance).  
**Returns:** `CanvasLayer`

---

### `layerOptions` (Static)

```typescript
static get layerOptions(): { name: string; zIndex: number }
```
Customize behaviors of this `CanvasLayer` by modifying some behaviors at a class level.  
Overrides `CanvasLayer.layerOptions`  
**Returns:**  
```typescript
{ 
  name: string; 
  zIndex: number; 
}
```

---

## Methods

### `_draw`

```typescript
_draw(options: any): Promise<void>
```
Overrides [CanvasLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_draw).

**Parameters:**

- **options**: `any`  
  Options for drawing.

**Returns:** `Promise<void>`

---

### `activate`

```typescript
activate(options?: { tool?: string }): InteractionLayer
```
Activate the `InteractionLayer`, deactivating other layers and marking this layer's children as interactive.

**Parameters (optional):**

- **options**: `{ tool?: string } = {}`  
  Options which configure layer activation.
- **tool**?: `string`  
  A specific tool in the control palette to set as active.

**Returns:** `InteractionLayer`  
The layer instance, now activated.

---

### `deactivate`

```typescript
deactivate(): InteractionLayer
```
Deactivate the `InteractionLayer`, removing interactivity from its children.

**Returns:** `InteractionLayer`  
The layer instance, now inactive.

---

### `draw`

```typescript
draw(options?: object): Promise<CanvasLayer>
```
Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

**Parameters (optional):**

- **options**: `object = {}`  
  Options which configure how the layer is drawn.

**Returns:** `Promise<CanvasLayer>`  
Inherited from [CanvasLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#draw).

---

### `getZIndex`

```typescript
getZIndex(): number
```
Get the `zIndex` that should be used for ordering this layer vertically relative to others in the same Container.

**Returns:** `number`

---

### `tearDown`

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```
Deconstruct data used in the current layer in preparation to re-draw the canvas.

**Parameters (optional):**

- **options**: `object = {}`  
  Options which configure how the layer is deconstructed.

**Returns:** `Promise<CanvasLayer>`  
Inherited from [CanvasLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#teardown).

---

## Protected Methods

### `_activate`

```typescript
_activate(): void
```
The inner `_activate` method which may be defined by each `InteractionLayer` subclass.

**Returns:** `void`

---

### `_canDragLeftStart`

```typescript
_canDragLeftStart(
  user: User,
  event: FederatedEvent<UIEvent | PixiTouch>
): boolean
```
Does the `User` have permission to left-click drag on the Canvas?

**Parameters:**

- **user**: `User`  
  The User performing the action.
- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The event object.

**Returns:** `boolean`

---

### `_deactivate`

```typescript
_deactivate(): void
```
The inner `_deactivate` method which may be defined by each `InteractionLayer` subclass.

**Returns:** `void`

---

### `_highlightObjects`

```typescript
_highlightObjects(active: boolean): void
```
Highlight the objects of this layer.

**Parameters:**

- **active**: `boolean`  
  Should the objects of this layer be highlighted?

**Returns:** `void`

---

### `_onClickLeft`

```typescript
_onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle left mouse-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onClickLeft2`

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle double left-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onClickRight`

```typescript
_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle right mouse-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onClickRight2`

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle double right mouse-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onCopyKey`

```typescript
_onCopyKey(event: KeyboardEvent): boolean
```
Handle a Copy keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The copy key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_onCutKey`

```typescript
_onCutKey(event: KeyboardEvent): boolean
```
Handle a Cut keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The cut key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_onCycleViewKey`

```typescript
_onCycleViewKey(event: KeyboardEvent): boolean
```
Handle a Cycle View keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The cycle-view key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_onDeleteKey`

```typescript
_onDeleteKey(event: KeyboardEvent): boolean
```
Handle a Delete keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The delete key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_onDismissKey`

```typescript
_onDismissKey(event: KeyboardEvent): boolean
```
Handle a Dismiss keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The dismiss key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_onDragLeftCancel`

```typescript
_onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Cancel a left-click drag workflow originating from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onDragLeftDrop`

```typescript
_onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Conclude a left-click drag workflow originating from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onDragLeftMove`

```typescript
_onDragLeftMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Continue a left-click drag workflow originating from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onDragLeftStart`

```typescript
_onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Start a left-click drag workflow originating from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI `InteractionEvent` which wraps a `PointerEvent`.

**Returns:** `void`

---

### `_onMouseWheel`

```typescript
_onMouseWheel(event: WheelEvent): void
```
Handle mouse-wheel events which occur for this active layer.

**Parameters:**

- **event**: `WheelEvent`  
  The `WheelEvent` initiated on the document.

**Returns:** `void`

---

### `_onPasteKey`

```typescript
_onPasteKey(event: KeyboardEvent): boolean
```
Handle a Paste keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The paste key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_onSelectAllKey`

```typescript
_onSelectAllKey(event: KeyboardEvent): boolean
```
Handle a Select All keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The select-all key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_onUndoKey`

```typescript
_onUndoKey(event: KeyboardEvent): boolean
```
Handle an Undo keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The undo key press event.

**Returns:** `boolean`  
Was the event handled?

---

### `_tearDown`

```typescript
_tearDown(options: object): Promise<void>
```
The inner `_tearDown` method which may be customized by each `CanvasLayer` subclass.

**Parameters:**

- **options**: `object`  
  Options which configure how the layer is deconstructed.

**Returns:** `Promise<void>`  
Inherited from [CanvasLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_teardown).

---

## Static Methods

### `prepareSceneControls`

```typescript
static prepareSceneControls(): any
```
Prepare data used by SceneControls to register tools used by this layer.

**Returns:** `any`

---

*For more information, see the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/index.html).*