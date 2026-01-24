# PlaceableObject | Foundry Virtual Tabletop - API Documentation - Version 13

An Abstract Base Class which defines a Placeable Object which represents a Document placed on the Canvas.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.PlaceableObject)  
- RenderFlagObject<this>  
- **PlaceableObject**  
- canvas.placeables.Drawing  
- canvas.placeables.Note  
- canvas.placeables.Region  
- canvas.placeables.Tile  
- canvas.placeables.Token  
- canvas.placeables.MeasuredTemplate  
- canvas.placeables.Wall  
- canvas.placeables.AmbientLight  
- canvas.placeables.AmbientSound  

---

## Constructors

### constructor

```typescript
new PlaceableObject(document: CanvasDocument): PlaceableObject
```

**Parameters**

- **document**: *CanvasDocument*  
  The Document instance represented by this object

**Returns**

- *PlaceableObject*  

Overrides RenderFlagsMixin(PIXI.Container).constructor

---

## Properties

### controlIcon

```typescript
controlIcon: null | ControlIcon
```

A control icon for interacting with the object

### document

```typescript
document: CanvasDocument
```

A reference to the Scene embedded Document instance which this object represents

### mouseInteractionManager

```typescript
mouseInteractionManager: MouseInteractionManager
```

A mouse interaction manager instance which handles mouse workflows related to this object.

### renderFlags

```typescript
renderFlags: RenderFlags
```

Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for "redraw" and "refresh".

Inherited from RenderFlagsMixin(PIXI.Container).renderFlags

### scene

```typescript
scene: documents.Scene
```

Retain a reference to the Scene within which this Placeable Object resides

### embeddedName (static)

```typescript
embeddedName: string
```

Identify the official Document name for this PlaceableObject class

### RENDER_FLAG_PRIORITY (static)

```typescript
RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled. Valid values are OBJECTS or PERCEPTION.

Inherited from RenderFlagsMixin(PIXI.Container).RENDER_FLAG_PRIORITY

### RENDER_FLAGS (static)

```typescript
RENDER_FLAGS: {
    redraw: { propagate: string[] };
    refresh: { alias: boolean; propagate: string[] };
    refreshState: {};
} = ...
```

The flags declared here are required for all PlaceableObject subclasses to also support.

Overrides RenderFlagsMixin(PIXI.Container).RENDER_FLAGS

---

## Accessors

### _original

```typescript
get _original(): undefined | PlaceableObject
```

The object that this object is a preview of if this object is a preview.

**Returns**: *undefined* | *PlaceableObject*

### bounds

```typescript
get bounds(): Rectangle
```

The bounding box for this PlaceableObject. This is required if the layer uses a Quadtree, otherwise it is optional

**Returns**: *Rectangle*

### center

```typescript
get center(): Point
```

The central coordinate pair of the placeable object based on its own width and height

**Returns**: *Point*

### controlled

```typescript
get controlled(): boolean
```

An indicator for whether the object is currently controlled

**Returns**: *boolean*

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```

Is the HUD display active for this Placeable?

**Returns**: *boolean*

### hasPreview

```typescript
get hasPreview(): boolean
```

Does there exist a temporary preview of this placeable object?

**Returns**: *boolean*

### hover

```typescript
get hover(): boolean
```

An indicator for whether the object is currently a hover target

**Returns**: *boolean*

### id

```typescript
get id(): string
```

The id of the corresponding Document which this PlaceableObject represents.

**Returns**: *string*

### interactionState

```typescript
get interactionState(): 
| undefined 
| {
    CLICKED: number;
    DRAG: number;
    DROP: number;
    GRABBED: number;
    HOVER: number;
    NONE: number;
  }
```

The mouse interaction state of this placeable.

**Returns**

- *undefined*  
- or object with interaction state numeric values

### isOwner

```typescript
get isOwner(): boolean
```

A convenient reference for whether the current User has full control over the document.

**Returns**: *boolean*

### isPreview

```typescript
get isPreview(): boolean
```

Is this placeable object a temporary preview?

**Returns**: *boolean*

### layer

```typescript
get layer(): PlaceablesLayer
```

Provide a reference to the CanvasLayer which contains this PlaceableObject.

**Returns**: *PlaceablesLayer*

### objectId

```typescript
get objectId(): string
```

A unique identifier which is used to uniquely identify elements on the canvas related to this object.

**Returns**: *string*

### sheet

```typescript
get sheet(): DocumentSheetV2
```

A document sheet used to configure the properties of this Placeable Object or the Document it represents.

**Returns**: *DocumentSheetV2*

### sourceId

```typescript
get sourceId(): string
```

The named identified for the source object associated with this PlaceableObject. This differs from the objectId because the sourceId is the same for preview objects as for the original.

**Returns**: *string*

### implementation (static)

```typescript
get implementation(): typeof PlaceableObject
```

Return a reference to the configured subclass of this base PlaceableObject type.

**Returns**: typeof *PlaceableObject*

---

## Methods

### activateListeners

```typescript
activateListeners(): void
```

Activate interactivity for the Placeable Object

**Returns**: *void*

---

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

Overrides RenderFlagsMixin(PIXI.Container).applyRenderFlags

**Returns**: *void*

---

### can

```typescript
can(
  user: documents.User,
  action:
    | "update"
    | "delete"
    | "create"
    | "view"
    | "control"
    | "configure"
    | "hover"
    | "drag"
    | "HUD",
): boolean
```

Test whether a user can perform a certain interaction regarding a Placeable Object

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Must be equal to  game.user .
- **action**: *string*  
  The named action being attempted (one of "update", "delete", "create", "view", "control", "configure", "hover", "drag", "HUD")

**Returns**: *boolean*  
Does the User have rights to perform the action?

---

### clear

```typescript
clear(): PlaceableObject
```

Clear the display of the existing object.

**Returns**: *PlaceableObject*  
The cleared object

---

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes. The returned object is non-interactive, and has no assigned ID. If you plan to use it permanently you should call the create method.

**Returns**: *PlaceableObject*  
A new object with identical data

---

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors

**Parameters**

- **options** (optional):  
  - **releaseOthers** (optional): *boolean*  
    Release any other controlled objects first

**Returns**: *boolean*  
A flag denoting whether control was successful

---

### destroy

```typescript
destroy(options: any): any
```

**Parameters**

- **options**: *any*

**Returns**: *any*

Inherit Doc

---

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

Draw the placeable object into its parent container

**Parameters**

- **options** (optional): *object*  
  Options which may modify the draw and refresh workflow

**Returns**: *Promise<PlaceableObject>*  
The drawn object

---

### getSnappedPosition

```typescript
getSnappedPosition(position?: any): Point
```

Get the snapped position for a given position or the current position.

**Parameters**

- **position** (optional): *any*  
  The position to be used instead of the current position

**Returns**: *Point*  
The snapped position

---

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

Refresh all incremental render flags for the PlaceableObject. This method is no longer used by the core software but provided for backwards compatibility.

**Parameters**

- **options** (optional): *object*  
  Options which may modify the refresh workflow

**Returns**: *PlaceableObject*  
The refreshed object

---

### release

```typescript
release(options?: object): boolean
```

Release control over a PlaceableObject, removing it from the controlled set

**Parameters**

- **options** (optional): *object*  
  Options which modify the releasing workflow

**Returns**: *boolean*  
A Boolean flag confirming the object was released.

---

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

Rotate the PlaceableObject to a certain angle of facing

**Parameters**

- **angle**: *number*  
  The desired angle of rotation
- **snap**: *number*  
  Snap the angle of rotation to a certain target degree increment

**Returns**: *Promise<PlaceableObject>*  
The rotated object

---

## Protected Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: Record<string, boolean>): void
```

Apply render flags before a render occurs.

**Parameters**

- **flags**: *Record<string, boolean>*  
  The render flags which must be applied

**Returns**: *void*

---

### _canConfigure

```typescript
_canConfigure(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to configure the Placeable Object?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canControl

```typescript
_canControl(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to control the Placeable Object?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canCreate

```typescript
_canCreate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to create the underlying Document?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canDelete

```typescript
_canDelete(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to delete the underlying Document?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canDrag

```typescript
_canDrag(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to drag this Placeable Object?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canDragLeftStart

```typescript
_canDragLeftStart(
  user: documents.User,
  event: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to left-click drag this Placeable Object?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event

**Returns**: *boolean*

---

### _canHover

```typescript
_canHover(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to hover on this Placeable Object?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canHUD

```typescript
_canHUD(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Can the User access the HUD for this Placeable Object?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canUpdate

```typescript
_canUpdate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to update the underlying Document?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _canView

```typescript
_canView(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to view details of the Placeable Object?

**Parameters**

- **user**: *documents.User*  
  The User performing the action. Always equal to  game.user .
- **event** (optional): *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**: *boolean*

---

### _createInteractionManager

```typescript
_createInteractionManager(): MouseInteractionManager
```

Create a standard MouseInteractionManager for the PlaceableObject

**Returns**: *MouseInteractionManager*

---

### _destroy

```typescript
_destroy(options?: object): void
```

The inner _destroy method which may optionally be defined by each PlaceableObject subclass.

**Parameters**

- **options** (optional): *object*  
  Options passed to the initial destroy call

**Returns**: *void*

---

### _draw (abstract)

```typescript
_draw(options: object): Promise<void>
```

The inner _draw method which must be defined by each PlaceableObject subclass.

**Parameters**

- **options**: *object*  
  Options which may modify the draw workflow

**Returns**: *Promise<void>*

---

### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the left-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event

**Returns**: *void*

---

### _finalizeDragRight

```typescript
_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the right-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event

**Returns**: *void*

---

### _getTargetAlpha

```typescript
_getTargetAlpha(): number
```

Get the target opacity that should be used for a Placeable Object depending on its preview state.

**Returns**: *number*

---

### _initializeDragLeft

```typescript
_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the left-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _initializeDragRight

```typescript
_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the right-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onClickLeft

```typescript
_onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-click event to assume control of the object

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double left-click event to activate

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onClickRight

```typescript
_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-click event to configure properties of the object

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double right-click event to configure properties of the object

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onControl

```typescript
_onControl(options: object): void
```

Additional events which trigger once control of the object is established

**Parameters**

- **options**: *object*  
  Optional parameters which apply for specific implementations

**Returns**: *void*

---

### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Register pending canvas operations which should occur after a new PlaceableObject of this type is created

**Parameters**

- **data**: *object*  
- **options**: *object*  
- **userId**: *string*

**Returns**: *void*

---

### _onDelete

```typescript
_onDelete(options: object, userId: string): void
```

Define additional steps taken when an existing placeable object of this type is deleted

**Parameters**

- **options**: *object*  
- **userId**: *string*

**Returns**: *void*

---

### _onDragEnd

```typescript
_onDragEnd(): void
```

Conclude a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

**Returns**: *void*

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event

**Returns**: *boolean* | *void*  
If false, the cancellation is prevented

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *undefined* | *false*

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur when a mouse-drag action is first begun.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *boolean* | *void*  
If false, the start if prevented

---

### _onDragRightCancel

```typescript
_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event

**Returns**: *boolean* | *void*  
If false, the cancellation is prevented

---

### _onDragRightDrop

```typescript
_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onDragRightMove

```typescript
_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onDragRightStart

```typescript
_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event

**Returns**: *false* | *void*  
If false, the start if prevented

---

### _onDragStart

```typescript
_onDragStart(): void
```

Begin a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

**Returns**: *void*

---

### _onHoverIn

```typescript
_onHoverIn(
  event: FederatedEvent<UIEvent | PixiTouch>,
  options?: { hoverOutOthers?: boolean },
): void
```

Actions that should be taken for this Placeable Object when a mouseover event occurs. Hover events on PlaceableObject instances allow event propagation by default.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event
- **options** (optional):  
  - **hoverOutOthers** (optional): *boolean*  
    Trigger hover-out behavior on sibling objects

**Returns**: *void*

---

### _onHoverOut

```typescript
_onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Actions that should be taken for this Placeable Object when a mouseout event occurs

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onLongPress

```typescript
_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any
```

Callback action which occurs on a long press.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event
- **origin**: *Point*  
  The local canvas coordinates of the mousepress.

**Returns**: *any*

---

### _onRelease

```typescript
_onRelease(options: object): void
```

Additional events which trigger once control of the object is released

**Parameters**

- **options**: *object*  
  Options which modify the releasing workflow

**Returns**: *void*

---

### _onUnclickLeft

```typescript
_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-unclick event to assume control of the object

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onUnclickRight

```typescript
_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-unclick event

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**: *void*

---

### _onUpdate

```typescript
_onUpdate(changed: object, options: object, userId: string): void
```

Define additional steps taken when an existing placeable object of this type is updated with new data

**Parameters**

- **changed**: *object*  
- **options**: *object*  
- **userId**: *string*

**Returns**: *void*

---

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: Rectangle): boolean
```

Is this PlaceableObject within the selection rectangle?

**Parameters**

- **rectangle**: *Rectangle*  
  The selection rectangle

**Returns**: *boolean*

---

### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(
  event: FederatedEvent<UIEvent | PixiTouch>,
): null | object[] | [updates: object[], options?: object]
```

Perform the database updates that should occur as the result of a drag-left-drop operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event

**Returns**:  
- *null*  
- or *object[]*  
- or tuple: **updates**: *object[]* and optional **options**: *object*  
  An array of database updates to perform for documents in this collection

---

### _propagateLeftClick

```typescript
_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate left click downstream?

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  

**Returns**: *boolean*

---

### _propagateRightClick

```typescript
_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate right click downstream?

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  

**Returns**: *boolean*

---

### #onDragRightStart (private)

```typescript
"#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event

**Returns**: *false* | *void*  
If false, the start if prevented

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)