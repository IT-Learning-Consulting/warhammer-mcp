# TilesLayer | Foundry Virtual Tabletop - API Documentation - Version 13

A `PlaceablesLayer` designed for rendering the visual Scene for a specific vertical cross-section.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.TilesLayer))

- [PlaceablesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html)  
- **TilesLayer**

---

## Properties

### clipboard

`clipboard: { cut: boolean; objects: PlaceableObject[] } = ...`

Keep track of objects copied with CTRL+C/X which can be pasted later.

Inherited from [PlaceablesLayer.clipboard](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clipboard)

---

### eventMode

`eventMode: string = "passive"`

Inherited from [PlaceablesLayer.eventMode](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#eventmode)

---

### highlightObjects

`highlightObjects: boolean = false`

Track whether "highlight all objects" is currently active

Inherited from [PlaceablesLayer.highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#highlightObjects)

---

### history

`history: CanvasHistoryEvent[] = []`

Keep track of history so that CTRL+Z can undo changes.

Inherited from [PlaceablesLayer.history](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#history)

---

### interactiveChildren

`interactiveChildren: boolean = false`

Whether this event target has any children that need UI events. This can be used to optimize event propagation.

Inherited from [PlaceablesLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#interactiveChildren)

---

### objects

`objects: null | Container<DisplayObject> = null`

Placeable Layer Objects

Inherited from [PlaceablesLayer.objects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#objects)

---

### options

`options: { name: string } = ...`

Options for this layer instance.

Inherited from [PlaceablesLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#options)

---

### preview

`preview: null | Container<DisplayObject> = null`

Preview Object Placement

Inherited from [PlaceablesLayer.preview](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#preview)

---

### quadtree

`quadtree: null | Quadtree = ...`

A Quadtree which partitions and organizes Walls into quadrants for efficient target identification.

Inherited from [PlaceablesLayer.quadtree](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#quadtree)

---

### CREATION_STATES (Static)

```typescript
CREATION_STATES: {
    COMPLETED: number;
    CONFIRMED: number;
    NONE: number;
    POTENTIAL: number;
} = ...
```

Creation states affected to placeables during their construction.

Inherited from [PlaceablesLayer.CREATION_STATES](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#CREATION_STATES)

---

### documentName (Static Accessor)

`documentName: string = "Tile"`

A reference to the named Document type which is contained within this Canvas Layer.

Overrides [PlaceablesLayer.documentName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentName)

---

### SORT_ORDER (Static)

`SORT_ORDER: number = 0`

Sort order for placeables belonging to this layer.

Inherited from [PlaceablesLayer.SORT_ORDER](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#SORT_ORDER)

---

## Accessors

### active

`get active(): boolean`

Is this layer currently active

**Returns:** `boolean`

Inherited from PlaceablesLayer.active

---

### controlled

`get controlled(): PlaceableObject[]`

An Array of placeable objects in this layer which have the _controlled attribute

**Returns:** `PlaceableObject[]`

Inherited from PlaceablesLayer.controlled

---

### controlledObjects

`get controlledObjects(): Map<string, PlaceableObject>`

Track the set of PlaceableObjects on this layer which are currently controlled.

**Returns:** `Map<string, PlaceableObject>`

Inherited from PlaceablesLayer.controlledObjects

---

### documentCollection

`get documentCollection(): null | DocumentCollection`

Obtain a reference to the Collection of embedded Document instances within the currently viewed Scene

**Returns:** `null | DocumentCollection`

Inherited from PlaceablesLayer.documentCollection

---

### hookName

`get hookName(): string`

The name used by hooks to construct their hook string. Note: You should override this getter if hookName should not return the class constructor name.

**Returns:** `string`

Overrides PlaceablesLayer.hookName

---

### hover

`get hover(): null | PlaceableObject`

Track the PlaceableObject on this layer which is currently hovered upon.

**Returns:** `null | PlaceableObject`

Inherited from PlaceablesLayer.hover

---

### hud

`get hud(): TileHUD`

If objects on this PlaceablesLayer have a HUD UI, provide a reference to its instance

**Returns:** `TileHUD`

Overrides PlaceablesLayer.hud

---

### name

`get name(): string`

The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.

**Returns:** `string`

**Example:**  
`canvas.lighting.name -> "LightingLayer"`

Inherited from PlaceablesLayer.name

---

### placeables

`get placeables(): PlaceableObject[]`

A convenience method for accessing the placeable object instances contained in this layer

**Returns:** `PlaceableObject[]`

Inherited from PlaceablesLayer.placeables

---

### tiles

`get tiles(): canvas.placeables.Tile[]`

An array of Tile objects which are rendered within the objects container.

**Returns:** `canvas.placeables.Tile[]`

---

### instance (Static)

`get instance(): CanvasLayer`

Return a reference to the active instance of this canvas layer

**Returns:** `CanvasLayer`

Inherited from PlaceablesLayer.instance

---

### layerOptions (Static)

`get layerOptions(): object`

Configuration options for the PlaceablesLayer.

**Returns:** `object`

Overrides PlaceablesLayer.layerOptions

---

### placeableClass (Static)

`get placeableClass(): typeof PlaceableObject`

Obtain a reference to the PlaceableObject class definition which represents the Document type in this layer.

**Returns:** `typeof PlaceableObject`

Inherited from PlaceablesLayer.placeableClass

---

## Methods

### _activate

```typescript
_activate(): void
```

**Returns:** `void`

Inherited from [PlaceablesLayer._activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_activate)

---

### _canDragLeftStart

```typescript
_canDragLeftStart(user: any, event: any): boolean
```

**Parameters:**

- **user**: `any`
- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canDragLeftStart)

---

### _deactivate

```typescript
_deactivate(): void
```

**Returns:** `void`

Inherited from [PlaceablesLayer._deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_deactivate)

---

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters:**

- **options**: `any`

**Returns:** `Promise<void>`

Inherited from [PlaceablesLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_draw)

---

### _getDropData

```typescript
_getDropData(event: DragEvent, data: object): object
```

Prepare the data object when a new Tile is dropped onto the canvas

**Parameters:**

- **event**: `DragEvent` — The concluding drag event
- **data**: `object` — The extracted Tile data

**Returns:** `object`

---

### _highlightObjects

```typescript
_highlightObjects(active: any): void
```

**Parameters:**

- **active**: `any`

**Returns:** `void`

Inherited from [PlaceablesLayer._highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_highlightObjects)

---

### _onClickLeft

```typescript
_onClickLeft(event: any): void
```

**Parameters:**

- **event**: `any`

**Returns:** `void`

Inherited from [PlaceablesLayer._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickLeft)

---

### _onClickRight

```typescript
_onClickRight(event: any): void
```

**Parameters:**

- **event**: `any`

**Returns:** `void`

Inherited from [PlaceablesLayer._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickRight)

---

### _onCopyKey

```typescript
_onCopyKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._onCopyKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCopyKey)

---

### _onCutKey

```typescript
_onCutKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._onCutKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCutKey)

---

### _onDeleteKey

```typescript
_onDeleteKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._onDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDeleteKey)

---

### _onDismissKey

```typescript
_onDismissKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._onDismissKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDismissKey)

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: any): void
```

**Parameters:**

- **event**: `any`

**Returns:** `void`

Overrides [PlaceablesLayer._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftCancel)

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: any): void
```

**Parameters:**

- **event**: `any`

**Returns:** `void`

Overrides [PlaceablesLayer._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftDrop)

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

**Parameters:**

- **event**: `any`

**Returns:** `void`

Overrides [PlaceablesLayer._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftMove)

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: any): void
```

**Parameters:**

- **event**: `any`

**Returns:** `void`

Overrides [PlaceablesLayer._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftStart)

---

### _onMouseWheel

```typescript
_onMouseWheel(event: any): undefined | Promise<PlaceableObject[]>
```

**Parameters:**

- **event**: `any`

**Returns:** `undefined | Promise<PlaceableObject[]>`

Inherited from [PlaceablesLayer._onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onMouseWheel)

---

### _onPasteKey

```typescript
_onPasteKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._onPasteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onPasteKey)

---

### _onSelectAllKey

```typescript
_onSelectAllKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._onSelectAllKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onSelectAllKey)

---

### _onUndoKey

```typescript
_onUndoKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

**Returns:** `boolean`

Inherited from [PlaceablesLayer._onUndoKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onUndoKey)

---

### _tearDown

```typescript
_tearDown(options: any): Promise<void>
```

The inner _tearDown method which may be customized by each CanvasLayer subclass.

**Parameters:**

- **options**: `any` — Options which configure how the layer is deconstructed

**Returns:** `Promise<void>`

Overrides [PlaceablesLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_tearDown)

---

### activate

```typescript
activate(options?: { tool?: string }): InteractionLayer
```

Activate the InteractionLayer, deactivating other layers and marking this layer's children as interactive.

**Parameters:**

- Optional  
  - **options**: `{ tool?: string } = {}` — Options which configure layer activation  
  - **tool?**: `string` — A specific tool in the control palette to set as active

**Returns:** `InteractionLayer` — The layer instance, now activated

Inherited from [PlaceablesLayer.activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#activate)

---

### clearPreviewContainer

```typescript
clearPreviewContainer(): void
```

Clear the contents of the preview container, restoring visibility of original (non-preview) objects.

**Returns:** `void`

Inherited from [PlaceablesLayer.clearPreviewContainer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clearPreviewContainer)

---

### controlAll

```typescript
controlAll(options?: object): PlaceableObject[]
```

Acquire control over all PlaceableObject instances which are visible and controllable within the layer.

**Parameters:**

- **options**: `object = {}` — Options passed to the control method of each object

**Returns:** `PlaceableObject[]`

Inherited from [PlaceablesLayer.controlAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlAll)

---

### controllableObjects

```typescript
controllableObjects(): Generator<PlaceableObject, void, unknown>
```

**Returns:** `Generator<PlaceableObject, void, unknown>`

Overrides [PlaceablesLayer.controllableObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controllableObjects)

---

### copyObjects

```typescript
copyObjects(options?: { cut?: boolean }): readonly PlaceableObject[]
```

Copy (or cut) currently controlled PlaceableObjects, ready to paste back into the Scene later.

**Parameters:**

- Optional  
  - **options**: `{ cut?: boolean } = {}` — Additional options  
  - **cut?**: `boolean` — Cut instead of copy?

**Returns:** `readonly PlaceableObject[]`

Inherited from [PlaceablesLayer.copyObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#copyObjects)

---

### createObject

```typescript
createObject(document: ClientDocument): PlaceableObject
```

Draw a single placeable object

**Parameters:**

- **document**: `ClientDocument` — The Document instance used to create the placeable object

**Returns:** `PlaceableObject`

Inherited from [PlaceablesLayer.createObject](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#createObject)

---

### deactivate

```typescript
deactivate(): InteractionLayer
```

Deactivate the InteractionLayer, removing interactivity from its children.

**Returns:** `InteractionLayer` — The layer instance, now inactive

Inherited from [PlaceablesLayer.deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deactivate)

---

### deleteAll

```typescript
deleteAll(): Promise<Document[]>
```

A helper method to prompt for deletion of all PlaceableObject instances within the Scene. Renders a confirmation dialogue to confirm with the requester that all objects will be deleted.

**Returns:** `Promise<Document[]>` — An array of Document objects which were deleted by the operation

Inherited from [PlaceablesLayer.deleteAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deleteAll)

---

### draw

```typescript
draw(options?: object): Promise<CanvasLayer>
```

Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

**Parameters:**

- Optional  
  - **options**: `object = {}` — Options which configure how the layer is drawn

**Returns:** `Promise<CanvasLayer>`

Inherited from [PlaceablesLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#draw)

---

### get

```typescript
get(objectId: string): PlaceableObject
```

Get a PlaceableObject contained in this layer by its ID. Returns undefined if the object doesn't exist or if the canvas is not rendering a Scene.

**Parameters:**

- **objectId**: `string` — The ID of the contained object to retrieve

**Returns:** `PlaceableObject`

Inherited from [PlaceablesLayer.get](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#get)

---

### getDocuments

```typescript
getDocuments(): [] | DocumentCollection
```

Obtain an iterable of objects which should be added to this PlaceablesLayer

**Returns:** `[] | DocumentCollection`

Inherited from [PlaceablesLayer.getDocuments](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getDocuments)

---

### getMaxSort

```typescript
getMaxSort(): number
```

Get the maximum sort value of all placeables.

**Returns:**  
`number` — The maximum sort value (-Infinity if there are no objects)

Inherited from [PlaceablesLayer.getMaxSort](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getMaxSort)

---

### getSnappedPoint

```typescript
getSnappedPoint(point: any): any
```

Snaps the given point to grid. The layer defines the snapping behavior.

**Parameters:**

- **point**: `any` — The point that is to be snapped

**Returns:** `any` — The snapped point

Overrides [PlaceablesLayer.getSnappedPoint](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getSnappedPoint)

---

### getZIndex

```typescript
getZIndex(): number
```

Get the zIndex that should be used for ordering this layer vertically relative to others in the same Container.

**Returns:** `number`

Inherited from [PlaceablesLayer.getZIndex](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getZIndex)

---

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
    }
): Promise<PlaceableObject[]>
```

Simultaneously move multiple PlaceableObjects via keyboard movement offsets. This executes a single database operation using Scene#updateEmbeddedDocuments.

**Parameters:**

- **options** (optional):
  - `dx?`: `0 | 1 | -1` — Horizontal movement direction
  - `dy?`: `0 | 1 | -1` — Vertical movement direction
  - `dz?`: `0 | 1 | -1` — Movement direction along the z-axis (elevation)
  - `ids?`: `string[]` — An Array of object IDs to target for movement. Default is controlled objects.
  - `includeLocked?`: `boolean` — Move objects whose documents are locked?
  - `rotate?`: `boolean` — Rotate the placeable to direction instead of moving

**Returns:**  
`Promise<PlaceableObject[]>` — An array of objects which were moved during the operation

**Throws:**  
An error if an explicitly provided id is not valid

Inherited from [PlaceablesLayer.moveMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#moveMany)

---

### pasteObjects

```typescript
pasteObjects(
    position: Point, 
    options?: { hidden?: boolean; snap?: boolean }
): Promise<Document[]>
```

Paste currently copied PlaceableObjects back to the layer by creating new copies

**Parameters:**

- **position**: `Point` — The destination position for the copied data.
- Optional  
  - **options**: `{ hidden?: boolean; snap?: boolean } = {}` — Options which modify the paste operation
  - **hidden?**: `boolean` — Paste data in a hidden state, if applicable. Default is false.
  - **snap?**: `boolean` — Snap the resulting objects to the grid. Default is true.

**Returns:** `Promise<Document[]>` — An Array of created Document instances

Inherited from [PlaceablesLayer.pasteObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#pasteObjects)

---

### releaseAll

```typescript
releaseAll(options?: object): number
```

Release all controlled PlaceableObject instances from this layer.

**Parameters:**

- **options**: `object = {}` — Options passed to the release method of each object

**Returns:** `number` — The number of PlaceableObject instances which were released

Inherited from [PlaceablesLayer.releaseAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#releaseAll)

---

### rotateMany

```typescript
rotateMany(
    options?: {
        angle?: number;
        delta?: number;
        ids?: any[];
        includeLocked?: boolean;
        snap?: number;
    }
): Promise<PlaceableObject[]>
```

Simultaneously rotate multiple PlaceableObjects using a provided angle or incremental. This executes a single database operation using Scene#updateEmbeddedDocuments.

**Parameters:**

- **options** (optional):
  - `angle?`: `number` — A target angle of rotation (in degrees) where zero faces "south"
  - `delta?`: `number` — An incremental angle of rotation (in degrees)
  - `ids?`: `any[]` — An Array of object IDs to target for rotation
  - `includeLocked?`: `boolean` — Rotate objects whose documents are locked?
  - `snap?`: `number` — Snap the resulting angle to a multiple of some increment (in degrees)

**Returns:** `Promise<PlaceableObject[]>` — An array of objects which were rotated

**Throws:**  
An error if an explicitly provided id is not valid

Inherited from [PlaceablesLayer.rotateMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#rotateMany)

---

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
    aoptions?: { releaseOthers?: boolean }
): boolean
```

Select all PlaceableObject instances which fall within a coordinate rectangle.

**Parameters:**

- Optional  
  - **options**:
    - `controlOptions?`: `object` — Optional arguments provided to any called control() method.
    - `height?`: `number` — The height of the selection rectangle.
    - `releaseOptions?`: `object` — Optional arguments provided to any called release() method.
    - `width?`: `number` — The width of the selection rectangle.
    - `x?`: `number` — The top-left x-coordinate of the selection rectangle.
    - `y?`: `number` — The top-left y-coordinate of the selection rectangle.
- Optional  
  - **aoptions**: `{ releaseOthers?: boolean } = {}` — Additional options to configure selection behaviour.
  - **releaseOthers?**: `boolean` — Whether to release other selected objects.

**Returns:** `boolean` — A boolean for whether the controlled set was changed in the operation.

Inherited from [PlaceablesLayer.selectObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#selectObjects)

---

### setAllRenderFlags

```typescript
setAllRenderFlags(flags: Record<string, boolean>): void
```

Assign a set of render flags to all placeables in this layer.

**Parameters:**

- **flags**: `Record<string, boolean>` — The flags to set

**Returns:** `void`

Inherited from [PlaceablesLayer.setAllRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#setAllRenderFlags)

---

### storeHistory

```typescript
storeHistory(
    type: "update" | "delete" | "create",
    data: object[],
    options?: object
): void
```

Record a new CRUD event in the history log so that it can be undone later. The base implemenation calls [`PlaceablesLayer#_storeHistory`](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storeHistory) without passing the given options. Subclasses may override this function and can call `PlaceablesLayer#_storeHistory` themselves to pass options as needed.

**Parameters:**

- **type**: `"update" | "delete" | "create"` — The event type
- **data**: `object[]` — The create/update/delete data
- Optional  
  - **options**: `object` — The create/update/delete options

**Returns:** `void`

Inherited from [PlaceablesLayer.storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#storeHistory)

---

### tearDown

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```

Deconstruct data used in the current layer in preparation to re-draw the canvas

**Parameters:**

- Optional  
  - **options**: `object = {}` — Options which configure how the layer is deconstructed

**Returns:** `Promise<CanvasLayer>`

Inherited from [PlaceablesLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#tearDown)

---

### undoHistory

```typescript
undoHistory(): Promise<Document[]>
```

Undo a change to the objects in this layer. This method is typically activated using CTRL+Z while the layer is active.

**Returns:** `Promise<Document[]>` — An array of documents which were modified by the undo operation

Inherited from [PlaceablesLayer.undoHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#undoHistory)

---

### updateAll

```typescript
updateAll(
    transformation: object | Function,
    condition?: null | Function,
    options?: object,
): Promise<Document[]>
```

Update all objects in this layer with a provided transformation. Conditionally filter to only apply to objects which match a certain condition.

**Parameters:**

- **transformation**: `object | Function` — An object of data or function to apply to all matched objects
- **condition** (optional): `null | Function = null` — A function which tests whether to target each object
- **options** (optional): `object = {}` — Additional options passed to Document.update

**Returns:** `Promise<Document[]>` — An array of updated data once the operation is complete

Inherited from [PlaceablesLayer.updateAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#updateAll)

---

### _canvasCoordinatesFromDrop (Protected)

```typescript
_canvasCoordinatesFromDrop(
    event: DragEvent,
    options?: { center?: boolean },
): boolean | number[]
```

Get the world-transformed drop position.

**Parameters:**

- **event**: `DragEvent`
- Optional  
  - **options**: `{ center?: boolean } = {}`  
  - **center?**: `boolean` — Return the coordinates of the center of the nearest grid element.

**Returns:**  
`boolean | number[]` — Returns the transformed x, y coordinates, or false if the drag event was outside the canvas.

Inherited from [PlaceablesLayer._canvasCoordinatesFromDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canvasCoordinatesFromDrop)

---

### _confirmDeleteKey (Protected)

```typescript
_confirmDeleteKey(documents: Document): Promise<boolean>
```

Confirm deletion via the delete key. Called only if [PlaceablesLayerOptions.confirmDeleteKey is true](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.PlaceablesLayerOptions.html#confirmDeleteKey).

**Parameters:**

- **documents**: `Document` — The documents that will be deleted on confirmation.

**Returns:** `Promise<boolean>` — True if the deletion is confirmed to proceed.

Inherited from [PlaceablesLayer._confirmDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_confirmDeleteKey)

---

### _onClickLeft2 (Protected)

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle double left-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent

**Returns:** `void`

Inherited from [PlaceablesLayer._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickLeft2)

---

### _onClickRight2 (Protected)

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle double right mouse-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `FederatedEvent<UIEvent | PixiTouch>` — The PIXI InteractionEvent which wraps a PointerEvent

**Returns:** `void`

Inherited from [PlaceablesLayer._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickRight2)

---

### _onCycleViewKey (Protected)

```typescript
_onCycleViewKey(event: KeyboardEvent): boolean
```

Handle a Cycle View keypress while this layer is active.

**Parameters:**

- **event**: `KeyboardEvent` — The cycle-view key press event

**Returns:** `boolean` — Was the event handled?

Inherited from [PlaceablesLayer._onCycleViewKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCycleViewKey)

---

### _onDropData (Protected)

```typescript
_onDropData(
    event: DragEvent,
    data: object,
): Promise<
    | undefined
    | false
    | Document<object, DocumentConstructionContext>
    | Document<object, DocumentConstructionContext>[]
>
```

Handle drop events for Tile data on the Tiles Layer.

**Parameters:**

- **event**: `DragEvent` — The concluding drag event
- **data**: `object` — The extracted Tile data

**Returns:**  
`Promise<undefined | false | Document | Document[]>`

Protected

Inherited from [PlaceablesLayer._onDropData](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDropData)

---

### _storeHistory (Protected)

```typescript
_storeHistory(
    type: "update" | "delete" | "create",
    data: object[],
    options?: object,
): void
```

Record a new CRUD event in the history log so that it can be undone later. Updates without changes are filtered out unless the `diff` option is set to false. This function may not be overridden.

**Parameters:**

- **type**: `"update" | "delete" | "create"`
- **data**: `object[]`
- Optional  
  - **options**: `object = {}` — The options of the undo operation

**Returns:** `void`

Inherited from [PlaceablesLayer._storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storeHistory)

---

### prepareSceneControls (Static)

```typescript
prepareSceneControls(): {
    activeTool: string;
    icon: string;
    layer: string;
    name: string;
    onChange: (event: any, active: any) => void;
    onToolChange: () => any;
    order: number;
    title: string;
    tools: {
        browse: {
            button: boolean;
            icon: string;
            name: string;
            onChange: () => Promise<FilePicker>;
            order: number;
            title: string;
            toolclip: {
                heading: string;
                items: ToolclipConfigurationItem[];
                src: string;
            };
        };
        foreground: {
            active: boolean;
            icon: string;
            name: string;
            onChange: (event: any, active: any) => void;
            order: number;
            title: string;
            toggle: boolean;
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
            visible: boolean;
        };
        tile: {
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
    };
    visible: boolean;
}
```

Overrides [PlaceablesLayer.prepareSceneControls](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#prepareSceneControls)

---

For the complete class details, visit the official [TilesLayer API Documentation](https://foundryvtt.com/api/classes/foundry.canvas.layers.TilesLayer.html).