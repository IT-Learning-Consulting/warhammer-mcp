# SoundsLayer | Foundry Virtual Tabletop - API Documentation - Version 13

This Canvas Layer provides a container for AmbientSound objects.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.layers.SoundsLayer), Expand):

- _PlaceablesLayer_
- **SoundsLayer**

---

## Properties

### clipboard

`clipboard: { cut: boolean; objects: PlaceableObject[] } = ...`

Keep track of objects copied with CTRL+C/X which can be pasted later.

Inherited from [PlaceablesLayer.clipboard](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clipboard).

---

### eventMode

`eventMode: string = "passive"`

Inherited from [PlaceablesLayer.eventMode](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#eventmode).

---

### highlightObjects

`highlightObjects: boolean = false`

Track whether "highlight all objects" is currently active.

Inherited from [PlaceablesLayer.highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#highlightobjects).

---

### history

`history: CanvasHistoryEvent[] = []`

Keep track of history so that CTRL+Z can undo changes.

Inherited from [PlaceablesLayer.history](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#history).

---

### interactiveChildren

`interactiveChildren: boolean = false`

Whether this event target has any children that need UI events. This can be used to optimize event propagation.

Inherited from [PlaceablesLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#interactivechildren).

---

### livePreview

`livePreview: boolean = false`

Track whether to actively preview ambient sounds with mouse cursor movements.

---

### objects

`objects: null | Container<DisplayObject> = null`

Placeable Layer Objects.

Inherited from [PlaceablesLayer.objects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#objects).

---

### options

`options: { name: string } = ...`

Options for this layer instance.

Inherited from [PlaceablesLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#options).

---

### preview

`preview: null | Container<DisplayObject> = null`

Preview Object Placement.

Inherited from [PlaceablesLayer.preview](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#preview).

---

### quadtree

`quadtree: null | Quadtree = ...`

A Quadtree which partitions and organizes Walls into quadrants for efficient target identification.

Inherited from [PlaceablesLayer.quadtree](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#quadtree).

---

## Accessors

### sources

`sources: Collection<string, PointSoundSource> = ...`

A mapping of ambient audio sources which are active within the rendered Scene.

---

### Static Properties

#### CREATION_STATES

```typescript
CREATION_STATES: {
    COMPLETED: number;
    CONFIRMED: number;
    NONE: number;
    POTENTIAL: number;
} = ...
```

Creation states assigned to placeables during their construction.

Inherited from [PlaceablesLayer.CREATION_STATES](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#creation_states).

---

#### documentName

`documentName: string = "AmbientSound"`

A reference to the named Document type which is contained within this Canvas Layer.

Overrides [PlaceablesLayer.documentName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentname).

---

#### SORT_ORDER

`SORT_ORDER: number = 0`

Sort order for placeables belonging to this layer.

Inherited from [PlaceablesLayer.SORT_ORDER](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#sort_order).

---

### active

`get active(): boolean`

Is this layer currently active.

Returns: `boolean`

Inherited from [PlaceablesLayer.active](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#active).

---

### controlled

`get controlled(): PlaceableObject[]`

An array of placeable objects in this layer which have the _controlled attribute.

Returns: `PlaceableObject[]`

Inherited from [PlaceablesLayer.controlled](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlled).

---

### controlledObjects

`get controlledObjects(): Map<string, PlaceableObject>`

Tracks the set of PlaceableObjects on this layer which are currently controlled.

Returns: `Map<string, PlaceableObject>`

Inherited from [PlaceablesLayer.controlledObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlledObjects).

---

### documentCollection

`get documentCollection(): null | DocumentCollection`

Obtain a reference to the Collection of embedded Document instances within the currently viewed Scene.

Returns: `null | DocumentCollection`

Inherited from [PlaceablesLayer.documentCollection](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#documentCollection).

---

### hookName

`get hookName(): string`

The name used by hooks to construct their hook string.  
Note: You should override this getter if `hookName` should not return the class constructor name.

Returns: `string`

Overrides [PlaceablesLayer.hookName](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hookName).

---

### hover

`get hover(): null | PlaceableObject`

Track the PlaceableObject on this layer which is currently hovered upon.

Returns: `null | PlaceableObject`

Inherited from [PlaceablesLayer.hover](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hover).

---

### hud

`get hud(): null | BasePlaceableHUD<any, any, any>`

If objects on this PlaceablesLayer have a HUD UI, provide a reference to its instance.

Returns: `null | BasePlaceableHUD<any, any, any>`

Inherited from [PlaceablesLayer.hud](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#hud).

---

### name

`get name(): string`

The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.

Returns: `string`

Example: `canvas.lighting.name -> "LightingLayer"`

Inherited from [PlaceablesLayer.name](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#name).

---

### placeables

`get placeables(): PlaceableObject[]`

A convenience method for accessing the placeable object instances contained in this layer.

Returns: `PlaceableObject[]`

Inherited from [PlaceablesLayer.placeables](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#placeables).

---

### instance

`get instance(): CanvasLayer`

Return a reference to the active instance of this canvas layer.

Returns: `CanvasLayer`

Inherited from [PlaceablesLayer.instance](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#instance).

---

### layerOptions

`get layerOptions(): object`

Configuration options for the PlaceablesLayer.

Returns: `object`

Overrides [PlaceablesLayer.layerOptions](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#layerOptions).

---

### placeableClass

`get placeableClass(): typeof PlaceableObject`

Obtain a reference to the PlaceableObject class definition which represents the Document type in this layer.

Returns: `typeof PlaceableObject`

Inherited from [PlaceablesLayer.placeableClass](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#placeableClass).

---

## Methods

### _activate

```typescript
_activate(): void
```

Overrides [PlaceablesLayer._activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_activate).

Returns: `void`

---

### _canDragLeftStart

```typescript
_canDragLeftStart(user: any, event: any): boolean
```

Parameters:

- **user**: `any`
- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._canDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canDragLeftStart).

---

### _deactivate

```typescript
_deactivate(): void
```

Overrides [PlaceablesLayer._deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_deactivate).

Returns: `void`

---

### _draw

```typescript
_draw(options: any): Promise<void>
```

Parameters:

- **options**: `any`

Overrides [PlaceablesLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_draw).

Returns: `Promise<void>`

---

### _highlightObjects

```typescript
_highlightObjects(active: any): void
```

Parameters:

- **active**: `any`

Returns: `void`

Inherited from [PlaceablesLayer._highlightObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_highlightObjects).

---

### _onClickLeft

```typescript
_onClickLeft(event: any): void
```

Parameters:

- **event**: `any`

Returns: `void`

Inherited from [PlaceablesLayer._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickLeft).

---

### _onClickRight

```typescript
_onClickRight(event: any): void
```

Parameters:

- **event**: `any`

Returns: `void`

Inherited from [PlaceablesLayer._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickRight).

---

### _onCopyKey

```typescript
_onCopyKey(event: any): boolean
```

Parameters:

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onCopyKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCopyKey).

---

### _onCutKey

```typescript
_onCutKey(event: any): boolean
```

Parameters:

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onCutKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCutKey).

---

### _onDeleteKey

```typescript
_onDeleteKey(event: any): boolean
```

Parameters:

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDeleteKey).

---

### _onDismissKey

```typescript
_onDismissKey(event: any): boolean
```

Parameters:

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onDismissKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDismissKey).

---

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: any): void
```

Parameters:

- **event**: `any`

Overrides [PlaceablesLayer._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftCancel).

Returns: `void`

---

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: any): void
```

Parameters:

- **event**: `any`

Overrides [PlaceablesLayer._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftDrop).

Returns: `void`

---

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

Parameters:

- **event**: `any`

Overrides [PlaceablesLayer._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftMove).

Returns: `void`

---

### _onDragLeftStart

```typescript
_onDragLeftStart(event: any): void
```

Parameters:

- **event**: `any`

Overrides [PlaceablesLayer._onDragLeftStart](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onDragLeftStart).

Returns: `void`

---

### _onMouseWheel

```typescript
_onMouseWheel(event: any): undefined | Promise<PlaceableObject[]>
```

Parameters:

- **event**: `any`

Returns: `undefined | Promise<PlaceableObject[]>`

Inherited from [PlaceablesLayer._onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onMouseWheel).

---

### _onPasteKey

```typescript
_onPasteKey(event: any): boolean
```

Parameters:

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onPasteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onPasteKey).

---

### _onSelectAllKey

```typescript
_onSelectAllKey(event: any): boolean
```

Parameters:

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onSelectAllKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onSelectAllKey).

---

### _onUndoKey

```typescript
_onUndoKey(event: any): boolean
```

Parameters:

- **event**: `any`

Returns: `boolean`

Inherited from [PlaceablesLayer._onUndoKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onUndoKey).

---

### _tearDown

```typescript
_tearDown(options: any): Promise<void>
```

The inner `_tearDown` method which may be customized by each CanvasLayer subclass.

Parameters:

- **options**: `any` - Options which configure how the layer is deconstructed.

Overrides [PlaceablesLayer._tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_tearDown).

Returns: `Promise<void>`

---

### activate

```typescript
activate(options?: { tool?: string }): InteractionLayer
```

Activate the InteractionLayer, deactivating other layers and marking this layer's children as interactive.

Parameters (optional):

- **options**: `{ tool?: string }` = `{}`  
  options which configure layer activation.
  - `tool?: string` - A specific tool in the control palette to set as active.

Returns: `InteractionLayer`  
The layer instance, now activated.

Inherited from [PlaceablesLayer.activate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#activate).

---

### clearPreviewContainer

```typescript
clearPreviewContainer(): void
```

Clear the contents of the preview container, restoring visibility of original (non-preview) objects.

Returns: `void`

Inherited from [PlaceablesLayer.clearPreviewContainer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#clearPreviewContainer).

---

### controlAll

```typescript
controlAll(options?: object): PlaceableObject[]
```

Acquire control over all PlaceableObject instances which are visible and controllable within the layer.

Parameters (optional):

- **options**: `object` = `{}`  
  Options passed to the control method of each object.

Returns: `PlaceableObject[]`  
An array of objects that were controlled.

Inherited from [PlaceablesLayer.controlAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controlAll).

---

### controllableObjects

```typescript
controllableObjects(): Generator<PlaceableObject, any, any>
```

Iterates over placeable objects that are eligible for control/select.

Yields: `PlaceableObject`

Inherited from [PlaceablesLayer.controllableObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#controllableObjects).

---

### copyObjects

```typescript
copyObjects(options?: { cut?: boolean }): readonly PlaceableObject[]
```

Copy (or cut) currently controlled PlaceableObjects, ready to paste back into the Scene later.

Parameters (optional):

- **options**: `{ cut?: boolean }` = `{}`  
  Additional options.
  - `cut?: boolean` - Cut instead of copy?

Returns: `readonly PlaceableObject[]`  
The array of copied PlaceableObject instances.

Inherited from [PlaceablesLayer.copyObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#copyObjects).

---

### createObject

```typescript
createObject(document: ClientDocument): PlaceableObject
```

Draw a single placeable object.

Parameters:

- **document**: `ClientDocument`  
  The Document instance used to create the placeable object.

Returns: `PlaceableObject`

Inherited from [PlaceablesLayer.createObject](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#createObject).

---

### deactivate

```typescript
deactivate(): InteractionLayer
```

Deactivate the InteractionLayer, removing interactivity from its children.

Returns: `InteractionLayer`  
The layer instance, now inactive.

Inherited from [PlaceablesLayer.deactivate](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deactivate).

---

### deleteAll

```typescript
deleteAll(): Promise<Document[]>
```

A helper method to prompt for deletion of all PlaceableObject instances within the Scene. Renders a confirmation dialogue to confirm with the requester that all objects will be deleted.

Returns: `Promise<Document[]>`  
An array of Document objects which were deleted by the operation.

Inherited from [PlaceablesLayer.deleteAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#deleteAll).

---

### draw

```typescript
draw(options?: object): Promise<CanvasLayer>
```

Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.

Parameters (optional):

- **options**: `object` = `{}`  
  Options which configure how the layer is drawn.

Returns: `Promise<CanvasLayer>`

Inherited from [PlaceablesLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#draw).

---

### emitAtPosition

```typescript
emitAtPosition(...args: any[]): Promise<void>
```

Emit playback to other connected clients to occur at a specified position.

Parameters:

- `...args: any[]` - Arguments passed to `SoundsLayer#playAtPosition`.

Returns: `Promise<void>`  
A Promise which resolves once playback for the initiating client has completed.

---

### get

```typescript
get(objectId: string): PlaceableObject
```

Get a PlaceableObject contained in this layer by its ID. Returns undefined if the object doesn't exist or if the canvas is not rendering a Scene.

Parameters:

- **objectId**: `string`  
  The ID of the contained object to retrieve.

Returns: `PlaceableObject | undefined`

Inherited from [PlaceablesLayer.get](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#get).

---

### getDocuments

```typescript
getDocuments(): [] | DocumentCollection
```

Obtain an iterable of objects which should be added to this PlaceablesLayer.

Returns: `[] | DocumentCollection`

Inherited from [PlaceablesLayer.getDocuments](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getDocuments).

---

### getListenerPositions

```typescript
getListenerPositions(): ElevatedPoint[]
```

Get an array of listener positions for Tokens which are able to hear environmental sound.

Returns: `ElevatedPoint[]`

---

### getMaxSort

```typescript
getMaxSort(): number
```

Get the maximum sort value of all placeables.

Returns: `number`  
The maximum sort value (`-Infinity` if there are no objects).

Inherited from [PlaceablesLayer.getMaxSort](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getMaxSort).

---

### getSnappedPoint

```typescript
getSnappedPoint(point: Point): Point
```

Snaps the given point to grid. The layer defines the snapping behavior.

Parameters:

- **point**: `Point`  
  The point that is to be snapped.

Returns: `Point`  
The snapped point.

Inherited from [PlaceablesLayer.getSnappedPoint](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getSnappedPoint).

---

### getZIndex

```typescript
getZIndex(): number
```

Get the zIndex that should be used for ordering this layer vertically relative to others in the same Container.

Returns: `number`

Inherited from [PlaceablesLayer.getZIndex](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#getZIndex).

---

### initializeSources

```typescript
initializeSources(): void
```

Initialize all AmbientSound sources which are present on this layer.

Returns: `void`

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

Parameters (optional):

- **options**: (default `{}`)
  - `dx?: 0 | 1 | -1` - Horizontal movement direction
  - `dy?: 0 | 1 | -1` - Vertical movement direction
  - `dz?: 0 | 1 | -1` - Movement direction along the z-axis (elevation)
  - `ids?: string[]` - Array of object IDs to target for movement. Default is the IDs of controlled objects.
  - `includeLocked?: boolean` - Move objects whose documents are locked?
  - `rotate?: boolean` - Rotate the placeable to direction instead of moving

Returns: `Promise<PlaceableObject[]>`  
An array of objects which were moved during the operation.

Throws: An error if an explicitly provided `id` is not valid.

Inherited from [PlaceablesLayer.moveMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#moveMany).

---

### pasteObjects

```typescript
pasteObjects(
    position: Point,
    options?: { hidden?: boolean; snap?: boolean }
): Promise<Document[]>
```

Paste currently copied PlaceableObjects back to the layer by creating new copies.

Parameters:

- **position**: `Point`  
  The destination position for the copied data.

- **options** (optional, default `{}`):  
  - `hidden?: boolean` - Paste data in a hidden state, if applicable. Default is false.
  - `snap?: boolean` - Snap the resulting objects to the grid. Default is true.

Returns: `Promise<Document[]>`  
An Array of created Document instances.

Inherited from [PlaceablesLayer.pasteObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#pasteObjects).

---

### playAtPosition

```typescript
playAtPosition(
    src: string,
    origin: Point | ElevatedPoint,
    radius: number,
    options?: {
        baseEffect?: any;
        easing?: boolean;
        gmAlways?: boolean;
        muffledEffect?: any;
        playbackOptions?: any;
        sourceData?: Partial<PointEffectSourceData>;
        volume?: number;
        walls?: boolean;
    }
): Promise<null | Sound>
```

Play a one-shot Sound originating from a predefined point on the canvas. The sound plays locally for the current client only. To play a sound for all connected clients use `SoundsLayer#emitAtPosition`.

Parameters:

- **src**: `string`  
  The sound source path to play.

- **origin**: `Point | ElevatedPoint`  
  The canvas coordinates from which the sound originates.

- **radius**: `number`  
  The radius of effect in distance units.

- **options** (optional, default `{}`):
  - `baseEffect?: any` - A base sound effect to apply to playback.
  - `easing?: boolean` - Should volume be attenuated by distance?
  - `gmAlways?: boolean` - Should the sound always be played for GM users regardless of actively controlled tokens?
  - `muffledEffect?: any` - A muffled sound effect to apply, applicable if not constrained by walls.
  - `playbackOptions?: any` - Additional options passed to Sound#play.
  - `sourceData?: Partial<PointEffectSourceData>` - Additional data passed to the SoundSource constructor.
  - `volume?: number` - The maximum volume at which the effect should be played.
  - `walls?: boolean` - Should the sound be constrained by walls?

Returns: `Promise<null | Sound>`  
A Promise which resolves to the played Sound, or null.

#### Example: Play the sound of a trap springing

```typescript
const src = "modules/my-module/sounds/spring-trap.ogg";
const origin = {x: 5200, y: 3700};  // The origin point for the sound
const radius = 30;                  // Audible in a 30-foot radius
await canvas.sounds.playAtPosition(src, origin, radius);
```

#### Example: A Token casts a spell

```typescript
const src = "modules/my-module/sounds/spells-sprite.ogg";
const origin = token.center;        // The origin point for the sound
const radius = 60;                  // Audible in a 60-foot radius
await canvas.sounds.playAtPosition(src, origin, radius, {
  walls: false,                    // Not constrained by walls with a lowpass muffled effect
  muffledEffect: {type: "lowpass", intensity: 6},
  sourceData: {
    angle: 120,                   // Sound emitted at a limited angle
    rotation: 270                // Configure the direction of sound emission
  },
  playbackOptions: {
    loopStart: 12,                // Audio sprite timing
    loopEnd: 16,
    fade: 300,                   // Fade-in 300ms
    onended: () => console.log("Do something after the spell sound has played")
  }
});
```

---

### previewSound

```typescript
previewSound(position: Point | ElevatedPoint): void
```

Preview ambient audio for a given position.

Parameters:

- **position**: `Point | ElevatedPoint`  
  The position to preview.

Returns: `void`

---

### refresh

```typescript
refresh(options?: object): undefined | number
```

Update all AmbientSound effects in the layer by toggling their playback status. Sync audio for the positions of tokens which are capable of hearing.

Parameters (optional):

- **options**: `object` = `{}`  
  Additional options forwarded to AmbientSound synchronization.

Returns: `undefined | number`

---

### releaseAll

```typescript
releaseAll(options?: object): number
```

Release all controlled PlaceableObject instances from this layer.

Parameters (optional):

- **options**: `object` = `{}`  
  Options passed to the release method of each object.

Returns: `number`  
The number of PlaceableObject instances which were released.

Inherited from [PlaceablesLayer.releaseAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#releaseAll).

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

Simultaneously rotate multiple PlaceableObjects using a provided angle or incremental. This executes a single database operation using Scene#updateEmbeddedDocuments.

Parameters (optional):

- **options**: (default `{}`)
  - `angle?: number` - A target angle of rotation (in degrees) where zero faces "south".
  - `delta?: number` - An incremental angle of rotation (in degrees).
  - `ids?: any[]` - An array of object IDs to target for rotation.
  - `includeLocked?: boolean` - Rotate objects whose documents are locked?
  - `snap?: number` - Snap the resulting angle to a multiple of some increment (in degrees).

Returns: `Promise<PlaceableObject[]>`  
An array of objects which were rotated.

Throws: An error if an explicitly provided `id` is not valid.

Inherited from [PlaceablesLayer.rotateMany](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#rotateMany).

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

Parameters (optional):

- **options**: (default `{}`)
  - `controlOptions?: object` - Optional arguments provided to any called `control()` method.
  - `height?: number` - Height of the selection rectangle.
  - `releaseOptions?: object` - Optional arguments provided to any called `release()` method.
  - `width?: number` - Width of the selection rectangle.
  - `x?: number` - The top-left x-coordinate of the selection rectangle.
  - `y?: number` - The top-left y-coordinate of the selection rectangle.

- **aoptions**: (default `{}`)
  - `releaseOthers?: boolean` - Whether to release other selected objects.

Returns: `boolean`  
A boolean for whether the controlled set was changed in the operation.

Inherited from [PlaceablesLayer.selectObjects](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#selectObjects).

---

### setAllRenderFlags

```typescript
setAllRenderFlags(flags: Record<string, boolean>): void
```

Assign a set of render flags to all placeables in this layer.

Parameters:

- **flags**: `Record<string, boolean>` - The flags to set.

Returns: `void`

Inherited from [PlaceablesLayer.setAllRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#setAllRenderFlags).

---

### stopAll

```typescript
stopAll(): void
```

Terminate playback of all ambient audio sources.

Returns: `void`

---

### storeHistory

```typescript
storeHistory(type: "update" | "delete" | "create", data: object[], options?: object): void
```

Record a new CRUD event in the history log so that it can be undone later. The base implementation calls [PlaceablesLayer#_storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storeHistory) without passing the given options. Subclasses may override this function and can call PlaceablesLayer#_storeHistory themselves to pass options as needed.

Parameters:

- **type**: `"update" | "delete" | "create"` - The event type.
- **data**: `object[]` - The create/update/delete data.
- **options** (optional): `object` - The create/update/delete options.

Returns: `void`

Inherited from [PlaceablesLayer.storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#storeHistory).

---

### tearDown

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```

Deconstruct data used in the current layer in preparation to re-draw the canvas.

Parameters (optional):

- **options**: `object` = `{}`  
  Options which configure how the layer is deconstructed.

Returns: `Promise<CanvasLayer>`

Inherited from [PlaceablesLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#tearDown).

---

### undoHistory

```typescript
undoHistory(): Promise<Document[]>
```

Undo a change to the objects in this layer. This method is typically activated using CTRL+Z while the layer is active.

Returns: `Promise<Document[]>`  
An array of documents which were modified by the undo operation.

Inherited from [PlaceablesLayer.undoHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#undoHistory).

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

Parameters:

- **transformation**: `object | Function`  
  An object of data or function to apply to all matched objects.

- **condition** (optional): `null | Function` = `null`  
  A function which tests whether to target each object.

- **options** (optional): `object` = `{}`  
  Additional options passed to Document.update.

Returns: `Promise<Document[]>`  
An array of updated data once the operation is complete.

Inherited from [PlaceablesLayer.updateAll](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#updateAll).

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

Parameters:

- **event**: `DragEvent`
- **options** (optional, default `{}`):
  - `center?: boolean` - Return the coordinates of the center of the nearest grid element.

Returns: `boolean | number[]`  
Returns the transformed x, y coordinates, or false if the drag event was outside the canvas.

Inherited from [PlaceablesLayer._canvasCoordinatesFromDrop](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_canvasCoordinatesFromDrop).

---

### _configurePlayback

```typescript
_configurePlayback(config: AmbientSoundPlaybackConfig): void
```

Configure playback by assigning the muffled state and final playback volume for the sound. This method should mutate the config object by assigning the `volume` and `muffled` properties.

Parameters:

- **config**: `AmbientSoundPlaybackConfig`

Returns: `void`

---

### _confirmDeleteKey

```typescript
_confirmDeleteKey(documents: Document): Promise<boolean>
```

Confirm deletion via the delete key. Called only if [foundry.canvas.layers.types.PlaceablesLayerOptions#confirmDeleteKey](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.PlaceablesLayerOptions.html#confirmDeleteKey) is true.

Parameters:

- **documents**: `Document`  
  The documents that will be deleted on confirmation.

Returns: `Promise<boolean>`  
True if the deletion is confirmed to proceed.

Inherited from [PlaceablesLayer._confirmDeleteKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_confirmDeleteKey).

---

### _onClickLeft2

```typescript
_onClickLeft2(event: FederatedEvent<UIEvent> | PixiTouch): void
```

Handle double left-click events which originate from the Canvas stage.

Parameters:

- **event**: `FederatedEvent<UIEvent> | PixiTouch`  
  The PIXI InteractionEvent which wraps a PointerEvent.

Returns: `void`

Inherited from [PlaceablesLayer._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickLeft2).

---

### _onClickRight2

```typescript
_onClickRight2(event: FederatedEvent<UIEvent> | PixiTouch): void
```

Handle double right mouse-click events which originate from the Canvas stage.

Parameters:

- **event**: `FederatedEvent<UIEvent> | PixiTouch`

Returns: `void`

Inherited from [PlaceablesLayer._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onClickRight2).

---

### _onCycleViewKey

```typescript
_onCycleViewKey(event: KeyboardEvent): boolean
```

Handle a Cycle View keypress while this layer is active.

Parameters:

- **event**: `KeyboardEvent`  
  The cycle-view key press event.

Returns: `boolean`  
Was the event handled?

Inherited from [PlaceablesLayer._onCycleViewKey](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_onCycleViewKey).

---

### _onDropData

```typescript
_onDropData(event: DragEvent, data: object): Promise<false | PlaceableObject>
```

Handle PlaylistSound document drop data.

Parameters:

- **event**: `DragEvent`  
  The drag drop event.

- **data**: `object`  
  The dropped transfer data.

Returns: `Promise<false | PlaceableObject>`

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

Parameters:

- **type**: `"update" | "delete" | "create"`  
  The event type.

- **data**: `object[]`  
  The create/update/delete data.

- **options** (optional, default `{}`): `object`  
  The options of the undo operation.

Returns: `void`

Inherited from [PlaceablesLayer._storeHistory](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#_storeHistory).

---

### _syncPositions

```typescript
_syncPositions(listeners: ElevatedPoint[], options?: object): void
```

Sync the playing state and volume of all AmbientSound objects based on the position of listener points.

Parameters:

- **listeners**: `ElevatedPoint[]`  
  Locations of listeners which have the capability to hear.

- **options** (optional): `object`  
  Additional options forwarded to AmbientSound synchronization.

Returns: `void`

---

## Static Methods

### prepareSceneControls

```typescript
prepareSceneControls():
{
    activeTool: string;
    icon: string;
    layer: string;
    name: string;
    onChange: (_event: any, active: any) => void;
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
        preview: {
            active: any;
            icon: string;
            name: string;
            onChange: (_event: any, toggled: any) => void;
            order: number;
            title: string;
            toggle: boolean;
            toolclip: {
                heading: string;
                items: { paragraph: string }[];
                src: string;
            };
        };
        sound: {
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

Overrides [PlaceablesLayer.prepareSceneControls](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html#prepareSceneControls).

---

# References

- [PlaceablesLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.PlaceablesLayer.html)
- [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)
- [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)
- [InteractionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html)
- [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)
- [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)
- [AmbientSoundPlaybackConfig](https://foundryvtt.com/api/interfaces/foundry.canvas.layers.types.AmbientSoundPlaybackConfig.html)
- [PointEffectSourceData](https://foundryvtt.com/api/interfaces/foundry.PointEffectSourceData.html)
- [Sound](https://foundryvtt.com/api/classes/foundry.audio.Sound.html)
- [DocumentCollection](https://foundryvtt.com/api/classes/foundry.documents.abstract.DocumentCollection.html)
- [ToolclipConfigurationItem](https://foundryvtt.com/api/interfaces/foundry.ToolclipConfigurationItem.html)

---

For more information, visit the full [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.layers.SoundsLayer.html).