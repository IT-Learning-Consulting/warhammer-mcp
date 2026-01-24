# AmbientSound | Foundry Virtual Tabletop - API Documentation - Version 13

An `AmbientSound` is an implementation of `PlaceableObject` which represents a dynamic audio source within the Scene.

**See also:**  
- [foundry.documents.AmbientSoundDocument](https://foundryvtt.com/api/classes/foundry.documents.AmbientSoundDocument.html)  
- [foundry.canvas.layers.SoundsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.SoundsLayer.html)

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.AmbientSound), Expand):  
- *PlaceableObject*  
- **AmbientSound**

---

## Constructors

### constructor

```typescript
new AmbientSound(document: CanvasDocument) : canvas.placeables.AmbientSound
```

**Parameters**

- **document**: `CanvasDocument`  
  The Document instance represented by this object.

**Returns**  
`canvas.placeables.AmbientSound`

_Inherited from [PlaceableObject.constructor](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#constructor)_

---

## Properties

### controlIcon

`controlIcon: null | ControlIcon`

A control icon for interacting with the object.

_Inherited from [PlaceableObject.controlIcon](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon)_

### document

`document: CanvasDocument`

A reference to the Scene embedded Document instance which this object represents.

_Inherited from [PlaceableObject.document](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document)_

### field

`field: Graphics`

The area that is affected by this ambient sound.

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

Retain a reference to the Scene within which this Placeable Object resides.

_Inherited from [PlaceableObject.scene](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene)_

### sound

`sound: any`

The Sound which manages playback for this AmbientSound effect.

### source

`source: PointSoundSource`

A SoundSource object which manages the area of effect for this ambient sound.

---

## Static Properties

### embeddedName

```typescript
static embeddedName: string = "AmbientSound"
```

Identify the official Document name for this PlaceableObject class.

Overrides [PlaceableObject.embeddedName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname).

### RENDER_FLAG_PRIORITY

```typescript
static RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled. Valid values are `"OBJECTS"` or `"PERCEPTION"`.

Inherited from [PlaceableObject.RENDER_FLAG_PRIORITY](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority).

### RENDER_FLAGS

```typescript
static RENDER_FLAGS: {
    redraw: { propagate: string[] };
    refresh: { alias: boolean; propagate: string[] };
    refreshElevation: {};
    refreshField: { propagate: string[] };
    refreshPosition: {};
    refreshState: {};
}
```

Overrides [PlaceableObject.RENDER_FLAGS](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags).

---

## Accessors

### _original

```typescript
get _original(): undefined | PlaceableObject
```

The object that this object is a preview of if this object is a preview.

Returns `undefined | PlaceableObject`.

Inherited from `PlaceableObject._original`.

### bounds

```typescript
get bounds(): Rectangle
```

The bounding box for this PlaceableObject. This is required if the layer uses a Quadtree, otherwise it is optional.

Overrides `PlaceableObject.bounds`.

### center

```typescript
get center(): Point
```

The central coordinate pair of the placeable object based on its own width and height.

Overrides `PlaceableObject.center`.

### controlled

```typescript
get controlled(): boolean
```

An indicator for whether the object is currently controlled.

Inherited from `PlaceableObject.controlled`.

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```

Is the HUD display active for this Placeable?

Inherited from `PlaceableObject.hasActiveHUD`.

### hasPreview

```typescript
get hasPreview(): boolean
```

Does there exist a temporary preview of this placeable object?

Inherited from `PlaceableObject.hasPreview`.

### hover

```typescript
get hover(): boolean
```

An indicator for whether the object is currently a hover target.

Inherited from `PlaceableObject.hover`.

### id

```typescript
get id(): string
```

The id of the corresponding Document which this PlaceableObject represents.

Inherited from `PlaceableObject.id`.

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

Inherited from `PlaceableObject.interactionState`.

### isAudible

```typescript
get isAudible(): boolean
```

Is this ambient sound currently audible based on its hidden state and the darkness level of the Scene?

### isOwner

```typescript
get isOwner(): boolean
```

A convenient reference for whether the current User has full control over the document.

Inherited from `PlaceableObject.isOwner`.

### isPreview

```typescript
get isPreview(): boolean
```

Is this placeable object a temporary preview?

Inherited from `PlaceableObject.isPreview`.

### layer

```typescript
get layer(): PlaceablesLayer
```

Provide a reference to the CanvasLayer which contains this PlaceableObject.

Inherited from `PlaceableObject.layer`.

### objectId

```typescript
get objectId(): string
```

A unique identifier which is used to uniquely identify elements on the canvas related to this object.

Inherited from `PlaceableObject.objectId`.

### radius

```typescript
get radius(): number
```

A convenience accessor for the sound radius in pixels.

### sheet

```typescript
get sheet(): DocumentSheetV2
```

A document sheet used to configure the properties of this Placeable Object or the Document it represents.

Inherited from `PlaceableObject.sheet`.

### sourceId

```typescript
get sourceId(): string
```

The named identifier for the source object associated with this PlaceableObject. This differs from the objectId because the sourceId is the same for preview objects as for the original.

Inherited from `PlaceableObject.sourceId`.

---

## Methods

### implementation

```typescript
static get implementation(): typeof PlaceableObject
```

Return a reference to the configured subclass of this base PlaceableObject type.

Inherited from `PlaceableObject.implementation`.

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

Overrides [PlaceableObject._applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyrenderflags).

**Parameters**

- **flags**: `any`

**Returns**  
`void`

### _canConfigure

```typescript
_canConfigure(user: any, event: any): boolean
```

Does the User have permission to configure the Placeable Object?

**Parameters**

- **user**: `any`  
  The User performing the action. Always equal to `game.user`.
- **event**: `any`  
  The pointer event if this function was called by [foundry.canvas.interaction.MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**  
`boolean`

Overrides `PlaceableObject._canConfigure`.

### _canHUD

```typescript
_canHUD(user: any, event: any): any
```

Can the User access the HUD for this Placeable Object?

**Parameters**

- **user**: `any`  
  The User performing the action. Always equal to `game.user`.
- **event**: `any`  
  The pointer event if this function was called by [foundry.canvas.interaction.MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**  
`any`

Overrides `PlaceableObject._canHUD`.

### _destroy

```typescript
_destroy(options: any): void
```

Overrides `PlaceableObject._destroy`.

**Parameters**

- **options**: `any`

**Returns**  
`void`

### _draw

```typescript
_draw(options: any): Promise<void>
```

Overrides `PlaceableObject._draw`.

**Parameters**

- **options**: `any`

**Returns**  
`Promise<void>`

### _onClickRight

```typescript
_onClickRight(event: any): void
```

Overrides `PlaceableObject._onClickRight`.

**Parameters**

- **event**: `any`

**Returns**  
`void`

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

Register pending canvas operations which should occur after a new PlaceableObject of this type is created.

**Parameters**

- **data**: `any`
- **options**: `any`
- **userId**: `any`

**Returns**  
`void`

Overrides `PlaceableObject._onCreate`.

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

Define additional steps taken when an existing placeable object of this type is deleted.

**Parameters**

- **options**: `any`
- **userId**: `any`

**Returns**  
`void`

Overrides `PlaceableObject._onDelete`.

### _onDragEnd

```typescript
_onDragEnd(): void
```

Conclude a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (`_original`) object.

**Returns**  
`void`

Overrides `PlaceableObject._onDragEnd`.

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

Overrides `PlaceableObject._onDragLeftMove`.

**Parameters**

- **event**: `any`

**Returns**  
`void`

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

Overrides `PlaceableObject._onUpdate`.

### activateListeners

```typescript
activateListeners(): void
```

Activate interactivity for the Placeable Object.

Inherited from `PlaceableObject.activateListeners`.

### applyEffects

```typescript
applyEffects(options?: { muffled?: boolean }): void
```

Update the set of effects which are applied to the managed Sound.

**Parameters**

- **options** (optional):  
  - **muffled?**: `boolean` - Is the sound currently muffled? (default: false)

**Returns**  
`void`

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

Apply render flags to update the display.

Inherited from `PlaceableObject.applyRenderFlags`.

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
- **action**: string  
  The named action being attempted. One of `"update"`, `"delete"`, `"create"`, `"view"`, `"control"`, `"configure"`, `"hover"`, `"drag"`, `"HUD"`.

**Returns**  
`boolean`

Inherited from `PlaceableObject.can`.

### clear

```typescript
clear(): PlaceableObject
```

Clear the display of the existing object.

**Returns**  
`PlaceableObject` - The cleared object.

Overrides `PlaceableObject.clear`.

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes.  
The returned object is non-interactive, and has no assigned ID.  
If you plan to use it permanently you should call the create method.

**Returns**  
`PlaceableObject` - A new object with identical data.

Inherited from `PlaceableObject.clone`.

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.

**Parameters**

- **options** (optional):  
  - **releaseOthers?**: `boolean` - Release any other controlled objects first (default: false)

**Returns**  
`boolean` - A flag denoting whether control was successful.

Inherited from `PlaceableObject.control`.

### destroy

```typescript
destroy(options: any): any
```

Destroy the object.

**Parameters**

- **options**: `any`

**Returns**  
`any`

Inherited from `PlaceableObject.destroy`.

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

Inherited from `PlaceableObject.draw`.

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

Inherited from `PlaceableObject.getSnappedPosition`.

### initializeSoundSource

```typescript
initializeSoundSource(options?: { deleted?: boolean }): void
```

Compute the field-of-vision for an object, determining its effective line-of-sight and field-of-vision polygons.

**Parameters**

- **options** (optional):  
  - **deleted?**: `boolean` - Indicate that this SoundSource has been deleted (default: false)

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

Inherited from `PlaceableObject.refresh`.

### refreshControl

```typescript
refreshControl(): void
```

Refresh the display of the ControlIcon for this AmbientSound source.

**Returns**  
`void`

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

Inherited from `PlaceableObject.release`.

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

Rotate the PlaceableObject to a certain angle of facing.

**Parameters**

- **angle**: `number`  
  The desired angle of rotation.
- **snap**: `number`  
  Snap the angle of rotation to a certain target degree increment.

**Returns**  
`Promise<PlaceableObject>` - The rotated object.

Inherited from `PlaceableObject.rotate`.

### sync

```typescript
sync(
    isAudible: boolean,
    volume?: number,
    options?: { fade?: number; muffled?: boolean },
): Promise<void>
```

Toggle playback of the sound depending on whether it is audible.

**Parameters**

- **isAudible**: `boolean`  
  Is the sound audible?
- **volume** (optional): `number`  
  The target playback volume.
- **options** (optional):  
  - **fade?**: `number` - A duration in milliseconds to fade volume transition.
  - **muffled?**: `boolean` - Is the sound currently muffled?

**Returns**  
`Promise<void>` - A promise which resolves once sound playback is synchronized.

---

## Protected Methods

### _canControl

```typescript
_canControl(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to control the Placeable Object?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer event if this function was called by [foundry.canvas.interaction.MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**  
`boolean`

Inherited from `PlaceableObject._canControl`.

### _canCreate

```typescript
_canCreate(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to create the underlying Document?

**Parameters**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._canCreate`.

### _canDelete

```typescript
_canDelete(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to delete the underlying Document?

**Parameters**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._canDelete`.

### _canDrag

```typescript
_canDrag(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to drag this Placeable Object?

**Parameters**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._canDrag`.

### _canDragLeftStart

```typescript
_canDragLeftStart(
    user: documents.User,
    event: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to left-click drag this Placeable Object?

**Parameters**

- **user**: `documents.User`
- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._canDragLeftStart`.

### _canHover

```typescript
_canHover(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to hover on this Placeable Object?

**Parameters**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._canHover`.

### _canUpdate

```typescript
_canUpdate(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to update the underlying Document?

**Parameters**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._canUpdate`.

### _canView

```typescript
_canView(
    user: documents.User,
    event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to view details of the Placeable Object?

**Parameters**

- **user**: `documents.User`
- **event** (optional): `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._canView`.

### _createInteractionManager

```typescript
_createInteractionManager(): MouseInteractionManager
```

Create a standard MouseInteractionManager for the PlaceableObject.

**Returns**  
`MouseInteractionManager`

Inherited from `PlaceableObject._createInteractionManager`.

### _createSound

```typescript
_createSound(): any
```

Create a Sound used to play this AmbientSound object.

**Returns**  
`any`

### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the left-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**  
`void`

Inherited from `PlaceableObject._finalizeDragLeft`.

### _finalizeDragRight

```typescript
_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the right-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event.

**Returns**  
`void`

Inherited from `PlaceableObject._finalizeDragRight`.

### _getSoundSourceData

```typescript
_getSoundSourceData(): BaseEffectSourceData
```

Get the sound source data.

**Returns**  
`BaseEffectSourceData`

### _getTargetAlpha

```typescript
_getTargetAlpha(): number
```

Get the target opacity that should be used for a Placeable Object depending on its preview state.

**Returns**  
`number`

Inherited from `PlaceableObject._getTargetAlpha`.

### _initializeDragLeft

```typescript
_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the left-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**  
`void`

Inherited from `PlaceableObject._initializeDragLeft`.

### _initializeDragRight

```typescript
_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the right-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**  
`void`

Inherited from `PlaceableObject._initializeDragRight`.

### _onClickLeft

```typescript
_onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-click event to assume control of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering canvas interaction event.

**Returns**  
`void`

Inherited from `PlaceableObject._onClickLeft`.

### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double left-click event to activate.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

Inherited from `PlaceableObject._onClickLeft2`.

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double right-click event to configure properties of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

Inherited from `PlaceableObject._onClickRight2`.

### _onControl

```typescript
_onControl(options: object): void
```

Additional events which trigger once control of the object is established.

**Parameters**

- **options**: `object`  
  Optional parameters which apply for specific implementations.

**Returns**  
`void`

Inherited from `PlaceableObject._onControl`.

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a mouse-move operation. If `false`, the cancellation is prevented.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean | void`

Inherited from `PlaceableObject._onDragLeftCancel`.

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`undefined | false`

Inherited from `PlaceableObject._onDragLeftDrop`.

### _onDragLeftStart

```typescript
_onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur when a mouse-drag action is first begun. If `false`, the start is prevented.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean | void`

Inherited from `PlaceableObject._onDragLeftStart`.

### _onDragRightCancel

```typescript
_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a right mouse-drag operation. If `false`, the cancellation is prevented.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean | void`

Inherited from `PlaceableObject._onDragRightCancel`.

### _onDragRightDrop

```typescript
_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

Inherited from `PlaceableObject._onDragRightDrop`.

### _onDragRightMove

```typescript
_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

Inherited from `PlaceableObject._onDragRightMove`.

### _onDragRightStart

```typescript
_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation. If `false`, the start is prevented.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`false | void`

Inherited from `PlaceableObject._onDragRightStart`.

### _onDragStart

```typescript
_onDragStart(): void
```

Begin a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (`_original`) object.

**Returns**  
`void`

Inherited from `PlaceableObject._onDragStart`.

### _onHoverIn

```typescript
_onHoverIn(
    event: FederatedEvent<UIEvent | PixiTouch>,
    options?: { hoverOutOthers?: boolean },
): void
```

Actions that should be taken for this Placeable Object when a mouseover event occurs. Hover events on PlaceableObject instances allow event propagation by default.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`
- **options** (optional):  
  - **hoverOutOthers?**: `boolean` - Trigger hover-out behavior on sibling objects.

**Returns**  
`void`

Inherited from `PlaceableObject._onHoverIn`.

### _onHoverOut

```typescript
_onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Actions that should be taken for this Placeable Object when a mouseout event occurs.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

Inherited from `PlaceableObject._onHoverOut`.

### _onLongPress

```typescript
_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any
```

Callback action which occurs on a long press.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`
- **origin**: `Point` - The local canvas coordinates of the mousepress.

**Returns**  
`any`

Inherited from `PlaceableObject._onLongPress`.

### _onRelease

```typescript
_onRelease(options: object): void
```

Additional events which trigger once control of the object is released.

**Parameters**

- **options**: `object` - Options which modify the releasing workflow.

**Returns**  
`void`

Inherited from `PlaceableObject._onRelease`.

### _onUnclickLeft

```typescript
_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-unclick event to assume control of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

Inherited from `PlaceableObject._onUnclickLeft`.

### _onUnclickRight

```typescript
_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-unclick event.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`void`

Inherited from `PlaceableObject._onUnclickRight`.

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: Rectangle): boolean
```

Is this PlaceableObject within the selection rectangle?

**Parameters**

- **rectangle**: `Rectangle` - The selection rectangle.

**Returns**  
`boolean`

Inherited from `PlaceableObject._overlapsSelection`.

### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(
    event: FederatedEvent<UIEvent | PixiTouch>,
): null | object[] | [updates: object[], options?: object]
```

Perform the database updates that should occur as the result of a drag-left-drop operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>` - The triggering canvas interaction event.

**Returns**  
`null | object[] | [object[], options?]` - An array of database updates to perform for documents in this collection.

Inherited from `PlaceableObject._prepareDragLeftDropUpdates`.

### _propagateLeftClick

```typescript
_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate left click downstream?

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._propagateLeftClick`.

### _propagateRightClick

```typescript
_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate right click downstream?

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`boolean`

Inherited from `PlaceableObject._propagateRightClick`.

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

Refresh the shape of the sound field-of-effect. This is refreshed when the SoundSource field-of-vision polygon changes.

**Returns**  
`void`

### _refreshPosition

```typescript
_refreshPosition(): void
```

Refresh the position of the AmbientSound. Called when the coordinates change.

**Returns**  
`void`

### _refreshState

```typescript
_refreshState(): void
```

Refresh the state of the light. Called when the disabled state or darkness conditions change.

**Returns**  
`void`

---

### #onDragRightStart

```typescript
"#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**  
`false | void`

If `false`, the start is prevented.

Inherited from `PlaceableObject.#onDragRightStart`.

---

For complete class reference, see the [AmbientSound API Documentation](https://foundryvtt.com/api/classes/foundry.canvas.placeables.AmbientSound.html).