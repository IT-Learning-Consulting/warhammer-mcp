# ResizeHandle | Foundry Virtual Tabletop - API Documentation - Version 13

A class based on PIXI.Graphics, that allows to create a resize handle in the desired area.

## Hierarchy

*Graphics<this>*

**ResizeHandle**

---

## Constructors

### constructor

```typescript
new ResizeHandle(
    offset: number[],
    handlers?: { canDrag?: Function },
): ResizeHandle
```

**Parameters**

- **offset**: `number[]`  
  A two-element array `[xFactor, yFactor]` which defines the normalized position of this handle relative to the bounding box.

- **handlers**? : `{ canDrag?: Function }` = `{}`  
  An object of optional handler functions.

  - **canDrag**?: `Function`  
    A function determining if this handle can initiate a drag.

**Returns**  
`ResizeHandle`

Overrides `PIXI.smooth.SmoothGraphics.constructor`.

---

## Properties

### active

`active: boolean = false`  
Track whether the handle is being actively used for a drag workflow.

### offset

`offset: number[]`  
A two-element array `[xFactor, yFactor]` which defines the normalized position of this handle relative to the bounding box.

---

## Methods

### activateListeners

```typescript
activateListeners(): void
```

Activate listeners for pointer events, enabling hover and mouse-down behavior on the resize handle.

**Returns**  
`void`

---

### refresh

```typescript
refresh(bounds: Rectangle): void
```

Refresh the position and hit area of this handle based on the provided bounding box.

**Parameters**

- **bounds**: `Rectangle`  
  The bounding box in which this handle operates.

**Returns**  
`void`

---

### updateDimensions

```typescript
updateDimensions(
    current: Rectangle,
    origin: Rectangle,
    destination: { x: number; y: number },
    options?: { aspectRatio?: null | number },
): object
```

Compute updated dimensions for an object being resized, respecting optional constraints.

**Parameters**

- **current**: `Rectangle`  
  The current geometric state of the object.

- **origin**: `Rectangle`  
  The original position and dimensions used for reference.

- **destination**: `{ x: number; y: number }`  
  The mouse (or pointer) destination coordinates.

  - **x**: `number`  
    The x-coordinate where the pointer was released.

  - **y**: `number`  
    The y-coordinate where the pointer was released.

- **options**?: `{ aspectRatio?: null | number }` = `{}`  
  Additional options.

  - **aspectRatio**?: `null | number`  
    If provided, a numeric aspect ratio to maintain (width/height).

**Returns**  
`object`  
An object containing the adjusted `{x, y, width, height}`.

---

## Protected Methods

### _onHoverIn

```typescript
_onHoverIn(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle mouse-over event on a control handle.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The mouseover event.

**Returns**  
`void`

---

### _onHoverOut

```typescript
_onHoverOut(event: FederatedEvent<UIEvent | PixiTouch>): void
```

Handle mouse-out event on a control handle.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The mouseout event.

**Returns**  
`void`

---

### _onMouseDown

```typescript
_onMouseDown(event: FederatedEvent<UIEvent | PixiTouch>): void
```

When we start a drag event - create a preview copy of the Tile for re-positioning.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The mousedown event.

**Returns**  
`void`

---

For more information, see the [ResizeHandle class documentation](https://foundryvtt.com/api/classes/foundry.canvas.containers.ResizeHandle.html).