# ControlsLayer

A `CanvasLayer` for displaying UI controls which are overlayed on top of other layers.

We track three types of events:

1. Cursor movement  
2. Ruler measurement  
3. Map pings

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.ControlsLayer)):

- *InteractionLayer*  
- **ControlsLayer**

---

## Properties

### cursors
**Type:** [`UnboundContainer`](https://foundryvtt.com/api/classes/foundry.canvas.containers.UnboundContainer.html)  
A container of cursor interaction elements not bound to stage transforms. Contains cursors elements.

### debug
**Type:** `Graphics`  
A graphics instance used for drawing debugging visualization.

### doors
**Type:** `Container<DisplayObject>`  
A container of DoorControl instances.

### eventMode
**Type:** `string` = `"passive"`  
Inherited from [InteractionLayer.eventMode](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#eventmode).

### options
**Type:** `{ name: string }`  
Options for this layer instance.  
Inherited from [InteractionLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#options).

### pings
**Type:** `Container<DisplayObject>`  
A container of pings interaction elements. Contains pings elements.

### select
**Type:** `Graphics`  
The Canvas selection rectangle.

---

## Accessors

### active
```typescript
get active(): boolean
```
Is this layer currently active?  
Returns: `boolean`  
Inherited from InteractionLayer.active

### hookName
```typescript
get hookName(): string
```
The name used by hooks to construct their hook string. Note: You should override this getter if `hookName` should not return the class constructor name.  
Returns: `string`  
Inherited from InteractionLayer.hookName  
[More info](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#hookname)

### name
```typescript
get name(): string
```
The canonical name of the `CanvasLayer` is the name of the constructor that is the immediate child of the defined baseClass for the layer type.  
Returns: `string`  
Example:  
`canvas.lighting.name -> "LightingLayer"`  
Inherited from InteractionLayer.name

### ruler
```typescript
get ruler(): BaseRuler
```
A convenience accessor to the Ruler for the active game user.  
Returns: [`BaseRuler`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html)

### instance (static)
```typescript
static get instance(): CanvasLayer
```
Return a reference to the active instance of this canvas layer.  
Returns: [`CanvasLayer`](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)  
Inherited from InteractionLayer.instance

---

## Methods

### layerOptions (static)
```typescript
static get layerOptions(): object
```
Overrides InteractionLayer.layerOptions  
Returns: `object`

### _deactivate
```typescript
_deactivate(): void
```
Overrides [InteractionLayer._deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_deactivate)  
Returns: `void`

### _draw
```typescript
_draw(options: any): Promise<void>
```
Overrides [InteractionLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_draw)  
**Parameters:**
- **options**: `any` — Options for drawing.  
Returns: `Promise<void>`

### _tearDown
```typescript
_tearDown(options: any): Promise<void>
```
Overrides [InteractionLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_teardown)  
**Parameters:**
- **options**: `any` — Options for teardown.  
Returns: `Promise<void>`

### activate
```typescript
activate(options?: { tool?: string }): InteractionLayer
```
Activate the InteractionLayer, deactivating other layers and marking this layer's children as interactive.  
**Parameters:**
- **options** (optional):  
  - **tool?** (optional): `string` — A specific tool in the control palette to set as active.  
Returns: `InteractionLayer` — The layer instance, now activated.  
Inherited from [InteractionLayer.activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#activate)

### deactivate
```typescript
deactivate(): InteractionLayer
```
Deactivate the InteractionLayer, removing interactivity from its children.  
Returns: `InteractionLayer` — The layer instance, now inactive.  
Inherited from [InteractionLayer.deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#deactivate)

### draw
```typescript
draw(options?: object): Promise<CanvasLayer>
```
Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.  
**Parameters:**
- **options** (optional): `object` — Options which configure how the layer is drawn.  
Returns: `Promise<CanvasLayer>`  
Inherited from [InteractionLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#draw)

### drawCursor
```typescript
drawCursor(user: documents.User): Cursor
```
Create and draw the Cursor object for a given User.  
**Parameters:**
- **user**: [`User`](https://foundryvtt.com/api/classes/foundry.documents.User.html) — The User document for whom to draw the cursor Container.  
Returns: [`Cursor`](https://foundryvtt.com/api/classes/foundry.canvas.containers.Cursor.html)

### drawCursors
```typescript
drawCursors(): void
```
Draw the cursors container.  
Returns: `void`

### drawDoors
```typescript
drawDoors(): void
```
Draw door control icons to the doors container.  
Returns: `void`

### drawOffscreenPing
```typescript
drawOffscreenPing(position: Point, options?: any): Promise<boolean>
```
Draw a ping at the edge of the viewport, pointing to the location of an off-screen ping.  
**Parameters:**
- **position**: [`Point`](https://foundryvtt.com/api/interfaces/foundry.types.Point.html) — The coordinates of the off-screen ping.  
- **options** (optional): `any` — Additional options to configure how the ping is drawn.  
Returns: `Promise<boolean>` — A promise which resolves once the Ping has been drawn and animated.  
See also: [ControlsLayer#drawPing](#drawping)

### drawPing
```typescript
drawPing(position: Point, options?: any): Promise<boolean>
```
Draw a ping on the canvas.  
**Parameters:**
- **position**: [`Point`](https://foundryvtt.com/api/interfaces/foundry.types.Point.html) — The position on the canvas that was pinged.  
- **options** (optional): `any` — Additional options to configure how the ping is drawn.  
Returns: `Promise<boolean>` — A promise which resolves once the Ping has been drawn and animated.  
See also: [`foundry.canvas.interaction.Ping#animate`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#animate)

### drawRuler
```typescript
drawRuler(user: documents.User): Promise<BaseRuler>
```
Create and draw the Ruler object for a given User.  
**Parameters:**
- **user**: [`User`](https://foundryvtt.com/api/classes/foundry.documents.User.html) — The User document for whom to draw the Ruler.  
Returns: `Promise<BaseRuler>` — The Ruler instance.

### drawRulers
```typescript
drawRulers(): Promise<void>
```
Create and add Ruler instances for every game User.  
Returns: `Promise<void>`

### drawSelect
```typescript
drawSelect(coords: Rectangle): void
```
Draw the select rectangle given an event originated within the base canvas layer.  
**Parameters:**
- **coords**: [`Rectangle`](https://foundryvtt.com/api/interfaces/foundry.types.Rectangle.html) — The rectangle.  
Returns: `void`

### getRulerForUser
```typescript
getRulerForUser(userId: string): null | BaseRuler
```
Get the Ruler instance for a specific User ID.  
**Parameters:**
- **userId**: `string` — The User ID.  
Returns: `null | BaseRuler`

### getZIndex
```typescript
getZIndex(): number
```
Get the zIndex that should be used for ordering this layer vertically relative to others in the same Container.  
Returns: `number`  
Inherited from [InteractionLayer.getZIndex](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#getzindex)

### handlePing
```typescript
handlePing(
  user: documents.User,
  position: Point,
  data?: PingData,
): Promise<boolean>
```
Handle a broadcast ping.  
**Parameters:**
- **user**: [`User`](https://foundryvtt.com/api/classes/foundry.documents.User.html) — The user who pinged.  
- **position**: [`Point`](https://foundryvtt.com/api/interfaces/foundry.types.Point.html) — The position on the canvas that was pinged.  
- **data** (optional): [`PingData`](https://foundryvtt.com/api/interfaces/foundry.canvas.interaction.types.PingData.html) — The broadcast ping data.  
Returns: `Promise<boolean>` — A promise which resolves once the Ping has been drawn and animated.  
See also: [ControlsLayer#drawPing](#drawping)

### tearDown
```typescript
tearDown(options?: object): Promise<CanvasLayer>
```
Deconstruct data used in the current layer in preparation to re-draw the canvas.  
**Parameters:**
- **options** (optional): `object` — Options which configure how the layer is deconstructed.  
Returns: `Promise<CanvasLayer>`  
Inherited from [InteractionLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#teardown)

### updateCursor
```typescript
updateCursor(user: documents.User, position: Point): void
```
Update the cursor when the user moves to a new position.  
**Parameters:**
- **user**: [`User`](https://foundryvtt.com/api/classes/foundry.documents.User.html) — The User for whom to update the cursor.  
- **position**: [`Point`](https://foundryvtt.com/api/interfaces/foundry.types.Point.html) — The new cursor position.  
Returns: `void`

### updateRuler
```typescript
updateRuler(
  user: documents.User,
  data: null | { hidden: boolean; path: ElevatedPoint[] },
): Promise<void>
```
Update the Ruler for a User given the provided path.  
**Parameters:**
- **user**: [`User`](https://foundryvtt.com/api/classes/foundry.documents.User.html) — The User for whom to update the Ruler.  
- **data**: `null | { hidden: boolean; path: ElevatedPoint[] }` — The path and hidden state of the Ruler.  
Returns: `Promise<void>`

---

## Protected Methods

### _activate
```typescript
_protected _activate(): void
```
The inner _activate method which may be defined by each InteractionLayer subclass.  
Returns: `void`  
Inherited from [InteractionLayer._activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_activate)

### _canDragLeftStart
```typescript
_protected _canDragLeftStart(
  user: User,
  event: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```
Does the User have permission to left-click drag on the Canvas?  
**Parameters:**
- **user**: `User` — The User performing the action.  
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The event object.  
Returns: `boolean`  
Inherited from [InteractionLayer._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_candragleftstart)

### _highlightObjects
```typescript
_protected _highlightObjects(active: boolean): void
```
Highlight the objects of this layer.  
**Parameters:**
- **active**: `boolean` — Should the objects of this layer be highlighted?  
Returns: `void`  
Inherited from [InteractionLayer._highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_highlightobjects)

### _onCanvasPan
```typescript
_protected _onCanvasPan(): void
```
Handle the canvas panning to a new view.  
Returns: `void`  
Inherited from [InteractionLayer._onCanvasPan](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_oncanvaspan)

### _onClickLeft
```typescript
_protected _onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle left mouse-click events which originate from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickleft)

### _onClickLeft2
```typescript
_protected _onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle double left-click events which originate from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickleft2)

### _onClickRight
```typescript
_protected _onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle right mouse-click events which originate from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickright)

### _onClickRight2
```typescript
_protected _onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle double right mouse-click events which originate from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickright2)

### _onCopyKey
```typescript
_protected _onCopyKey(event: KeyboardEvent): boolean
```
Handle a Copy keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The copy key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onCopyKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_oncopykey)

### _onCutKey
```typescript
_protected _onCutKey(event: KeyboardEvent): boolean
```
Handle a Cut keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The cut key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onCutKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_oncutkey)

### _onCycleViewKey
```typescript
_protected _onCycleViewKey(event: KeyboardEvent): boolean
```
Handle a Cycle View keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The cycle-view key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onCycleViewKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_oncycleviewkey)

### _onDeleteKey
```typescript
_protected _onDeleteKey(event: KeyboardEvent): boolean
```
Handle a Delete keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The delete key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondeletekey)

### _onDismissKey
```typescript
_protected _onDismissKey(event: KeyboardEvent): boolean
```
Handle a Dismiss keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The dismiss key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onDismissKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondismisskey)

### _onDragLeftCancel
```typescript
_protected _onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Cancel a left-click drag workflow originating from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftcancel)

### _onDragLeftDrop
```typescript
_protected _onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Conclude a left-click drag workflow originating from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftdrop)

### _onDragLeftMove
```typescript
_protected _onDragLeftMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Continue a left-click drag workflow originating from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftmove)

### _onDragLeftStart
```typescript
_protected _onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Start a left-click drag workflow originating from the Canvas stage.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent.  
Returns: `void`  
Inherited from [InteractionLayer._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftstart)

### _onLongPress
```typescript
_protected _onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): undefined | Promise<boolean>
```
Handle pinging the canvas.  
**Parameters:**
- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The triggering canvas interaction event.  
- **origin**: `Point` — The local canvas coordinates of the mousepress.  
Returns: `undefined | Promise<boolean>`

### _onMouseWheel
```typescript
_protected _onMouseWheel(event: WheelEvent): void
```
Handle mouse-wheel events which occur for this active layer.  
**Parameters:**
- **event**: `WheelEvent` — The WheelEvent initiated on the document.  
Returns: `void`  
Inherited from [InteractionLayer._onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onmousewheel)

### _onPasteKey
```typescript
_protected _onPasteKey(event: KeyboardEvent): boolean
```
Handle a Paste keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The paste key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onPasteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onpastekey)

### _onSelectAllKey
```typescript
_protected _onSelectAllKey(event: KeyboardEvent): boolean
```
Handle a Select All keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The select-all key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onSelectAllKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onselectallkey)

### _onUndoKey
```typescript
_protected _onUndoKey(event: KeyboardEvent): boolean
```
Handle an Undo keypress while this layer is active.  
**Parameters:**
- **event**: `KeyboardEvent` — The undo key press event.  
Returns: `boolean` — Was the event handled?  
Inherited from [InteractionLayer._onUndoKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onundokey)

---

## Static Methods

### prepareSceneControls
```typescript
static prepareSceneControls(): any
```
Prepare data used by SceneControls to register tools used by this layer.  
Returns: `any`  
Inherited from [InteractionLayer.prepareSceneControls](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#preparescenecontrols)