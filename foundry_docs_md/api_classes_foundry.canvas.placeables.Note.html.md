# Class Note

A **Note** is an implementation of [`PlaceableObject`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) which represents an annotated location within the Scene. Each Note links to a JournalEntry document and represents its location on the map.

**See:**

- [`foundry.documents.NoteDocument`](https://foundryvtt.com/api/classes/foundry.documents.NoteDocument.html)
- [`foundry.canvas.layers.NotesLayer`](https://foundryvtt.com/api/classes/foundry.canvas.layers.NotesLayer.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.Note)):

- _PlaceableObject_
- **Note**

---

## Constructors

### constructor

```typescript
new Note(document: CanvasDocument): canvas.placeables.Note
```

**Parameters:**

- **document**: `CanvasDocument`  
  The Document instance represented by this object.

**Returns:**  
`canvas.placeables.Note`

_Inherited from [`PlaceableObject.constructor`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#constructor)_

---

## Properties

### controlIcon

`controlIcon: ControlIcon`

The control icon.

Overrides [`PlaceableObject.controlIcon`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon).

---

### document

`document: CanvasDocument`

A reference to the Scene embedded Document instance which this object represents.

Inherited from [`PlaceableObject.document`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document).

---

### mouseInteractionManager

`mouseInteractionManager: MouseInteractionManager`

A mouse interaction manager instance which handles mouse workflows related to this object.

Inherited from [`PlaceableObject.mouseInteractionManager`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager).

---

### renderFlags

`renderFlags: RenderFlags`

Status flags which are applied at render-time to update the PlaceableObject.  
If an object defines RenderFlags, it should at least include flags for "redraw" and "refresh".

Inherited from [`PlaceableObject.renderFlags`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags).

---

### scene

`scene: documents.Scene`

Retain a reference to the Scene within which this Placeable Object resides.

Inherited from [`PlaceableObject.scene`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene).

---

### tooltip

`tooltip: PreciseText`

The tooltip.

---

### Static Properties

#### embeddedName

```typescript
static embeddedName: string = "Note"
```

Identify the official Document name for this PlaceableObject class.

Overrides [`PlaceableObject.embeddedName`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname).

---

#### RENDER_FLAG_PRIORITY

```typescript
static RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled.  
Valid values are `OBJECTS` or `PERCEPTION`.

Inherited from [`PlaceableObject.RENDER_FLAG_PRIORITY`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority).

---

#### RENDER_FLAGS

```typescript
static RENDER_FLAGS: {
  redraw: { propagate: string[] };
  refresh: { alias: boolean; propagate: string[] };
  refreshElevation: { propagate: string[] };
  refreshPosition: {};
  refreshState: { propagate: string[] };
  refreshText: {
    alias: boolean;
    deprecated: { since: number; until: number };
    propagate: string[];
  };
  refreshTooltip: {};
  refreshVisibility: {};
} = ...
```

_Render flag definitions:_

- **redraw**: `{ propagate: string[] }`
- **refresh**: `{ alias: boolean; propagate: string[] }`
- **refreshElevation**: `{ propagate: string[] }`
- **refreshPosition**: `{}`
- **refreshState**: `{ propagate: string[] }`
- **refreshText**:  
  - `alias: boolean`  
  - `deprecated: { since: number; until: number }` _(Deprecated since v12)_  
  - `propagate: string[]`
- **refreshTooltip**: `{}`
- **refreshVisibility**: `{}`

Overrides [`PlaceableObject.RENDER_FLAGS`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags).

---

## Accessors

### _original

```typescript
get _original(): undefined | PlaceableObject
```

The object that this object is a preview of if this object is a preview.

_Returns:_ `undefined | PlaceableObject`

Inherited from PlaceableObject._original

---

### bounds

```typescript
get bounds(): Rectangle
```

_Returns:_ `Rectangle`

Overrides PlaceableObject.bounds

---

### center

```typescript
get center(): Point
```

The central coordinate pair of the placeable object based on its own width and height.

_Returns:_ `Point`

Inherited from PlaceableObject.center

---

### controlled

```typescript
get controlled(): boolean
```

An indicator for whether the object is currently controlled.

_Returns:_ `boolean`

Inherited from PlaceableObject.controlled

---

### entry

```typescript
get entry(): JournalEntry
```

The associated JournalEntry which is referenced by this Note.

_Returns:_ `JournalEntry`

---

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```

Is the HUD display active for this Placeable?

_Returns:_ `boolean`

Inherited from PlaceableObject.hasActiveHUD

---

### hasPreview

```typescript
get hasPreview(): boolean
```

Does there exist a temporary preview of this placeable object?

_Returns:_ `boolean`

Inherited from PlaceableObject.hasPreview

---

### hover

```typescript
get hover(): boolean
```

An indicator for whether the object is currently a hover target.

_Returns:_ `boolean`

Inherited from PlaceableObject.hover

---

### id

```typescript
get id(): string
```

The id of the corresponding Document which this PlaceableObject represents.

_Returns:_ `string`

Inherited from PlaceableObject.id

---

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

_Returns:_  
`undefined` or an object with the above numeric states.

Inherited from PlaceableObject.interactionState

---

### isOwner

```typescript
get isOwner(): boolean
```

A convenient reference for whether the current User has full control over the document.

_Returns:_ `boolean`

Inherited from PlaceableObject.isOwner

---

### isPreview

```typescript
get isPreview(): boolean
```

Is this placeable object a temporary preview?

_Returns:_ `boolean`

Inherited from PlaceableObject.isPreview

---

### isVisible

```typescript
get isVisible(): boolean
```

Determine whether the Note is visible to the current user based on their perspective of the Scene.

Visibility depends on permission to the underlying journal entry, as well as the perspective of controlled Tokens.  
If Token Vision is required, the user must have a token with vision over the note to see it.

_Returns:_ `boolean`

---

### layer

```typescript
get layer(): PlaceablesLayer
```

Provide a reference to the CanvasLayer which contains this PlaceableObject.

_Returns:_ `PlaceablesLayer`

Inherited from PlaceableObject.layer

---

### objectId

```typescript
get objectId(): string
```

A unique identifier which is used to uniquely identify elements on the canvas related to this object.

_Returns:_ `string`

Inherited from PlaceableObject.objectId

---

### page

```typescript
get page(): any
```

The specific JournalEntryPage within the associated JournalEntry referenced by this Note.

_Returns:_ `any`

---

### sheet

```typescript
get sheet(): DocumentSheetV2
```

A document sheet used to configure the properties of this Placeable Object or the Document it represents.

_Returns:_ `DocumentSheetV2`

---

### sourceId

```typescript
get sourceId(): string
```

The named identifier for the source object associated with this PlaceableObject.  
This differs from the `objectId` because the `sourceId` is the same for preview objects as for the original.

_Returns:_ `string`

Inherited from PlaceableObject.sourceId

---

### implementation

```typescript
static get implementation(): typeof PlaceableObject
```

Return a reference to the configured subclass of this base PlaceableObject type.

_Returns:_ `typeof PlaceableObject`

Inherited from PlaceableObject.implementation

---

## Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

Overrides [`PlaceableObject._applyRenderFlags`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyrenderflags).

**Parameters:**

- **flags**: `any`

**Returns:** `void`

---

### _canConfigure

```typescript
_canConfigure(user: any): any
```

Overrides [`PlaceableObject._canConfigure`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canconfigure).

**Parameters:**

- **user**: `any`

**Returns:** `any`

---

### _canHover

```typescript
_canHover(user: any): boolean
```

Overrides [`PlaceableObject._canHover`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhover).

**Parameters:**

- **user**: `any`

**Returns:** `boolean`

---

### _canView

```typescript
_canView(user: any): any
```

Overrides [`PlaceableObject._canView`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canview).

**Parameters:**

- **user**: `any`

**Returns:** `any`

---

### _draw

```typescript
_draw(options: any): Promise<void>
```

Overrides [`PlaceableObject._draw`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_draw).

**Parameters:**

- **options**: `any`

**Returns:** `Promise<void>`

---

### _onClickLeft2

```typescript
_onClickLeft2(event: any): undefined | Promise<ImagePopout>
```

Callback actions which occur on a double left-click event to activate.

**Parameters:**

- **event**: `any`  
  The triggering canvas interaction event.

**Returns:** `undefined | Promise<ImagePopout>`

Overrides [`PlaceableObject._onClickLeft2`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft2).

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Define additional steps taken when an existing placeable object of this type is updated with new data.

**Parameters:**

- **changed**: `any`
- **options**: `any`
- **userId**: `any`

**Returns:** `void`

Overrides [`PlaceableObject._onUpdate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onupdate).

---

### activateListeners

```typescript
activateListeners(): void
```

Activate interactivity for the Placeable Object.

**Returns:** `void`

Inherited from [`PlaceableObject.activateListeners`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activatelisteners).

---

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

**Returns:** `void`

Inherited from [`PlaceableObject.applyRenderFlags`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyrenderflags).

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

Test whether a user can perform a certain interaction regarding a Placeable Object.

**Parameters:**

- **user**: `documents.User`  
  The User performing the action. Must be equal to `game.user`.
- **action**:  
  One of the following string literals:  
  `"update"`, `"delete"`, `"create"`, `"view"`, `"control"`, `"configure"`, `"hover"`, `"drag"`, `"HUD"`  
  The named action being attempted.

**Returns:** `boolean`  
Does the User have rights to perform the action?

Inherited from [`PlaceableObject.can`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can).

---

### clear

```typescript
clear(): PlaceableObject
```

Clear the display of the existing object.

**Returns:** `PlaceableObject`  
The cleared object.

Inherited from [`PlaceableObject.clear`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear).

---

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes.  
The returned object is non-interactive and has no assigned ID.  
If you plan to use it permanently you should call the create method.

**Returns:** `PlaceableObject`  
A new object with identical data.

Inherited from [`PlaceableObject.clone`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone).

---

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.

**Parameters:**

- **options** (optional):  
  - **releaseOthers**?: `boolean` — Release any other controlled objects first.

**Returns:** `boolean`  
A flag denoting whether control was successful.

Inherited from [`PlaceableObject.control`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control).

---

### destroy

```typescript
destroy(options: any): any
```

**Parameters:**

- **options**: `any`

**Returns:** `any`

Inherited from [`PlaceableObject.destroy`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy).

---

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

Draw the placeable object into its parent container.

**Parameters:**

- **options** (optional): `object`  
  Options which may modify the draw and refresh workflow.

**Returns:** `Promise<PlaceableObject>`  
The drawn object.

Inherited from [`PlaceableObject.draw`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw).

---

### getSnappedPosition

```typescript
getSnappedPosition(position?: any): Point
```

Get the snapped position for a given position or the current position.

**Parameters:**

- **position** (optional): `any`  
  The position to be used instead of the current position.

**Returns:** `Point`  
The snapped position.

Inherited from [`PlaceableObject.getSnappedPosition`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getsnappedposition).

---

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

Refresh all incremental render flags for the PlaceableObject.  
This method is no longer used by the core software but provided for backwards compatibility.

**Parameters:**

- **options** (optional): `object`  
  Options which may modify the refresh workflow.

**Returns:** `PlaceableObject`  
The refreshed object.

Inherited from [`PlaceableObject.refresh`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh).

---

### release

```typescript
release(options?: object): boolean
```

Release control over a PlaceableObject, removing it from the controlled set.

**Parameters:**

- **options** (optional): `object`  
  Options which modify the releasing workflow.

**Returns:** `boolean`  
A Boolean flag confirming the object was released.

Inherited from [`PlaceableObject.release`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release).

---

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

Rotate the PlaceableObject to a certain angle of facing.

**Parameters:**

- **angle**: `number`  
  The desired angle of rotation.
- **snap**: `number`  
  Snap the angle of rotation to a certain target degree increment.

**Returns:** `Promise<PlaceableObject>`  
The rotated object.

Inherited from [`PlaceableObject.rotate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate).

---

## Protected Methods

### _canControl

```typescript
_canControl(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to control the Placeable Object?

**Parameters:**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if this function was called by [`foundry.canvas.interaction.MouseInteractionManager`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns:** `boolean`

Inherited from [`PlaceableObject._canControl`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancontrol).

---

### _canCreate

```typescript
_canCreate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to create the underlying Document?

**Parameters:**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`

Inherited from [`PlaceableObject._canCreate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancreate).

---

### _canDelete

```typescript
_canDelete(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to delete the underlying Document?

**Parameters:**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`

Inherited from [`PlaceableObject._canDelete`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candelete).

---

### _canDrag

```typescript
_canDrag(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to drag this Placeable Object?

**Parameters:**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`

Inherited from [`PlaceableObject._canDrag`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candrag).

---

### _canDragLeftStart

```typescript
_canDragLeftStart(
  user: documents.User,
  event: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to left-click drag this Placeable Object?

**Parameters:**

- **user**: `documents.User`
- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event.

**Returns:** `boolean`

Inherited from [`PlaceableObject._canDragLeftStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candragleftstart).

---

### _canHUD

```typescript
_canHUD(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Can the User access the HUD for this Placeable Object?

**Parameters:**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`

Inherited from [`PlaceableObject._canHUD`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhud).

---

### _canUpdate

```typescript
_canUpdate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to update the underlying Document?

**Parameters:**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`

Inherited from [`PlaceableObject._canUpdate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canupdate).

---

### _createInteractionManager

```typescript
_createInteractionManager(): MouseInteractionManager
```

Create a standard MouseInteractionManager for the PlaceableObject.

**Returns:** `MouseInteractionManager`

Inherited from [`PlaceableObject._createInteractionManager`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_createinteractionmanager).

---

### _destroy

```typescript
_destroy(options?: object): void
```

The inner _destroy method which may optionally be defined by each PlaceableObject subclass.

**Parameters:**

- **options** (optional): `object`  
  Options passed to the initial destroy call.

**Returns:** `void`

Inherited from [`PlaceableObject._destroy`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_destroy).

---

### _drawControlIcon

```typescript
_drawControlIcon(): ControlIcon
```

Draw the control icon.

**Returns:** `ControlIcon`

---

### _drawTooltip

```typescript
_drawTooltip(): PreciseText
```

Draw the tooltip.

**Returns:** `PreciseText`

---

### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the left-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns:** `void`

Inherited from [`PlaceableObject._finalizeDragLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragleft).

---

### _finalizeDragRight

```typescript
_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the right-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._finalizeDragRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragright).

---

### _getTargetAlpha

```typescript
_getTargetAlpha(): number
```

Get the target opacity that should be used for a Placeable Object depending on its preview state.

**Returns:** `number`

Inherited from [`PlaceableObject._getTargetAlpha`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_gettargetalpha).

---

### _getTextStyle

```typescript
_getTextStyle(): TextStyle
```

Define a PIXI TextStyle object which is used for the tooltip displayed for this Note.

**Returns:** `TextStyle`

---

### _initializeDragLeft

```typescript
_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the left-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._initializeDragLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragleft).

---

### _initializeDragRight

```typescript
_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the right-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._initializeDragRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragright).

---

### _onClickLeft

```typescript
_onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-click event to assume control of the object.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onClickLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft).

---

### _onClickRight

```typescript
_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-click event to configure properties of the object.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onClickRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright).

---

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double right-click event to configure properties of the object.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onClickRight2`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright2).

---

### _onControl

```typescript
_onControl(options: object): void
```

Additional events which trigger once control of the object is established.

**Parameters:**

- **options**: `object`  
  Optional parameters which apply for specific implementations.

**Returns:** `void`

Inherited from [`PlaceableObject._onControl`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncontrol).

---

### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Register pending canvas operations which should occur after a new PlaceableObject of this type is created.

**Parameters:**

- **data**: `object`
- **options**: `object`
- **userId**: `string`

**Returns:** `void`

Inherited from [`PlaceableObject._onCreate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncreate).

---

### _onDelete

```typescript
_onDelete(options: object, userId: string): void
```

Define additional steps taken when an existing placeable object of this type is deleted.

**Parameters:**

- **options**: `object`
- **userId**: `string`

**Returns:** `void`

Inherited from [`PlaceableObject._onDelete`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondelete).

---

### _onDragEnd

```typescript
_onDragEnd(): void
```

Conclude a drag operation from the perspective of the preview clone.  
Modify the appearance of both the clone (this) and the original (_original) object.

**Returns:** `void`

Inherited from [`PlaceableObject._onDragEnd`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragend).

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a mouse-move operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean | void`  
If false, the cancellation is prevented.

Inherited from [`PlaceableObject._onDragLeftCancel`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftcancel).

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Callback actions which occur on a mouse-move operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `undefined | false`

Inherited from [`PlaceableObject._onDragLeftDrop`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftdrop).

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a mouse-move operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onDragLeftMove`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftmove).

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur when a mouse-drag action is first begun.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean | void`  
If false, the start is prevented.

Inherited from [`PlaceableObject._onDragLeftStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftstart).

---

### _onDragRightCancel

```typescript
_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean | void`  
If false, the cancellation is prevented.

Inherited from [`PlaceableObject._onDragRightCancel`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightcancel).

---

### _onDragRightDrop

```typescript
_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onDragRightDrop`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightdrop).

---

### _onDragRightMove

```typescript
_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onDragRightMove`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightmove).

---

### _onDragRightStart

```typescript
_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `false | void`  
If false, the start is prevented.

Inherited from [`PlaceableObject._onDragRightStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightstart).

---

### _onDragStart

```typescript
_onDragStart(): void
```

Begin a drag operation from the perspective of the preview clone.  
Modify the appearance of both the clone (this) and the original (_original) object.

**Returns:** `void`

Inherited from [`PlaceableObject._onDragStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragstart).

---

### _onHoverIn

```typescript
_onHoverIn(
  event: FederatedEvent<UIEvent | PixiTouch>,
  options?: { hoverOutOthers?: boolean }
): void
```

Actions that should be taken for this Placeable Object when a mouseover event occurs.  
Hover events on PlaceableObject instances allow event propagation by default.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.
- **options** (optional):  
  - **hoverOutOthers**?: `boolean`  
    Trigger hover-out behavior on sibling objects. Default is `false`.

**Returns:** `void`

Inherited from [`PlaceableObject._onHoverIn`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverin).

---

### _onHoverOut

```typescript
_onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Actions that should be taken for this Placeable Object when a mouseout event occurs.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onHoverOut`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverout).

---

### _onLongPress

```typescript
_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any
```

Callback action which occurs on a long press.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`
- **origin**: `Point`  
  The local canvas coordinates of the mousepress.

**Returns:** `any`

Inherited from [`PlaceableObject._onLongPress`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onlongpress).

---

### _onRelease

```typescript
_onRelease(options: object): void
```

Additional events which trigger once control of the object is released.

**Parameters:**

- **options**: `object`  
  Options which modify the releasing workflow.

**Returns:** `void`

Inherited from [`PlaceableObject._onRelease`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onrelease).

---

### _onUnclickLeft

```typescript
_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-unclick event to release control of the object.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onUnclickLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickleft).

---

### _onUnclickRight

```typescript
_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-unclick event.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `void`

Inherited from [`PlaceableObject._onUnclickRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickright).

---

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: Rectangle): boolean
```

Is this PlaceableObject within the selection rectangle?

**Parameters:**

- **rectangle**: `Rectangle`  
  The selection rectangle.

**Returns:** `boolean`

Inherited from [`PlaceableObject._overlapsSelection`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_overlapsselection).

---

### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(
  event: FederatedEvent<UIEvent | PixiTouch>
): null | object[] | [updates: object[], options?: object]
```

Perform the database updates that should occur as the result of a drag-left-drop operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:**  
`null` or an array of objects to update or a tuple with updates and options.

Inherited from [`PlaceableObject._prepareDragLeftDropUpdates`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_preparedragleftdropupdates).

---

### _propagateLeftClick

```typescript
_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate left click downstream?

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`

Inherited from [`PlaceableObject._propagateLeftClick`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateleftclick).

---

### _propagateRightClick

```typescript
_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate right click downstream?

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`

Inherited from [`PlaceableObject._propagateRightClick`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagaterightclick).

---

### _refreshElevation

```typescript
_refreshElevation(): void
```

Refresh the elevation of the control icon.

**Returns:** `void`

---

### _refreshPosition

```typescript
_refreshPosition(): void
```

Refresh the position of the Note. Called when the coordinates change.

**Returns:** `void`

---

### _refreshState

```typescript
_refreshState(): void
```

Refresh the state of the Note. Called when the Note enters a different interaction state.

**Returns:** `void`

---

### _refreshTooltip

```typescript
_refreshTooltip(): void
```

Refresh the tooltip.

**Returns:** `void`

---

### _refreshVisibility

```typescript
_refreshVisibility(): void
```

Refresh the visibility.

**Returns:** `void`

---

### #onDragRightStart

```typescript
"#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `false | void`  
If false, the start is prevented.

Inherited from [`PlaceableObject.#onDragRightStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#ondragrightstart).

---

# See Also

- [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)
- [NoteDocument](https://foundryvtt.com/api/classes/foundry.documents.NoteDocument.html)
- [NotesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.NotesLayer.html)