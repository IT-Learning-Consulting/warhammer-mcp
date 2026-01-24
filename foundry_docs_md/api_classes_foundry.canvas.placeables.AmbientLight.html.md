# AmbientLight | Foundry Virtual Tabletop - API Documentation - Version 13

An AmbientLight is an implementation of PlaceableObject which represents a dynamic light source within the Scene.

See also:
- [foundry.documents.AmbientLightDocument](https://foundryvtt.com/api/classes/foundry.documents.AmbientLightDocument.html)
- [foundry.canvas.layers.LightingLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.LightingLayer.html)

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.AmbientLight)):
- *PlaceableObject*
- AmbientLight

---

## Constructors

### constructor

```typescript
new AmbientLight(document: CanvasDocument): canvas.placeables.AmbientLight
```

**Parameters**
- **document**: *CanvasDocument*  
  The Document instance represented by this object

**Returns**  
`canvas.placeables.AmbientLight`

_Inherited from [PlaceableObject.constructor](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#constructor)_

---

## Properties

### controlIcon

`controlIcon: null | ControlIcon`  
A control icon for interacting with the object

_Inherited from [PlaceableObject.controlIcon](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon)_

### document

`document: CanvasDocument`  
A reference to the Scene embedded Document instance which this object represents

_Inherited from [PlaceableObject.document](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document)_

### field

`field: Graphics`  
The area that is affected by this light.

### lightSource

`lightSource: any`  
A reference to the PointSource object which defines this light or darkness area of effect. This is undefined if the AmbientLight does not provide an active source of light.

### mouseInteractionManager

`mouseInteractionManager: MouseInteractionManager`  
A mouse interaction manager instance which handles mouse workflows related to this object.

_Inherited from [PlaceableObject.mouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager)_

### renderFlags

`renderFlags: RenderFlags`  
Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for "redraw" and "refresh".

_Inherited from [PlaceableObject.renderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags)_

### scene

`scene: documents.Scene`  
Retain a reference to the Scene within which this Placeable Object resides

_Inherited from [PlaceableObject.scene](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene)_

---

## Static Properties

### embeddedName

```typescript
static embeddedName: string = "AmbientLight"
```

Identify the official Document name for this PlaceableObject class

Overrides [PlaceableObject.embeddedName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname)

### RENDER_FLAG_PRIORITY

```typescript
static RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled. Valid values are OBJECTS or PERCEPTION.

Inherited from [PlaceableObject.RENDER_FLAG_PRIORITY](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority)

### RENDER_FLAGS

```typescript
static RENDER_FLAGS: {
  redraw: { propagate: string[] };
  refresh: { alias: boolean; propagate: string[] };
  refreshElevation: {};
  refreshField: { propagate: string[] };
  refreshPosition: {};
  refreshState: {};
} = ...
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

_Inherited from PlaceableObject._original_

### bounds

```typescript
get bounds(): Rectangle
```

The bounding box for this PlaceableObject. This is required if the layer uses a Quadtree, otherwise it is optional.

**Returns**  
`Rectangle`

Overrides PlaceableObject.bounds

### brightRadius

```typescript
get brightRadius(): number
```

Get the pixel radius of bright light emitted by this light source.

**Returns**  
`number`

### center

```typescript
get center(): Point
```

The central coordinate pair of the placeable object based on its own width and height.

**Returns**  
`Point`

_Inherited from PlaceableObject.center_

### config

```typescript
get config(): LightData
```

A convenience accessor to the LightData configuration object.

**Returns**  
`LightData`

### controlled

```typescript
get controlled(): boolean
```

An indicator for whether the object is currently controlled.

**Returns**  
`boolean`

_Inherited from PlaceableObject.controlled_

### dimRadius

```typescript
get dimRadius(): number
```

Get the pixel radius of dim light emitted by this light source.

**Returns**  
`number`

### emitsDarkness

```typescript
get emitsDarkness(): boolean
```

Does this Ambient Light actively emit darkness light given its properties and the current darkness level of the Scene?

**Returns**  
`boolean`

### emitsLight

```typescript
get emitsLight(): boolean
```

Does this Ambient Light actively emit positive light given its properties and the current darkness level of the Scene?

**Returns**  
`boolean`

### global

```typescript
get global(): boolean
```

Test whether a specific AmbientLight source provides global illumination.

**Returns**  
`boolean`

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```

Is the HUD display active for this Placeable?

**Returns**  
`boolean`

_Inherited from PlaceableObject.hasActiveHUD_

### hasPreview

```typescript
get hasPreview(): boolean
```

Does there exist a temporary preview of this placeable object?

**Returns**  
`boolean`

_Inherited from PlaceableObject.hasPreview_

### hover

```typescript
get hover(): boolean
```

An indicator for whether the object is currently a hover target.

**Returns**  
`boolean`

_Inherited from PlaceableObject.hover_

### id

```typescript
get id(): string
```

The id of the corresponding Document which this PlaceableObject represents.

**Returns**  
`string`

_Inherited from PlaceableObject.id_

### interactionState

```typescript
get interactionState(): undefined | {
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
`undefined | { CLICKED: number; DRAG: number; DROP: number; GRABBED: number; HOVER: number; NONE: number; }`

_Inherited from PlaceableObject.interactionState_

### isDarknessSource

```typescript
get isDarknessSource(): boolean
```

Check if the point source is a DarknessSource instance.

**Returns**  
`boolean`

### isLightSource

```typescript
get isLightSource(): boolean
```

Check if the point source is a LightSource instance.

**Returns**  
`boolean`

### isOwner

```typescript
get isOwner(): boolean
```

A convenient reference for whether the current User has full control over the document.

**Returns**  
`boolean`

_Inherited from PlaceableObject.isOwner_

### isPreview

```typescript
get isPreview(): boolean
```

Is this placeable object a temporary preview?

**Returns**  
`boolean`

_Inherited from PlaceableObject.isPreview_

### isVisible

```typescript
get isVisible(): boolean
```

Is this Ambient Light currently visible? By default, true only if the source actively emits light or darkness.

**Returns**  
`boolean`

### layer

```typescript
get layer(): PlaceablesLayer
```

Provide a reference to the CanvasLayer which contains this PlaceableObject.

**Returns**  
`PlaceablesLayer`

_Inherited from PlaceableObject.layer_

### objectId

```typescript
get objectId(): string
```

A unique identifier which is used to uniquely identify elements on the canvas related to this object.

**Returns**  
`string`

_Inherited from PlaceableObject.objectId_

### radius

```typescript
get radius(): number
```

The maximum radius in pixels of the light field.

**Returns**  
`number`

### sheet

```typescript
get sheet(): DocumentSheetV2
```

A document sheet used to configure the properties of this Placeable Object or the Document it represents.

**Returns**  
`DocumentSheetV2`

_Inherited from PlaceableObject.sheet_

### sourceId

```typescript
get sourceId(): string
```

**Returns**  
`string`

Overrides PlaceableObject.sourceId

### implementation

```typescript
static get implementation(): typeof PlaceableObject
```

Return a reference to the configured subclass of this base PlaceableObject type.

**Returns**  
`typeof PlaceableObject`

Inherited from PlaceableObject.implementation

---

## Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

Overrides [PlaceableObject._applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyrenderflags)

**Parameters**
- **flags**: *any*

**Returns**  
`void`

### _canConfigure

```typescript
_canConfigure(user: any, event: any): boolean
```

Does the User have permission to configure the Placeable Object?

**Parameters**
- **user**: *any*  
  The User performing the action. Always equal to `game.user`.
- **event**: *any*  
  The pointer event if this function was called by [foundry.canvas.interaction.MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**  
`boolean`

Overrides [PlaceableObject._canConfigure](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canconfigure)

### _canDragLeftStart

```typescript
_canDragLeftStart(user: any, event: any): boolean
```

Does the User have permission to left-click drag this Placeable Object?

**Parameters**
- **user**: *any*  
  The User performing the action. Always equal to `game.user`.
- **event**: *any*  
  The pointer event

**Returns**  
`boolean`

Overrides [PlaceableObject._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candragleftstart)

### _canHUD

```typescript
_canHUD(user: any, event: any): any
```

Can the User access the HUD for this Placeable Object?

**Parameters**
- **user**: *any*  
  The User performing the action. Always equal to `game.user`.
- **event**: *any*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**  
`any`

Overrides [PlaceableObject._canHUD](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhud)

### _destroy

```typescript
_destroy(options: any): void
```

Overrides [PlaceableObject._destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_destroy)

**Parameters**
- **options**: *any*

**Returns**  
`void`

### _draw

```typescript
_draw(options: any): Promise<void>
```

Overrides [PlaceableObject._draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_draw)

**Parameters**
- **options**: *any*

**Returns**  
`Promise<void>`

### _onClickRight

```typescript
_onClickRight(event: any): void
```

Callback actions which occur on a single right-click event to configure properties of the object.

**Parameters**
- **event**: *any*  
  The triggering canvas interaction event.

**Returns**  
`void`

Overrides [PlaceableObject._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright)

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Register pending canvas operations which should occur after a new PlaceableObject of this type is created.

**Parameters**
- **data**: *any*
- **options**: *any*
- **userId**: *any*

**Returns**  
`void`

Overrides [PlaceableObject._onCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncreate)

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Define additional steps taken when an existing placeable object of this type is deleted.

**Parameters**
- **options**: *any*
- **userId**: *any*

**Returns**  
`void`

Overrides [PlaceableObject._onDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondelete)

### _onDragEnd

```typescript
_onDragEnd(): void
```

Conclude a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

**Returns**  
`void`

Overrides [PlaceableObject._onDragEnd](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragend)

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

Callback actions which occur on a mouse-move operation.

**Parameters**
- **event**: *any*  
  The triggering canvas interaction event.

**Returns**  
`void`

Overrides [PlaceableObject._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftmove)

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

**Parameters**
- **changed**: *any*  
- **options**: *any*  
- **userId**: *any*

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

_Inherited from [PlaceableObject.activateListeners](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activatelisteners)_

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

**Returns**  
`void`

_Inherited from [PlaceableObject.applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyrenderflags)_

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
    | "HUD"
): boolean
```

Test whether a user can perform a certain interaction regarding a Placeable Object.

**Parameters**
- **user**: *documents.User*  
  The User performing the action. Must be equal to `game.user`.
- **action**:  
  The named action being attempted. One of: `"update"`, `"delete"`, `"create"`, `"view"`, `"control"`, `"configure"`, `"hover"`, `"drag"`, or `"HUD"`.

**Returns**  
`boolean`  
Does the User have rights to perform the action?

_Inherited from [PlaceableObject.can](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can)_

### clear

```typescript
clear(): PlaceableObject
```

Clear the display of the existing object.

**Returns**  
`PlaceableObject`  
The cleared object

_Inherited from [PlaceableObject.clear](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear)_

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes. The returned object is non-interactive, and has no assigned ID. If you plan to use it permanently you should call the create method.

**Returns**  
`PlaceableObject`  
A new object with identical data

_Inherited from [PlaceableObject.clone](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone)_

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.

**Parameters**
- **options?**: *{ releaseOthers?: boolean }* = {}  
  Additional options which modify the control request.
  - **releaseOthers?**: *boolean*  
    Release any other controlled objects first.

**Returns**  
`boolean`  
A flag denoting whether control was successful.

_Inherited from [PlaceableObject.control](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control)_

### destroy

```typescript
destroy(options: any): any
```

**Parameters**
- **options**: *any*

**Returns**  
`any`

Inherit Doc

_Inherited from [PlaceableObject.destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy)_

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

Draw the placeable object into its parent container.

**Parameters**
- **options?**: *object* = {}  
  Options which may modify the draw and refresh workflow.

**Returns**  
`Promise<PlaceableObject>`  
The drawn object

_Inherited from [PlaceableObject.draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw)_

### getSnappedPosition

```typescript
getSnappedPosition(position?: any): Point
```

Get the snapped position for a given position or the current position.

**Parameters**
- **position?**: *any*  
  The position to be used instead of the current position.

**Returns**  
`Point`  
The snapped position

_Inherited from [PlaceableObject.getSnappedPosition](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getsnappedposition)_

### initializeLightSource

```typescript
initializeLightSource(options?: { deleted?: boolean }): void
```

Update the LightSource associated with this AmbientLight object. Darkness sources always generate edges. Light sources only do so if their priority is strictly greater than 0. If any aspect changes (deletion, switching between darkness/light, or priority change), the source may be destroyed and recreated as needed, and relevant perception flags are set.

**Parameters**
- **options?**: *{ deleted?: boolean }* = {}  
  Options which modify how the source is updated.
  - **deleted?**: *boolean*  
    Indicate that this light source has been deleted.

**Returns**  
`void`

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

Refresh all incremental render flags for the PlaceableObject. This method is no longer used by the core software but provided for backwards compatibility.

**Parameters**
- **options?**: *object* = {}  
  Options which may modify the refresh workflow.

**Returns**  
`PlaceableObject`  
The refreshed object

_Inherited from [PlaceableObject.refresh](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh)_

### refreshControl

```typescript
refreshControl(): void
```

Refresh the display of the ControlIcon for this AmbientLight source.

**Returns**  
`void`

### release

```typescript
release(options?: object): boolean
```

Release control over a PlaceableObject, removing it from the controlled set.

**Parameters**
- **options?**: *object* = {}  
  Options which modify the releasing workflow.

**Returns**  
`boolean`  
A Boolean flag confirming the object was released.

_Inherited from [PlaceableObject.release](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release)_

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

Rotate the PlaceableObject to a certain angle of facing.

**Parameters**
- **angle**: *number*  
  The desired angle of rotation.
- **snap**: *number*  
  Snap the angle of rotation to a certain target degree increment.

**Returns**  
`Promise<PlaceableObject>`  
The rotated object

_Inherited from [PlaceableObject.rotate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate)_

---

## Protected Methods

These methods are generally intended for internal use.

### _canControl

```typescript
_canControl(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to control the Placeable Object?

**Parameters**
- **user**: *documents.User*  
  The User performing the action. Always equal to `game.user`.
- **event?**: *FederatedEvent<UIEvent | PixiTouch>*  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**  
`boolean`

_Inherited from [PlaceableObject._canControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancontrol)_

### _canCreate

```typescript
_canCreate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to create the underlying Document?

**Parameters**
- **user**: *documents.User*
- **event?**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._canCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancreate)_

### _canDelete

```typescript
_canDelete(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to delete the underlying Document?

**Parameters**
- **user**: *documents.User*
- **event?**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._canDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candelete)_

### _canDrag

```typescript
_canDrag(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to drag this Placeable Object?

**Parameters**
- **user**: *documents.User*
- **event?**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._canDrag](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candrag)_

### _canHover

```typescript
_canHover(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to hover on this Placeable Object?

**Parameters**
- **user**: *documents.User*
- **event?**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._canHover](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhover)_

### _canUpdate

```typescript
_canUpdate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to update the underlying Document?

**Parameters**
- **user**: *documents.User*
- **event?**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._canUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canupdate)_

### _canView

```typescript
_canView(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>
): boolean
```

Does the User have permission to view details of the Placeable Object?

**Parameters**
- **user**: *documents.User*
- **event?**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._canView](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canview)_

### _createInteractionManager

```typescript
_createInteractionManager(): MouseInteractionManager
```

Create a standard MouseInteractionManager for the PlaceableObject.

**Returns**  
`MouseInteractionManager`

_Inherited from [PlaceableObject._createInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_createinteractionmanager)_

### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the left-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event.

**Returns**  
`void`

_Inherited from [PlaceableObject._finalizeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragleft)_

### _finalizeDragRight

```typescript
_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the right-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event.

**Returns**  
`void`

_Inherited from [PlaceableObject._finalizeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragright)_

### _getLightSourceData

```typescript
_getLightSourceData(): LightSourceData
```

Get the light source data.

**Returns**  
`LightSourceData`

### _getTargetAlpha

```typescript
_getTargetAlpha(): number
```

Get the target opacity that should be used for a Placeable Object depending on its preview state.

**Returns**  
`number`

_Inherited from [PlaceableObject._getTargetAlpha](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_gettargetalpha)_

### _initializeDragLeft

```typescript
_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the left-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._initializeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragleft)_

### _initializeDragRight

```typescript
_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the right-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._initializeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragright)_

### _isLightSourceDisabled

```typescript
_isLightSourceDisabled(): boolean
```

Is the source of this Ambient Light disabled?

**Returns**  
`boolean`

### _onClickLeft

```typescript
_onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-click event to assume control of the object.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft)_

### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double left-click event to activate.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft2)_

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double right-click event to configure properties of the object.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright2)_

### _onControl

```typescript
_onControl(options: object): void
```

Additional events which trigger once control of the object is established.

**Parameters**
- **options**: *object*  
  Optional parameters which apply for specific implementations.

**Returns**  
`void`

_Inherited from [PlaceableObject._onControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncontrol)_

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a mouse-move operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event.

**Returns**  
`boolean | void`  
If false, the cancellation is prevented.

_Inherited from [PlaceableObject._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftcancel)_

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Callback actions which occur on a mouse-move operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`undefined | false`

_Inherited from [PlaceableObject._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftdrop)_

### _onDragLeftStart

```typescript
_onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur when a mouse-drag action is first begun.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`boolean | void`  
If false, the start is prevented.

_Inherited from [PlaceableObject._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftstart)_

### _onDragRightCancel

```typescript
_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event.

**Returns**  
`boolean | void`  
If false, the cancellation is prevented.

_Inherited from [PlaceableObject._onDragRightCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightcancel)_

### _onDragRightDrop

```typescript
_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onDragRightDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightdrop)_

### _onDragRightMove

```typescript
_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onDragRightMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightmove)_

### _onDragRightStart

```typescript
_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering mouse click event.

**Returns**  
`false | void`  
If false, the start is prevented.

_Inherited from [PlaceableObject._onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightstart)_

### _onDragStart

```typescript
_onDragStart(): void
```

Begin a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

**Returns**  
`void`

_Inherited from [PlaceableObject._onDragStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragstart)_

### _onHoverIn

```typescript
_onHoverIn(
  event: FederatedEvent<UIEvent | PixiTouch>,
  options?: { hoverOutOthers?: boolean }
): void
```

Actions that should be taken for this Placeable Object when a mouseover event occurs. Hover events on PlaceableObject instances allow event propagation by default.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.
- **options?**: *{ hoverOutOthers?: boolean }* = {}  
  Options which customize event handling.
  - **hoverOutOthers?**: *boolean*  
    Trigger hover-out behavior on sibling objects.

**Returns**  
`void`

_Inherited from [PlaceableObject._onHoverIn](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverin)_

### _onHoverOut

```typescript
_onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Actions that should be taken for this Placeable Object when a mouseout event occurs.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onHoverOut](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverout)_

### _onLongPress

```typescript
_onLongPress(
  event: FederatedEvent<UIEvent | PixiTouch>,
  origin: Point
): any
```

Callback action which occurs on a long press.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.
- **origin**: *Point*  
  The local canvas coordinates of the mousepress.

**Returns**  
`any`

_Inherited from [PlaceableObject._onLongPress](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onlongpress)_

### _onRelease

```typescript
_onRelease(options: object): void
```

Additional events which trigger once control of the object is released.

**Parameters**
- **options**: *object*  
  Options which modify the releasing workflow.

**Returns**  
`void`

_Inherited from [PlaceableObject._onRelease](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onrelease)_

### _onUnclickLeft

```typescript
_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-unclick event to assume control of the object.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onUnclickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickleft)_

### _onUnclickRight

```typescript
_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-unclick event.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`void`

_Inherited from [PlaceableObject._onUnclickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickright)_

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: Rectangle): boolean
```

Is this PlaceableObject within the selection rectangle?

**Parameters**
- **rectangle**: *Rectangle*  
  The selection rectangle.

**Returns**  
`boolean`

_Inherited from [PlaceableObject._overlapsSelection](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_overlapsselection)_

### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(
  event: FederatedEvent<UIEvent | PixiTouch>
): null | object[] | [updates: object[], options?: object]
```

Perform the database updates that should occur as the result of a drag-left-drop operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*  
  The triggering canvas interaction event.

**Returns**  
`null | object[] | [ updates: object[], options?: object ]`  
An array of database updates to perform for documents in this collection.

_Inherited from [PlaceableObject._prepareDragLeftDropUpdates](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_preparedragleftdropupdates)_

### _propagateLeftClick

```typescript
_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate left click downstream?

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._propagateLeftClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateleftclick)_

### _propagateRightClick

```typescript
_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate right click downstream?

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`boolean`

_Inherited from [PlaceableObject._propagateRightClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagaterightclick)_

### _refreshElevation

```typescript
_refreshElevation(): void
```

Refresh the elevation of the control icon.

**Returns**  
`void`

### _refreshField

```typescript
_refreshField(): void
```

Refresh the shape of the light field-of-effect. This is refreshed when the AmbientLight FOV polygon changes.

**Returns**  
`void`

### _refreshPosition

```typescript
_refreshPosition(): void
```

Refresh the position of the AmbientLight. Called when the coordinates change.

**Returns**  
`void`

### _refreshState

```typescript
_refreshState(): void
```

Refresh the state of the light. Called when the disabled state or darkness conditions change.

**Returns**  
`void`

### #onDragRightStart

```typescript
"#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**
- **event**: *FederatedEvent<UIEvent | PixiTouch>*

**Returns**  
`false | void`  
If false, the start is prevented.

_Inherited from [PlaceableObject.#onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#ondragrightstart)_

---

For more details, refer to the official [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.placeables.AmbientLight.html).