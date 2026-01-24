# Region | Foundry Virtual Tabletop - API Documentation - Version 13

A **Region** is an implementation of `PlaceableObject` which represents a Region document within a viewed Scene on the game canvas.

**See also:**  
- [foundry.documents.RegionDocument](https://foundryvtt.com/api/classes/foundry.documents.RegionDocument.html)  
- [foundry.canvas.layers.RegionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.RegionLayer.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.Region))  
- *PlaceableObject*  
- **Region**

---

## Constructors

### constructor

```typescript
new Region(document: CanvasDocument): canvas.placeables.Region
```

**Parameters**

- **document**: `CanvasDocument`  
  The Document instance represented by this object

**Returns**  
`canvas.placeables.Region`

_Inherited from [PlaceableObject.constructor](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#constructor)_

---

## Properties

### controlIcon

`controlIcon: null | ControlIcon`

A control icon for interacting with the object

_Inherited from [PlaceableObject.controlIcon](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon)_

---

### document

`document: CanvasDocument`

A reference to the Scene embedded Document instance which this object represents

_Inherited from [PlaceableObject.document](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document)_

---

### mouseInteractionManager

`mouseInteractionManager: MouseInteractionManager`

A mouse interaction manager instance which handles mouse workflows related to this object.

_Inherited from [PlaceableObject.mouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager)_

---

### renderFlags

`renderFlags: RenderFlags`

Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for `"redraw"` and `"refresh"`.

_Inherited from [PlaceableObject.renderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags)_

---

### scene

`scene: documents.Scene`

Retain a reference to the Scene within which this Placeable Object resides

_Inherited from [PlaceableObject.scene](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene)_

---

### Static Properties

#### embeddedName

```typescript
static embeddedName: string = "Region"
```

Overrides [PlaceableObject.embeddedName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname)

---

#### RENDER_FLAG_PRIORITY

```typescript
static RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled. Valid values are `"OBJECTS"` or `"PERCEPTION"`.

---

#### RENDER_FLAGS

```typescript
static RENDER_FLAGS = {
    redraw: { propagate: string[] },
    refresh: { alias: boolean; propagate: string[] },
    refreshBorder: {},
    refreshState: {}
}
```

Overrides [PlaceableObject.RENDER_FLAGS](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags)

---

## Accessors

### _original

```typescript
get _original(): undefined | PlaceableObject
```

The object that this object is a preview of if this object is a preview.

**Returns**  
`undefined | PlaceableObject`

_Inherited from [PlaceableObject._original](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_original)_

---

### bounds

```typescript
get bounds(): any
```

**Returns**  
`any`

Overrides [PlaceableObject.bounds](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#bounds)

---

### center

```typescript
get center(): Point
```

**Returns**  
`Point`

Overrides [PlaceableObject.center](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#center)

---

### controlled

```typescript
get controlled(): boolean
```

An indicator for whether the object is currently controlled

**Returns**  
`boolean`

_Inherited from [PlaceableObject.controlled](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlled)_

---

### geometry

```typescript
get geometry(): RegionGeometry
```

The geometry of this Region.

The value of this property must not be mutated.

This property is updated only by a document update.

**Returns**  
`RegionGeometry`

---

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```

Is the HUD display active for this Placeable?

**Returns**  
`boolean`

_Inherited from [PlaceableObject.hasActiveHUD](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#hasActiveHUD)_

---

### hasPreview

```typescript
get hasPreview(): boolean
```

Does there exist a temporary preview of this placeable object?

**Returns**  
`boolean`

_Inherited from [PlaceableObject.hasPreview](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#hasPreview)_

---

### hover

```typescript
get hover(): boolean
```

An indicator for whether the object is currently a hover target

**Returns**  
`boolean`

_Inherited from [PlaceableObject.hover](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#hover)_

---

### id

```typescript
get id(): string
```

The id of the corresponding Document which this PlaceableObject represents.

**Returns**  
`string`

_Inherited from [PlaceableObject.id](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#id)_

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

**Returns**  
`undefined | { CLICKED: number; DRAG: number; DROP: number; GRABBED: number; HOVER: number; NONE: number }`

_Inherited from [PlaceableObject.interactionState](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#interactionState)_

---

### isOwner

```typescript
get isOwner(): boolean
```

A convenient reference for whether the current User has full control over the document.

**Returns**  
`boolean`

_Inherited from [PlaceableObject.isOwner](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#isOwner)_

---

### isPreview

```typescript
get isPreview(): boolean
```

Is this placeable object a temporary preview?

**Returns**  
`boolean`

_Inherited from [PlaceableObject.isPreview](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#isPreview)_

---

### isVisible

```typescript
get isVisible(): boolean
```

Is this Region currently visible on the Canvas?

**Returns**  
`boolean`

---

### layer

```typescript
get layer(): PlaceablesLayer
```

Provide a reference to the CanvasLayer which contains this PlaceableObject.

**Returns**  
`PlaceablesLayer`

_Inherited from [PlaceableObject.layer](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#layer)_

---

### objectId

```typescript
get objectId(): string
```

A unique identifier which is used to uniquely identify elements on the canvas related to this object.

**Returns**  
`string`

_Inherited from [PlaceableObject.objectId](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#objectId)_

---

### sheet

```typescript
get sheet(): DocumentSheetV2
```

A document sheet used to configure the properties of this Placeable Object or the Document it represents.

**Returns**  
`DocumentSheetV2`

_Inherited from [PlaceableObject.sheet](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#sheet)_

---

### sourceId

```typescript
get sourceId(): string
```

The named identified for the source object associated with this PlaceableObject. This differs from the objectId because the sourceId is the same for preview objects as for the original.

**Returns**  
`string`

_Inherited from [PlaceableObject.sourceId](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#sourceId)_

---

### implementation

```typescript
static get implementation(): typeof PlaceableObject
```

Return a reference to the configured subclass of this base PlaceableObject type.

**Returns**  
`typeof PlaceableObject`

_Inherited from [PlaceableObject.implementation](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#implementation)_

---

## Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

Overrides [PlaceableObject._applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyRenderFlags)

**Parameters**

- **flags**: `any`

**Returns**  
`void`

---

### _canDrag

```typescript
_canDrag(user: any, event: any): boolean
```

Overrides [PlaceableObject._canDrag](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canDrag)

**Parameters**

- **user**: `any`  
- **event**: `any`

**Returns**  
`boolean`

---

### _canHUD

```typescript
_canHUD(user: any, event: any): boolean
```

Overrides [PlaceableObject._canHUD](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canHUD)

**Parameters**

- **user**: `any`  
- **event**: `any`

**Returns**  
`boolean`

---

### _draw

```typescript
_draw(options: any): Promise<void>
```

Overrides [PlaceableObject._draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_draw)

**Parameters**

- **options**: `any`

**Returns**  
`Promise<void>`

---

### _onControl

```typescript
_onControl(options: any): void
```

Additional events which trigger once control of the object is established.

Overrides [PlaceableObject._onControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onControl)

**Parameters**

- **options**: `any`  
  Optional parameters which apply for specific implementations

**Returns**  
`void`

---

### _onHoverIn

```typescript
_onHoverIn(event: any, __namedParameters?: { updateLegend?: boolean }): void
```

Actions that should be taken for this Placeable Object when a mouseover event occurs.  
Hover events on PlaceableObject instances allow event propagation by default.

Overrides [PlaceableObject._onHoverIn](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onHoverIn)

**Parameters**

- **event**: `any`  
  The triggering canvas interaction event
- **__namedParameters?**:  
  - **updateLegend?**: `boolean`

**Returns**  
`void`

---

### _onHoverOut

```typescript
_onHoverOut(event: any, __namedParameters?: { updateLegend?: boolean }): void
```

Actions that should be taken for this Placeable Object when a mouseout event occurs.

Overrides [PlaceableObject._onHoverOut](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onHoverOut)

**Parameters**

- **event**: `any`  
  The triggering canvas interaction event
- **__namedParameters?**:  
  - **updateLegend?**: `boolean`

**Returns**  
`void`

---

### _onRelease

```typescript
_onRelease(options: any): void
```

Additional events which trigger once control of the object is released.

Overrides [PlaceableObject._onRelease](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onRelease)

**Parameters**

- **options**: `any`  
  Options which modify the releasing workflow

**Returns**  
`void`

---

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

Define additional steps taken when an existing placeable object of this type is updated with new data.

Overrides [PlaceableObject._onUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onUpdate)

**Parameters**

- **changed**: `any`  
- **options**: `any`  
- **userId**: `any`

**Returns**  
`void`

---

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: any): boolean
```

Overrides [PlaceableObject._overlapsSelection](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_overlapsSelection)

**Parameters**

- **rectangle**: `any`

**Returns**  
`boolean`

---

### activateListeners

```typescript
activateListeners(): void
```

Activate interactivity for the Placeable Object.

_Inherited from [PlaceableObject.activateListeners](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activateListeners)_

**Returns**  
`void`

---

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

Inherited from [PlaceableObject.applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyRenderFlags)

**Returns**  
`void`

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

_Inherited from [PlaceableObject.can](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can)_

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Must be equal to `game.user`.
- **action**:  
  One of `"update"`, `"delete"`, `"create"`, `"view"`, `"control"`, `"configure"`, `"hover"`, `"drag"`, `"HUD"`  
  The named action being attempted

**Returns**  
`boolean`  
Does the User have rights to perform the action?

---

### clear

```typescript
clear(): PlaceableObject
```

Clear the display of the existing object.

_Inherited from [PlaceableObject.clear](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear)_

**Returns**  
`PlaceableObject`  
The cleared object

---

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes. The returned object is non-interactive, and has no assigned ID. If you plan to use it permanently you should call the create method.

_Inherited from [PlaceableObject.clone](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone)_

**Returns**  
`PlaceableObject`  
A new object with identical data

---

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.

_Inherited from [PlaceableObject.control](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control)_

**Parameters**

- **options?**:  
  - **releaseOthers?**: `boolean`  
    Release any other controlled objects first.

**Returns**  
`boolean`  
A flag denoting whether control was successful

---

### destroy

```typescript
destroy(options: any): any
```

Inherited from [PlaceableObject.destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy)

**Parameters**

- **options**: `any`

**Returns**  
`any`

---

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

Draw the placeable object into its parent container.

_Inherited from [PlaceableObject.draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw)_

**Parameters**

- **options?**: `object`  
  Options which may modify the draw and refresh workflow

**Returns**  
`Promise<PlaceableObject>`

---

### getSnappedPosition

```typescript
getSnappedPosition(position: any): void
```

Overrides [PlaceableObject.getSnappedPosition](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getSnappedPosition)

**Parameters**

- **position**: `any`

**Returns**  
`void`

---

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

Refresh all incremental render flags for the PlaceableObject. This method is no longer used by the core software but provided for backwards compatibility.

_Inherited from [PlaceableObject.refresh](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh)_

**Parameters**

- **options?**: `object`  
  Options which may modify the refresh workflow

**Returns**  
`PlaceableObject`  
The refreshed object

---

### release

```typescript
release(options?: object): boolean
```

Release control over a PlaceableObject, removing it from the controlled set.

_Inherited from [PlaceableObject.release](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release)_

**Parameters**

- **options?**: `object`  
  Options which modify the releasing workflow

**Returns**  
`boolean`  
A Boolean flag confirming the object was released.

---

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

Rotate the PlaceableObject to a certain angle of facing.

_Inherited from [PlaceableObject.rotate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate)_

**Parameters**

- **angle**: `number`  
  The desired angle of rotation
- **snap**: `number`  
  Snap the angle of rotation to a certain target degree increment

**Returns**  
`Promise<PlaceableObject>`  
The rotated object

---

## Protected Methods

### _canConfigure

```typescript
_canConfigure(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to configure the Placeable Object?

_Inherited from [PlaceableObject._canConfigure](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canConfigure)_

**Parameters**

- **user**: `documents.User`  
- **event?**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**  
`boolean`

---

### _canControl

```typescript
_canControl(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to control the Placeable Object?

_Inherited from [PlaceableObject._canControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canControl)_

**Parameters**

- **user**: `documents.User`  
- **event?**: `FederatedEvent<UIEvent | PixiTouch>`  

**Returns**  
`boolean`

---

### _canCreate

```typescript
_canCreate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to create the underlying Document?

_Inherited from [PlaceableObject._canCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canCreate)_

**Parameters**

- **user**: `documents.User`  
- **event?**: `FederatedEvent<UIEvent | PixiTouch>`  

**Returns**  
`boolean`

---

### _canDelete

```typescript
_canDelete(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to delete the underlying Document?

_Inherited from [PlaceableObject._canDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canDelete)_

**Parameters**

- **user**: `documents.User`  
- **event?**: `FederatedEvent<UIEvent | PixiTouch>`  

**Returns**  
`boolean`

---

### _canDragLeftStart

```typescript
_canDragLeftStart(
  user: documents.User,
  event: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to left-click drag this Placeable Object?

_Inherited from [PlaceableObject._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canDragLeftStart)_

**Parameters**

- **user**: `documents.User`  
- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

---

### _canHover

```typescript
_canHover(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to hover on this Placeable Object?

_Inherited from [PlaceableObject._canHover](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canHover)_

**Parameters**

- **user**: `documents.User`  
- **event?**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

---

### _canUpdate

```typescript
_canUpdate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to update the underlying Document?

_Inherited from [PlaceableObject._canUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canUpdate)_

**Parameters**

- **user**: `documents.User`  
- **event?**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

---

### _canView

```typescript
_canView(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to view details of the Placeable Object?

_Inherited from [PlaceableObject._canView](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canView)_

**Parameters**

- **user**: `documents.User`  
- **event?**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

---

### _createInteractionManager

```typescript
_createInteractionManager(): MouseInteractionManager
```

Create a standard MouseInteractionManager for the PlaceableObject.

_Inherited from [PlaceableObject._createInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_createInteractionManager)_

**Returns**  
`MouseInteractionManager`

---

### _destroy

```typescript
_destroy(options?: object): void
```

The inner `_destroy` method which may optionally be defined by each PlaceableObject subclass.

_Inherited from [PlaceableObject._destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_destroy)_

**Parameters**

- **options?**: `object`  
  Options passed to the initial destroy call

**Returns**  
`void`

---

### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the left-drag operation.

_Inherited from [PlaceableObject._finalizeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizeDragLeft)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event

**Returns**  
`void`

---

### _finalizeDragRight

```typescript
_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the right-drag operation.

_Inherited from [PlaceableObject._finalizeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizeDragRight)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event

**Returns**  
`void`

---

### _getTargetAlpha

```typescript
_getTargetAlpha(): number
```

Get the target opacity that should be used for a Placeable Object depending on its preview state.

_Inherited from [PlaceableObject._getTargetAlpha](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_getTargetAlpha)_

**Returns**  
`number`

---

### _initializeDragLeft

```typescript
_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the left-drag operation.

_Inherited from [PlaceableObject._initializeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializeDragLeft)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _initializeDragRight

```typescript
_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the right-drag operation.

_Inherited from [PlaceableObject._initializeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializeDragRight)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onClickLeft

```typescript
_onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-click event to assume control of the object.

_Inherited from [PlaceableObject._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onClickLeft)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double left-click event to activate.

_Inherited from [PlaceableObject._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onClickLeft2)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onClickRight

```typescript
_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-click event to configure properties of the object.

_Inherited from [PlaceableObject._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onClickRight)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double right-click event to configure properties of the object.

_Inherited from [PlaceableObject._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onClickRight2)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Register pending canvas operations which should occur after a new PlaceableObject of this type is created.

_Inherited from [PlaceableObject._onCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onCreate)_

**Parameters**

- **data**: `object`  
- **options**: `object`  
- **userId**: `string`

**Returns**  
`void`

---

### _onDelete

```typescript
_onDelete(options: object, userId: string): void
```

Define additional steps taken when an existing placeable object of this type is deleted.

_Inherited from [PlaceableObject._onDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDelete)_

**Parameters**

- **options**: `object`  
- **userId**: `string`

**Returns**  
`void`

---

### _onDragEnd

```typescript
_onDragEnd(): void
```

Conclude a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

_Inherited from [PlaceableObject._onDragEnd](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragEnd)_

**Returns**  
`void`

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a mouse-move operation.

_Inherited from [PlaceableObject._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragLeftCancel)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean | void`  
If false, the cancellation is prevented

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Callback actions which occur on a mouse-move operation.

_Inherited from [PlaceableObject._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragLeftDrop)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`undefined | false`

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a mouse-move operation.

_Inherited from [PlaceableObject._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragLeftMove)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur when a mouse-drag action is first begun.

_Inherited from [PlaceableObject._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragLeftStart)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean | void`  
If false, the start is prevented

---

### _onDragRightCancel

```typescript
_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a right mouse-drag operation.

_Inherited from [PlaceableObject._onDragRightCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragRightCancel)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean | void`  
If false, the cancellation is prevented

---

### _onDragRightDrop

```typescript
_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

_Inherited from [PlaceableObject._onDragRightDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragRightDrop)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onDragRightMove

```typescript
_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

_Inherited from [PlaceableObject._onDragRightMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragRightMove)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onDragRightStart

```typescript
_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

_Inherited from [PlaceableObject._onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragRightStart)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`false | void`  
If false, the start is prevented

---

### _onDragStart

```typescript
_onDragStart(): void
```

Begin a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

_Inherited from [PlaceableObject._onDragStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onDragStart)_

**Returns**  
`void`

---

### _onLongPress

```typescript
_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any
```

Callback action which occurs on a long press.

_Inherited from [PlaceableObject._onLongPress](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onLongPress)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
- **origin**: `Point`  
  The local canvas coordinates of the mouse press.

**Returns**  
`any`

---

### _onUnclickLeft

```typescript
_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-unclick event to assume control of the object.

_Inherited from [PlaceableObject._onUnclickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onUnclickLeft)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _onUnclickRight

```typescript
_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-unclick event.

_Inherited from [PlaceableObject._onUnclickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onUnclickRight)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

---

### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(
  event: FederatedEvent<UIEvent | PixiTouch>
): null | object[] | [updates: object[], options?: object]
```

Perform the database updates that should occur as the result of a drag-left-drop operation.

_Inherited from [PlaceableObject._prepareDragLeftDropUpdates](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_prepareDragLeftDropUpdates)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`null | object[] | [updates: object[], options?: object]`  
An array of database updates to perform for documents in this collection

---

### _propagateLeftClick

```typescript
_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate left click downstream?

_Inherited from [PlaceableObject._propagateLeftClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateLeftClick)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

---

### _propagateRightClick

```typescript
_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate right click downstream?

_Inherited from [PlaceableObject._propagateRightClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateRightClick)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

---

### _refreshBorder

```typescript
_refreshBorder(): void
```

Refresh the border of the Region.

**Returns**  
`void`

---

### _refreshState

```typescript
_refreshState(): void
```

Refresh the state of the Region.

**Returns**  
`void`

---

### #onDragRightStart

```typescript
#onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

_Inherited from [PlaceableObject.#onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#onDragRightStart)_

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`false | void`  
If false, the start is prevented

---