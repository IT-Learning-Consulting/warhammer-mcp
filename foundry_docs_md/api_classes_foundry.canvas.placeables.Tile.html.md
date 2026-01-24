# Class Tile

A Tile is an implementation of [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) which represents a static piece of artwork or prop within the Scene.

See also:  
- [foundry.documents.TileDocument](https://foundryvtt.com/api/classes/foundry.documents.TileDocument.html)  
- [foundry.canvas.layers.TilesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TilesLayer.html)  

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.Tile)):

- *PlaceableObject*
- **Tile**

---

## Constructors

### constructor

```typescript
new Tile(document: CanvasDocument): canvas.placeables.Tile
```

**Parameters**

- **document**: `CanvasDocument`  
  The Document instance represented by this object

---

## Properties

- **bg**: `Graphics`  
  A Tile background which is displayed if no valid image texture is present

- **controlIcon**: `null | ControlIcon`  
  A control icon for interacting with the object  
  *Inherited from [PlaceableObject.controlIcon](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon)*

- **document**: `CanvasDocument`  
  A reference to the Scene embedded Document instance which this object represents  
  *Inherited from [PlaceableObject.document](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document)*

- **frame**: `Container<DisplayObject>`  
  The Tile border frame

- **mesh**: `PrimarySpriteMesh`  
  A reference to the SpriteMesh which displays this Tile in the PrimaryCanvasGroup.

- **mouseInteractionManager**: `MouseInteractionManager`  
  A mouse interaction manager instance which handles mouse workflows related to this object.  
  *Inherited from [PlaceableObject.mouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager)*

- **renderFlags**: `RenderFlags`  
  Status flags which are applied at render-time to update the PlaceableObject.  
  If an object defines RenderFlags, it should at least include flags for `"redraw"` and `"refresh"`.  
  *Inherited from [PlaceableObject.renderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags)*

- **scene**: `documents.Scene`  
  Retain a reference to the Scene within which this Placeable Object resides  
  *Inherited from [PlaceableObject.scene](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene)*

- **texture**: `Texture<Resource>`  
  The primary tile image texture

---

## Static Properties

- **embeddedName**: `string = "Tile"`  
  Identify the official Document name for this PlaceableObject class  
  Overrides [PlaceableObject.embeddedName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname)

- **RENDER_FLAG_PRIORITY**: `string = "OBJECTS"`  
  The ticker priority when RenderFlags of this class are handled. Valid values are `OBJECTS` or `PERCEPTION`.  
  *Inherited from [PlaceableObject.RENDER_FLAG_PRIORITY](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority)*

- **RENDER_FLAGS**:  
```typescript
{
  redraw: { propagate: string[] };
  refresh: { alias: boolean; propagate: string[] };
  refreshElevation: { propagate: string[] };
  refreshFrame: {};
  refreshMesh: {};
  refreshPerception: {};
  refreshPosition: { propagate: string[] };
  refreshRotation: { propagate: string[] };
  refreshShape: {
    deprecated: { alias: boolean; since: number; until: number };
    propagate: string[];
  };
  refreshSize: { propagate: string[] };
  refreshState: { propagate: string[] };
  refreshTransform: { alias: boolean; propagate: string[] };
  refreshVideo: {};
}
```
Overrides [PlaceableObject.RENDER_FLAGS](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags)

---

## Accessors

- **_original**: `undefined | PlaceableObject`  
  The object that this object is a preview of if this object is a preview.  
  *Inherited from PlaceableObject._original*

- **aspectRatio**: `number`  
  Get the native aspect ratio of the base texture for the Tile sprite

- **bounds**: `any`  
  Overrides PlaceableObject.bounds

- **center**: `Point`  
  The central coordinate pair of the placeable object based on its own width and height  
  *Inherited from PlaceableObject.center*

- **controlled**: `boolean`  
  An indicator for whether the object is currently controlled  
  *Inherited from PlaceableObject.controlled*

- **hasActiveHUD**: `boolean`  
  Is the HUD display active for this Placeable?  
  *Inherited from PlaceableObject.hasActiveHUD*

- **hasPreview**: `boolean`  
  Does there exist a temporary preview of this placeable object?  
  *Inherited from PlaceableObject.hasPreview*

- **hover**: `boolean`  
  An indicator for whether the object is currently a hover target  
  *Inherited from PlaceableObject.hover*

- **id**: `string`  
  The id of the corresponding Document which this PlaceableObject represents.  
  *Inherited from PlaceableObject.id*

- **interactionState**:  
```typescript
undefined | {
  CLICKED: number;
  DRAG: number;
  DROP: number;
  GRABBED: number;
  HOVER: number;
  NONE: number;
}
```
  The mouse interaction state of this placeable.  
  *Inherited from PlaceableObject.interactionState*

- **isOwner**: `boolean`  
  A convenient reference for whether the current User has full control over the document.  
  *Inherited from PlaceableObject.isOwner*

- **isPreview**: `boolean`  
  Is this placeable object a temporary preview?  
  *Inherited from PlaceableObject.isPreview*

- **isVideo**: `boolean`  
  Does this Tile depict an animated video texture?

- **isVisible**: `boolean`  
  Is this Tile currently visible on the Canvas?

- **layer**: `PlaceablesLayer`  
  Provide a reference to the CanvasLayer which contains this PlaceableObject.  
  *Inherited from PlaceableObject.layer*

- **objectId**: `string`  
  A unique identifier which is used to uniquely identify elements on the canvas related to this object.  
  *Inherited from PlaceableObject.objectId*

- **occluded**: `boolean`  
  Is this tile occluded?

- **playing**: `boolean`  
  Is the tile video playing?

- **sheet**: `DocumentSheetV2`  
  A document sheet used to configure the properties of this Placeable Object or the Document it represents.  
  *Inherited from PlaceableObject.sheet*

- **sourceElement**: `HTMLImageElement | HTMLVideoElement`  
  The HTML source element for the primary Tile texture

- **sourceId**: `string`  
  The named identifier for the source object associated with this PlaceableObject.  
  This differs from the objectId because the sourceId is the same for preview objects as for the original.  
  *Inherited from PlaceableObject.sourceId*

- **volume**: `number`  
  The effective volume at which this Tile should be playing, including the global ambient volume modifier

- **implementation**: `typeof PlaceableObject`  
  Return a reference to the configured subclass of this base PlaceableObject type.  
  *Inherited from PlaceableObject.implementation*

---

## Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

**Parameters**

- **flags**: `any`

**Returns**

- `void`

Overrides [PlaceableObject._applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyrenderflags)

---

### _destroy

```typescript
_destroy(options: any): void
```

The inner `_destroy` method which may optionally be defined by each PlaceableObject subclass.

**Parameters**

- **options**: `any`  
  Options passed to the initial destroy call

**Returns**

- `void`

Overrides [PlaceableObject._destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_destroy)

---

### _draw

```typescript
_draw(options?: {}): Promise<void>
```

**Parameters**

- **options**: `{}` = `{}` (optional)

**Returns**

- `Promise<void>`

Overrides [PlaceableObject._draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_draw)

---

### _onClickLeft

```typescript
_onClickLeft(event: any): void
```

Callback actions which occur on a single left-click event to assume control of the object.

**Parameters**

- **event**: `any`  
  The triggering canvas interaction event

**Returns**

- `void`

Overrides [PlaceableObject._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft)

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: any): boolean | void
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: `any`  
  The triggering mouse click event

**Returns**

- `boolean | void`  
  If false, the cancellation is prevented

Overrides [PlaceableObject._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftcancel)

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: any): false | void
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: `any`  
  The triggering canvas interaction event

**Returns**

- `false | void`

Overrides [PlaceableObject._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftdrop)

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

Callback actions which occur on a mouse-move operation.

**Parameters**

- **event**: `any`  
  The triggering canvas interaction event

**Returns**

- `void`

Overrides [PlaceableObject._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftmove)

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: any): boolean | void
```

Callback actions which occur when a mouse-drag action is first begun.

**Parameters**

- **event**: `any`  
  The triggering canvas interaction event

**Returns**

- `boolean | void`  
  If false, the start is prevented

Overrides [PlaceableObject._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftstart)

---

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

- `void`

Overrides [PlaceableObject._onUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onupdate)

---

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: any): any
```

**Parameters**

- **rectangle**: `any`

**Returns**

- `any`

Overrides [PlaceableObject._overlapsSelection](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_overlapsselection)

---

### activateListeners

```typescript
activateListeners(): void
```

Activate interactivity for the Placeable Object.

**Returns**

- `void`

Overrides [PlaceableObject.activateListeners](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activatelisteners)

---

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

**Returns**

- `void`

Inherited from [PlaceableObject.applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyrenderflags)

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

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Must be equal to `game.user`.

- **action**:  
  The named action being attempted; one of:  
  `"update"`, `"delete"`, `"create"`, `"view"`, `"control"`, `"configure"`, `"hover"`, `"drag"`, `"HUD"`

**Returns**

- `boolean`  
  Does the User have rights to perform the action?

Inherited from [PlaceableObject.can](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can)

---

### clear

```typescript
clear(options: any): void
```

Clear the display of the existing object.

**Parameters**

- **options**: `any`

**Returns**

- `void`

Overrides [PlaceableObject.clear](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear)

---

### clone

```typescript
clone(): PlaceableObject
```

Clone the placeable object, returning a new object with identical attributes.  
The returned object is non-interactive, and has no assigned ID.  
If you plan to use it permanently you should call the create method.

**Returns**

- `PlaceableObject`  
  A new object with identical data

Inherited from [PlaceableObject.clone](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone)

---

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.

**Parameters (Optional)**

- **options**:  
  Additional options which modify the control request.

- **releaseOthers?**: `boolean` (optional)  
  Release any other controlled objects first

**Returns**

- `boolean`  
  A flag denoting whether control was successful

Inherited from [PlaceableObject.control](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control)

---

### destroy

```typescript
destroy(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**

- `any`

Inherited from [PlaceableObject.destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy)

---

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

Draw the placeable object into its parent container.

**Parameters (Optional)**

- **options**: `object` = `{}`  
  Options which may modify the draw and refresh workflow

**Returns**

- `Promise<PlaceableObject>`  
  The drawn object

Inherited from [PlaceableObject.draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw)

---

### getSnappedPosition

```typescript
getSnappedPosition(position?: any): Point
```

Get the snapped position for a given position or the current position.

**Parameters (Optional)**

- **position**: `any`  
  The position to be used instead of the current position

**Returns**

- `Point`  
  The snapped position

Inherited from [PlaceableObject.getSnappedPosition](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getsnappedposition)

---

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

Refresh all incremental render flags for the PlaceableObject.  
This method is no longer used by the core software but provided for backwards compatibility.

**Parameters (Optional)**

- **options**: `object` = `{}`  
  Options which may modify the refresh workflow

**Returns**

- `PlaceableObject`  
  The refreshed object

Inherited from [PlaceableObject.refresh](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh)

---

### release

```typescript
release(options?: object): boolean
```

Release control over a PlaceableObject, removing it from the controlled set.

**Parameters (Optional)**

- **options**: `object` = `{}`  
  Options which modify the releasing workflow

**Returns**

- `boolean`  
  A Boolean flag confirming the object was released.

Inherited from [PlaceableObject.release](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release)

---

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

Rotate the PlaceableObject to a certain angle of facing.

**Parameters**

- **angle**: `number`  
  The desired angle of rotation

- **snap**: `number`  
  Snap the angle of rotation to a certain target degree increment

**Returns**

- `Promise<PlaceableObject>`  
  The rotated object

Inherited from [PlaceableObject.rotate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate)

---

### Protected Methods

#### _canConfigure

```typescript
_canConfigure(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to configure the Placeable Object?

**Parameters**

- **user**: `documents.User`  
  The User performing the action. Always equal to `game.user`.

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)  
  The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).

**Returns**

- `boolean`

Inherited from [PlaceableObject._canConfigure](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canconfigure)

---

#### _canControl

```typescript
_canControl(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to control the Placeable Object?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancontrol)

---

#### _canCreate

```typescript
_canCreate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to create the underlying Document?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancreate)

---

#### _canDelete

```typescript
_canDelete(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to delete the underlying Document?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candelete)

---

#### _canDrag

```typescript
_canDrag(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to drag this Placeable Object?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canDrag](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candrag)

---

#### _canDragLeftStart

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

- `boolean`

Inherited from [PlaceableObject._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candragleftstart)

---

#### _canHover

```typescript
_canHover(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to hover on this Placeable Object?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canHover](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhover)

---

#### _canHUD

```typescript
_canHUD(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Can the User access the HUD for this Placeable Object?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canHUD](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhud)

---

#### _canUpdate

```typescript
_canUpdate(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to update the underlying Document?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canupdate)

---

#### _canView

```typescript
_canView(
  user: documents.User,
  event?: FederatedEvent<UIEvent | PixiTouch>,
): boolean
```

Does the User have permission to view details of the Placeable Object?

**Parameters**

- **user**: `documents.User`

- **event?**: `FederatedEvent<UIEvent | PixiTouch>` (optional)

**Returns**

- `boolean`

Inherited from [PlaceableObject._canView](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canview)

---

#### _createInteractionManager

```typescript
_createInteractionManager(): MouseInteractionManager
```

Create a standard MouseInteractionManager for the PlaceableObject.

**Returns**

- `MouseInteractionManager`

Inherited from [PlaceableObject._createInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_createinteractionmanager)

---

#### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the left-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The triggering mouse click event

**Returns**

- `void`

Inherited from [PlaceableObject._finalizeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragleft)

---

#### _finalizeDragRight

```typescript
_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Finalize the right-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._finalizeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragright)

---

#### _getTargetAlpha

```typescript
_getTargetAlpha(): number
```

Get the target opacity that should be used for a Placeable Object depending on its preview state.

**Returns**

- `number`

Inherited from [PlaceableObject._getTargetAlpha](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_gettargetalpha)

---

#### _initializeDragLeft

```typescript
_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the left-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._initializeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragleft)

---

#### _initializeDragRight

```typescript
_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Initialize the right-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._initializeDragRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragright)

---

#### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double left-click event to activate.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft2)

---

#### _onClickRight

```typescript
_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-click event to configure properties of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright)

---

#### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a double right-click event to configure properties of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright2)

---

#### _onControl

```typescript
_onControl(options: object): void
```

Additional events which trigger once control of the object is established.

**Parameters**

- **options**: `object`  
  Optional parameters which apply for specific implementations

**Returns**

- `void`

Inherited from [PlaceableObject._onControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncontrol)

---

#### _onCreate

```typescript
_onCreate(data: object, options: object, userId: string): void
```

Register pending canvas operations which should occur after a new PlaceableObject of this type is created.

**Parameters**

- **data**: `object`  
- **options**: `object`  
- **userId**: `string`

**Returns**

- `void`

Inherited from [PlaceableObject._onCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncreate)

---

#### _onDelete

```typescript
_onDelete(options: object, userId: string): void
```

Define additional steps taken when an existing placeable object of this type is deleted.

**Parameters**

- **options**: `object`  
- **userId**: `string`

**Returns**

- `void`

Inherited from [PlaceableObject._onDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondelete)

---

#### _onDragEnd

```typescript
_onDragEnd(): void
```

Conclude a drag operation from the perspective of the preview clone.  
Modify the appearance of both the clone (`this`) and the original (`_original`) object.

**Returns**

- `void`

Inherited from [PlaceableObject._onDragEnd](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragend)

---

#### _onDragRightCancel

```typescript
_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `boolean | void`  
  If false, the cancellation is prevented

Inherited from [PlaceableObject._onDragRightCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightcancel)

---

#### _onDragRightDrop

```typescript
_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onDragRightDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightdrop)

---

#### _onDragRightMove

```typescript
_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onDragRightMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightmove)

---

#### _onDragRightStart

```typescript
_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `false | void`  
  If false, the start is prevented

Inherited from [PlaceableObject._onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragrightstart)

---

#### _onDragStart

```typescript
_onDragStart(): void
```

Begin a drag operation from the perspective of the preview clone.  
Modify the appearance of both the clone (`this`) and the original (`_original`) object.

**Returns**

- `void`

Inherited from [PlaceableObject._onDragStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragstart)

---

#### _onHandleDragCancel

```typescript
_onHandleDragCancel(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle cancellation of a drag event for one of the resizing handles.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

---

#### _onHandleDragDrop

```typescript
_onHandleDragDrop(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle mouseup after dragging a tile scale handler.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

---

#### _onHandleDragMove

```typescript
_onHandleDragMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle mousemove while dragging a tile scale handler.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

---

#### _onHandleDragStart

```typescript
_onHandleDragStart(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle the beginning of a drag event on a resize handle.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

---

#### _onHandleHoverIn

```typescript
_onHandleHoverIn(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle mouse-over event on a control handle.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

---

#### _onHandleHoverOut

```typescript
_onHandleHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle mouse-out event on a control handle.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

---

#### _onHoverIn

```typescript
_onHoverIn(
  event: FederatedEvent<UIEvent | PixiTouch>,
  options?: { hoverOutOthers?: boolean },
): void
```

Actions that should be taken for this Placeable Object when a mouseover event occurs.  
Hover events on PlaceableObject instances allow event propagation by default.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

- **options**: `{ hoverOutOthers?: boolean } = {}` (optional)  
  Options which customize event handling.

**Returns**

- `void`

Inherited from [PlaceableObject._onHoverIn](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverin)

---

#### _onHoverOut

```typescript
_onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Actions that should be taken for this Placeable Object when a mouseout event occurs.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onHoverOut](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverout)

---

#### _onLongPress

```typescript
_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any
```

Callback action which occurs on a long press.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`
- **origin**: `Point`  
  The local canvas coordinates of the mouse press.

**Returns**

- `any`

Inherited from [PlaceableObject._onLongPress](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onlongpress)

---

#### _onRelease

```typescript
_onRelease(options: object): void
```

Additional events which trigger once control of the object is released.

**Parameters**

- **options**: `object`  
  Options which modify the releasing workflow

**Returns**

- `void`

Inherited from [PlaceableObject._onRelease](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onrelease)

---

#### _onUnclickLeft

```typescript
_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single left-unclick event to assume control of the object.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onUnclickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickleft)

---

#### _onUnclickRight

```typescript
_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Callback actions which occur on a single right-unclick event.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `void`

Inherited from [PlaceableObject._onUnclickRight](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onunclickright)

---

#### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(
  event: FederatedEvent<UIEvent | PixiTouch>,
): null | object[] | [updates: object[], options?: object]
```

Perform the database updates that should occur as the result of a drag-left-drop operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `null | object[] | [updates: object[], options?: object]`  
  An array of database updates to perform for documents in this collection

Inherited from [PlaceableObject._prepareDragLeftDropUpdates](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_preparedragleftdropupdates)

---

#### _propagateLeftClick

```typescript
_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate left click downstream?

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `boolean`

Inherited from [PlaceableObject._propagateLeftClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateleftclick)

---

#### _propagateRightClick

```typescript
_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

Should the placeable propagate right click downstream?

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `boolean`

Inherited from [PlaceableObject._propagateRightClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagaterightclick)

---

#### _refreshElevation

```typescript
_refreshElevation(): void
```

Refresh the elevation.

**Returns**

- `void`

---

#### _refreshFrame

```typescript
_refreshFrame(): void
```

Refresh the border frame that encloses the Tile.

**Returns**

- `void`

---

#### _refreshMesh

```typescript
_refreshMesh(): void
```

Refresh the appearance of the tile.

**Returns**

- `void`

---

#### _refreshPosition

```typescript
_refreshPosition(): void
```

Refresh the position.

**Returns**

- `void`

---

#### _refreshRotation

```typescript
_refreshRotation(): any
```

Refresh the rotation.

**Returns**

- `any`

---

#### _refreshSize

```typescript
_refreshSize(): undefined | Graphics
```

Refresh the size.

**Returns**

- `undefined | Graphics`

---

#### _refreshState

```typescript
_refreshState(): void
```

Refresh the displayed state of the Tile.  
Updated when the tile interaction state changes, when it is hidden, or when its elevation changes.

**Returns**

- `void`

---

#### _refreshVideo

```typescript
_refreshVideo(): void
```

Refresh changes to the video playback state.

**Returns**

- `void`

---

#### #onDragRightStart

```typescript
"#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

Callback actions which occur on a right mouse-drag operation.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns**

- `false | void`  
  If false, the start is prevented

Inherited from [PlaceableObject.#onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#ondragrightstart)

---

## Static Methods

### createPreview

```typescript
static createPreview(data: object): PlaceableObject
```

Create a preview tile with a background texture instead of an image.

**Parameters**

- **data**: `object`  
  Initial data with which to create the preview Tile

**Returns**

- `PlaceableObject`