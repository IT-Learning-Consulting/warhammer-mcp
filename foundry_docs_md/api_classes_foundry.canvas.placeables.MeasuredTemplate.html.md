# MeasuredTemplate

A type of Placeable Object which highlights an area of the grid as covered by some area of effect.

**See also:**  
- [foundry.documents.MeasuredTemplateDocument](https://foundryvtt.com/api/classes/foundry.documents.MeasuredTemplateDocument.html)  
- [foundry.canvas.layers.TemplateLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TemplateLayer.html)

**Hierarchy:**  
- [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)  
- MeasuredTemplate

---

## Constructors

### constructor

```typescript
new MeasuredTemplate(
    document: CanvasDocument,
): canvas.placeables.MeasuredTemplate
```

**Parameters**

- **document**: `CanvasDocument`  
  The Document instance represented by this object.

**Returns**

`canvas.placeables.MeasuredTemplate`

> Inherited from [PlaceableObject.constructor](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#constructor)

---

## Properties

### controlIcon

`null | ControlIcon`

A control icon for interacting with the object.

> Inherited from [PlaceableObject.controlIcon](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon)

### document

`CanvasDocument`

A reference to the Scene embedded Document instance which this object represents.

> Inherited from [PlaceableObject.document](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document)

### mouseInteractionManager

`MouseInteractionManager`

A mouse interaction manager instance which handles mouse workflows related to this object.

> Inherited from [PlaceableObject.mouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager)

### renderFlags

`RenderFlags`

Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for "redraw" and "refresh".

> Inherited from [PlaceableObject.renderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags)

### ruler

`PreciseText`

The measurement ruler label.

### scene

`documents.Scene`

Retain a reference to the Scene within which this Placeable Object resides.

> Inherited from [PlaceableObject.scene](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene)

### shape

`Rectangle | Polygon | Circle | Ellipse | RoundedRectangle`

The geometry shape used for testing point intersection.

### template

`Graphics`

The template graphics.

### texture

`Texture<Resource>`

The tiling texture used for this template, if any.

### _borderThickness

`number = 3`

Internal property used to configure the control border thickness.

---

## Accessors

### Static embeddedName

```typescript
static embeddedName: string = "MeasuredTemplate"
```

Identify the official Document name for this PlaceableObject class.

Overrides [PlaceableObject.embeddedName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname)

### Static RENDER_FLAG_PRIORITY

```typescript
static RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled. Valid values are OBJECTS or PERCEPTION.

> Inherited from [PlaceableObject.RENDER_FLAG_PRIORITY](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority)

### Static RENDER_FLAGS

```typescript
static RENDER_FLAGS = {
    redraw: { propagate: string[] },
    refresh: { alias: boolean; propagate: string[] },
    refreshElevation: {},
    refreshGrid: {},
    refreshPosition: { propagate: string[] },
    refreshShape: { propagate: string[] },
    refreshState: {},
    refreshTemplate: {},
    refreshText: {},
}
```

Overrides [PlaceableObject.RENDER_FLAGS](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags)

### _original

```typescript
get _original(): undefined | PlaceableObject
```

The object that this object is a preview of if this object is a preview.

**Returns**

`undefined | PlaceableObject`

> Inherited from PlaceableObject._original

### bounds

```typescript
get bounds(): Rectangle
```

The bounding box for this PlaceableObject. This is required if the layer uses a Quadtree, otherwise it is optional.

**Returns**

`Rectangle`

Overrides PlaceableObject.bounds

### center

```typescript
get center(): Point
```

The central coordinate pair of the placeable object based on its own width and height.

**Returns**

`Point`

> Inherited from PlaceableObject.center

### controlled

```typescript
get controlled(): boolean
```

An indicator for whether the object is currently controlled.

**Returns**

`boolean`

> Inherited from PlaceableObject.controlled

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```

Is the HUD display active for this Placeable?

**Returns**

`boolean`

> Inherited from PlaceableObject.hasActiveHUD

### hasPreview

```typescript
get hasPreview(): boolean
```

Does there exist a temporary preview of this placeable object?

**Returns**

`boolean`

> Inherited from PlaceableObject.hasPreview

### highlightId

```typescript
get highlightId(): string
```

A unique identifier which is used to uniquely identify related objects like a template effect or grid highlight.

**Returns**

`string`

### hover

```typescript
get hover(): boolean
```

An indicator for whether the object is currently a hover target.

**Returns**

`boolean`

> Inherited from PlaceableObject.hover

### id

```typescript
get id(): string
```

The id of the corresponding Document which this PlaceableObject represents.

**Returns**

`string`

> Inherited from PlaceableObject.id

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

`undefined | {CLICKED:number; DRAG:number; DROP:number; GRABBED:number; HOVER:number; NONE:number;}`

> Inherited from PlaceableObject.interactionState

### isAuthor

```typescript
get isAuthor(): boolean
```

A convenient reference for whether the current User is the author of the MeasuredTemplate document.

**Returns**

`boolean`

### isOwner

```typescript
get isOwner(): boolean
```

A convenient reference for whether the current User has full control over the document.

**Returns**

`boolean`

> Inherited from PlaceableObject.isOwner

### isPreview

```typescript
get isPreview(): boolean
```

Is this placeable object a temporary preview?

**Returns**

`boolean`

> Inherited from PlaceableObject.isPreview

### isVisible

```typescript
get isVisible(): boolean
```

Is this MeasuredTemplate currently visible on the Canvas?

**Returns**

`boolean`

### layer

```typescript
get layer(): PlaceablesLayer
```

Provide a reference to the CanvasLayer which contains this PlaceableObject.

**Returns**

`PlaceablesLayer`

> Inherited from PlaceableObject.layer

### objectId

```typescript
get objectId(): string
```

A unique identifier which is used to uniquely identify elements on the canvas related to this object.

**Returns**

`string`

> Inherited from PlaceableObject.objectId

### sheet

```typescript
get sheet(): DocumentSheetV2
```

A document sheet used to configure the properties of this Placeable Object or the Document it represents.

**Returns**

`DocumentSheetV2`

> Inherited from PlaceableObject.sheet

### sourceId

```typescript
get sourceId(): string
```

The named identifier for the source object associated with this PlaceableObject. This differs from the objectId because the sourceId is the same for preview objects as for the original.

**Returns**

`string`

> Inherited from PlaceableObject.sourceId

### Static implementation

```typescript
static get implementation(): typeof PlaceableObject
```

Return a reference to the configured subclass of this base PlaceableObject type.

**Returns**

`typeof PlaceableObject`

> Inherited from PlaceableObject.implementation

---

## Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

**Parameters**

- **flags**: `any`

**Returns**

`void`

Overrides [PlaceableObject._applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyrenderflags)

### _canConfigure

```typescript
_canConfigure(user: any, event: any): boolean
```

Does the User have permission to configure the Placeable Object?

**Parameters**

- **user**: `any`  
  The User performing the action. Always equal to `game.user`.
- **event**: `any`  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

`boolean`

Overrides [PlaceableObject._canConfigure](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canconfigure)

### _canControl

```typescript
_canControl(user: any, event: any): any
```

**Parameters**

- **user**: `any`  
- **event**: `any`

**Returns**

`any`

Overrides [PlaceableObject._canControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancontrol)

### _canHUD

```typescript
_canHUD(user: any, event: any): boolean
```

Can the User access the HUD for this Placeable Object?

**Parameters**

- **user**: `any`  
  The User performing the action. Always equal to `game.user`.
- **event**: `any`  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

`boolean`

Overrides [PlaceableObject._canHUD](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhud)

### _canView

```typescript
_canView(user: any, event: any): any
```

**Parameters**

- **user**: `any`  
- **event**: `any`

**Returns**

`any`

Overrides [PlaceableObject._canView](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canview)

### _destroy

```typescript
_destroy(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**

`void`

Overrides [PlaceableObject._destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_destroy)

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters**

- **options**: `any`

**Returns**

`Promise<void>`

Overrides [PlaceableObject._draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_draw)

### _getTargetAlpha

```typescript
_getTargetAlpha(): 0.8 | 1
```

**Returns**

`0.8 | 1`

Overrides [PlaceableObject._getTargetAlpha](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_gettargetalpha)

### _onClickRight

```typescript
_onClickRight(event: any): void
```

Callback actions which occur on a single right-click event to configure properties of the object.

**Parameters**

- **event**: `any`  
  The triggering canvas interaction event.

**Returns**

`void`

Overrides [PlaceableObject._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright)

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Define additional steps taken when an existing placeable object of this type is updated with new data.

**Parameters**

- **changed**: `any`  
- **options**: `any`  
- **userId**: `any`

**Returns**

`void`

Overrides [PlaceableObject._onUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onupdate)

### activateListeners

```typescript
activateListeners(): void
```

Activate interactivity for the Placeable Object.

**Returns**

`void`

> Inherited from [PlaceableObject.activateListeners](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activatelisteners)

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

**Returns**

`void`

> Inherited from [PlaceableObject.applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyrenderflags)

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

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Must be equal to `game.user`.
- **action**:  
  The named action being attempted:
  - `"update"`
  - `"delete"`
  - `"create"`
  - `"view"`
  - `"control"`
  - `"configure"`
  - `"hover"`
  - `"drag"`
  - `"HUD"`

**Returns**

`boolean`

> Inherited from [PlaceableObject.can](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can)

### clear

```typescript
clear(): PlaceableObject
```

Clear the display of the existing object.

**Returns**

`PlaceableObject` - The cleared object.

> Inherited from [PlaceableObject.clear](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear)

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes. The returned object is non-interactive, and has no assigned ID. If you plan to use it permanently you should call the create method.

**Returns**

`PlaceableObject`

> Inherited from [PlaceableObject.clone](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone)

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.

**Parameters**

- **options** (optional):  
  Additional options which modify the control request.
  - **releaseOthers**?: `boolean` - Release any other controlled objects first.

**Returns**

`boolean` - A flag denoting whether control was successful.

> Inherited from [PlaceableObject.control](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control)

### destroy

```typescript
destroy(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**

`any`

> Inherited from [PlaceableObject.destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy)

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

Draw the placeable object into its parent container.

**Parameters**

- **options** (optional): `object`  
  Options which may modify the draw and refresh workflow.

**Returns**

`Promise<PlaceableObject>` - The drawn object.

> Inherited from [PlaceableObject.draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw)

### getSnappedPosition

```typescript
getSnappedPosition(position?: any): Point
```

Get the snapped position for a given position or the current position.

**Parameters**

- **position** (optional): `any`  
  The position to be used instead of the current position.

**Returns**

`Point` - The snapped position.

> Inherited from [PlaceableObject.getSnappedPosition](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getsnappedposition)

### highlightGrid

```typescript
highlightGrid(): void
```

Highlight the grid squares which should be shown under the area of effect.

**Returns**

`void`

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

Refresh all incremental render flags for the PlaceableObject. This method is no longer used by the core software but provided for backwards compatibility.

**Parameters**

- **options** (optional): `object`  
  Options which may modify the refresh workflow.

**Returns**

`PlaceableObject` - The refreshed object.

> Inherited from [PlaceableObject.refresh](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh)

### release

```typescript
release(options?: object): boolean
```

Release control over a PlaceableObject, removing it from the controlled set.

**Parameters**

- **options** (optional): `object`  
  Options which modify the releasing workflow.

**Returns**

`boolean` - A Boolean flag confirming the object was released.

> Inherited from [PlaceableObject.release](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release)

### rotate

```typescript
rotate(angle: any, snap: any): Promise<canvas.placeables.MeasuredTemplate>
```

**Parameters**

- **angle**: `any`  
- **snap**: `any`

**Returns**

`Promise<canvas.placeables.MeasuredTemplate>`

Overrides [PlaceableObject.rotate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate)

### testPoint

```typescript
testPoint(point: Point): boolean
```

Is the given point contained in the template's shape?

**Parameters**

- **point**: `Point`  
  The point.

**Returns**

`boolean` - Is contained?

### _canCreate

```typescript
protected _canCreate(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to create the underlying Document?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

`boolean`

> Inherited from [PlaceableObject._canCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancreate)

### _canDelete

```typescript
protected _canDelete(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to delete the underlying Document?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

`boolean`

> Inherited from [PlaceableObject._canDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candelete)

### _canDrag

```typescript
protected _canDrag(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to drag this Placeable Object?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

`boolean`

> Inherited from [PlaceableObject._canDrag](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candrag)

### _canDragLeftStart

```typescript
protected _canDragLeftStart(
    user: documents.User,
    event: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to left-click drag this Placeable Object?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event.

**Returns**

`boolean`

> Inherited from [PlaceableObject._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candragleftstart)

### _canHover

```typescript
protected _canHover(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to hover on this Placeable Object?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

`boolean`

> Inherited from [PlaceableObject._canHover](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhover)

### _canUpdate

```typescript
protected _canUpdate(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to update the underlying Document?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

`boolean`

> Inherited from [PlaceableObject._canUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canupdate)

### _computeShape

```typescript
protected _computeShape(): Rectangle | Polygon | Circle
```

Compute the geometry for the template using its document data. Subclasses can override this method to take control over how different shapes are rendered.

**Returns**

`Rectangle | Polygon | Circle`

### _createInteractionManager

```typescript
protected _createInteractionManager(): MouseInteractionManager
```

Create a standard MouseInteractionManager for the PlaceableObject.

**Returns**

`MouseInteractionManager`

> Inherited from [PlaceableObject._createInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_createinteractionmanager)

### _finalizeDragLeft

```typescript
protected _finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the left-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**

`void`

> Inherited from [PlaceableObject._finalizeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragleft)

### _finalizeDragRight

```typescript
protected _finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the right-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**

`void`

> Inherited from [PlaceableObject._finalizeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragright)

### _getGridHighlightPositions

```typescript
protected _getGridHighlightPositions(): Point[]
```

Get an array of points which define top-left grid spaces to highlight for square or hexagonal grids.

**Returns**

`Point[]`

### _getGridHighlightShape

```typescript
protected _getGridHighlightShape(): Rectangle | Polygon | Circle
```

Get the shape to highlight on a Scene which uses grid-less mode.

**Returns**

`Rectangle | Polygon | Circle`

### _initializeDragLeft

```typescript
protected _initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the left-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._initializeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragleft)

### _initializeDragRight

```typescript
protected _initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the right-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._initializeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragright)

### _onClickLeft

```typescript
protected _onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-click event to assume control of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft)

### _onClickLeft2

```typescript
protected _onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double left-click event to activate.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft2)

### _onClickRight2

```typescript
protected _onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double right-click event to configure properties of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright2)

### _onControl

```typescript
protected _onControl(options: object): void
```

Additional events which trigger once control of the object is established.

**Parameters**

- **options**: `object`  
  Optional parameters which apply for specific implementations.

**Returns**

`void`

> Inherited from [PlaceableObject._onControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncontrol)

### _onCreate

```typescript
protected _onCreate(data: object, options: object, userId: string): void
```

Register pending canvas operations which should occur after a new PlaceableObject of this type is created.

**Parameters**

- **data**: `object`  
- **options**: `object`  
- **userId**: `string`

**Returns**

`void`

> Inherited from [PlaceableObject._onCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncreate)

### _onDelete

```typescript
protected _onDelete(options: object, userId: string): void
```

Define additional steps taken when an existing placeable object of this type is deleted.

**Parameters**

- **options**: `object`  
- **userId**: `string`

**Returns**

`void`

> Inherited from [PlaceableObject._onDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondelete)

### _onDragEnd

```typescript
protected _onDragEnd(): void
```

Conclude a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

**Returns**

`void`

> Inherited from [PlaceableObject._onDragEnd](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragend)

### _onDragLeftCancel

```typescript
protected _onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**

`boolean | void`  
If false, the cancellation is prevented.

> Inherited from [PlaceableObject._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftcancel)

### _onDragLeftDrop

```typescript
protected _onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`undefined | false`

> Inherited from [PlaceableObject._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftdrop)

### _onDragLeftMove

```typescript
protected _onDragLeftMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftmove)

### _onDragLeftStart

```typescript
protected _onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur when a mouse-drag action is first begun.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`boolean | void`  
If false, the start is prevented.

> Inherited from [PlaceableObject._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftstart)

### _onDragRightCancel

```typescript
protected _onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**

`boolean | void`  
If false, the cancellation is prevented.

> Inherited from [PlaceableObject._onDragRightCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightcancel)

### _onDragRightDrop

```typescript
protected _onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onDragRightDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightdrop)

### _onDragRightMove

```typescript
protected _onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onDragRightMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightmove)

### _onDragRightStart

```typescript
protected _onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**

`false | void`  
If false, the start is prevented.

> Inherited from [PlaceableObject._onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightstart)

### _onDragStart

```typescript
protected _onDragStart(): void
```

Begin a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

**Returns**

`void`

> Inherited from [PlaceableObject._onDragStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragstart)

### _onHoverIn

```typescript
protected _onHoverIn(
    event: FederatedEvent<UIEvent | PixiTouch>, 
    options?: { hoverOutOthers?: boolean },
): void
```

Actions that should be taken for this Placeable Object when a mouseover event occurs. Hover events on PlaceableObject instances allow event propagation by default.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.
- **options** (optional):  
  - **hoverOutOthers**?: `boolean` - Trigger hover-out behavior on sibling objects.

**Returns**

`void`

> Inherited from [PlaceableObject._onHoverIn](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverin)

### _onHoverOut

```typescript
protected _onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Actions that should be taken for this Placeable Object when a mouseout event occurs.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onHoverOut](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverout)

### _onLongPress

```typescript
protected _onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any
```

Callback action which occurs on a long press.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.
- **origin**: `Point`  
  The local canvas coordinates of the mouse press.

**Returns**

`any`

> Inherited from [PlaceableObject._onLongPress](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onlongpress)

### _onRelease

```typescript
protected _onRelease(options: object): void
```

Additional events which trigger once control of the object is released.

**Parameters**

- **options**: `object`  
  Options which modify the releasing workflow.

**Returns**

`void`

> Inherited from [PlaceableObject._onRelease](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onrelease)

### _onUnclickLeft

```typescript
protected _onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-unclick event to assume control of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onUnclickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickleft)

### _onUnclickRight

```typescript
protected _onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-unclick event.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`void`

> Inherited from [PlaceableObject._onUnclickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickright)

### _overlapsSelection

```typescript
protected _overlapsSelection(rectangle: Rectangle): boolean
```

Is this PlaceableObject within the selection rectangle?

**Parameters**

- **rectangle**: `Rectangle`  
  The selection rectangle.

**Returns**

`boolean`

> Inherited from [PlaceableObject._overlapsSelection](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_overlapsselection)

### _prepareDragLeftDropUpdates

```typescript
protected _prepareDragLeftDropUpdates(
    event: FederatedEvent<UIEvent | PixiTouch>,
): null | object[] | [updates: object[], options?: object]
```

Perform the database updates that should occur as the result of a drag-left-drop operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**

`null | object[] | [updates: object[], options?: object]`  
An array of database updates to perform for documents in this collection.

> Inherited from [PlaceableObject._prepareDragLeftDropUpdates](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_preparedragleftdropupdates)

### _propagateLeftClick

```typescript
protected _propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate left click downstream?

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

`boolean`

> Inherited from [PlaceableObject._propagateLeftClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateleftclick)

### _propagateRightClick

```typescript
protected _propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate right click downstream?

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

`boolean`

> Inherited from [PlaceableObject._propagateRightClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagaterightclick)

### _refreshElevation

```typescript
protected _refreshElevation(): void
```

Refresh the elevation of the control icon.

**Returns**

`void`

### _refreshPosition

```typescript
protected _refreshPosition(): void
```

Refresh the position of the MeasuredTemplate.

**Returns**

`void`

### _refreshRulerText

```typescript
protected _refreshRulerText(): void
```

Update the displayed ruler tooltip text.

**Returns**

`void`

### _refreshShape

```typescript
protected _refreshShape(): void
```

Refresh the underlying geometric shape of the MeasuredTemplate.

**Returns**

`void`

### _refreshState

```typescript
protected _refreshState(): void
```

Refresh the displayed state of the MeasuredTemplate. This refresh occurs when the user interaction state changes.

**Returns**

`void`

### _refreshTemplate

```typescript
protected _refreshTemplate(): void
```

Refresh the display of the template outline and shape. Subclasses may override this method to take control over how the template is visually rendered.

**Returns**

`void`

### #onDragRightStart

```typescript
protected "#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**

`false | void`  
If false, the start is prevented.

> Inherited from [PlaceableObject.#onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#ondragrightstart)

---

## Static Methods for Shapes

### getCircleShape

```typescript
static getCircleShape(distance: number): Polygon | Circle
```

Get a Circular area of effect given a radius of effect.

**Parameters**

- **distance**: `number`  
  The radius of the circle in grid units.

**Returns**

`Polygon | Circle`

### getConeShape

```typescript
static getConeShape(
    distance: number,
    direction: number,
    angle: number,
): Polygon | Circle
```

Get a Conical area of effect given a direction, angle, and distance.

**Parameters**

- **distance**: `number`  
  The radius of the cone in grid units.
- **direction**: `number`  
  The direction of the cone in degrees.
- **angle**: `number`  
  The angle of the cone in degrees.

**Returns**

`Polygon | Circle`

### getRayShape

```typescript
static getRayShape(distance: number, direction: number, width: number): Polygon
```

Get a rotated Rectangular area of effect given a width, height, and direction.

**Parameters**

- **distance**: `number`  
  The length of the ray in grid units.
- **direction**: `number`  
  The direction of the ray in degrees.
- **width**: `number`  
  The width of the ray in grid units.

**Returns**

`Polygon`

### getRectShape

```typescript
static getRectShape(distance: number, direction: number): Rectangle
```

Get a Rectangular area of effect given a width and height.

**Parameters**

- **distance**: `number`  
  The length of the diagonal in grid units.
- **direction**: `number`  
  The direction of the diagonal in degrees.

**Returns**

`Rectangle`