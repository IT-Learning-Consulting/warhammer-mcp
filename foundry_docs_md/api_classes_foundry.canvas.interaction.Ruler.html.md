# Ruler | Foundry Virtual Tabletop - API Documentation - Version 13

The default implementation of the `Ruler`.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.interaction.Ruler)  

- *BaseRuler*  
- **Ruler**  

## Properties

### renderFlags  
**Type:** [RenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.interaction.RenderFlags.html)  
Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for "redraw" and "refresh".  
Inherited from [BaseRuler.renderFlags](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#renderflags)

### RENDER_FLAG_PRIORITY  
**Type:** `string` = `"OBJECTS"`  
The ticker priority when RenderFlags of this class are handled. Valid values are `OBJECTS` or `PERCEPTION`.  
Inherited from [BaseRuler.RENDER_FLAG_PRIORITY](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#render_flag_priority)

### RENDER_FLAGS  
**Type:** `{ refresh: {} }`  
Inherited from [BaseRuler.RENDER_FLAGS](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#render_flags)

### WAYPOINT_LABEL_TEMPLATE  
**Type:** `string` = `"templates/hud/waypoint-label.hbs"`  
A handlebars template used to render each waypoint label.

## Accessors

### active  
```typescript
get active(): boolean
```
Is this Ruler active? True, if the path of the Ruler is nonempty.  
Returns: `boolean`  
Inherited from BaseRuler.active

### destination  
```typescript
get destination(): undefined | ElevatedPoint
```
The last point of the path, or undefined if the path is empty.  
Returns: `undefined | ElevatedPoint`  
Inherited from BaseRuler.destination

### hidden  
```typescript
get hidden(): boolean
```
Is this Ruler hidden? If true, only the User of the Ruler can see it.  
Returns: `boolean`  
Default Value: `false`  
Inherited from BaseRuler.hidden

### origin  
```typescript
get origin(): undefined | ElevatedPoint
```
The first point of the path, or undefined if the path is empty.  
Returns: `undefined | ElevatedPoint`  
Inherited from BaseRuler.origin

### path  
```typescript
get path(): readonly Readonly<ElevatedPoint>[]
set path(value: readonly Readonly<ElevatedPoint>[])
```
The sequence of points that the Ruler measures.  
Returns: `readonly Readonly<ElevatedPoint>[]`  

**Parameters**

- **value**: readonly `Readonly<ElevatedPoint>[]`  
  Default: `[]`

Inherited from BaseRuler.path

### user  
```typescript
get user(): documents.User
```
The User who this Ruler belongs to.  
Returns: `documents.User`  
Inherited from BaseRuler.user

### visible  
```typescript
get visible(): boolean
```
The Ruler is visible if it is active and either not hidden or its User is the current User.  
Returns: `boolean`  
Inherited from BaseRuler.visible

### canMeasure  
```typescript
static get canMeasure(): boolean
```
Is the Ruler ready to measure?  
Returns: `boolean`  
Inherited from BaseRuler.canMeasure

## Methods

### _refresh  
```typescript
_refresh(): void
```
Overrides [BaseRuler._refresh](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_refresh)  
Returns: `void`

### applyRenderFlags  
```typescript
applyRenderFlags(): void
```
Inherited from [BaseRuler.applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#applyrenderflags)  
Returns: `void`

### destroy  
```typescript
destroy(): void
```
Overrides [BaseRuler.destroy](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#destroy)  
Returns: `void`

### draw  
```typescript
draw(): Promise<void>
```
Overrides [BaseRuler.draw](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#draw)  
Returns: `Promise<void>`

### refresh  
```typescript
refresh(): void
```
Refresh the Ruler.  
Inherited from [BaseRuler.refresh](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#refresh)  
Returns: `void`

### reset  
```typescript
reset(): void
```
Reset the path and the hidden state of the Ruler.  
Inherited from [BaseRuler.reset](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#reset)  
Returns: `void`

### _addDragWaypoint  
```typescript
protected _addDragWaypoint(point: Point, options?: { snap?: boolean }): void
```
Protected  
Add a waypoint.

**Parameters**

- **point**: `Point`  
  The (unsnapped) waypoint
- **options?**: `{ snap?: boolean } = {}`  
  Additional options

  - **snap?**: `boolean`  
    Snap the added waypoint?  

Returns: `void`  
Inherited from [BaseRuler._addDragWaypoint](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_adddragwaypoint)

### _changeDragElevation  
```typescript
protected _changeDragElevation(delta: number, options?: { precise?: boolean }): void
```
Protected  
Change the elevation of the destination.

**Parameters**

- **delta**: `number`  
  The number of vertical steps
- **options?**: `{ precise?: boolean } = {}`  
  Additional options

  - **precise?**: `boolean`  
    Round elevations to multiples of the grid distance divided by `CONFIG.Canvas.elevationSnappingPrecision`?  
    If false, rounds to multiples of the grid distance.

Returns: `void`  
Inherited from [BaseRuler._changeDragElevation](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_changedragelevation)

### _configureOutline  
```typescript
protected _configureOutline(): { color: ColorSource; thickness: number }
```
Protected  
Configure the properties of the outline. Called in [Ruler.draw](api_classes_foundry.canvas.interaction.Ruler.html.html#6).  
Returns: `{ color: ColorSource; thickness: number }`  
The thickness in pixels and the color.

### _getSegmentStyle  
```typescript
protected _getSegmentStyle(
  waypoint: DeepReadonly<RulerWaypoint>,
): { alpha?: number; color?: ColorSource; width: number }
```
Protected  
Get the style of the segment from the previous to the given waypoint.

**Parameters**

- **waypoint**: `DeepReadonly<RulerWaypoint>`  
  The waypoint.

Returns:  
`{ alpha?: number; color?: ColorSource; width: number }`  
The line width, color, and alpha of the segment.

### _getWaypointLabelContext  
```typescript
protected _getWaypointLabelContext(
  waypoint: DeepReadonly<RulerWaypoint>, 
  state: object,
): void | object
```
Protected  
Get the context used to render a ruler waypoint label.

**Parameters**

- **waypoint**: `DeepReadonly<RulerWaypoint>`
- **state**: `object`

Returns: `void | object`

### _getWaypointStyle  
```typescript
protected _getWaypointStyle(
  waypoint: DeepReadonly<RulerWaypoint>,
): { alpha?: number; color?: ColorSource; radius: number }
```
Protected  
Get the style of the waypoint at the given waypoint.

**Parameters**

- **waypoint**: `DeepReadonly<RulerWaypoint>`  
  The waypoint.

Returns:  
`{ alpha?: number; color?: ColorSource; radius: number }`  
The radius, color, and alpha of the waypoint.

### _onClickLeft  
```typescript
protected _onClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Protected  
Handle left-click events on the Canvas during Ruler measurement.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer-down event.

Returns: `void`  
Inherited from [BaseRuler._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_onclickleft)

### _onClickRight  
```typescript
protected _onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Protected  
Handle right-click events on the Canvas during Ruler measurement.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer-down event.

Returns: `void`  
Inherited from [BaseRuler._onClickRight](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_onclickright)

### _onDragCancel  
```typescript
protected _onDragCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void
```
Protected  
Handle the end of the Ruler measurement workflow.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The drag cancel event.

Returns: `boolean | void`  
If false, the cancellation of the drag workflow is prevented.  
Inherited from [BaseRuler._onDragCancel](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_ondragcancel)

### _onDragStart  
```typescript
protected _onDragStart(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Protected  
Handle the beginning of a new Ruler measurement workflow.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The drag start event.

Returns: `void`  
Inherited from [BaseRuler._onDragStart](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_ondragstart)

### _onHiddenChange  
```typescript
protected _onHiddenChange(): void
```
Protected  
Called when the Ruler becomes hidden or unhidden.  
Returns: `void`  
Inherited from [BaseRuler._onHiddenChange](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_onhiddenchange)

### _onMouseMove  
```typescript
protected _onMouseMove(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Protected  
Continue a Ruler measurement workflow for left-mouse movements on the Canvas.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The mouse move event.

Returns: `void`  
Inherited from [BaseRuler._onMouseMove](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_onmousemove)

### _onMouseUp  
```typescript
protected _onMouseUp(event: FederatedEvent<UIEvent | PixiTouch>): void
```
Protected  
Conclude a Ruler measurement workflow by releasing the left-mouse button.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The pointer-up event.

Returns: `void`  
Inherited from [BaseRuler._onMouseUp](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_onmouseup)

### _onMouseWheel  
```typescript
protected _onMouseWheel(event: WheelEvent): void
```
Protected  
Adjust the elevation of Ruler waypoints by scrolling up/down.

**Parameters**

- **event**: `WheelEvent`  
  The mousewheel event.

Returns: `void`  
Inherited from [BaseRuler._onMouseWheel](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_onmousewheel)

### _onPathChange  
```typescript
protected _onPathChange(): void
```
Protected  
Called when the Ruler's path has changed.

Returns: `void`  
Inherited from [BaseRuler._onPathChange](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_onpathchange)

### _removeDragWaypoint  
```typescript
protected _removeDragWaypoint(): void
```
Protected  
Remove the second to last waypoint.

Returns: `void`  
Inherited from [BaseRuler._removeDragWaypoint](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#_removedragwaypoint)

### getSnappedPoint  
```typescript
static getSnappedPoint(point: Point): Point
```
Snaps the given point to the grid.

**Parameters**

- **point**: `Point`  
  The point that is to be snapped.

Returns: `Point`  
The snapped point.  
Inherited from [BaseRuler.getSnappedPoint](https://foundryvtt.com/api/classes/foundry.canvas.interaction.BaseRuler.html#getsnappedpoint)