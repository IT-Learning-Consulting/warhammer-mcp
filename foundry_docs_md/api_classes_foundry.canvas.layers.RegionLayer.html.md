# RegionLayer | Foundry Virtual Tabletop - API Documentation - Version 13

**Class RegionLayer**  
The Regions Container.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.RegionLayer)  
- _PlaceablesLayer_  
- **RegionLayer**

---

## Properties

### clipboard
`clipboard: { cut: boolean; objects: PlaceableObject[] } = ...`  
Keep track of objects copied with CTRL+C/X which can be pasted later.  
Inherited from [PlaceablesLayer.clipboard](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clipboard)

### eventMode
`eventMode: string = "passive"`  
Inherited from [PlaceablesLayer.eventMode](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#eventmode)

### highlightObjects
`highlightObjects: boolean = false`  
Track whether "highlight all objects" is currently active.  
Inherited from [PlaceablesLayer.highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#highlightobjects)

### history
`history: CanvasHistoryEvent[] = []`  
Keep track of history so that CTRL+Z can undo changes.  
Inherited from [PlaceablesLayer.history](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#history)

### interactiveChildren
`interactiveChildren: boolean = false`  
Whether this event target has any children that need UI events. This can be used to optimize event propagation.  
Inherited from [PlaceablesLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#interactivechildren)

### objects
`objects: null | Container<DisplayObject> = null`  
Placeable Layer Objects.  
Inherited from [PlaceablesLayer.objects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#objects)

### options
`options: { name: string } = ...`  
Options for this layer instance.  
Inherited from [PlaceablesLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#options)

### preview
`preview: null | Container<DisplayObject> = null`  
Preview Object Placement.  
Inherited from [PlaceablesLayer.preview](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#preview)

### quadtree
`quadtree: null | Quadtree = ...`  
A Quadtree which partitions and organizes Walls into quadrants for efficient target identification.  
Inherited from [PlaceablesLayer.quadtree](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#quadtree)

---

## Static Properties

### CREATION_STATES
```typescript
CREATION_STATES: {
  COMPLETED: number;
  CONFIRMED: number;
  NONE: number;
  POTENTIAL: number;
} = ...
```
Creation states affected to placeables during their construction.  
Inherited from [PlaceablesLayer.CREATION_STATES](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#creation_states)

### documentName
`documentName: string = "Region"`  
A reference to the named Document type which is contained within this Canvas Layer.  
Overrides [PlaceablesLayer.documentName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentname)

### SORT_ORDER
`SORT_ORDER: number = 0`  
Sort order for placeables belonging to this layer.  
Inherited from [PlaceablesLayer.SORT_ORDER](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#sort_order)

---

## Accessors

### active
```typescript
get active(): boolean
```
Is this layer currently active?  
Returns: `boolean`  
Inherited from PlaceablesLayer.active

### controlled
```typescript
get controlled(): PlaceableObject[]
```
An Array of placeable objects in this layer which have the _controlled attribute.  
Returns: `PlaceableObject[]`  
Inherited from PlaceablesLayer.controlled

### controlledObjects
```typescript
get controlledObjects(): Map<string, PlaceableObject>
```
Track the set of PlaceableObjects on this layer which are currently controlled.  
Returns: `Map<string, PlaceableObject>`  
Inherited from PlaceablesLayer.controlledObjects

### documentCollection
```typescript
get documentCollection(): null | DocumentCollection
```
Obtain a reference to the Collection of embedded Document instances within the currently viewed Scene.  
Returns: `null | DocumentCollection`  
Inherited from PlaceablesLayer.documentCollection

### hookName
```typescript
get hookName(): string
```
The name used by hooks to construct their hook string. Note: You should override this getter if `hookName` should not return the class constructor name.  
Returns: `string`  
Overrides PlaceablesLayer.hookName

### hover
```typescript
get hover(): null | PlaceableObject
```
Track the PlaceableObject on this layer which is currently hovered upon.  
Returns: `null | PlaceableObject`  
Inherited from PlaceablesLayer.hover

### hud
```typescript
get hud(): null | BasePlaceableHUD<any, any, any>
```
If objects on this PlaceablesLayer have a HUD UI, provide a reference to its instance.  
Returns: `null | BasePlaceableHUD<any, any, any>`  
Inherited from PlaceablesLayer.hud

### legend
```typescript
get legend(): RegionLegend
```
The RegionLegend application of this RegionLayer.  
Returns: `RegionLegend`

### name
```typescript
get name(): string
```
The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.  
Returns: `string`  
**Example:**  
`canvas.lighting.name -> "LightingLayer"`  
Inherited from PlaceablesLayer.name

### placeables
```typescript
get placeables(): PlaceableObject[]
```
A convenience method for accessing the placeable object instances contained in this layer.  
Returns: `PlaceableObject[]`  
Inherited from PlaceablesLayer.placeables

### instance
```typescript
get instance(): CanvasLayer
```
Return a reference to the active instance of this canvas layer.  
Returns: `CanvasLayer`  
Inherited from PlaceablesLayer.instance

### layerOptions
```typescript
get layerOptions(): object
```
Configuration options for the PlaceablesLayer.  
Returns: `object`  
Overrides PlaceablesLayer.layerOptions

### placeableClass
```typescript
get placeableClass(): typeof PlaceableObject
```
Obtain a reference to the PlaceableObject class definition which represents the Document type in this layer.  
Returns: `typeof PlaceableObject`  
Inherited from PlaceablesLayer.placeableClass

---

## Methods

### _activate
```typescript
_activate(): void
```
Overrides [PlaceablesLayer._activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_activate)  
Returns: `void`

### _canDragLeftStart
```typescript
_canDragLeftStart(user: any, event: any): boolean
```
Overrides [PlaceablesLayer._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_candragleftstart)  

**Parameters:**  
- **user**: `any`  
- **event**: `any`  

**Returns:** `boolean`

### _deactivate
```typescript
_deactivate(): void
```
Overrides [PlaceablesLayer._deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_deactivate)  
Returns: `void`

### _draw
```typescript
_draw(options: any): Promise<void>
```
Overrides [PlaceablesLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_draw)  

**Parameters:**  
- **options**: `any`  

**Returns:** `Promise<void>`

### _highlightObjects
```typescript
_highlightObjects(active: any): void
```
Inherited from [PlaceablesLayer._highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_highlightobjects)  

**Parameters:**  
- **active**: `any`  

**Returns:** `void`

### _onClickLeft
```typescript
_onClickLeft(event: any): void
```
Overrides [PlaceablesLayer._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickleft)  

**Parameters:**  
- **event**: `any`  

**Returns:** `void`

### _onClickLeft2
```typescript
_onClickLeft2(event: any): void
```
Handle double left-click events which originate from the Canvas stage.  
Overrides [PlaceablesLayer._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickleft2)  

**Parameters:**  
- **event**: `any` - The PIXI InteractionEvent which wraps a PointerEvent  

**Returns:** `void`

### _onClickRight
```typescript
_onClickRight(event: any): undefined | false
```
Overrides [PlaceablesLayer._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickright)  

**Parameters:**  
- **event**: `any`  

**Returns:** `undefined | false`

### _onCopyKey
```typescript
_onCopyKey(event: any): boolean
```
Inherited from [PlaceablesLayer._onCopyKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_oncopykey)  

**Parameters:**  
- **event**: `any`  

**Returns:** `boolean`

### _onCutKey
```typescript
_onCutKey(event: any): boolean
```
Inherited from [PlaceablesLayer._onCutKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_oncutkey)  

**Parameters:**  
- **event**: `any`  

**Returns:** `boolean`

### _onDeleteKey
```typescript
_onDeleteKey(event: any): boolean
```
Inherited from [PlaceablesLayer._onDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondeletekey)  

**Parameters:**  
- **event**: `any`  

**Returns:** `boolean`

### _onDismissKey
```typescript
_onDismissKey(event: any): boolean
```
Inherited from [PlaceablesLayer._onDismissKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondismisskey)  

**Parameters:**  
- **event**: `any`  

**Returns:** `boolean`

### _onDragLeftCancel
```typescript
_onDragLeftCancel(event: any): void
```
Overrides [PlaceablesLayer._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftcancel)  

**Parameters:**  
- **event**: `any`  

**Returns:** `void`

### _onDragLeftDrop
```typescript
_onDragLeftDrop(event: any): void
```
Overrides [PlaceablesLayer._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftdrop)  

**Parameters:**  
- **event**: `any`  

**Returns:** `void`

### _onDragLeftMove
```typescript
_onDragLeftMove(event: any): void
```
Overrides [PlaceablesLayer._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftmove)  

**Parameters:**  
- **event**: `any`  

**Returns:** `void`

### _onDragLeftStart
```typescript
_onDragLeftStart(event: any): void
```
Overrides [PlaceablesLayer._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftstart)  

**Parameters:**  
- **event**: `any`  

**Returns:** `void`

### _onMouseWheel
```typescript
_onMouseWheel(event: any): undefined | Promise<PlaceableObject[]>
```
Inherited from [PlaceablesLayer._onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onmousewheel)  

**Parameters:**  
- **event**: `any`  

**Returns:** `undefined | Promise<PlaceableObject[]>`

### _onPasteKey
```typescript
_onPasteKey(event: any): boolean
```
Inherited from [PlaceablesLayer._onPasteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onpastekey)  

**Parameters:**  
- **event**: `any`  

**Returns:** `boolean`

### _onSelectAllKey
```typescript
_onSelectAllKey(event: any): boolean
```
Inherited from [PlaceablesLayer._onSelectAllKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onselectallkey)  

**Parameters:**  
- **event**: `any`  

**Returns:** `boolean`

### _onUndoKey
```typescript
_onUndoKey(event: any): boolean
```
Inherited from [PlaceablesLayer._onUndoKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onundokey)  

**Parameters:**  
- **event**: `any`  

**Returns:** `boolean`

### _tearDown
```typescript
_tearDown(options: any): Promise<void>
```
The inner _tearDown method which may be customized by each CanvasLayer subclass.  
Overrides [PlaceablesLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_teardown)  

**Parameters:**  
- **options**: `any` - Options which configure how the layer is deconstructed  

**Returns:** `Promise<void>`

### activate
```typescript
activate(options?: { tool?: string }): InteractionLayer
```
Activate the InteractionLayer, deactivating other layers and marking this layer's children as interactive.  
Inherited from [PlaceablesLayer.activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#activate)  

**Parameters:**  
- **options** (optional): `{ tool?: string }`  
  - **tool**?: `string` - A specific tool in the control palette to set as active  

**Returns:** `InteractionLayer` - The layer instance, now activated

### clearPreviewContainer
```typescript
clearPreviewContainer(): void
```
Clear the contents of the preview container, restoring visibility of original (non-preview) objects.  
Inherited from [PlaceablesLayer.clearPreviewContainer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clearpreviewcontainer)  

**Returns:** `void`

### controlAll
```typescript
controlAll(options?: object): PlaceableObject[]
```
Acquire control over all PlaceableObject instances which are visible and controllable within the layer.  
Inherited from [PlaceablesLayer.controlAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlall)  

**Parameters:**  
- **options**: `object` = {} - Options passed to the control method of each object  

**Returns:** `PlaceableObject[]` - An array of objects that were controlled

### controllableObjects
```typescript
controllableObjects(): Generator<PlaceableObject, any, any>
```
Iterates over placeable objects that are eligible for control/select.  
Inherited from [PlaceablesLayer.controllableObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controllableobjects)  

**Yields:**  
- A placeable object

### copyObjects
```typescript
copyObjects(): never[]
```
Overrides [PlaceablesLayer.copyObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#copyobjects)  

**Returns:** `never[]`

### createObject
```typescript
createObject(document: ClientDocument): PlaceableObject
```
Draw a single placeable object.  
Inherited from [PlaceablesLayer.createObject](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#createobject)  

**Parameters:**  
- **document**: `ClientDocument` - The Document instance used to create the placeable object  

**Returns:** `PlaceableObject`

### deactivate
```typescript
deactivate(): InteractionLayer
```
Deactivate the InteractionLayer, removing interactivity from its children.  
Inherited from [PlaceablesLayer.deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deactivate)  

**Returns:** `InteractionLayer` - The layer instance, now inactive

### deleteAll
```typescript
deleteAll(): Promise<Document[]>
```
A helper method to prompt for deletion of all PlaceableObject instances within the Scene.  
Renders a confirmation dialogue to confirm with the requester that all objects will be deleted.  
Inherited from [PlaceablesLayer.deleteAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deleteall)  

**Returns:** `Promise<Document[]>` - An array of Document objects which were deleted by the operation

### draw
```typescript
draw(options?: object): Promise<CanvasLayer>
```
Draw the canvas layer, rendering its internal components and returning a Promise.  
The Promise resolves to the drawn layer once its contents are successfully rendered.  
Inherited from [PlaceablesLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#draw)  

**Parameters:**  
- **options** (optional): `object` = {} - Options which configure how the layer is drawn  

**Returns:** `Promise<CanvasLayer>`

### get
```typescript
get(objectId: string): PlaceableObject
```
Get a PlaceableObject contained in this layer by its ID. Returns undefined if the object doesn't exist or if the canvas is not rendering a Scene.  
Inherited from [PlaceablesLayer.get](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#get)  

**Parameters:**  
- **objectId**: `string` - The ID of the contained object to retrieve  

**Returns:** `PlaceableObject` - The object instance, or undefined

### getDocuments
```typescript
getDocuments(): [] | DocumentCollection
```
Obtain an iterable of objects which should be added to this PlaceablesLayer.  
Inherited from [PlaceablesLayer.getDocuments](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getdocuments)  

**Returns:** `[] | DocumentCollection`

### getMaxSort
```typescript
getMaxSort(): number
```
Get the maximum sort value of all placeables.  
Inherited from [PlaceablesLayer.getMaxSort](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getmaxsort)  

**Returns:** `number` - The maximum sort value (-Infinity if there are no objects)

### getSnappedPoint
```typescript
getSnappedPoint(point: any): Point
```
Overrides [PlaceablesLayer.getSnappedPoint](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getsnappedpoint)  

**Parameters:**  
- **point**: `any`  

**Returns:** `Point`

### getZIndex
```typescript
getZIndex(): any
```
Overrides [PlaceablesLayer.getZIndex](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getzindex)  

**Returns:** `any`

### moveMany
```typescript
moveMany(
  options?: {
    dx?: 0 | 1 | -1;
    dy?: 0 | 1 | -1;
    dz?: 0 | 1 | -1;
    ids?: string[];
    includeLocked?: boolean;
    rotate?: boolean;
  },
): Promise<PlaceableObject[]>
```
Simultaneously move multiple PlaceableObjects via keyboard movement offsets. This executes a single database operation using Scene#updateEmbeddedDocuments.  
Inherited from [PlaceablesLayer.moveMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#movemany)  

**Parameters:**  
- **options** (optional):  
  - **dx**?: `0 | 1 | -1` - Horizontal movement direction  
  - **dy**?: `0 | 1 | -1` - Vertical movement direction  
  - **dz**?: `0 | 1 | -1` - Movement direction along the z-axis (elevation)  
  - **ids**?: `string[]` - An Array of object IDs to target for movement. Default is the IDs of controlled objects.  
  - **includeLocked**?: `boolean` - Move objects whose documents are locked?  
  - **rotate**?: `boolean` - Rotate the placeable to direction instead of moving  

**Returns:** `Promise<PlaceableObject[]>` - An array of objects which were moved during the operation  

**Throws:** An error if an explicitly provided id is not valid

### pasteObjects
```typescript
pasteObjects(
  position: Point,
  options?: { hidden?: boolean; snap?: boolean },
): Promise<Document[]>
```
Paste currently copied PlaceableObjects back to the layer by creating new copies.  
Inherited from [PlaceablesLayer.pasteObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#pasteobjects)  

**Parameters:**  
- **position**: `Point` - The destination position for the copied data.  
- **options** (optional): `{ hidden?: boolean; snap?: boolean } = {}`  
  - **hidden**?: `boolean` - Paste data in a hidden state, if applicable. Default is false.  
  - **snap**?: `boolean` - Snap the resulting objects to the grid. Default is true.  

**Returns:** `Promise<Document[]>` - An Array of created Document instances

### releaseAll
```typescript
releaseAll(options?: object): number
```
Release all controlled PlaceableObject instance from this layer.  
Inherited from [PlaceablesLayer.releaseAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#releaseall)  

**Parameters:**  
- **options**: `object` = {} - Options passed to the release method of each object  

**Returns:** `number` - The number of PlaceableObject instances which were released

### rotateMany
```typescript
rotateMany(
  options?: {
    angle?: number;
    delta?: number;
    ids?: any[];
    includeLocked?: boolean;
    snap?: number;
  },
): Promise<PlaceableObject[]>
```
Simultaneously rotate multiple PlaceableObjects using a provided angle or incremental. This executes a single database operation using Scene#updateEmbeddedDocuments.  
Inherited from [PlaceablesLayer.rotateMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#rotatemany)  

**Parameters:**  
- **options** (optional):  
  - **angle**?: `number` - A target angle of rotation (in degrees) where zero faces "south"  
  - **delta**?: `number` - An incremental angle of rotation (in degrees)  
  - **ids**?: `any[]` - An Array of object IDs to target for rotation  
  - **includeLocked**?: `boolean` - Rotate objects whose documents are locked?  
  - **snap**?: `number` - Snap the resulting angle to a multiple of some increment (in degrees)  

**Returns:** `Promise<PlaceableObject[]>` - An array of objects which were rotated  

**Throws:** An error if an explicitly provided id is not valid

### selectObjects
```typescript
selectObjects(
  options?: {
    controlOptions?: object;
    height?: number;
    releaseOptions?: object;
    width?: number;
    x?: number;
    y?: number;
  },
  aoptions?: { releaseOthers?: boolean },
): boolean
```
Select all PlaceableObject instances which fall within a coordinate rectangle.  
Inherited from [PlaceablesLayer.selectObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#selectobjects)  

**Parameters:**  
- **options** (optional):  
  - **controlOptions**?: `object` - Optional arguments provided to any called control() method.  
  - **height**?: `number` - The height of the selection rectangle.  
  - **releaseOptions**?: `object` - Optional arguments provided to any called release() method.  
  - **width**?: `number` - The width of the selection rectangle.  
  - **x**?: `number` - The top-left x-coordinate of the selection rectangle.  
  - **y**?: `number` - The top-left y-coordinate of the selection rectangle.  
- **aoptions** (optional): `{ releaseOthers?: boolean } = {}` - Additional options to configure selection behaviour.  
  - **releaseOthers**?: `boolean` - Whether to release other selected objects.  

**Returns:** `boolean` - A boolean for whether the controlled set was changed in the operation.

### setAllRenderFlags
```typescript
setAllRenderFlags(flags: Record<string, boolean>): void
```
Assign a set of render flags to all placeables in this layer.  
Inherited from [PlaceablesLayer.setAllRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#setallrenderflags)  

**Parameters:**  
- **flags**: `Record<string, boolean>` - The flags to set  

**Returns:** `void`

### storeHistory
```typescript
storeHistory(type: any, data: any, options: any): void
```
Record a new CRUD event in the history log so that it can be undone later. The base implementation calls [PlaceablesLayer#_storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storehistory) without passing the given options.  
Subclasses may override this function and can call [PlaceablesLayer#_storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storehistory) themselves to pass options as needed.  
Overrides [PlaceablesLayer.storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#storehistory)  

**Parameters:**  
- **type**: `any` - The event type  
- **data**: `any` - The create/update/delete data  
- **options**: `any` - The create/update/delete options  

**Returns:** `void`

### tearDown
```typescript
tearDown(options?: object): Promise<CanvasLayer>
```
Deconstruct data used in the current layer in preparation to re-draw the canvas.  
Inherited from [PlaceablesLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#teardown)  

**Parameters:**  
- **options** (optional): `object` = {} - Options which configure how the layer is deconstructed  

**Returns:** `Promise<CanvasLayer>`

### undoHistory
```typescript
undoHistory(): Promise<Document[]>
```
Undo a change to the objects in this layer. This method is typically activated using CTRL+Z while the layer is active.  
Inherited from [PlaceablesLayer.undoHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#undohistory)  

**Returns:** `Promise<Document[]>` - An array of documents which were modified by the undo operation

### updateAll
```typescript
updateAll(
  transformation: object | Function,
  condition?: null | Function,
  options?: object,
): Promise<Document[]>
```
Update all objects in this layer with a provided transformation. Conditionally filter to only apply to objects which match a certain condition.  
Inherited from [PlaceablesLayer.updateAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#updateall)  

**Parameters:**  
- **transformation**: `object | Function` - An object of data or function to apply to all matched objects  
- **condition** (optional): `null | Function = null` - A function which tests whether to target each object  
- **options** (optional): `object = {}` - Additional options passed to Document.update  

**Returns:** `Promise<Document[]>` - An array of updated data once the operation is complete

---

## Protected Methods

### _canvasCoordinatesFromDrop
```typescript
_canvasCoordinatesFromDrop(
  event: DragEvent,
  options?: { center?: boolean },
): boolean | number[]
```
Get the world-transformed drop position.  
Inherited from [PlaceablesLayer._canvasCoordinatesFromDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canvascoordinatesfromdrop)  

**Parameters:**  
- **event**: `DragEvent`  
- **options** (optional): `{ center?: boolean } = {}`  
  - **center**?: `boolean` - Return the coordinates of the center of the nearest grid element.  

**Returns:** `boolean | number[]` - Returns the transformed x, y coordinates, or false if the drag event was outside the canvas.

### _confirmDeleteKey
```typescript
_confirmDeleteKey(documents: Document): Promise<boolean>
```
Confirm deletion via the delete key. Called only if [PlaceablesLayerOptions.confirmDeleteKey](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.PlaceablesLayerOptions.html#confirmDeleteKey) is true.  
Inherited from [PlaceablesLayer._confirmDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_confirmdeletekey)  

**Parameters:**  
- **documents**: `Document` - The documents that will be deleted on confirmation.  

**Returns:** `Promise<boolean>` - True if the deletion is confirmed to proceed.

### _onClickRight2
```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle double right mouse-click events which originate from the Canvas stage.  
Inherited from [PlaceablesLayer._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickright2)  

**Parameters:**  
- **event**: `FederatedEvent<UIEvent | PixiTouch>` - The PIXI InteractionEvent which wraps a PointerEvent

**Returns:** `void`

### _onCycleViewKey
```typescript
_onCycleViewKey(event: KeyboardEvent): boolean
```
Handle a Cycle View keypress while this layer is active.  
Inherited from [PlaceablesLayer._onCycleViewKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_oncycleviewkey)  

**Parameters:**  
- **event**: `KeyboardEvent` - The cycle-view key press event

**Returns:** `boolean` - Was the event handled?

### _storeHistory
```typescript
_storeHistory(
  type: "update" | "delete" | "create",
  data: object[],
  options?: object,
): void
```
Record a new CRUD event in the history log so that it can be undone later. Updates without changes are filtered out unless the `diff` option is set to false. This function may not be overridden.  
Inherited from [PlaceablesLayer._storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storehistory)  

**Parameters:**  
- **type**: `"update" | "delete" | "create"` - The event type  
- **data**: `object[]` - The create/update/delete data  
- **options** (optional): `object = {}` - The options of the undo operation  

**Returns:** `void`

---

## Static Methods

### prepareSceneControls
```typescript
static prepareSceneControls(): {
  activeTool: string;
  icon: string;
  layer: string;
  name: string;
  onChange: (event: any, active: any) => void;
  onToolChange: () => any;
  order: number;
  title: string;
  tools: {
    clear: {
      button: boolean;
      icon: string;
      name: string;
      onChange: () => any;
      order: number;
      title: string;
    };
    ellipse: {
      icon: string;
      name: string;
      order: number;
      title: string;
      toolclip: {
        heading: string;
        items: ToolclipConfigurationItem[];
        src: string;
      };
    };
    hole: {
      active: boolean;
      icon: string;
      name: string;
      order: number;
      title: string;
      toggle: boolean;
      toolclip: {
        heading: string;
        items: ToolclipConfigurationItem[];
        src: string;
      };
    };
    polygon: {
      icon: string;
      name: string;
      order: number;
      title: string;
      toolclip: {
        heading: string;
        items: ToolclipConfigurationItem[];
        src: string;
      };
    };
    rectangle: {
      icon: string;
      name: string;
      order: number;
      title: string;
      toolclip: {
        heading: string;
        items: ToolclipConfigurationItem[];
        src: string;
      };
    };
    select: {
      icon: string;
      name: string;
      order: number;
      title: string;
      toolclip: {
        heading: string;
        items: ToolclipConfigurationItem[];
        src: string;
      };
    };
    snap: {
      active: boolean;
      icon: string;
      name: string;
      onChange: (event: any, toggled: any) => any;
      order: number;
      title: string;
      toggle: boolean;
      toolclip: {
        heading: string;
        items: ToolclipConfigurationItem[];
        src: string;
      };
      visible: boolean;
    };
  };
  visible: boolean;
}
```
Overrides [PlaceablesLayer.prepareSceneControls](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#preparescenecontrols)

---

*Links:*  
- [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)  
- [CanvasHistoryEvent](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.CanvasHistoryEvent.html)  
- [Quadtree](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html)  
- [DocumentCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)  
- [BasePlaceableHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.BasePlaceableHUD.html)  
- [RegionLegend](https://foundryvtt.com/api/classes/foundry.applications.ui.RegionLegend.html)  
- [ToolclipConfigurationItem](https://foundryvtt.com/api/interfaces/foundry.ToolclipConfigurationItem.html)  
- [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)  
- [InteractionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html)  
- [ClientDocument](https://foundryvtt.com/api/classes/foundry.documents.abstract.ClientDocument.html)  
- [Document](https://foundryvtt.com/api/classes/foundry.documents.abstract.Document.html)  
- [FederatedEvent](https://foundryvtt.com/api/classes/foundry.federated.FederatedEvent.html)  
- [UIEvent](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent)  
- [PixiTouch](https://pixijs.download/release/docs/PIXI.interaction.InteractionManager.html#event)  
- [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)