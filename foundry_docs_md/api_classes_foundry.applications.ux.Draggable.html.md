# Draggable | Foundry Virtual Tabletop - API Documentation - Version 13

A UI utility to make an element draggable.

## Constructor

```typescript
new Draggable(
    app: 
        | Application
        | ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>,
    element: any,
    handle: false | HTMLElement,
    resizable: boolean | DraggableResizeOptions,
): Draggable
```

**Parameters**

- **app**: `Application` | `ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>`  
  The Application that is being made draggable.

- **element**: `any`  
  The Application's outer-most element.

- **handle**: `false` | `HTMLElement`  
  The element that acts as a drag handle. Supply `false` to disable dragging.

- **resizable**: `boolean` | `DraggableResizeOptions`  
  Is the application resizable? Supply an object to configure resizing behavior or `true` to have it automatically configured.

**Returns**  
`Draggable`

---

## Properties

### app

```typescript
app: Application | ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>
```
The Application being made draggable.

### element

```typescript
element: HTMLElement
```
The Application's outer-most element.

### handle

```typescript
handle: false | HTMLElement
```
The drag handle, or `false` to disable dragging.

### handlers

```typescript
handlers: Record<string, Function> = {}
```
Registered event handlers.

### position

```typescript
position: object = null
```
The Application's starting position, pre-drag.

### resizable

```typescript
resizable: boolean | DraggableResizeOptions
```
Resize configuration.

---

## Accessors

### implementation

```typescript
get implementation(): typeof Draggable
```
Retrieve the configured Draggable implementation.

**Returns**  
`typeof Draggable`

---

## Methods

### activateListeners

```typescript
activateListeners(): void
```
Activate event handling for a Draggable application. Attach handlers for floating, dragging, and resizing.

**Returns**  
`void`

---

### _activateDragListeners

```typescript
protected _activateDragListeners(): void
```
Attach handlers for dragging and floating.

**Returns**  
`void`

---

### _activateResizeListeners

```typescript
protected _activateResizeListeners(): void
```
Attach handlers for resizing.

**Returns**  
`void`

---

### _onDragMouseDown

```typescript
protected _onDragMouseDown(event: PointerEvent): void
```
Handle the initial mouse click which activates dragging behavior for the application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

---

### _onDragMouseMove

```typescript
protected _onDragMouseMove(event: PointerEvent): void
```
Move the window with the mouse, bounding the movement to ensure the window stays within bounds of the viewport.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

---

### _onDragMouseUp

```typescript
protected _onDragMouseUp(event: PointerEvent): void
```
Conclude the dragging behavior when the mouse is released, setting the final position and removing listeners.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

---

### _onResizeMouseDown

```typescript
protected _onResizeMouseDown(event: PointerEvent): void
```
Handle the initial mouse click which activates resizing behavior for the application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

---

### _onResizeMouseMove

```typescript
protected _onResizeMouseMove(event: PointerEvent): void
```
Move the window with the mouse, bounding the movement to ensure the window stays within bounds of the viewport.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

---

### _onResizeMouseUp

```typescript
protected _onResizeMouseUp(event: PointerEvent): void
```
Conclude the resizing behavior when the mouse is released, setting the final position and removing listeners.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

---

*See the Foundry Virtual Tabletop API Documentation [here](https://foundryvtt.com/api/classes/foundry.applications.ux.Draggable.html).*