# Wall | Foundry Virtual Tabletop - API Documentation - Version 13

A **Wall** is an implementation of [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html) which represents a physical or visual barrier within the Scene. Walls are used to restrict Token movement or visibility as well as to define the areas of effect for ambient lights and sounds.

**See also**:  
- [foundry.documents.WallDocument](https://foundryvtt.com/api/classes/foundry.documents.WallDocument.html)  
- [foundry.canvas.layers.WallsLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.WallsLayer.html)  

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.Wall)):  
- *PlaceableObject*  
- **Wall**  

---

## Properties

### controlIcon  
`controlIcon: null | [ControlIcon](https://foundryvtt.com/api/classes/foundry.canvas.containers.ControlIcon.html)`  
A control icon for interacting with the object.  
Inherited from [PlaceableObject.controlIcon](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon).

### directionIcon  
`directionIcon: null | Sprite`  
The icon that indicates the direction of the Wall.

### document  
`document: CanvasDocument`  
A reference to the Scene embedded Document instance which this object represents.  
Inherited from [PlaceableObject.document](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document).

### doorControl  
`doorControl: any`  
A reference to the Door Control icon associated with this Wall, if any.

### endpoints  
`endpoints: Graphics`  
The endpoints of the Wall line segment.

### highlight  
`highlight: Graphics`  
A Graphics object used to highlight this wall segment. Only used when the wall is controlled.

### line  
`line: Graphics`  
The line segment that represents the Wall.

### mouseInteractionManager  
`mouseInteractionManager: [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html)`  
A mouse interaction manager instance which handles mouse workflows related to this object.  
Inherited from [PlaceableObject.mouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager).

### renderFlags  
`renderFlags: [RenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.interaction.RenderFlags.html)`  
Status flags applied at render-time to update the PlaceableObject. Includes flags for "redraw" and "refresh".  
Inherited from [PlaceableObject.renderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags).

### scene  
`scene: [documents.Scene](https://foundryvtt.com/api/modules/foundry.documents.html#Scene)`  
A reference to the Scene within which this Placeable Object resides.  
Inherited from [PlaceableObject.scene](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene).

---

## Static Properties

### embeddedName  
`embeddedName: string = "Wall"`  
Identify the official Document name for this PlaceableObject class.  
Overrides [PlaceableObject.embeddedName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname).

### RENDER_FLAG_PRIORITY  
`RENDER_FLAG_PRIORITY: string = "OBJECTS"`  
The ticker priority when RenderFlags of this class are handled. Valid values are `OBJECTS` or `PERCEPTION`.  
Inherited from [PlaceableObject.RENDER_FLAG_PRIORITY](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority).

### RENDER_FLAGS  
```typescript
RENDER_FLAGS: {
    redraw: { propagate: string[] };
    refresh: { alias: boolean; propagate: string[] };
    refreshDirection: {};
    refreshEndpoints: {};
    refreshHighlight: {};
    refreshLine: { propagate: string[] };
    refreshState: { propagate: string[] };
} = ...
```
Overrides [PlaceableObject.RENDER_FLAGS](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags).

---

## Accessors

### _original  
`get _original(): undefined | PlaceableObject`  
The object that this object is a preview of if this object is a preview.  
Inherited from PlaceableObject._original.

### bounds  
`get bounds(): any`  
The bounding box for this PlaceableObject. Required if the layer uses a Quadtree, otherwise optional.  
Overrides PlaceableObject.bounds.

### center  
`get center(): Point`  
The central coordinate pair of the placeable object based on its own width and height.  
Overrides PlaceableObject.center.

### controlled  
`get controlled(): boolean`  
Indicates whether the object is currently controlled.  
Inherited from PlaceableObject.controlled.

### coords  
`get coords(): number[]`  
A convenience reference to the coordinates array for the Wall endpoints, `[x0, y0, x1, y1]`.

### direction  
`get direction(): null | number`  
Get the direction of effect for a directional Wall.

### doorMeshes  
`get doorMeshes(): Set<DoorMesh>`  
A set of optional DoorMesh instances used to render a door animation for this Wall.

### edge  
`get edge(): Edge`  
The Edge instance which represents this Wall. Re-created when data for the Wall changes.

### hasActiveHUD  
`get hasActiveHUD(): boolean`  
Is the HUD display active for this Placeable?  
Inherited from PlaceableObject.hasActiveHUD.

### hasDoorMesh  
`get hasDoorMesh(): boolean`  
Should this Wall have a corresponding DoorMesh?

### hasPreview  
`get hasPreview(): boolean`  
Does there exist a temporary preview of this placeable object?  
Inherited from PlaceableObject.hasPreview.

### hover  
`get hover(): boolean`  
Indicates whether the object is currently a hover target.  
Inherited from PlaceableObject.hover.

### id  
`get id(): string`  
The id of the corresponding Document which this PlaceableObject represents.  
Inherited from PlaceableObject.id.

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
Inherited from PlaceableObject.interactionState.

### isDoor  
`get isDoor(): boolean`  
True if this wall contains a door.

### isOpen  
`get isOpen(): boolean`  
True if the wall contains an open door.

### isOwner  
`get isOwner(): boolean`  
Indicates whether the current User has full control over the document.  
Inherited from PlaceableObject.isOwner.

### isPreview  
`get isPreview(): boolean`  
True if this placeable object is a temporary preview.  
Inherited from PlaceableObject.isPreview.

### layer  
`get layer(): PlaceablesLayer`  
Reference to the CanvasLayer which contains this PlaceableObject.  
Inherited from PlaceableObject.layer.

### midpoint  
`get midpoint(): number[]`  
Returns the coordinates `[x, y]` at the midpoint of the wall segment.

### objectId  
`get objectId(): string`  
A unique identifier used to identify elements on the canvas related to this object.  
Inherited from PlaceableObject.objectId.

### sheet  
`get sheet(): DocumentSheetV2`  
A document sheet used to configure properties of this Placeable Object or the Document it represents.  
Inherited from PlaceableObject.sheet.

### soundRadius  
`get soundRadius(): number`  
Customize the audible radius of sounds emitted by this wall, e.g., when a door opens or closes.

### sourceId  
`get sourceId(): string`  
The named identifier for the source object associated with this PlaceableObject. Differs from `objectId` because the `sourceId` is the same for preview objects as for the original.  
Inherited from PlaceableObject.sourceId.

### implementation  
`static get implementation(): typeof PlaceableObject`  
Returns a reference to the configured subclass of this base PlaceableObject type.  
Inherited from PlaceableObject.implementation.

---

## Methods

### _applyRenderFlags  
```typescript
_applyRenderFlags(flags: any): void
```
Overrides PlaceableObject._applyRenderFlags.  
**Parameters:**  
- **flags**: *any*  
**Returns:** void  

### _canControl  
```typescript
_canControl(user: any, event: any): boolean
```
Does the User have permission to control the Placeable Object?  
Overrides PlaceableObject._canControl.  
**Parameters:**  
- **user**: *any* - The User performing the action. Always equal to `game.user`.  
- **event**: *any* - The pointer event if this function was called by [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).  
**Returns:** boolean

### _destroy  
```typescript
_destroy(options: any): void
```
Overrides PlaceableObject._destroy.  
**Parameters:**  
- **options**: *any*  
**Returns:** void

### _draw  
```typescript
_draw(options: any): Promise<void>
```
Overrides PlaceableObject._draw.  
**Parameters:**  
- **options**: *any*  
**Returns:** Promise<void>

### _onClickLeft  
```typescript
_onClickLeft(event: any): boolean | void
```
Callback on single left-click event to assume control of the object.  
Overrides PlaceableObject._onClickLeft.  
**Parameters:**  
- **event**: *any* - The triggering canvas interaction event.  
**Returns:** boolean | void

### _onClickLeft2  
```typescript
_onClickLeft2(event: any): void
```
Overrides PlaceableObject._onClickLeft2.  
**Parameters:**  
- **event**: *any*  
**Returns:** void

### _onClickRight2  
```typescript
_onClickRight2(event: any): void
```
Overrides PlaceableObject._onClickRight2.  
**Parameters:**  
- **event**: *any*  
**Returns:** void

### _onCreate  
```typescript
_onCreate(data: any, options: any, userId: any): void
```
Register pending canvas operations after creating a new PlaceableObject of this type.  
Overrides PlaceableObject._onCreate.  
**Parameters:**  
- **data**: *any*  
- **options**: *any*  
- **userId**: *any*  
**Returns:** void

### _onDelete  
```typescript
_onDelete(options: any, userId: any): void
```
Steps to take when deleting a placeable object of this type.  
Overrides PlaceableObject._onDelete.  
**Parameters:**  
- **options**: *any*  
- **userId**: *any*  
**Returns:** void

### _onDragLeftMove  
```typescript
_onDragLeftMove(event: any): void
```
Overrides PlaceableObject._onDragLeftMove.  
**Parameters:**  
- **event**: *any*  
**Returns:** void

### _onDragLeftStart  
```typescript
_onDragLeftStart(event: any): boolean | void
```
Callback on start of a mouse left-drag action. Prevent if returns false.  
Overrides PlaceableObject._onDragLeftStart.  
**Parameters:**  
- **event**: *any* - The triggering canvas interaction event.  
**Returns:** boolean | void

### _onHoverIn  
```typescript
_onHoverIn(event: any, options: any): false | void
```
Actions on mouseover for Placeable Object, allows event propagation. Overrides PlaceableObject._onHoverIn.  
**Parameters:**  
- **event**: *any*  
- **options**: *any*  
**Returns:** false | void

### _onHoverOut  
```typescript
_onHoverOut(event: any): void
```
Actions on mouseout for Placeable Object. Overrides PlaceableObject._onHoverOut.  
**Parameters:**  
- **event**: *any*  
**Returns:** void

### _onUpdate  
```typescript
_onUpdate(changed: any, options: any, userId: any): void
```
Steps taken when an existing placeable object is updated. Overrides PlaceableObject._onUpdate.  
**Parameters:**  
- **changed**: *any*  
- **options**: *any*  
- **userId**: *any*  
**Returns:** void

### _overlapsSelection  
```typescript
_overlapsSelection(rectangle: any): boolean
```
Overrides PlaceableObject._overlapsSelection.  
**Parameters:**  
- **rectangle**: *any*  
**Returns:** boolean

### _pasteObject  
```typescript
_pasteObject(offset: any, options: any): any
```
Overrides PlaceableObject._pasteObject.  
**Parameters:**  
- **offset**: *any*  
- **options**: *any*  
**Returns:** any

### _prepareDragLeftDropUpdates  
```typescript
_prepareDragLeftDropUpdates(event: any): null | { _id: any; c: any }[]
```
Overrides PlaceableObject._prepareDragLeftDropUpdates.  
**Parameters:**  
- **event**: *any*  
**Returns:** null | array of objects `{ _id, c }`

### activateListeners  
```typescript
activateListeners(): void
```
Activate interactivity for the Placeable Object.  
Inherited from [PlaceableObject.activateListeners](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activatelisteners).

### applyRenderFlags  
```typescript
applyRenderFlags(): void
```
Apply render flags to update the object.  
Inherited from [PlaceableObject.applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyrenderflags).

### can  
```typescript
can(
  user: documents.User,
  action: "update" | "delete" | "create" | "view" | "control" | "configure" | "hover" | "drag" | "HUD"
): boolean
```
Test whether a user can perform an interaction.  
Inherited from [PlaceableObject.can](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can).  
**Parameters:**  
- **user**: *User* — The User performing the action. Must be equal to `game.user`.  
- **action**: *string* — The named action being attempted.  
**Returns:** boolean  

### canRayIntersect  
```typescript
canRayIntersect(ray: Ray): boolean
```
Test whether a Ray can intersect a directional wall.  
**Parameters:**  
- **ray**: *Ray* — The ray to test.  
**Returns:** boolean

### clear  
```typescript
clear(): PlaceableObject
```
Clear the object state. Overrides [PlaceableObject.clear](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear).  
**Returns:** PlaceableObject

### clearDoorControl  
```typescript
clearDoorControl(): void
```
Clear the door control if it exists.

### clone  
```typescript
clone(): PlaceableObject
```
Clone the placeable object as a non-interactive object with no ID.  
Inherited from [PlaceableObject.clone](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone).  
**Returns:** PlaceableObject

### control  
```typescript
control(__namedParameters?: { chain?: boolean }): boolean
```
Assume control of the PlaceableObject, flagging it as controlled to enable downstream behaviors.  
Overrides [PlaceableObject.control](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control).  
**Parameters:**  
- **__namedParameters** (optional):  
  - **chain?**: boolean — Additional control options.  
**Returns:** boolean  

### createDoorControl  
```typescript
createDoorControl(): DoorControl
```
Draw a control icon to manipulate the door's state.  
**Returns:** DoorControl

### createDoorMeshes  
```typescript
createDoorMeshes(): Promise<void>
```
Create and add a DoorMesh to the PrimaryCanvasContainer.  
**Returns:** Promise<void>

### destroy  
```typescript
destroy(options: any): any
```
Inherited from [PlaceableObject.destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy).  
**Parameters:**  
- **options**: any  
**Returns:** any  

### destroyDoorMeshes  
```typescript
destroyDoorMeshes(): void
```
Remove and destroy the DoorMesh from the PrimaryCanvasContainer.

### draw  
```typescript
draw(options?: object): Promise<PlaceableObject>
```
Draw the placeable object into its parent container.  
Inherited from [PlaceableObject.draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw).  
**Parameters:**  
- **options** (optional): object — Options to modify draw/refresh workflow.  
**Returns:** Promise<PlaceableObject>  

### getLinkedSegments  
```typescript
getLinkedSegments(): Object
```
Get an array of Wall objects linked by common coordinates.  
**Returns:** Object describing ids and endpoints of linked segments.

### getSnappedPosition  
```typescript
getSnappedPosition(position: any): void
```
Overrides [PlaceableObject.getSnappedPosition](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getsnappedposition).  
**Parameters:**  
- **position**: any  
**Returns:** void

### initializeEdge  
```typescript
initializeEdge(options?: { deleted?: boolean }): void
```
Initialize the Edge that represents this Wall.  
**Parameters:**  
- **options** (optional):  
  - **deleted?**: boolean — Has the edge been deleted?  
**Returns:** void

### isDirectionBetweenAngles  
```typescript
isDirectionBetweenAngles(lower: number, upper: number): boolean
```
Test whether Wall direction lies between two angles. Used for collision/vision checks for one-directional walls.  
**Parameters:**  
- **lower**: number — Lower-bound angle (radians).  
- **upper**: number — Upper-bound angle (radians).  
**Returns:** boolean  

### refresh  
```typescript
refresh(options?: object): PlaceableObject
```
Refresh incremental render flags for the PlaceableObject. Provided for backwards compatibility.  
Inherited from [PlaceableObject.refresh](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh).  
**Parameters:**  
- **options** (optional): object — Modify the refresh workflow.  
**Returns:** PlaceableObject

### release  
```typescript
release(options?: object): boolean
```
Release control over a PlaceableObject, removing it from the controlled set.  
Inherited from [PlaceableObject.release](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release).  
**Parameters:**  
- **options** (optional): object — Modify releasing workflow.  
**Returns:** boolean — Whether the object was released.

### rotate  
```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```
Rotate the PlaceableObject to a certain angle.  
Inherited from [PlaceableObject.rotate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate).  
**Parameters:**  
- **angle**: number — Desired angle of rotation.  
- **snap**: number — Snap angle to increments.  
**Returns:** Promise<PlaceableObject>

### toRay  
```typescript
toRay(): Ray
```
Convert the wall segment to a Ray representation.  
**Returns:** Ray

---

### Protected Methods

- `_canConfigure(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can configure the Placeable Object.  
- `_canCreate(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can create the underlying Document.  
- `_canDelete(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can delete the underlying Document.  
- `_canDrag(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can drag this Placeable Object.  
- `_canDragLeftStart(user: User, event: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can initiate a left drag.  
- `_canHover(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can hover on this Placeable Object.  
- `_canHUD(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can access the HUD.  
- `_canUpdate(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can update the Document.  
- `_canView(user: User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Check if the user can view details of the Placeable Object.  

- `_createInteractionManager(): MouseInteractionManager`  
  Create a MouseInteractionManager instance.  

- `_finalizeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Finalize the left-drag operation.  
- `_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Finalize the right-drag operation.  

- `_getTargetAlpha(): number`  
  Get target opacity depending on preview state.  
- `_getWallColor(): number`  
  Decide what color to render the wall on the WallsLayer according to properties.  

- `_initializeDragLeft(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Initialize left-drag operation.  
- `_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Initialize right-drag operation.  

- `_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Actions on single right-click to configure object.  
- `_onControl(options: object): void`  
  Actions triggered once control is established.  
- `_onDragEnd(): void`  
  Conclude drag operation on preview clone.  
- `_onDragLeftCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void`  
  Actions on cancelling left drag; prevent cancellation if returns false.  
- `_onDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false`  
  Actions on left drag drop; may prevent if returns false.  
- `_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void`  
  Actions on cancelling right drag; prevent if returns false.  
- `_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Actions on right drag drop.  
- `_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Actions on right drag move.  
- `_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void`  
  Actions on beginning right drag; prevent if returns false.  
- `_onDragStart(): void`  
  Begin drag operation on preview clone.  
- `_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any`  
  Actions on long press.  
- `_onRelease(options: object): void`  
  Actions on releasing control.  
- `_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Actions on left-unclick event.  
- `_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Actions on right-unclick event.  

- `_playDoorSound(interaction: string): void`  
  Play a door interaction sound locally.  
  - **interaction**: "open", "close", "lock", "unlock", or "test".

- `_propagateLeftClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Should left clicks propagate downstream?  
- `_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Should right clicks propagate downstream?  

- `_refreshDirection(): undefined | false`  
  Draw directional icon for one-way walls.  
- `_refreshEndpoints(): void`  
  Refresh display of wall endpoints.  
- `_refreshHighlight(): void`  
  Refresh Wall control highlight graphic.  
- `_refreshLine(): void`  
  Refresh displayed position of the wall line segment.  
- `_refreshState(): void`  
  Refresh the displayed state of the Wall.

- `#onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void`  
  Callback actions on right mouse drag start; prevent if false.  

---

For full details, see the official [Wall API Documentation](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Wall.html).