# BaseRuler

The ruler that is used to measure distances on the Canvas.

Mixes: **RenderFlagsMixin**

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.interaction.BaseRuler)):

- RenderFlagObject<this>  
- **BaseRuler**  
- [Ruler](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ruler.html)


---

## Constructors

### constructor

```typescript
new BaseRuler(user: documents.User): BaseRuler
```

**Parameters**

- **user**: `documents.User`  
  The User for whom to construct the Ruler instance

**Returns**  
`BaseRuler`

Overrides `RenderFlagsMixin().constructor`.

---

## Properties

### renderFlags

**Inherited from** `RenderFlagsMixin().renderFlags`

**Accessor**

```typescript
renderFlags: RenderFlags
```

Status flags which are applied at render-time to update the PlaceableObject. If an object defines `RenderFlags`, it should at least include flags for `"redraw"` and `"refresh"`.

---

### Static: RENDER_FLAG_PRIORITY

```typescript
RENDER_FLAG_PRIORITY: string = "OBJECTS"
```

The ticker priority when RenderFlags of this class are handled. Valid values are `OBJECTS` or `PERCEPTION`.

Inherited from `RenderFlagsMixin().RENDER_FLAG_PRIORITY`.

---

### Static: RENDER_FLAGS

```typescript
RENDER_FLAGS = { refresh: {} }
```

Overrides `RenderFlagsMixin().RENDER_FLAGS`.

---

## Accessors

### active

```typescript
get active(): boolean
```

Is this Ruler active? True if the path of the Ruler is nonempty.

**Returns**  
`boolean`

---

### destination

```typescript
get destination(): undefined | ElevatedPoint
```

The last point of the path, or `undefined` if the path is empty.

**Returns**  
`undefined | ElevatedPoint`

---

### hidden

```typescript
get hidden(): boolean
```

Is this Ruler hidden? If true, only the User of the Ruler can see it.

**Default Value:** `false`

**Returns**  
`boolean`

---

### origin

```typescript
get origin(): undefined | ElevatedPoint
```

The first point of the path, or `undefined` if the path is empty.

**Returns**  
`undefined | ElevatedPoint`

---

### path

```typescript
get path(): readonly Readonly<ElevatedPoint>[]
set path(value: readonly Readonly<ElevatedPoint>[]): void
```

The sequence of points that the Ruler measures.

**Default Value:** `[]`

**Parameters**

- **value**: `readonly Readonly<ElevatedPoint>[]`

**Returns**  
`void`

---

### user

```typescript
get user(): documents.User
```

The User who this Ruler belongs to.

**Returns**  
`documents.User`

---

### visible

```typescript
get visible(): boolean
```

The Ruler is visible if it is active and either not hidden or its User is the current User.

**Returns**  
`boolean`

---

### Static: canMeasure

```typescript
get canMeasure(): boolean
```

Is the Ruler ready to measure?

**Returns**  
`boolean`

---

## Methods

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

Overrides `RenderFlagsMixin().applyRenderFlags`.

**Returns**  
`void`

---

### destroy

```typescript
destroy(): void
```

Destroy the Ruler.

**Returns**  
`void`

---

### draw

```typescript
draw(): Promise<void>
```

Draw the Ruler.

**Returns**  
`Promise<void>`

---

### refresh

```typescript
refresh(): void
```

Refresh the Ruler.

**Returns**  
`void`

---

### reset

```typescript
reset(): void
```

Reset the path and the hidden state of the Ruler.

**Returns**  
`void`

---

### _addDragWaypoint

```typescript
protected _addDragWaypoint(point: Point, options?: { snap?: boolean }): void
```

Add a waypoint.

**Parameters**

- **point**: `Point`  
  The (unsnapped) waypoint

- **options?**: `{ snap?: boolean } = {}`  
  Additional options

  - **snap?**: `boolean`  
    Snap the added waypoint?

**Returns**  
`void`

---

### _changeDragElevation

```typescript
protected _changeDragElevation(delta: number, options?: { precise?: boolean }): void
```

Change the elevation of the destination.

**Parameters**

- **delta**: `number`  
  The number of vertical steps.

- **options?**: `{ precise?: boolean } = {}`  
  Additional options

  - **precise?**: `boolean`  
    Round elevations to multiples of the grid distance divided by `CONFIG.Canvas.elevationSnappingPrecision`?  
    If false, rounds to multiples of the grid distance.

**Returns**  
`void`

---

### _onClickLeft

```typescript
protected _onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle left-click events on the Canvas during Ruler measurement.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer-down event

**Returns**  
`void`

---

### _onClickRight

```typescript
protected _onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle right-click events on the Canvas during Ruler measurement.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer-down event

**Returns**  
`void`

---

### _onDragCancel

```typescript
protected _onDragCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```

Handle the end of the Ruler measurement workflow.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The drag cancel event

**Returns**  
`boolean | void`

If `false`, the cancellation of the drag workflow is prevented.

---

### _onDragStart

```typescript
protected _onDragStart(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle the beginning of a new Ruler measurement workflow.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The drag start event

**Returns**  
`void`

---

### _onHiddenChange

```typescript
protected _onHiddenChange(): void
```

Called when the Ruler becomes hidden or unhidden.

**Returns**  
`void`

---

### _onMouseMove

```typescript
protected _onMouseMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Continue a Ruler measurement workflow for left-mouse movements on the Canvas.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The mouse move event

**Returns**  
`void`

---

### _onMouseUp

```typescript
protected _onMouseUp(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Conclude a Ruler measurement workflow by releasing the left-mouse button.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer-up event

**Returns**  
`void`

---

### _onMouseWheel

```typescript
protected _onMouseWheel(event: WheelEvent): void
```

Adjust the elevation of Ruler waypoints by scrolling up/down.

**Parameters**

- **event**: `WheelEvent`  
  The mousewheel event

**Returns**  
`void`

---

### _onPathChange

```typescript
protected _onPathChange(): void
```

Called when the Ruler's path has changed.

**Returns**  
`void`

---

### _refresh

```typescript
protected _refresh(): void
```

Refresh the Ruler.

**Returns**  
`void`

---

### _removeDragWaypoint

```typescript
protected _removeDragWaypoint(): void
```

Remove the second to last waypoint.

**Returns**  
`void`

---

### Static: getSnappedPoint

```typescript
static getSnappedPoint(point: Point): Point
```

Snaps the given point to the grid.

**Parameters**

- **point**: `Point`  
  The point that is to be snapped

**Returns**  
`Point` - The snapped point

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html).