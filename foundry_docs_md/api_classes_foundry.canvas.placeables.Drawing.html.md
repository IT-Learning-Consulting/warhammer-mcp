# Drawing | Foundry Virtual Tabletop - API Documentation - Version 13

The **Drawing** object is an implementation of the PlaceableObject container. Each Drawing is a placeable object in the DrawingsLayer.

**See:**

- [foundry.documents.DrawingDocument](https://foundryvtt.com/api/classes/foundry.documents.DrawingDocument.html)
- [foundry.canvas.layers.DrawingsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.DrawingsLayer.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.Drawing), Expand):

- *PlaceableObject*
- **Drawing**

---

## Constructors

```typescript
new Drawing(document: CanvasDocument): canvas.placeables.Drawing
```

**Parameters:**

- **document**: *CanvasDocument*  
  The Document instance represented by this object

**Returns:**  
canvas.placeables.Drawing

*Inherited from* [`PlaceableObject.constructor`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#constructor)

---

## Properties

### controlIcon

```typescript
controlIcon: null | ControlIcon
```

A control icon for interacting with the object

*Inherited from* [`PlaceableObject.controlIcon`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon)

---

### document

```typescript
document: CanvasDocument
```

A reference to the Scene embedded Document instance which this object represents

*Inherited from* [`PlaceableObject.document`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document)

---

### frame

```typescript
frame: Container<DisplayObject>
```

The border frame and resizing handles for the drawing.

---

### mouseInteractionManager

```typescript
mouseInteractionManager: MouseInteractionManager
```

A mouse interaction manager instance which handles mouse workflows related to this object.

*Inherited from* [`PlaceableObject.mouseInteractionManager`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager)

---

### renderFlags

```typescript
renderFlags: RenderFlags
```

Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for "redraw" and "refresh".

*Inherited from* [`PlaceableObject.renderFlags`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags)

---

### scene

```typescript
scene: documents.Scene
```

Retain a reference to the Scene within which this Placeable Object resides

*Inherited from* [`PlaceableObject.scene`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene)

---

### shape

```typescript
shape: any
```

The drawing shape which is rendered as a PIXI.Graphics in the interface or a PrimaryGraphics in the Primary Group.

---

### text

```typescript
text: null | PreciseText = null
```

A text label that may be displayed as part of the interface layer for the Drawing.

---

### texture

```typescript
texture: Texture<Resource>
```

The texture that is used to fill this Drawing, if any.

---

## Static Properties

### embeddedName

```typescript
embeddedName: string = "Drawing"
```

Identify the official Document name for this PlaceableObject class

Overrides [`PlaceableObject.embeddedName`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname)

---

### FREEHAND_SAMPLE_RATE

```typescript
FREEHAND_SAMPLE_RATE: number = 75
```

The rate at which points are sampled (in milliseconds) during a freehand drawing workflow

---

### RENDER_FLAG_PRIORITY

```typescript
RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled. Valid values are OBJECTS or PERCEPTION.

Inherited from [`PlaceableObject.RENDER_FLAG_PRIORITY`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority)

---

### RENDER_FLAGS

```typescript
RENDER_FLAGS: {
    redraw: { propagate: string[] };
    refresh: { alias: boolean; propagate: string[] };
    refreshElevation: {};
    refreshFrame: {};
    refreshMesh: {
        deprecated: { alias: boolean; since: number; until: number };
        propagate: string[];
    };
    refreshPosition: {};
    refreshRotation: { propagate: string[] };
    refreshShape: {};
    refreshSize: { propagate: string[] };
    refreshState: {};
    refreshText: {};
    refreshTransform: { alias: boolean; propagate: string[] };
} = ...
```

Type declaration:

- **redraw**: { propagate: string[] }
- **refresh**: { alias: boolean; propagate: string[] }
- **refreshElevation**: {}
- **refreshFrame**: {}
- **refreshMesh**: {
  - deprecated: { alias: boolean; since: number; until: number }
  - propagate: string[]
  }
- **refreshPosition**: {}
- **refreshRotation**: { propagate: string[] }
- **refreshShape**: {}
- **refreshSize**: { propagate: string[] }
- **refreshState**: {}
- **refreshText**: {}
- **refreshTransform**: { alias: boolean; propagate: string[] }

**Deprecated** since v12.

Overrides [`PlaceableObject.RENDER_FLAGS`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags)

---

### SHAPE_TYPES

```typescript
SHAPE_TYPES: {
    CIRCLE: string;
    ELLIPSE: string;
    POLYGON: string;
    RECTANGLE: string;
} = ShapeData.TYPES
```

A convenience reference to the possible shape types.

---

## Accessors

### _original

```typescript
get _original(): undefined | PlaceableObject
```

The object that this object is a preview of if this object is a preview.

**Returns:**  
undefined | PlaceableObject

*Inherited from* PlaceableObject._original

---

### bounds

```typescript
get bounds(): any
```

Overrides PlaceableObject.bounds

Returns: any

---

### center

```typescript
get center(): Point
```

Overrides PlaceableObject.center

Returns: Point

---

### controlled

```typescript
get controlled(): boolean
```

An indicator for whether the object is currently controlled

Returns: boolean

*Inherited from* PlaceableObject.controlled

---

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```

Is the HUD display active for this Placeable?

Returns: boolean

*Inherited from* PlaceableObject.hasActiveHUD

---

### hasPreview

```typescript
get hasPreview(): boolean
```

Does there exist a temporary preview of this placeable object?

Returns: boolean

*Inherited from* PlaceableObject.hasPreview

---

### hasText

```typescript
get hasText(): boolean
```

Does the Drawing have text that is displayed?

Returns: boolean

---

### hover

```typescript
get hover(): boolean
```

An indicator for whether the object is currently a hover target

Returns: boolean

*Inherited from* PlaceableObject.hover

---

### id

```typescript
get id(): string
```

The id of the corresponding Document which this PlaceableObject represents.

Returns: string

*Inherited from* PlaceableObject.id

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

Returns:

- undefined  
- or an object with the following keys: CLICKED, DRAG, DROP, GRABBED, HOVER, NONE

*Inherited from* PlaceableObject.interactionState

---

### isAuthor

```typescript
get isAuthor(): boolean
```

A convenient reference for whether the current User is the author of the Drawing document.

Returns: boolean

---

### isOwner

```typescript
get isOwner(): boolean
```

A convenient reference for whether the current User has full control over the document.

Returns: boolean

*Inherited from* PlaceableObject.isOwner

---

### isPolygon

```typescript
get isPolygon(): boolean
```

A Boolean flag for whether the Drawing is a Polygon type (either linear or freehand)?

Returns: boolean

---

### isPreview

```typescript
get isPreview(): boolean
```

Is this placeable object a temporary preview?

Returns: boolean

*Inherited from* PlaceableObject.isPreview

---

### isTiled

```typescript
get isTiled(): boolean
```

A Boolean flag for whether the Drawing utilizes a tiled texture background?

Returns: boolean

---

### isVisible

```typescript
get isVisible(): boolean
```

Is this Drawing currently visible on the Canvas?

Returns: boolean

---

### layer

```typescript
get layer(): PlaceablesLayer
```

Provide a reference to the CanvasLayer which contains this PlaceableObject.

Returns: PlaceablesLayer

*Inherited from* PlaceableObject.layer

---

### objectId

```typescript
get objectId(): string
```

A unique identifier which is used to uniquely identify elements on the canvas related to this object.

Returns: string

*Inherited from* PlaceableObject.objectId

---

### sheet

```typescript
get sheet(): DocumentSheetV2
```

A document sheet used to configure the properties of this Placeable Object or the Document it represents.

Returns: DocumentSheetV2

*Inherited from* PlaceableObject.sheet

---

### sourceId

```typescript
get sourceId(): string
```

The named identified for the source object associated with this PlaceableObject. This differs from the objectId because the sourceId is the same for preview objects as for the original.

Returns: string

*Inherited from* PlaceableObject.sourceId

---

### type

```typescript
get type(): string
```

The shape type that this Drawing represents. A value in Drawing.SHAPE_TYPES.

**See:**  
[Drawing.SHAPE_TYPES](api_classes_foundry.canvas.placeables.Drawing.html.html#8)

Returns: string

---

### implementation

```typescript
get implementation(): typeof PlaceableObject
```

Return a reference to the configured subclass of this base PlaceableObject type.

Returns: typeof PlaceableObject

---

## Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

**Parameters:**

- **flags**: any

Returns: void

Overrides [`PlaceableObject._applyRenderFlags`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyrenderflags)

---

### _canConfigure

```typescript
_canConfigure(user: any, event: any): boolean
```

**Parameters:**

- **user**: any  
- **event**: any

Returns: boolean

Overrides [`PlaceableObject._canConfigure`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canconfigure)

---

### _canControl

```typescript
_canControl(user: any, event: any): any
```

**Parameters:**

- **user**: any  
- **event**: any

Returns: any

Overrides [`PlaceableObject._canControl`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancontrol)

---

### _destroy

```typescript
_destroy(options: any): void
```

The inner _destroy method which may optionally be defined by each PlaceableObject subclass.

**Parameters:**

- **options**: any  
  Options passed to the initial destroy call

Returns: void

Overrides [`PlaceableObject._destroy`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_destroy)

---

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters:**

- **options**: any

Returns: Promise<void>

Overrides [`PlaceableObject._draw`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_draw)

---

### _onClickLeft

```typescript
_onClickLeft(event: any): void
```

Callback actions which occur on a single left-click event to assume control of the object.

**Parameters:**

- **event**: any  
  The triggering canvas interaction event

Returns: void

Overrides [`PlaceableObject._onClickLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft)

---

### _onControl

```typescript
_onControl(options: any): void
```

Additional events which trigger once control of the object is established.

**Parameters:**

- **options**: any  
  Optional parameters which apply for specific implementations

Returns: void

Overrides [`PlaceableObject._onControl`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncontrol)

---

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Define additional steps taken when an existing placeable object of this type is deleted.

**Parameters:**

- **options**: any  
- **userId**: any

Returns: void

Overrides [`PlaceableObject._onDelete`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondelete)

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: any): boolean | void
```

Callback actions which occur on a mouse-move operation.

**Parameters:**

- **event**: any  
  The triggering mouse click event

Returns: boolean | void  
If false, the cancellation is prevented

Overrides [`PlaceableObject._onDragLeftCancel`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftcancel)

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: any): false | void
```

**Parameters:**

- **event**: any

Returns: false | void

Overrides [`PlaceableObject._onDragLeftDrop`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftdrop)

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

**Parameters:**

- **event**: any

Returns: void

Overrides [`PlaceableObject._onDragLeftMove`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftmove)

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: any): boolean | void
```

**Parameters:**

- **event**: any

Returns: boolean | void

Overrides [`PlaceableObject._onDragLeftStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftstart)

---

### _onRelease

```typescript
_onRelease(options: any): void
```

Additional events which trigger once control of the object is released.

**Parameters:**

- **options**: any  
  Options which modify the releasing workflow

Returns: void

Overrides [`PlaceableObject._onRelease`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onrelease)

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Define additional steps taken when an existing placeable object of this type is updated with new data.

**Parameters:**

- **changed**: any  
- **options**: any  
- **userId**: any

Returns: void

Overrides [`PlaceableObject._onUpdate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onupdate)

---

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: any): any
```

**Parameters:**

- **rectangle**: any

Returns: any

Overrides [`PlaceableObject._overlapsSelection`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_overlapsselection)

---

### activateListeners

```typescript
activateListeners(): void
```

Activate interactivity for the Placeable Object.

Returns: void

Overrides [`PlaceableObject.activateListeners`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activatelisteners)

---

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

Returns: void

*Inherited from* [`PlaceableObject.applyRenderFlags`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyrenderflags)

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

- **user**: documents.User  
  The User performing the action. Must be equal to `game.user`.
- **action**: string  
  The named action being attempted, one of `"update" | "delete" | "create" | "view" | "control" | "configure" | "hover" | "drag" | "HUD"`.

Returns: boolean  
Does the User have rights to perform the action?

*Inherited from* [`PlaceableObject.can`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can)

---

### clear

```typescript
clear(): PlaceableObject
```

Clear the display of the existing object.

Returns: PlaceableObject  
The cleared object

*Inherited from* [`PlaceableObject.clear`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear)

---

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes. The returned object is non-interactive, and has no assigned ID. If you plan to use it permanently you should call the create method.

Returns: PlaceableObject  
A new object with identical data

Overrides [`PlaceableObject.clone`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone)

---

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.

**Parameters:**

- **options** (optional): object  
  Additional options which modify the control request.
  - **releaseOthers?**: boolean  
    Release any other controlled objects first.

Returns: boolean  
A flag denoting whether control was successful.

*Inherited from* [`PlaceableObject.control`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control)

---

### destroy

```typescript
destroy(options: any): any
```

**Parameters:**

- **options**: any

Returns: any

*Inherited from* [`PlaceableObject.destroy`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy)

---

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

Draw the placeable object into its parent container.

**Parameters:**

- **options** (optional): object  
  Options which may modify the draw and refresh workflow

Returns: Promise\<PlaceableObject\>  
The drawn object

*Inherited from* [`PlaceableObject.draw`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw)

---

### enableTextEditing

```typescript
enableTextEditing(options?: object): void
```

Enable text editing for this drawing.

**Parameters:**

- **options** (optional): object

Returns: void

---

### getSnappedPosition

```typescript
getSnappedPosition(position?: any): Point
```

Get the snapped position for a given position or the current position.

**Parameters:**

- **position** (optional): any  
  The position to be used instead of the current position.

Returns: Point

*Inherited from* [`PlaceableObject.getSnappedPosition`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getsnappedposition)

---

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

Refresh all incremental render flags for the PlaceableObject. This method is no longer used by the core software but provided for backwards compatibility.

**Parameters:**

- **options** (optional): object  
  Options which may modify the refresh workflow

Returns: PlaceableObject  
The refreshed object

*Inherited from* [`PlaceableObject.refresh`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh)

---

### release

```typescript
release(options?: object): boolean
```

Release control over a PlaceableObject, removing it from the controlled set.

**Parameters:**

- **options** (optional): object  
  Options which modify the releasing workflow

Returns: boolean  
A Boolean flag confirming the object was released.

*Inherited from* [`PlaceableObject.release`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release)

---

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

Rotate the PlaceableObject to a certain angle of facing.

**Parameters:**

- **angle**: number  
  The desired angle of rotation.
- **snap**: number  
  Snap the angle of rotation to a certain target degree increment.

Returns: Promise\<PlaceableObject\>  
The rotated object.

*Inherited from* [`PlaceableObject.rotate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate)

---

### _canCreate

```typescript
_canCreate(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Does the User have permission to create the underlying Document?

**Parameters:**

- **user**: documents.User  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): FederatedEvent<UIEvent | PixiTouch>  
  The pointer event if this function was called by [foundry.canvas.interaction.MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

Returns: boolean

*Inherited from* [`PlaceableObject._canCreate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancreate)

---

### _canDelete

```typescript
_canDelete(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Does the User have permission to delete the underlying Document?

**Parameters:**

- **user**: documents.User  
- **event** (optional): FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._canDelete`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candelete)

---

### _canDrag

```typescript
_canDrag(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Does the User have permission to drag this Placeable Object?

**Parameters:**

- **user**: documents.User  
- **event** (optional): FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._canDrag`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candrag)

---

### _canDragLeftStart

```typescript
_canDragLeftStart(
    user: documents.User,
    event: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Does the User have permission to left-click drag this Placeable Object?

**Parameters:**

- **user**: documents.User  
- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._canDragLeftStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candragleftstart)

---

### _canHover

```typescript
_canHover(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Does the User have permission to hover on this Placeable Object?

**Parameters:**

- **user**: documents.User  
- **event** (optional): FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._canHover`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhover)

---

### _canHUD

```typescript
_canHUD(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Can the User access the HUD for this Placeable Object?

**Parameters:**

- **user**: documents.User  
- **event** (optional): FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._canHUD`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhud)

---

### _canUpdate

```typescript
_canUpdate(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Does the User have permission to update the underlying Document?

**Parameters:**

- **user**: documents.User  
- **event** (optional): FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._canUpdate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canupdate)

---

### _canView

```typescript
_canView(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Protected  
Does the User have permission to view details of the Placeable Object?

**Parameters:**

- **user**: documents.User  
- **event** (optional): FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._canView`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canview)

---

### _createInteractionManager

```typescript
_createInteractionManager(): MouseInteractionManager
```

Protected  
Create a standard MouseInteractionManager for the PlaceableObject.

Returns: MouseInteractionManager

*Inherited from* [`PlaceableObject._createInteractionManager`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_createinteractionmanager)

---

### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Finalize the left-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering mouse click event

Returns: void

*Inherited from* [`PlaceableObject._finalizeDragLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragleft)

---

### _finalizeDragRight

```typescript
_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Finalize the right-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering mouse click event

Returns: void

*Inherited from* [`PlaceableObject._finalizeDragRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragright)

---

### _getFillStyle

```typescript
_getFillStyle(): object
```

Protected  
Get the fill style used for drawing the shape of this Drawing.

Returns: object  
The fill style options (PIXI.IFillStyleOptions).

---

### _getLineStyle

```typescript
_getLineStyle(): object
```

Protected  
Get the line style used for drawing the shape of this Drawing.

Returns: object  
The line style options (PIXI.ILineStyleOptions).

---

### _getTargetAlpha

```typescript
_getTargetAlpha(): number
```

Protected  
Get the target opacity that should be used for a Placeable Object depending on its preview state.

Returns: number

*Inherited from* [`PlaceableObject._getTargetAlpha`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_gettargetalpha)

---

### _getTextStyle

```typescript
_getTextStyle(): TextStyle
```

Protected  
Prepare the text style used to instantiate a PIXI.Text or PreciseText instance for this Drawing document.

Returns: TextStyle

---

### _initializeDragLeft

```typescript
_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Initialize the left-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering canvas interaction event

Returns: void

*Inherited from* [`PlaceableObject._initializeDragLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragleft)

---

### _initializeDragRight

```typescript
_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Initialize the right-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering canvas interaction event

Returns: void

*Inherited from* [`PlaceableObject._initializeDragRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragright)

---

### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Callback actions which occur on a double left-click event to activate.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering canvas interaction event

Returns: void

*Inherited from* [`PlaceableObject._onClickLeft2`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft2)

---

### _onClickRight

```typescript
_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Callback actions which occur on a single right-click event to configure properties of the object.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering canvas interaction event

Returns: void

*Inherited from* [`PlaceableObject._onClickRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright)

---

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Callback actions which occur on a double right-click event to configure properties of the object.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering canvas interaction event

Returns: void

*Inherited from* [`PlaceableObject._onClickRight2`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright2)

---

### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Protected  
Register pending canvas operations which should occur after a new PlaceableObject of this type is created.

**Parameters:**

- **data**: object  
- **options**: object  
- **userId**: string

Returns: void

*Inherited from* [`PlaceableObject._onCreate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncreate)

---

### _onDragEnd

```typescript
_onDragEnd(): void
```

Protected  
Conclude a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

Returns: void

*Inherited from* [`PlaceableObject._onDragEnd`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragend)

---

### _onDragRightCancel

```typescript
_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Protected  
Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: boolean | void  
If false, the cancellation is prevented

*Inherited from* [`PlaceableObject._onDragRightCancel`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightcancel)

---

### _onDragRightDrop

```typescript
_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

*Inherited from* [`PlaceableObject._onDragRightDrop`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightdrop)

---

### _onDragRightMove

```typescript
_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

*Inherited from* [`PlaceableObject._onDragRightMove`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightmove)

---

### _onDragRightStart

```typescript
_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Protected  
Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: false | void  
If false, the start is prevented

*Inherited from* [`PlaceableObject._onDragRightStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightstart)

---

### _onDragStart

```typescript
_onDragStart(): void
```

Protected  
Begin a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

Returns: void

*Inherited from* [`PlaceableObject._onDragStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragstart)

---

### _onHandleDragCancel

```typescript
_onHandleDragCancel(event: PointerEvent): void
```

Protected  
Handle cancellation of a drag event for one of the resizing handles.

**Parameters:**

- **event**: PointerEvent  
  The drag cancellation event

Returns: void

---

### _onHandleDragDrop

```typescript
_onHandleDragDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Handle mouseup after dragging a tile scale handler.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

---

### _onHandleDragMove

```typescript
_onHandleDragMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Handle mousemove while dragging a tile scale handler.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

---

### _onHandleDragStart

```typescript
_onHandleDragStart(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Starting the resize handle drag event, initialize the original data.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

---

### _onHandleHoverIn

```typescript
_onHandleHoverIn(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Handle mouse-over event on a control handle.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

---

### _onHandleHoverOut

```typescript
_onHandleHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Handle mouse-out event on a control handle.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

---

### _onHoverIn

```typescript
_onHoverIn(
    event: FederatedEvent<UIEvent | PixiTouch>,
    options?: { hoverOutOthers?: boolean },
): void
```

Protected  
Actions that should be taken for this Placeable Object when a mouseover event occurs. Hover events on PlaceableObject instances allow event propagation by default.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
  The triggering canvas interaction event.
- **options** (optional):  
  Customize event handling.
  - **hoverOutOthers?**: boolean  
    Trigger hover-out behavior on sibling objects.

Returns: void

*Inherited from* [`PlaceableObject._onHoverIn`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverin)

---

### _onHoverOut

```typescript
_onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Actions that should be taken for this Placeable Object when a mouseout event occurs.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

*Inherited from* [`PlaceableObject._onHoverOut`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverout)

---

### _onLongPress

```typescript
_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any
```

Protected  
Callback action which occurs on a long press.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>  
- **origin**: Point  
  The local canvas coordinates of the mousepress.

Returns: any

*Inherited from* [`PlaceableObject._onLongPress`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onlongpress)

---

### _onMouseDraw

```typescript
_onMouseDraw(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Handle mouse movement which modifies the dimensions of the drawn shape.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

---

### _onUnclickLeft

```typescript
_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Callback actions which occur on a single left-unclick event to assume control of the object.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

*Inherited from* [`PlaceableObject._onUnclickLeft`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickleft)

---

### _onUnclickRight

```typescript
_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Protected  
Callback actions which occur on a single right-unclick event.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: void

*Inherited from* [`PlaceableObject._onUnclickRight`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickright)

---

### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(
    event: FederatedEvent<UIEvent | PixiTouch>,
): null | object[] | [updates: object[], options?: object]
```

Protected  
Perform the database updates that should occur as the result of a drag-left-drop operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns:  
- null  
- or an array of objects  
- or a tuple containing an array of objects and optional options object.

An array of database updates to perform for documents in this collection.

*Inherited from* [`PlaceableObject._prepareDragLeftDropUpdates`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_preparedragleftdropupdates)

---

### _propagateLeftClick

```typescript
_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Protected  
Should the placeable propagate left click downstream?

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._propagateLeftClick`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateleftclick)

---

### _propagateRightClick

```typescript
_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Protected  
Should the placeable propagate right click downstream?

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: boolean

*Inherited from* [`PlaceableObject._propagateRightClick`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagaterightclick)

---

### _refreshElevation

```typescript
_refreshElevation(): void
```

Protected  
Update sorting of this Drawing relative to other PrimaryCanvasGroup siblings. Called when the elevation or sort order for the Drawing changes.

Returns: void

---

### _refreshFrame

```typescript
_refreshFrame(): void
```

Protected  
Refresh the border frame that encloses the Drawing.

Returns: void

---

### _refreshPosition

```typescript
_refreshPosition(): void
```

Protected  
Refresh the position.

Returns: void

---

### _refreshRotation

```typescript
_refreshRotation(): void
```

Protected  
Refresh the rotation.

Returns: void

---

### _refreshShape

```typescript
_refreshShape(): void
```

Protected  
Clear and then draw the shape.

Returns: void

---

### _refreshState

```typescript
_refreshState(): void
```

Protected  
Refresh the displayed state of the Drawing. Used to update aspects of the Drawing which change based on the user interaction state.

Returns: void

---

### _refreshText

```typescript
_refreshText(): void
```

Protected  
Refresh the content and appearance of text.

Returns: void

---

### #onDragRightStart

```typescript
"#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Protected  
Callback actions which occur on a right mouse-drag operation.

**Parameters:**

- **event**: FederatedEvent<UIEvent | PixiTouch>

Returns: false | void  
If false, the start is prevented

*Inherited from* [`PlaceableObject.#onDragRightStart`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#ondragrightstart)

---

## Static Methods

### normalizeShape

```typescript
static normalizeShape(data: object): object
```

Adjust the location, dimensions, and points of the Drawing before committing the change.

**Parameters:**

- **data**: object  
  The DrawingData pending update

Returns: object  
The adjusted data

---

### rescaleDimensions

```typescript
static rescaleDimensions(original: Object, dx: number, dy: number): object
```

Get a vectorized rescaling transformation for drawing data and dimensions passed in parameter.

**Parameters:**

- **original**: Object  
  The original drawing data
- **dx**: number  
  The pixel distance dragged in the horizontal direction
- **dy**: number  
  The pixel distance dragged in the vertical direction

Returns: object  
The adjusted shape data