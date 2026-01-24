# NotesLayer

The Notes Layer which contains Note canvas objects.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas /](https://foundryvtt.com/api/modules/foundry.canvas.html) [layers](https://foundryvtt.com/api/modules/foundry.canvas.layers.html) /  
[NotesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.NotesLayer.html)

## Hierarchy
- [PlaceablesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html)
- **NotesLayer**

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
Track whether "highlight all objects" is currently active  
Inherited from [PlaceablesLayer.highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#highlightobjects)

### history
`history: CanvasHistoryEvent[] = []`  
Keep track of history so that CTRL+Z can undo changes.  
Inherited from [PlaceablesLayer.history](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#history)

### interactiveChildren
`interactiveChildren: any = ...`  
Overrides [PlaceablesLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#interactivechildren)

### objects
`objects: null | Container<DisplayObject> = null`  
Placeable Layer Objects  
Inherited from [PlaceablesLayer.objects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#objects)

### options
`options: { name: string } = ...`  
Options for this layer instance.  
Inherited from [PlaceablesLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#options)

### preview
`preview: null | Container<DisplayObject> = null`  
Preview Object Placement  
Inherited from [PlaceablesLayer.preview](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#preview)

### quadtree
`quadtree: null | Quadtree = ...`  
A Quadtree which partitions and organizes Walls into quadrants for efficient target identification.  
Inherited from [PlaceablesLayer.quadtree](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#quadtree)

### CREATION_STATES (static)
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

### documentName (static)
`documentName: string = "Note"`  
A reference to the named Document type which is contained within this Canvas Layer.  
Overrides [PlaceablesLayer.documentName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentname)

### SORT_ORDER (static)
`SORT_ORDER: number = 0`  
Sort order for placeables belonging to this layer.  
Inherited from [PlaceablesLayer.SORT_ORDER](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#sort_order)

### TOGGLE_SETTING (static)
`TOGGLE_SETTING: string = "notesDisplayToggle"`  
The named core setting which tracks the toggled visibility state of map notes

---

## Accessors

### active
```typescript
get active(): boolean
```
Is this layer currently active  
Returns: `boolean`  
Inherited from `PlaceablesLayer.active`

### controlled
```typescript
get controlled(): PlaceableObject[]
```
An Array of placeable objects in this layer which have the _controlled attribute  
Returns: `PlaceableObject[]`  
Inherited from [PlaceablesLayer.controlled](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlled)

### controlledObjects
```typescript
get controlledObjects(): Map<string, PlaceableObject>
```
Track the set of PlaceableObjects on this layer which are currently controlled.  
Returns: `Map<string, PlaceableObject>`  
Inherited from [PlaceablesLayer.controlledObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlledobjects)

### documentCollection
```typescript
get documentCollection(): null | DocumentCollection
```
Obtain a reference to the Collection of embedded Document instances within the currently viewed Scene  
Returns: `null | DocumentCollection`  
Inherited from [PlaceablesLayer.documentCollection](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentcollection)

### hookName
```typescript
get hookName(): string
```
The name used by hooks to construct their hook string. Note: You should override this getter if hookName should not return the class constructor name.  
Returns: `string`  
Overrides [PlaceablesLayer.hookName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hookname)

### hover
```typescript
get hover(): null | PlaceableObject
```
Track the PlaceableObject on this layer which is currently hovered upon.  
Returns: `null | PlaceableObject`  
Inherited from [PlaceablesLayer.hover](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hover)

### hud
```typescript
get hud(): null | BasePlaceableHUD<any, any, any>
```
If objects on this PlaceablesLayer have a HUD UI, provide a reference to its instance  
Returns: `null | BasePlaceableHUD<any, any, any>`  
Inherited from [PlaceablesLayer.hud](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hud)

### name
```typescript
get name(): string
```
The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.  
Returns: `string`  
Example:  
```typescript
canvas.lighting.name -> "LightingLayer"
```
Inherited from [PlaceablesLayer.name](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#name)

### placeables
```typescript
get placeables(): PlaceableObject[]
```
A convenience method for accessing the placeable object instances contained in this layer  
Returns: `PlaceableObject[]`  
Inherited from [PlaceablesLayer.placeables](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#placeables)

### instance (static)
```typescript
get instance(): CanvasLayer
```
Return a reference to the active instance of this canvas layer  
Returns: `CanvasLayer`  
Inherited from [PlaceablesLayer.instance](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#instance)

### layerOptions (static)
```typescript
get layerOptions(): object
```
Configuration options for the PlaceablesLayer.  
Returns: `object`  
Overrides [PlaceablesLayer.layerOptions](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#layeroptions)

### placeableClass (static)
```typescript
get placeableClass(): typeof PlaceableObject
```
Obtain a reference to the PlaceableObject class definition which represents the Document type in this layer.  
Returns: `typeof PlaceableObject`  
Inherited from [PlaceablesLayer.placeableClass](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#placeableclass)

---

## Methods

### _activate
```typescript
_activate(): void
```
Inherited from [_activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_activate)  
Returns: `void`

### _canDragLeftStart
```typescript
_canDragLeftStart(user: any, event: any): boolean
```
- **Parameters:**
  - `user: any`
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_candragleftstart)

### _deactivate
```typescript
_deactivate(): void
```
Overrides [_deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_deactivate)  
Returns: `void`

### _draw
```typescript
_draw(options: any): Promise<void>
```
- **Parameters:**
  - `options: any`
- **Returns:** `Promise<void>`  
Overrides [_draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_draw)

### _highlightObjects
```typescript
_highlightObjects(active: any): void
```
- **Parameters:**
  - `active: any`
- **Returns:** `void`  
Inherited from [_highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_highlightobjects)

### _onClickLeft
```typescript
_onClickLeft(event: any): Promise<void>
```
- **Parameters:**
  - `event: any`
- **Returns:** `Promise<void>`  
Overrides [_onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickleft)

### _onClickRight
```typescript
_onClickRight(event: any): void
```
- **Parameters:**
  - `event: any`
- **Returns:** `void`  
Inherited from [_onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickright)

### _onCopyKey
```typescript
_onCopyKey(event: any): boolean
```
- **Parameters:**
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_onCopyKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_oncopykey)

### _onCutKey
```typescript
_onCutKey(event: any): boolean
```
- **Parameters:**
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_onCutKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_oncutkey)

### _onDeleteKey
```typescript
_onDeleteKey(event: any): boolean
```
- **Parameters:**
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_onDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondeletekey)

### _onDismissKey
```typescript
_onDismissKey(event: any): boolean
```
- **Parameters:**
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_onDismissKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondismisskey)

### _onDragLeftCancel
```typescript
_onDragLeftCancel(event: any): void
```
- **Parameters:**
  - `event: any`
- **Returns:** `void`  
Inherited from [_onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftcancel)

### _onDragLeftDrop
```typescript
_onDragLeftDrop(event: any): void
```
- **Parameters:**
  - `event: any`
- **Returns:** `void`  
Inherited from [_onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftdrop)

### _onDragLeftMove
```typescript
_onDragLeftMove(event: any): void
```
- **Parameters:**
  - `event: any`
- **Returns:** `void`  
Inherited from [_onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftmove)

### _onDragLeftStart
```typescript
_onDragLeftStart(event: any): void
```
- **Parameters:**
  - `event: any`
- **Returns:** `void`  
Inherited from [_onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondragleftstart)

### _onMouseWheel
```typescript
_onMouseWheel(event: any): undefined | Promise<PlaceableObject[]>
```
- **Parameters:**
  - `event: any`
- **Returns:** `undefined | Promise<PlaceableObject[]>`  
Inherited from [_onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onmousewheel)

### _onPasteKey
```typescript
_onPasteKey(event: any): boolean
```
- **Parameters:**
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_onPasteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onpastekey)

### _onSelectAllKey
```typescript
_onSelectAllKey(event: any): boolean
```
- **Parameters:**
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_onSelectAllKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onselectallkey)

### _onUndoKey
```typescript
_onUndoKey(event: any): boolean
```
- **Parameters:**
  - `event: any`
- **Returns:** `boolean`  
Inherited from [_onUndoKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onundokey)

### _tearDown
```typescript
_tearDown(options: any): Promise<void>
```
The inner _tearDown method which may be customized by each CanvasLayer subclass.  
- **Parameters:**
  - `options: any` - Options which configure how the layer is deconstructed  
- **Returns:** `Promise<void>`  
Inherited from [_tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_teardown)

### activate
```typescript
activate(options?: { tool?: string }): InteractionLayer
```
Activate the InteractionLayer, deactivating other layers and marking this layer's children as interactive.  
- **Parameters:**
  - `options?`:  
    - `tool?`: `string` - A specific tool in the control palette to set as active  
- **Returns:** `InteractionLayer` - The layer instance, now activated  
Inherited from [activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#activate)

### clearPreviewContainer
```typescript
clearPreviewContainer(): void
```
Clear the contents of the preview container, restoring visibility of original (non-preview) objects.  
- **Returns:** `void`  
Inherited from [clearPreviewContainer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clearpreviewcontainer)

### controlAll
```typescript
controlAll(options?: object): PlaceableObject[]
```
Acquire control over all PlaceableObject instances which are visible and controllable within the layer.  
- **Parameters:**
  - `options?`: `object` - Options passed to the control method of each object  
- **Returns:** `PlaceableObject[]` - An array of objects that were controlled  
Inherited from [controlAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlall)

### controllableObjects
```typescript
controllableObjects(): Generator<PlaceableObject, any, any>
```
Iterates over placeable objects that are eligible for control/select.  
- **Yields:** A placeable object  
- **Returns:** `Generator<PlaceableObject, any, any>`  
Inherited from [controllableObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controllableobjects)

### copyObjects
```typescript
copyObjects(options?: { cut?: boolean }): readonly PlaceableObject[]
```
Copy (or cut) currently controlled PlaceableObjects, ready to paste back into the Scene later.  
- **Parameters:**
  - `options?`:  
    - `cut?`: `boolean` - Cut instead of copy?  
- **Returns:** `readonly PlaceableObject[]` - The array of copied PlaceableObject instances  
Inherited from [copyObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#copyobjects)

### createObject
```typescript
createObject(document: ClientDocument): PlaceableObject
```
Draw a single placeable object  
- **Parameters:**
  - `document`: `ClientDocument` - The Document instance used to create the placeable object  
- **Returns:** `PlaceableObject`  
Inherited from [createObject](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#createobject)

### deactivate
```typescript
deactivate(): InteractionLayer
```
Deactivate the InteractionLayer, removing interactivity from its children.  
- **Returns:** `InteractionLayer` - The layer instance, now inactive  
Inherited from [deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deactivate)

### deleteAll
```typescript
deleteAll(): Promise<Document[]>
```
A helper method to prompt for deletion of all PlaceableObject instances within the Scene. Renders a confirmation dialogue to confirm with the requester that all objects will be deleted.  
- **Returns:** `Promise<Document[]>` - An array of Document objects which were deleted by the operation  
Inherited from [deleteAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deleteall)

### draw
```typescript
draw(options?: object): Promise<CanvasLayer>
```
Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.  
- **Parameters:**
  - `options?`: `object` - Options which configure how the layer is drawn  
- **Returns:** `Promise<CanvasLayer>`  
Inherited from [draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#draw)

### get
```typescript
get(objectId: string): PlaceableObject
```
Get a PlaceableObject contained in this layer by its ID. Returns undefined if the object doesn't exist or if the canvas is not rendering a Scene.  
- **Parameters:**
  - `objectId`: `string` - The ID of the contained object to retrieve  
- **Returns:** `PlaceableObject | undefined`  
Inherited from [get](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#get)

### getDocuments
```typescript
getDocuments(): [] | DocumentCollection
```
Obtain an iterable of objects which should be added to this PlaceablesLayer  
- **Returns:** `[] | DocumentCollection`  
Inherited from [getDocuments](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getdocuments)

### getMaxSort
```typescript
getMaxSort(): number
```
Get the maximum sort value of all placeables.  
- **Returns:** `number` - The maximum sort value (-Infinity if there are no objects)  
Inherited from [getMaxSort](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getmaxsort)

### getSnappedPoint
```typescript
getSnappedPoint(point: Point): Point
```
Snaps the given point to grid. The layer defines the snapping behavior.  
- **Parameters:**
  - `point`: `Point` - The point that is to be snapped  
- **Returns:** `Point` - The snapped point  
Inherited from [getSnappedPoint](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getsnappedpoint)

### getZIndex
```typescript
getZIndex(): number
```
Get the zIndex that should be used for ordering this layer vertically relative to others in the same Container.  
- **Returns:** `number`  
Inherited from [getZIndex](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getzindex)

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
- **Parameters:**
  - `options?`:  
    - `dx?`: `0 | 1 | -1` - Horizontal movement direction  
    - `dy?`: `0 | 1 | -1` - Vertical movement direction  
    - `dz?`: `0 | 1 | -1` - Movement direction along the z-axis (elevation)  
    - `ids?`: `string[]` - An Array of object IDs to target for movement. Default is the IDs of controlled objects  
    - `includeLocked?`: `boolean` - Move objects whose documents are locked?  
    - `rotate?`: `boolean` - Rotate the placeable to direction instead of moving  
- **Returns:** `Promise<PlaceableObject[]>` - An array of objects which were moved during the operation  
- **Throws:** An error if an explicitly provided id is not valid  
Inherited from [moveMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#movemany)

### panToNote
```typescript
panToNote(
    note: canvas.placeables.Note,
    options?: { duration?: number; scale?: number },
): Promise<void>
```
Pan to a given note on the layer.  
- **Parameters:**
  - `note`: `canvas.placeables.Note` - The note to pan to  
  - `options?`:  
    - `duration?`: `number` - The speed of the pan animation in milliseconds  
    - `scale?`: `number` - The resulting zoom level  
- **Returns:** `Promise<void>` - A Promise which resolves once the pan animation has concluded

### pasteObjects
```typescript
pasteObjects(
    position: Point,
    options?: { hidden?: boolean; snap?: boolean },
): Promise<Document[]>
```
Paste currently copied PlaceableObjects back to the layer by creating new copies.  
- **Parameters:**
  - `position`: `Point` - The destination position for the copied data  
  - `options?`:  
    - `hidden?`: `boolean` - Paste data in a hidden state, if applicable. Default is false  
    - `snap?`: `boolean` - Snap the resulting objects to the grid. Default is true  
- **Returns:** `Promise<Document[]>` - An Array of created Document instances  
Inherited from [pasteObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#pasteobjects)

### releaseAll
```typescript
releaseAll(options?: object): number
```
Release all controlled PlaceableObject instance from this layer.  
- **Parameters:**
  - `options?`: `object` - Options passed to the release method of each object  
- **Returns:** `number` - The number of PlaceableObject instances which were released  
Inherited from [releaseAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#releaseall)

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
- **Parameters:**
  - `options?`:  
    - `angle?`: `number` - A target angle of rotation (in degrees) where zero faces "south"  
    - `delta?`: `number` - An incremental angle of rotation (in degrees)  
    - `ids?`: `any[]` - An Array of object IDs to target for rotation  
    - `includeLocked?`: `boolean` - Rotate objects whose documents are locked?  
    - `snap?`: `number` - Snap the resulting angle to a multiple of some increment (in degrees)  
- **Returns:** `Promise<PlaceableObject[]>` - An array of objects which were rotated  
- **Throws:** An error if an explicitly provided id is not valid  
Inherited from [rotateMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#rotatemany)

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
- **Parameters:**
  - `options?`:  
    - `controlOptions?`: `object` - Optional arguments provided to any called control() method  
    - `height?`: `number` - The height of the selection rectangle  
    - `releaseOptions?`: `object` - Optional arguments provided to any called release() method  
    - `width?`: `number` - The width of the selection rectangle  
    - `x?`: `number` - The top-left x-coordinate of the selection rectangle  
    - `y?`: `number` - The top-left y-coordinate of the selection rectangle  
  - `aoptions?`:  
    - `releaseOthers?`: `boolean` - Whether to release other selected objects  
- **Returns:** `boolean` - Whether the controlled set was changed in the operation  
Inherited from [selectObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#selectobjects)

### setAllRenderFlags
```typescript
setAllRenderFlags(flags: Record<string, boolean>): void
```
Assign a set of render flags to all placeables in this layer.  
- **Parameters:**
  - `flags: Record<string, boolean>` - The flags to set  
- **Returns:** `void`  
Inherited from [setAllRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#setallrenderflags)

### storeHistory
```typescript
storeHistory(
    type: "update" | "delete" | "create",
    data: object[],
    options?: object,
): void
```
Record a new CRUD event in the history log so that it can be undone later. The base implementation calls [PlaceablesLayer#_storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storehistory) without passing the given options. Subclasses may override this function and can call PlaceablesLayer#_storeHistory themselves to pass options as needed.  
- **Parameters:**
  - `type`: `"update" | "delete" | "create"` - The event type  
  - `data`: `object[]` - The create/update/delete data  
  - `options?`: `object` - The create/update/delete options  
- **Returns:** `void`  
Inherited from [storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#storehistory)

### tearDown
```typescript
tearDown(options?: object): Promise<CanvasLayer>
```
Deconstruct data used in the current layer in preparation to re-draw the canvas  
- **Parameters:**
  - `options?`: `object` - Options which configure how the layer is deconstructed  
- **Returns:** `Promise<CanvasLayer>`  
Inherited from [tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#teardown)

### undoHistory
```typescript
undoHistory(): Promise<Document[]>
```
Undo a change to the objects in this layer. This method is typically activated using CTRL+Z while the layer is active.  
- **Returns:** `Promise<Document[]>` - An array of documents modified by the undo operation  
Inherited from [undoHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#undohistory)

### updateAll
```typescript
updateAll(
    transformation: object | Function, 
    condition?: null | Function, 
    options?: object
): Promise<Document[]>
```
Update all objects in this layer with a provided transformation. Conditionally filter to only apply to objects which match a certain condition.  
- **Parameters:**
  - `transformation`: `object | Function` - An object of data or function to apply to all matched objects  
  - `condition?`: `null | Function` - A function which tests whether to target each object  
  - `options?`: `object` - Additional options passed to Document.update  
- **Returns:** `Promise<Document[]>` - An array of updated data once the operation is complete  
Inherited from [updateAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#updateall)

### _canvasCoordinatesFromDrop (protected)
```typescript
_canvasCoordinatesFromDrop(
    event: DragEvent,
    options?: { center?: boolean },
): boolean | number[]
```
Get the world-transformed drop position.  
- **Parameters:**
  - `event`: `DragEvent`  
  - `options?`: `{ center?: boolean }` - Return the coordinates of the center of the nearest grid element  
- **Returns:** `boolean | number[]` - Returns the transformed x, y coordinates, or false if the drag event was outside the canvas  
Inherited from [_canvasCoordinatesFromDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canvascoordinatesfromdrop)

### _confirmDeleteKey (protected)
```typescript
_confirmDeleteKey(documents: Document): Promise<boolean>
```
Confirm deletion via the delete key. Called only if [foundry.canvas.layers.types.PlaceablesLayerOptions#confirmDeleteKey is true](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.PlaceablesLayerOptions.html#confirmDeleteKey).  
- **Parameters:**
  - `documents`: `Document` - The documents that will be deleted on confirmation  
- **Returns:** `Promise<boolean>` - True if the deletion is confirmed to proceed  
Inherited from [_confirmDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_confirmdeletekey)

### _onClickLeft2 (protected)
```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle double left-click events which originate from the Canvas stage.  
- **Parameters:**
  - `event`: `FederatedEvent<UIEvent | PixiTouch>` - The PIXI InteractionEvent which wraps a PointerEvent  
- **Returns:** `void`  
Inherited from [_onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickleft2)

### _onClickRight2 (protected)
```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Handle double right mouse-click events which originate from the Canvas stage.  
- **Parameters:**
  - `event`: `FederatedEvent<UIEvent | PixiTouch>` - The PIXI InteractionEvent which wraps a PointerEvent  
- **Returns:** `void`  
Inherited from [_onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onclickright2)

### _onCycleViewKey (protected)
```typescript
_onCycleViewKey(event: KeyboardEvent): boolean
```
Handle a Cycle View keypress while this layer is active.  
- **Parameters:**
  - `event`: `KeyboardEvent` - The cycle-view key press event  
- **Returns:** `boolean` - Was the event handled?  
Inherited from [_onCycleViewKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_oncycleviewkey)

### _onDropData (protected)
```typescript
_onDropData(event: DragEvent, data: object): Promise<false | PlaceableObject>
```
Handle JournalEntry document drop data  
- **Parameters:**
  - `event`: `DragEvent` - The drag drop event  
  - `data`: `object` - The dropped data transfer data  
- **Returns:** `Promise<false | PlaceableObject>`  
Inherited from [_onDropData](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_ondropdata)

### _storeHistory (protected)
```typescript
_storeHistory(
    type: "update" | "delete" | "create",
    data: object[],
    options?: object,
): void
```
Record a new CRUD event in the history log so that it can be undone later. Updates without changes are filtered out unless the `diff` option is set to false. This function may not be overridden.  
- **Parameters:**
  - `type`: `"update" | "delete" | "create"` - The event type  
  - `data`: `object[]` - The create/update/delete data  
  - `options?`: `object` - The options of the undo operation  
- **Returns:** `void`  
Inherited from [_storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storehistory)

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
            visible: boolean;
        };
        journal: {
            icon: string;
            name: string;
            order: number;
            title: string;
            visible: boolean;
        };
        select: {
            icon: string;
            name: string;
            order: number;
            title: string;
        };
        toggle: {
            active: any;
            icon: string;
            name: string;
            onChange: (event: any, toggled: any) => Promise<any>;
            order: number;
            title: string;
            toggle: boolean;
        };
    };
}
```
Overrides [PlaceablesLayer.prepareSceneControls](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#preparescenecontrols)

### registerSettings
```typescript
static registerSettings(): void
```
Register game settings used by the NotesLayer  
- **Returns:** `void`