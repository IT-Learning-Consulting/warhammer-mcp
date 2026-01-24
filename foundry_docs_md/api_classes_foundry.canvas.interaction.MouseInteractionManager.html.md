# MouseInteractionManager

Handle mouse interaction events for a Canvas object. There are three phases of events: hover, click, and drag.

- **Hover Events:** `_handlePointerOver` action: `hoverIn`, `_handlePointerOut` action: `hoverOut`
- **Left Click and Double-Click:** `_handlePointerDown` action: `clickLeft`, action: `clickLeft2`, action: `unclickLeft`
- **Right Click and Double-Click:** `_handleRightDown` action: `clickRight`, action: `clickRight2`, action: `unclickRight`
- **Drag and Drop:**  
  `_handlePointerMove` action: `dragLeftStart`, action: `dragRightStart`, action: `dragLeftMove`, action: `dragRightMove`  
  `_handlePointerUp` action: `dragLeftDrop`, action: `dragRightDrop`  
  `_handleDragCancel` action: `dragLeftCancel`, action: `dragRightCancel`

---

## Constructors

### constructor

```typescript
new MouseInteractionManager(
    object: DisplayObject,
    layer: Container<DisplayObject>,
    permissions?: object,
    callbacks?: object,
    options?: {
        application?: Application<ICanvas>;
        dragResistance?: number;
        target?: string;
    },
): MouseInteractionManager
```

**Parameters**

- **object**: `DisplayObject`  
  The Canvas object (e.g., a Token, Tile, or Drawing) to which mouse events should be bound.
  
- **layer**: `Container<DisplayObject>`  
  The Canvas Layer that contains the object.

- **permissions**? : `object` (Optional)  
  An object of permission checks, keyed by action name, which return a boolean or invoke a function for whether the action is allowed. Default is `{}`.

- **callbacks**? : `object` (Optional)  
  An object of callback functions, keyed by action name, which will be executed during the event workflow (e.g., `hoverIn`, `clickLeft`). Default is `{}`.

- **options**? :  
  - **application**? : `Application<ICanvas>` (Optional)  
    A specific PIXI Application to use for pointer event handling; defaults to `canvas.app` if not provided.  
  - **dragResistance**? : `number` (Optional)  
    A minimum number of pixels the mouse must move before a drag is initiated.  
  - **target**? : `string` (Optional)  
    If provided, the property name on `object` which references a [ControlIcon](https://foundryvtt.com/api/classes/foundry.canvas.containers.ControlIcon.html). This is used to set [MouseInteractionManager#controlIcon](#controlIcon).

**Returns:** `MouseInteractionManager`

---

## Properties

### controlIcon

`controlIcon: null | ControlIcon`  
An optional ControlIcon instance for the object.

### dragTime

`dragTime: number`  
The drag handling time.

### interactionData

`interactionData: Record<string, any>`  
Bound interaction data object to populate with custom data.

### lastClick

`lastClick: Point = ...`  
The client position of the last left/right-click.

### lcTime

`lcTime: number`  
The time of the last left-click event.

### options

`options: { dragResistance: number; target: DisplayObject }`  
Interaction options which configure handling workflows.

### rcTime

`rcTime: number`  
The time of the last right-click event.

### state

`state: number`  
The current interaction state.

### viewId

`viewId: string`  
The view id pertaining to the PIXI Application. If not provided, defaults to [canvas.app.view.id](http://canvas.app.view.id/).

---

## Static Properties

### DEFAULT_DRAG_RESISTANCE_PX

`DEFAULT_DRAG_RESISTANCE_PX: number = 10`  
The minimum distance, measured in screen-coordinate pixels, that a pointer must move to initiate a drag operation. This default value can be overridden by specifying the `dragResistance` option when invoking the constructor.

### DOUBLE_CLICK_DISTANCE_PX

`DOUBLE_CLICK_DISTANCE_PX: number = 5`  
The maximum number of pixels between two clicks to be considered a double-click.

### DOUBLE_CLICK_TIME_MS

`DOUBLE_CLICK_TIME_MS: number = 250`  
The maximum number of milliseconds between two clicks to be considered a double-click.

### INTERACTION_STATES

```typescript
INTERACTION_STATES: {
    CLICKED: number;
    DRAG: number;
    DROP: number;
    GRABBED: number;
    HOVER: number;
    NONE: number;
} = ...
```

Enumerate the states of a mouse interaction workflow.  
- `0: NONE` - the object is inactive  
- `1: HOVER` - the mouse is hovered over the object  
- `2: CLICKED` - the object is clicked  
- `3: GRABBED` - the object is grabbed  
- `4: DRAG` - the object is being dragged  
- `5: DROP` - the object is being dropped

### LONG_PRESS_DURATION_MS

`LONG_PRESS_DURATION_MS: number = 500`  
The number of milliseconds of mouse click depression to consider it a long press.

### longPressTimeout

`longPressTimeout: null | number = null`  
Global timeout for the long-press event.

---

## Accessors

### handlerOutcomes

```typescript
get handlerOutcomes(): Record<string, number>
```

A reference to the possible interaction states which can be observed.

**Returns:** `Record<string, number>`

### isDragging

```typescript
get isDragging(): boolean
```

Is this mouse manager in a dragging state?

**Returns:** `boolean`

### states

```typescript
get states(): Record<string, number>
```

A reference to the possible interaction states which can be observed.

**Returns:** `Record<string, number>`

### target

```typescript
get target(): DisplayObject
```

Get the target.

**Returns:** `DisplayObject`

---

## Methods

### activate

```typescript
activate(): MouseInteractionManager
```

Activate interactivity for the handled object.

**Returns:** `MouseInteractionManager`

### callback

```typescript
callback(
    action: string,
    event: Event | FederatedEvent<UIEvent | PixiTouch>,
    ...args: any[],
): boolean
```

Execute a callback function associated with a certain action in the workflow.

**Parameters**

- **action**: `string`  
  The action being attempted.

- **event**: `Event | FederatedEvent<UIEvent | PixiTouch>`  
  The event being handled.

- **...args**: `any[]`  
  Additional callback arguments.

**Returns:** `boolean`  
A boolean which may indicate that the event was handled by the callback. Events which do not specify a callback are assumed to have been handled as no-op.

### can

```typescript
can(action: string, event: Event | FederatedEvent<UIEvent | PixiTouch>): boolean
```

Test whether the current user has permission to perform a step of the workflow.

**Parameters**

- **action**: `string`  
  The action being attempted.

- **event**: `Event | FederatedEvent<UIEvent | PixiTouch>`  
  The event being handled.

**Returns:** `boolean`  
Can the action be performed?

### cancel

```typescript
cancel(event?: FederatedEvent<UIEvent | PixiTouch>): void
```

A public method to cancel a current interaction workflow from this manager.

**Parameters**

- **event**? : `FederatedEvent<UIEvent | PixiTouch>` (Optional)  
  The event that initiates the cancellation.

**Returns:** `void`

### handleEvent

```typescript
handleEvent(event: FederatedEvent<UIEvent | PixiTouch>): boolean
```

A public method to handle directly an event into this manager, according to its type. Note: drag events are not handled.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`

**Returns:** `boolean`  
Has the event been processed?

### reset

```typescript
reset(options?: { interactionData?: boolean; state?: boolean }): void
```

Reset the mouse manager.

**Parameters**

- **options**? : `{ interactionData?: boolean; state?: boolean }` (Optional) = `{}`  
  - **interactionData**? : `boolean` (Optional)  
    Reset the interaction data?  
  - **state**? : `boolean` (Optional)  
    Reset the state?

**Returns:** `void`

### emulateMoveEvent

```typescript
static emulateMoveEvent(): void
```

Emulate a pointermove event on the main game canvas. This method must be called when an object with the static event mode or any of its parents is transformed or its visibility is changed.

**Returns:** `void`

---

For more details, see [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html).