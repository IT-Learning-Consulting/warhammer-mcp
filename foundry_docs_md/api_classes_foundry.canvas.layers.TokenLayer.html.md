# TokenLayer | Foundry Virtual Tabletop - API Documentation - Version 13

## Class TokenLayer

The Tokens Container.

**Hierarchy**: [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.TokenLayer)  
Extends: [PlaceablesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html)

---

## Properties

### clipboard

```typescript
clipboard: { cut: boolean; objects: PlaceableObject[] } = ...
```
Keep track of objects copied with CTRL+C/X which can be pasted later.

Inherited from [PlaceablesLayer.clipboard](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clipboard)

---

### eventMode

```typescript
eventMode: string = "passive"
```
Inherited from [PlaceablesLayer.eventMode](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#eventmode)

---

### highlightObjects

```typescript
highlightObjects: boolean = false
```
Track whether "highlight all objects" is currently active.

Inherited from [PlaceablesLayer.highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#highlightobjects)

---

### history

```typescript
history: CanvasHistoryEvent[] = []
```
Keep track of history so that CTRL+Z can undo changes.

Inherited from [PlaceablesLayer.history](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#history)

---

### interactiveChildren

```typescript
interactiveChildren: boolean = false
```
Whether this event target has any children that need UI events. This can be used to optimize event propagation.

Inherited from [PlaceablesLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#interactivechildren)

---

### objects

```typescript
objects: null | Container<DisplayObject> = null
```
Placeable Layer Objects.

Inherited from [PlaceablesLayer.objects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#objects)

---

### options

```typescript
options: { name: string } = ...
```
Options for this layer instance.

Inherited from [PlaceablesLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#options)

---

### preview

```typescript
preview: null | Container<DisplayObject> = null
```
Preview Object Placement.

Inherited from [PlaceablesLayer.preview](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#preview)

---

### quadtree

```typescript
quadtree: null | Quadtree = ...
```
A Quadtree which partitions and organizes Walls into quadrants for efficient target identification.

Inherited from [PlaceablesLayer.quadtree](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#quadtree)

---

### turnMarkers

```typescript
turnMarkers: Set<canvas.placeables.Token> = ...
```
A Set of Token objects which currently display a combat turn marker.

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
Creation states assigned to placeables during their construction.

Inherited from [PlaceablesLayer.CREATION_STATES](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#creation_states)

---

### documentName

```typescript
documentName: string = "Token"
```
A reference to the named Document type which is contained within this Canvas Layer.

Overrides [PlaceablesLayer.documentName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentname)

---

### SORT_ORDER

```typescript
SORT_ORDER: number = 0
```
Sort order for placeables belonging to this layer.

Inherited from [PlaceablesLayer.SORT_ORDER](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#sort_order)

---

## Accessors

### active

```typescript
get active(): boolean
```
Is this layer currently active.

Returns: `boolean`

Inherited from [PlaceablesLayer.active](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#active)

---

### controlled

```typescript
get controlled(): PlaceableObject[]
```
An Array of placeable objects in this layer which have the _controlled attribute.

Returns: `PlaceableObject[]`

Inherited from [PlaceablesLayer.controlled](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlled)

---

### controlledObjects

```typescript
get controlledObjects(): Map<string, PlaceableObject>
```
Track the set of PlaceableObjects on this layer which are currently controlled.

Returns: `Map<string, PlaceableObject>`

Inherited from [PlaceablesLayer.controlledObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlledObjects)

---

### documentCollection

```typescript
get documentCollection(): null | DocumentCollection
```
Obtain a reference to the Collection of embedded Document instances within the currently viewed Scene.

Returns: `null | DocumentCollection`

Inherited from [PlaceablesLayer.documentCollection](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentCollection)

---

### hookName

```typescript
get hookName(): string
```
The name used by hooks to construct their hook string. Note: You should override this getter if hookName should not return the class constructor name.

Returns: `string`

Overrides [PlaceablesLayer.hookName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hookName)

---

### hover

```typescript
get hover(): null | PlaceableObject
```
Track the PlaceableObject on this layer which is currently hovered upon.

Returns: `null | PlaceableObject`

Inherited from [PlaceablesLayer.hover](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hover)

---

### hud

```typescript
get hud(): TokenHUD
```
Returns: `TokenHUD`

Overrides [PlaceablesLayer.hud](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hud)

---

### name

```typescript
get name(): string
```
The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.

Returns: `string`

Example:  
`canvas.lighting.name -> "LightingLayer"`

Inherited from [PlaceablesLayer.name](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#name)

---

### occlusionMode

```typescript
get occlusionMode(): number
```
The set of tokens that trigger occlusion (a union of [CONST.TOKEN_OCCLUSION_MODES](https://foundryvtt.com/api/variables/CONST.TOKEN_OCCLUSION_MODES.html)).

Returns: `number`

---

### ownedTokens

```typescript
get ownedTokens(): canvas.placeables.Token[]
```
An Array of tokens which belong to actors which are owned.

Returns: `canvas.placeables.Token[]`

---

### placeables

```typescript
get placeables(): PlaceableObject[]
```
A convenience method for accessing the placeable object instances contained in this layer.

Returns: `PlaceableObject[]`

Inherited from [PlaceablesLayer.placeables](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#placeables)

---

### instance

```typescript
get instance(): CanvasLayer
```
Return a reference to the active instance of this canvas layer.

Returns: `CanvasLayer`

Inherited from [PlaceablesLayer.instance](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#instance)

---

### layerOptions

```typescript
get layerOptions(): object
```
Configuration options for the PlaceablesLayer.

Returns: `object`

Overrides [PlaceablesLayer.layerOptions](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#layerOptions)

---

### placeableClass

```typescript
get placeableClass(): typeof PlaceableObject
```
Obtain a reference to the PlaceableObject class definition which represents the Document type in this layer.

Returns: `typeof PlaceableObject`

Inherited from [PlaceablesLayer.placeableClass](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#placeableClass)

---

## Methods

### _activate

```typescript
_activate(): void
```
Overrides [PlaceablesLayer._activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_activate)

Returns: `void`

---

### _canDragLeftStart

```typescript
_canDragLeftStart(user: any, event: any): boolean
```

**Parameters:**

- **user**: `any`
- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canDragLeftStart)

---

### _confirmDeleteKey

```typescript
_confirmDeleteKey(documents: any): Promise<any>
```

**Parameters:**

- **documents**: `any`

Returns: `Promise<any>`

Overrides [PlaceablesLayer._confirmDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_confirmDeleteKey)

---

### _deactivate

```typescript
_deactivate(): void
```
Overrides [PlaceablesLayer._deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_deactivate)

Returns: `void`

---

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters:**

- **options**: `any`

Returns: `Promise<void>`

Overrides [PlaceablesLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_draw)

---

### _highlightObjects

```typescript
_highlightObjects(active: any): void
```

**Parameters:**

- **active**: `any`

Returns: `void`

Overrides [PlaceablesLayer._highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_highlightObjects)

---

### _onClickLeft

```typescript
_onClickLeft(event: any): any
```

**Parameters:**

- **event**: `any`

Returns: `any`

Overrides [PlaceablesLayer._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickLeft)

---

### _onClickLeft2

```typescript
_onClickLeft2(event: any): void
```
Handle double left-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `any`  
  The PIXI InteractionEvent which wraps a PointerEvent

Returns: `void`

Overrides [PlaceablesLayer._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickLeft2)

---

### _onClickRight

```typescript
_onClickRight(event: any): void
```

**Parameters:**

- **event**: `any`

Returns: `void`

Overrides [PlaceablesLayer._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickRight)

---

### _onClickRight2

```typescript
_onClickRight2(event: any): void
```
Handle double right mouse-click events which originate from the Canvas stage.

**Parameters:**

- **event**: `any`  
  The PIXI InteractionEvent which wraps a PointerEvent

Returns: `void`

Overrides [PlaceablesLayer._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickRight2)

---

### _onCopyKey

```typescript
_onCopyKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onCopyKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCopyKey)

---

### _onCutKey

```typescript
_onCutKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onCutKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCutKey)

---

### _onCycleViewKey

```typescript
_onCycleViewKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Overrides [PlaceablesLayer._onCycleViewKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCycleViewKey)

---

### _onDeleteKey

```typescript
_onDeleteKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDeleteKey)

---

### _onDismissKey

```typescript
_onDismissKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onDismissKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDismissKey)

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: any): void
```

**Parameters:**

- **event**: `any`

Returns: `void`

Overrides [PlaceablesLayer._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftCancel)

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: any): void
```

**Parameters:**

- **event**: `any`

Returns: `void`

Inherited from [PlaceablesLayer._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftDrop)

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

**Parameters:**

- **event**: `any`

Returns: `void`

Inherited from [PlaceablesLayer._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftMove)

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: any): void
```

**Parameters:**

- **event**: `any`

Returns: `void`

Inherited from [PlaceablesLayer._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftStart)

---

### _onMouseWheel

```typescript
_onMouseWheel(event: any): undefined | Promise<PlaceableObject[]>
```

**Parameters:**

- **event**: `any`

Returns: `undefined | Promise<PlaceableObject[]>`

Overrides [PlaceablesLayer._onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onMouseWheel)

---

### _onPasteKey

```typescript
_onPasteKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onPasteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onPasteKey)

---

### _onSelectAllKey

```typescript
_onSelectAllKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onSelectAllKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onSelectAllKey)

---

### _onUndoKey

```typescript
_onUndoKey(event: any): boolean
```

**Parameters:**

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onUndoKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onUndoKey)

---

### _prepareKeyboardMovementUpdates

```typescript
_prepareKeyboardMovementUpdates(
  objects: any,
  dx: any,
  dy: any,
  dz: any,
): ({ _id: any }[] | { movement: {} })[]
```

**Parameters:**

- **objects**: `any`
- **dx**: `any`
- **dy**: `any`
- **dz**: `any`

Returns: `({ _id: any }[] | { movement: {} })[]`

Overrides [PlaceablesLayer._prepareKeyboardMovementUpdates](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_prepareKeyboardMovementUpdates)

---

### _tearDown

```typescript
_tearDown(options: any): Promise<void>
```
The inner _tearDown method which may be customized by each CanvasLayer subclass.

**Parameters:**

- **options**: `any` - Options which configure how the layer is deconstructed

Returns: `Promise<void>`

Overrides [PlaceablesLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_tearDown)

---

### activate

```typescript
activate(options?: { tool?: string }): InteractionLayer
```
Activate the InteractionLayer, deactivating other layers and marking this layer's children as interactive.

**Parameters:**

- **options?**:  
  - **tool?**: `string` - A specific tool in the control palette to set as active

Returns: `InteractionLayer` - The layer instance, now activated.

Inherited from [PlaceablesLayer.activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#activate)

---

### clearPreviewContainer

```typescript
clearPreviewContainer(): void
```
Clear the contents of the preview container, restoring visibility of original (non-preview) objects.

Returns: `void`

Inherited from [PlaceablesLayer.clearPreviewContainer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clearPreviewContainer)

---

### concludeAnimation

```typescript
concludeAnimation(): void
```
Immediately conclude the animation of any/all tokens.

Returns: `void`

---

### controlAll

```typescript
controlAll(options?: object): PlaceableObject[]
```
Acquire control over all PlaceableObject instances which are visible and controllable within the layer.

**Parameters:**

- **options**: `object` = {} - Options passed to the control method of each object

Returns: `PlaceableObject[]` - An array of objects that were controlled.

Inherited from [PlaceablesLayer.controlAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlAll)

---

### controllableObjects

```typescript
controllableObjects(): Generator<PlaceableObject, any, any>
```
Iterates over placeable objects that are eligible for control/select.

Returns: `Generator<PlaceableObject, any, any>`

Yields: A placeable object

Inherited from [PlaceablesLayer.controllableObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controllableObjects)

---

### copyObjects

```typescript
copyObjects(options?: { cut?: boolean }): readonly PlaceableObject[]
```
Copy (or cut) currently controlled PlaceableObjects, ready to paste back into the Scene later.

**Parameters:**

- **options?**:  
  - **cut?**: `boolean` - Cut instead of copy?

Returns: `readonly PlaceableObject[]` - The Array of copied PlaceableObject instances.

Inherited from [PlaceablesLayer.copyObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#copyObjects)

---

### createObject

```typescript
createObject(document: ClientDocument): PlaceableObject
```
Draw a single placeable object.

**Parameters:**

- **document**: `ClientDocument` - The Document instance used to create the placeable object

Returns: `PlaceableObject`

Inherited from [PlaceablesLayer.createObject](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#createObject)

---

### cycleTokens

```typescript
cycleTokens(forwards: boolean, reset: boolean): null | canvas.placeables.Token
```
Cycle the controlled token by rotating through the list of Owned Tokens that are available within the Scene. Tokens are currently sorted in order of their TokenID.

**Parameters:**

- **forwards**: `boolean` - Which direction to cycle. A truthy value cycles forward, while false cycles backwards.
- **reset**: `boolean` - Restart the cycle order back at the beginning?

Returns: `null | canvas.placeables.Token` - The Token object which was cycled to, or null.

---

### deactivate

```typescript
deactivate(): InteractionLayer
```
Deactivate the InteractionLayer, removing interactivity from its children.

Returns: `InteractionLayer` - The layer instance, now inactive.

Inherited from [PlaceablesLayer.deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deactivate)

---

### deleteAll

```typescript
deleteAll(): Promise<Document[]>
```
A helper method to prompt for deletion of all PlaceableObject instances within the Scene. Renders a confirmation dialogue to confirm with the requester that all objects will be deleted.

Returns: `Promise<Document[]>` - An array of Document objects which were deleted by the operation.

Inherited from [PlaceablesLayer.deleteAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deleteAll)

---

### draw

```typescript
draw(options?: object): Promise<CanvasLayer>
```
Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

**Parameters:**

- **options?**: `object` = `{}` - Options which configure how the layer is drawn

Returns: `Promise<CanvasLayer>`

Inherited from [PlaceablesLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#draw)

---

### get

```typescript
get(objectId: string): PlaceableObject
```
Get a PlaceableObject contained in this layer by its ID. Returns undefined if the object doesn't exist or if the canvas is not rendering a Scene.

**Parameters:**

- **objectId**: `string` - The ID of the contained object to retrieve

Returns: `PlaceableObject | undefined`

Inherited from [PlaceablesLayer.get](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#get)

---

### getDocuments

```typescript
getDocuments(): [] | DocumentCollection
```
Obtain an iterable of objects which should be added to this PlaceablesLayer.

Returns: `[] | DocumentCollection`

Inherited from [PlaceablesLayer.getDocuments](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getDocuments)

---

### getMaxSort

```typescript
getMaxSort(): number
```
Get the maximum sort value of all placeables.

Returns: `number` - The maximum sort value (-Infinity if there are no objects).

Inherited from [PlaceablesLayer.getMaxSort](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getMaxSort)

---

### getSnappedPoint

```typescript
getSnappedPoint(point: any): Point
```

**Parameters:**

- **point**: `any`

Returns: `Point`

Overrides [PlaceablesLayer.getSnappedPoint](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getSnappedPoint)

---

### getZIndex

```typescript
getZIndex(): number
```
Get the zIndex that should be used for ordering this layer vertically relative to others in the same Container.

Returns: `number`

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
  },
): Promise<PlaceableObject[]>
```
Simultaneously move multiple PlaceableObjects via keyboard movement offsets. This executes a single database operation using Scene#updateEmbeddedDocuments.

**Parameters:**

- **options?**:
  - **dx?**: `0 | 1 | -1` - Horizontal movement direction
  - **dy?**: `0 | 1 | -1` - Vertical movement direction
  - **dz?**: `0 | 1 | -1` - Movement direction along the z-axis (elevation)
  - **ids?**: `string[]` - An Array of object IDs to target for movement. The default is the IDs of controlled objects.
  - **includeLocked?**: `boolean` - Move objects whose documents are locked?
  - **rotate?**: `boolean` - Rotate the placeable to direction instead of moving

Returns: `Promise<PlaceableObject[]>` - An array of objects which were moved during the operation

Throws: An error if an explicitly provided id is not valid

Inherited from [PlaceablesLayer.moveMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#moveMany)

---

### pasteObjects

```typescript
pasteObjects(
  position: Point,
  options?: { hidden?: boolean; snap?: boolean },
): Promise<Document[]>
```
Paste currently copied PlaceableObjects back to the layer by creating new copies.

**Parameters:**

- **position**: `Point` - The destination position for the copied data.
- **options?**:
  - **hidden?**: `boolean` - Paste data in a hidden state, if applicable. Default is false.
  - **snap?**: `boolean` - Snap the resulting objects to the grid. Default is true.

Returns: `Promise<Document[]>` - An Array of created Document instances.

Inherited from [PlaceablesLayer.pasteObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#pasteObjects)

---

### recalculatePlannedMovementPaths

```typescript
recalculatePlannedMovementPaths(): void
```
Recalculate the planned movement paths of all Tokens for the current User.

Returns: `void`

---

### releaseAll

```typescript
releaseAll(options?: object): number
```
Release all controlled PlaceableObject instances from this layer.

**Parameters:**

- **options**: `object` = {} - Options passed to the release method of each object

Returns: `number` - The number of PlaceableObject instances which were released.

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
  },
): Promise<PlaceableObject[]>
```
Simultaneously rotate multiple PlaceableObjects using a provided angle or increment. This executes a single database operation using Scene#updateEmbeddedDocuments.

**Parameters:**

- **options?**:
  - **angle?**: `number` - A target angle of rotation (in degrees) where zero faces "south"
  - **delta?**: `number` - An incremental angle of rotation (in degrees)
  - **ids?**: `any[]` - An Array of object IDs to target for rotation
  - **includeLocked?**: `boolean` - Rotate objects whose documents are locked?
  - **snap?**: `number` - Snap the resulting angle to a multiple of some increment (in degrees)

Returns: `Promise<PlaceableObject[]>` - An array of objects which were rotated

Throws: An error if an explicitly provided id is not valid

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
  aoptions?: { releaseOthers?: boolean },
): boolean
```
Select all PlaceableObject instances which fall within a coordinate rectangle.

**Parameters:**

- **options?**:
  - **controlOptions?**: `object` - Optional arguments provided to any called control() method.
  - **height?**: `number` - The height of the selection rectangle.
  - **releaseOptions?**: `object` - Optional arguments provided to any called release() method.
  - **width?**: `number` - The width of the selection rectangle.
  - **x?**: `number` - The top-left x-coordinate of the selection rectangle.
  - **y?**: `number` - The top-left y-coordinate of the selection rectangle.
- **aoptions?**:
  - **releaseOthers?**: `boolean` - Whether to release other selected objects.

Returns: `boolean` - Whether the controlled set was changed in the operation.

Inherited from [PlaceablesLayer.selectObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#selectObjects)

---

### setAllRenderFlags

```typescript
setAllRenderFlags(flags: Record<string, boolean>): void
```
Assign a set of render flags to all placeables in this layer.

**Parameters:**

- **flags**: `Record<string, boolean>` - The flags to set.

Returns: `void`

Inherited from [PlaceablesLayer.setAllRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#setAllRenderFlags)

---

### setTargets

```typescript
setTargets(
  targetIds: string[] | Set<string>,
  options?: { mode?: "replace" | "acquire" | "release" },
): void
```
Assign multiple token targets.

**Parameters:**

- **targetIds**: `string[] | Set<string>` - The array or set of Token IDs.
- **options?**:
  - **mode?**: `"replace" | "acquire" | "release"` - The mode that determines the targeting behavior:
    - `"replace"` (default): Replace the current set of targeted Tokens with provided set.
    - `"acquire"`: Acquire the given Tokens as targets without releasing already targeted Tokens.
    - `"release"`: Release the given Tokens as targets.

Returns: `void`

---

### storeHistory

```typescript
storeHistory(type: any, data: any, options: any): void
```

**Parameters:**

- **type**: `"update" | "delete" | "create"`
- **data**: `object[]` - The create/update/delete data
- **options?**: `object` = {} - The options of the undo operation

Returns: `void`

Overrides [PlaceablesLayer.storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#storeHistory)

---

### targetObjects

```typescript
targetObjects(
  rectangle: Rectangle,
  options?: { releaseOthers?: boolean },
): void
```
Target all Token instances which fall within a coordinate rectangle.

**Parameters:**

- **rectangle**: `Rectangle` - The selection rectangle.
- **options?**:  
  - **releaseOthers?**: `boolean` - Whether or not to release other targeted tokens.

Returns: `void`

---

### tearDown

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```
Deconstruct data used in the current layer in preparation to re-draw the canvas.

**Parameters:**

- **options?**: `object` = {} - Options which configure how the layer is deconstructed

Returns: `Promise<CanvasLayer>`

Inherited from [PlaceablesLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#tearDown)

---

### undoHistory

```typescript
undoHistory(): Promise<Document[]>
```
Undo a change to the objects in this layer. This method is typically activated using CTRL+Z while the layer is active.

Returns: `Promise<Document[]>` - An array of documents which were modified by the undo operation.

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

- **transformation**: `object | Function` - An object of data or function to apply to all matched objects.
- **condition?**: `null | Function` = `null` - A function which tests whether to target each object.
- **options?**: `object` = `{}` - Additional options passed to Document.update.

Returns: `Promise<Document[]>` - An array of updated data once the operation is complete.

Inherited from [PlaceablesLayer.updateAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#updateAll)

---

### _canvasCoordinatesFromDrop

```typescript
_canvasCoordinatesFromDrop(
  event: DragEvent,
  options?: { center?: boolean },
): boolean | number[]
```
Get the world-transformed drop position.

**Parameters:**

- **event**: `DragEvent`
- **options?**:
  - **center?**: `boolean` - Return the coordinates of the center of the nearest grid element.

Returns: `boolean | number[]` - The transformed x, y coordinates, or false if the drag event was outside the canvas.

Inherited from [PlaceablesLayer._canvasCoordinatesFromDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canvasCoordinatesFromDrop)

---

### _getOccludableTokens

```typescript
_getOccludableTokens(): canvas.placeables.Token[]
```
Provide an array of Tokens which are eligible subjects for tile occlusion. By default, only tokens which are currently controlled or owned by a player are included as subjects.

Returns: `canvas.placeables.Token[]`

---

### _storeHistory

```typescript
_storeHistory(
  type: "update" | "delete" | "create",
  data: object[],
  options?: object,
): void
```
Record a new CRUD event in the history log so that it can be undone later. Updates without changes are filtered out unless the `diff` option is set to false. This function may not be overridden.

**Parameters:**

- **type**: `"update" | "delete" | "create"` - The event type
- **data**: `object[]` - The create/update/delete data
- **options?**: `object` = `{}` - The options of the undo operation

Returns: `void`

Inherited from [PlaceablesLayer._storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storeHistory)

---

## Static Methods

### prepareSceneControls

```typescript
prepareSceneControls(): {
    activeTool: string;
    icon: string;
    name: string;
    onChange: (event: any, active: any) => void;
    onToolChange: () => any;
    order: number;
    title: string;
    tools: {
        ruler: { icon: string; name: string; order: number; title: string };
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
        target: {
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
        unconstrainedMovement: {
            active: boolean;
            icon: string;
            name: string;
            order: number;
            title: string;
            toggle: boolean;
            visible: boolean;
        };
    };
}
```
Overrides [PlaceablesLayer.prepareSceneControls](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#prepareSceneControls)

Returns: An object defining scene controls configuration with activeTool, icon, name, tools, and callbacks.

---

For further detail, please visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.canvas.layers.TokenLayer.html).