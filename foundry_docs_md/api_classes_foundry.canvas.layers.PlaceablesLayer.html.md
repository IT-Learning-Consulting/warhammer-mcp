# PlaceablesLayer

A subclass of Canvas Layer which is specifically designed to contain multiple PlaceableObject instances, each corresponding to an embedded Document.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.PlaceablesLayer)):

- _InteractionLayer_
- **PlaceablesLayer**
- _DrawingsLayer_
- _LightingLayer_
- _NotesLayer_
- _WallsLayer_
- _TokenLayer_
- _RegionLayer_
- _SoundsLayer_
- _TemplateLayer_
- _TilesLayer_

---

## Properties

### clipboard

```typescript
clipboard: { cut: boolean; objects: PlaceableObject[] } = ...
```

Keep track of objects copied with CTRL+C/X which can be pasted later.

### eventMode

```typescript
eventMode: string = "passive"
```

Inherited from [InteractionLayer.eventMode](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#eventmode)

### highlightObjects

```typescript
highlightObjects: boolean = false
```

Track whether "highlight all objects" is currently active.

### history

```typescript
history: CanvasHistoryEvent[] = []
```

Keep track of history so that CTRL+Z can undo changes.

### interactiveChildren

```typescript
interactiveChildren: boolean = false
```

Whether this event target has any children that need UI events. This can be used to optimize event propagation.

Inherited from [InteractionLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#interactivechildren)

### objects

```typescript
objects: null | Container<DisplayObject> = null
```

Placeable Layer Objects

### options

```typescript
options: { name: string } = ...
```

Options for this layer instance.

Inherited from [InteractionLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#options)

### preview

```typescript
preview: null | Container<DisplayObject> = null
```

Preview Object Placement

### quadtree

```typescript
quadtree: null | Quadtree = ...
```

A Quadtree which partitions and organizes Walls into quadrants for efficient target identification.

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

### documentName

```typescript
documentName: string
```

A reference to the named Document type which is contained within this Canvas Layer.

---

## Accessors

### SORT_ORDER

```typescript
SORT_ORDER: number = 0
```

Sort order for placeables belonging to this layer.

### active

```typescript
get active(): boolean
```

Is this layer currently active.

Returns boolean

Inherited from InteractionLayer.active

### controlled

```typescript
get controlled(): PlaceableObject[]
```

An Array of placeable objects in this layer which have the _controlled attribute

Returns PlaceableObject[]

### controlledObjects

```typescript
get controlledObjects(): Map<string, PlaceableObject>
```

Track the set of PlaceableObjects on this layer which are currently controlled.

Returns Map<string, PlaceableObject>

### documentCollection

```typescript
get documentCollection(): null | DocumentCollection
```

Obtain a reference to the Collection of embedded Document instances within the currently viewed Scene.

Returns null | [DocumentCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)

### hookName

```typescript
get hookName(): string
```

The name used by hooks to construct their hook string. Note: You should override this getter if hookName should not return the class constructor name.

Returns string

Inherited from InteractionLayer.hookName

### hover

```typescript
get hover(): null | PlaceableObject
```

Track the PlaceableObject on this layer which is currently hovered upon.

Returns null | PlaceableObject

### hud

```typescript
get hud(): null | BasePlaceableHUD<any, any, any>
```

If objects on this PlaceablesLayer have a HUD UI, provide a reference to its instance

Returns null | [BasePlaceableHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.BasePlaceableHUD.html)

### name

```typescript
get name(): string
```

The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.

Returns string

Example:  
`canvas.lighting.name -> "LightingLayer"`

### placeables

```typescript
get placeables(): PlaceableObject[]
```

A convenience method for accessing the placeable object instances contained in this layer.

Returns PlaceableObject[]

### instance

```typescript
static get instance(): CanvasLayer
```

Return a reference to the active instance of this canvas layer.

Returns CanvasLayer

Inherited from InteractionLayer.instance

### layerOptions

```typescript
static get layerOptions(): PlaceablesLayerOptions
```

Configuration options for the PlaceablesLayer.

Returns PlaceablesLayerOptions

Overrides InteractionLayer.layerOptions

### placeableClass

```typescript
static get placeableClass(): typeof PlaceableObject
```

Obtain a reference to the PlaceableObject class definition which represents the Document type in this layer.

Returns typeof PlaceableObject

---

## Methods

### _activate

```typescript
_activate(): void
```

Overrides [InteractionLayer._activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_activate)

Returns void

### _canDragLeftStart

```typescript
_canDragLeftStart(user: any, event: any): boolean
```

Overrides [InteractionLayer._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_candragleftstart)

**Parameters**

- **user**: `any`  
- **event**: `any`

Returns boolean

### _deactivate

```typescript
_deactivate(): void
```

Overrides [InteractionLayer._deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_deactivate)

Returns void

### _draw

```typescript
_draw(options: any): Promise<void>
```

Overrides [InteractionLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_draw)

**Parameters**

- **options**: `any`

Returns Promise<void>

### _highlightObjects

```typescript
_highlightObjects(active: any): void
```

Overrides [InteractionLayer._highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_highlightobjects)

**Parameters**

- **active**: `any`

Returns void

### _onClickLeft

```typescript
_onClickLeft(event: any): void
```

Overrides [InteractionLayer._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickleft)

**Parameters**

- **event**: `any`

Returns void

### _onClickRight

```typescript
_onClickRight(event: any): void
```

Overrides [InteractionLayer._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickright)

**Parameters**

- **event**: `any`

Returns void

### _onCopyKey

```typescript
_onCopyKey(event: any): boolean
```

Overrides [InteractionLayer._onCopyKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_oncopykey)

**Parameters**

- **event**: `any`

Returns boolean

### _onCutKey

```typescript
_onCutKey(event: any): boolean
```

Overrides [InteractionLayer._onCutKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_oncutkey)

**Parameters**

- **event**: `any`

Returns boolean

### _onDeleteKey

```typescript
_onDeleteKey(event: any): boolean
```

Overrides [InteractionLayer._onDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondeletekey)

**Parameters**

- **event**: `any`

Returns boolean

### _onDismissKey

```typescript
_onDismissKey(event: any): boolean
```

Overrides [InteractionLayer._onDismissKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondismisskey)

**Parameters**

- **event**: `any`

Returns boolean

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: any): void
```

Overrides [InteractionLayer._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftcancel)

**Parameters**

- **event**: `any`

Returns void

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: any): void
```

Overrides [InteractionLayer._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftdrop)

**Parameters**

- **event**: `any`

Returns void

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

Overrides [InteractionLayer._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftmove)

**Parameters**

- **event**: `any`

Returns void

### _onDragLeftStart

```typescript
_onDragLeftStart(event: any): void
```

Overrides [InteractionLayer._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_ondragleftstart)

**Parameters**

- **event**: `any`

Returns void

### _onMouseWheel

```typescript
_onMouseWheel(event: any): undefined | Promise<PlaceableObject[]>
```

Overrides [InteractionLayer._onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onmousewheel)

**Parameters**

- **event**: `any`

Returns undefined | Promise<PlaceableObject[]>

### _onPasteKey

```typescript
_onPasteKey(event: any): boolean
```

Overrides [InteractionLayer._onPasteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onpastekey)

**Parameters**

- **event**: `any`

Returns boolean

### _onSelectAllKey

```typescript
_onSelectAllKey(event: any): boolean
```

Overrides [InteractionLayer._onSelectAllKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onselectallkey)

**Parameters**

- **event**: `any`

Returns boolean

### _onUndoKey

```typescript
_onUndoKey(event: any): boolean
```

Overrides [InteractionLayer._onUndoKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onundokey)

**Parameters**

- **event**: `any`

Returns boolean

### _tearDown

```typescript
_tearDown(options: any): Promise<void>
```

The inner _tearDown method which may be customized by each CanvasLayer subclass.

Overrides [InteractionLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_teardown)

**Parameters**

- **options**: `any`

Returns Promise<void>

### activate

```typescript
activate(options?: { tool?: string }): InteractionLayer
```

Activate the InteractionLayer, deactivating other layers and marking this layer's children as interactive.

**Parameters**

- Optional  
  - **options**: `{ tool?: string } = {}`  
    Options which configure layer activation  
  - **tool?**: `string`  
    A specific tool in the control palette to set as active

Returns InteractionLayer

Inherited from [InteractionLayer.activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#activate)

### clearPreviewContainer

```typescript
clearPreviewContainer(): void
```

Clear the contents of the preview container, restoring visibility of original (non-preview) objects.

Returns void

### controlAll

```typescript
controlAll(options?: object): PlaceableObject[]
```

Acquire control over all PlaceableObject instances which are visible and controllable within the layer.

**Parameters**

- **options**: `object = {}`  
  Options passed to the control method of each object

Returns PlaceableObject[]

### controllableObjects

```typescript
controllableObjects(): Generator<PlaceableObject, any, any>
```

Iterates over placeable objects that are eligible for control/select.

Returns Generator<PlaceableObject, any, any>

Yields a placeable object

### copyObjects

```typescript
copyObjects(options?: { cut?: boolean }): readonly PlaceableObject[]
```

Copy (or cut) currently controlled PlaceableObjects, ready to paste back into the Scene later.

**Parameters**

- Optional  
  - **options**: `{ cut?: boolean } = {}`  
    Additional options  
  - **cut?**: `boolean`  
    Cut instead of copy?

Returns readonly PlaceableObject[]  
The Array of copied PlaceableObject instances

### createObject

```typescript
createObject(document: ClientDocument): PlaceableObject
```

Draw a single placeable object.

**Parameters**

- **document**: `ClientDocument`  
  The Document instance used to create the placeable object

Returns PlaceableObject

### deactivate

```typescript
deactivate(): InteractionLayer
```

Deactivate the InteractionLayer, removing interactivity from its children.

Returns InteractionLayer  
The layer instance, now inactive

Inherited from [InteractionLayer.deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#deactivate)

### deleteAll

```typescript
deleteAll(): Promise<Document[]>
```

A helper method to prompt for deletion of all PlaceableObject instances within the Scene. Renders a confirmation dialogue to confirm with the requester that all objects will be deleted.

Returns Promise<Document[]>  
An array of Document objects which were deleted by the operation

### draw

```typescript
draw(options?: object): Promise<CanvasLayer>
```

Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

**Parameters**

- Optional  
  - **options**: `object = {}`  
    Options which configure how the layer is drawn

Returns Promise<CanvasLayer>

Inherited from [InteractionLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#draw)

### get

```typescript
get(objectId: string): PlaceableObject
```

Get a PlaceableObject contained in this layer by its ID. Returns undefined if the object doesn't exist or if the canvas is not rendering a Scene.

**Parameters**

- **objectId**: `string`  
  The ID of the contained object to retrieve

Returns PlaceableObject | undefined

### getDocuments

```typescript
getDocuments(): [] | DocumentCollection
```

Obtain an iterable of objects which should be added to this PlaceablesLayer.

Returns [] | [DocumentCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)

### getMaxSort

```typescript
getMaxSort(): number
```

Get the maximum sort value of all placeables.

Returns number  
The maximum sort value (-Infinity if there are no objects)

### getSnappedPoint

```typescript
getSnappedPoint(point: Point): Point
```

Snaps the given point to grid. The layer defines the snapping behavior.

**Parameters**

- **point**: `Point`  
  The point that is to be snapped

Returns Point  
The snapped point

### getZIndex

```typescript
getZIndex(): number
```

Get the zIndex that should be used for ordering this layer vertically relative to others in the same Container.

Returns number

Inherited from [InteractionLayer.getZIndex](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#getzindex)

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

**Parameters**

- Optional  
  - **options**:  
    - **dx?**: `0 | 1 | -1` - Horizontal movement direction  
    - **dy?**: `0 | 1 | -1` - Vertical movement direction  
    - **dz?**: `0 | 1 | -1` - Movement direction along the z-axis (elevation)  
    - **ids?**: `string[]` - An Array of object IDs to target for movement. The default is the IDs of controlled objects.  
    - **includeLocked?**: `boolean` - Move objects whose documents are locked?  
    - **rotate?**: `boolean` - Rotate the placeable to direction instead of moving

Returns Promise<PlaceableObject[]>  
An array of objects which were moved during the operation

Throws  
An error if an explicitly provided id is not valid

### pasteObjects

```typescript
pasteObjects(
    position: Point,
    options?: { hidden?: boolean; snap?: boolean },
): Promise<Document[]>
```

Paste currently copied PlaceableObjects back to the layer by creating new copies.

**Parameters**

- **position**: `Point`  
  The destination position for the copied data.
- Optional  
  - **options**: `{ hidden?: boolean; snap?: boolean } = {}`  
    Options which modify the paste operation  
  - **hidden?**: `boolean` - Paste data in a hidden state, if applicable. Default is false.  
  - **snap?**: `boolean` - Snap the resulting objects to the grid. Default is true.

Returns Promise<Document[]>  
An Array of created Document instances

### releaseAll

```typescript
releaseAll(options?: object): number
```

Release all controlled PlaceableObject instance from this layer.

**Parameters**

- **options**: `object = {}`  
  Options passed to the release method of each object

Returns number  
The number of PlaceableObject instances which were released

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

**Parameters**

- Optional  
  - **options**:  
    - **angle?**: `number` - A target angle of rotation (in degrees) where zero faces "south"  
    - **delta?**: `number` - An incremental angle of rotation (in degrees)  
    - **ids?**: `any[]` - An Array of object IDs to target for rotation  
    - **includeLocked?**: `boolean` - Rotate objects whose documents are locked?  
    - **snap?**: `number` - Snap the resulting angle to a multiple of some increment (in degrees)

Returns Promise<PlaceableObject[]>  
An array of objects which were rotated

Throws  
An error if an explicitly provided id is not valid

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

**Parameters**

- Optional  
  - **options**:  
    - **controlOptions?**: `object` - Optional arguments provided to any called control() method.  
    - **height?**: `number` - The height of the selection rectangle.  
    - **releaseOptions?**: `object` - Optional arguments provided to any called release() method.  
    - **width?**: `number` - The width of the selection rectangle.  
    - **x?**: `number` - The top-left x-coordinate of the selection rectangle.  
    - **y?**: `number` - The top-left y-coordinate of the selection rectangle.
- Optional  
  - **aoptions**: `{ releaseOthers?: boolean } = {}`  
    Additional options to configure selection behaviour.  
  - **releaseOthers?**: `boolean` - Whether to release other selected objects.

Returns boolean  
A boolean for whether the controlled set was changed in the operation.

### setAllRenderFlags

```typescript
setAllRenderFlags(flags: Record<string, boolean>): void
```

Assign a set of render flags to all placeables in this layer.

**Parameters**

- **flags**: `Record<string, boolean>`  
  The flags to set

Returns void

### storeHistory

```typescript
storeHistory(
    type: "update" | "delete" | "create",
    data: object[],
    options?: object,
): void
```

Record a new CRUD event in the history log so that it can be undone later. The base implementation calls [PlaceablesLayer#_storeHistory](#_storehistory) without passing the given options.

Subclasses may override this function and can call [PlaceablesLayer#_storeHistory](#_storehistory) themselves to pass options as needed.

**Parameters**

- **type**: `"update"` | `"delete"` | `"create"`  
  The event type
- **data**: `object[]`  
  The create/update/delete data
- Optional  
  - **options**: `object`  
    The create/update/delete options

Returns void

### tearDown

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```

Deconstruct data used in the current layer in preparation to re-draw the canvas.

**Parameters**

- Optional  
  - **options**: `object = {}`  
    Options which configure how the layer is deconstructed

Returns Promise<CanvasLayer>

Inherited from [InteractionLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#teardown)

### undoHistory

```typescript
undoHistory(): Promise<Document[]>
```

Undo a change to the objects in this layer. This method is typically activated using CTRL+Z while the layer is active.

Returns Promise<Document[]>  
An array of documents which were modified by the undo operation

### updateAll

```typescript
updateAll(
    transformation: object | Function,
    condition?: null | Function,
    options?: object,
): Promise<Document[]>
```

Update all objects in this layer with a provided transformation. Conditionally filter to only apply to objects which match a certain condition.

**Parameters**

- **transformation**: `object | Function`  
  An object of data or function to apply to all matched objects
- **condition**: `null | Function = null`  
  A function which tests whether to target each object
- Optional  
  - **options**: `object = {}`  
    Additional options passed to Document.update

Returns Promise<Document[]>  
An array of updated data once the operation is complete

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

**Parameters**

- **event**: `DragEvent`
- Optional  
  - **options**: `{ center?: boolean } = {}`  
  - **center?**: `boolean` - Return the coordinates of the center of the nearest grid element.

Returns boolean | number[]  
Returns the transformed x, y coordinates, or false if the drag event was outside the canvas.

### _confirmDeleteKey

```typescript
_confirmDeleteKey(documents: Document): Promise<boolean>
```

Confirm deletion via the delete key. Called only if [PlaceablesLayerOptions.confirmDeleteKey](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.PlaceablesLayerOptions.html#confirmdeletekey) is true.

**Parameters**

- **documents**: `Document`  
  The documents that will be deleted on confirmation.

Returns Promise<boolean>  
True if the deletion is confirmed to proceed.

### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle double left-click events which originate from the Canvas stage.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI InteractionEvent which wraps a PointerEvent

Returns void

Inherited from [InteractionLayer._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickleft2)

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle double right mouse-click events which originate from the Canvas stage.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The PIXI InteractionEvent which wraps a PointerEvent

Returns void

Inherited from [InteractionLayer._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_onclickright2)

### _onCycleViewKey

```typescript
_onCycleViewKey(event: KeyboardEvent): boolean
```

Handle a Cycle View keypress while this layer is active.

**Parameters**

- **event**: `KeyboardEvent`  
  The cycle-view key press event

Returns boolean  
Was the event handled?

Inherited from [InteractionLayer._onCycleViewKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html#_oncycleviewkey)

### _storeHistory

```typescript
_storeHistory(
    type: "update" | "delete" | "create",
    data: object[],
    options?: object,
): void
```

Record a new CRUD event in the history log so that it can be undone later. Updates without changes are filtered out unless the `diff` option is set to false. This function may not be overridden.

**Parameters**

- **type**: `"update"` | `"delete"` | `"create"`  
  The event type
- **data**: `object[]`  
  The create/update/delete data
- Optional  
  - **options**: `object = {}`  
    The options of the undo operation

Returns void

---

## Links

- [PlaceableObject Class](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)
- [CanvasLayer Class](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)
- [DocumentCollection Class](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)
- [InteractionLayer Class](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html)
- [PlaceablesLayerOptions Interface](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.PlaceablesLayerOptions.html)
- [CanvasHistoryEvent Interface](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.CanvasHistoryEvent.html)
- [Quadtree Class](https://foundryvtt.com/api/classes/foundry.canvas.geometry.Quadtree.html)
- [BasePlaceableHUD Class](https://foundryvtt.com/api/classes/foundry.applications.hud.BasePlaceableHUD.html)