# DragDrop | Foundry Virtual Tabletop - API Documentation - Version 13

A controller class for managing drag and drop workflows within an Application instance. The controller manages the following actions: dragstart, dragover, drop.

Example: Activate drag-and-drop handling for a certain set of elements

```typescript
const dragDrop = new DragDrop({
  dragSelector: ".item",
  dropSelector: ".items",
  permissions: { 
    dragstart: this._canDragStart.bind(this), 
    drop: this._canDragDrop.bind(this) 
  },
  callbacks: { 
    dragstart: this._onDragStart.bind(this), 
    drop: this._onDragDrop.bind(this) 
  }
});
dragDrop.bind(html);
```

## Constructors

### constructor

```typescript
new DragDrop(config?: DragDropConfiguration): DragDrop
```

**Parameters**

- **config**?: `DragDropConfiguration = {}`  
  Optional configuration object for initializing the DragDrop controller.

**Returns**  
`DragDrop`

## Properties

### callbacks

Type: `Record<"dragstart" | "drop" | "dragover" | "dragenter" | "dragleave" | "dragend", (event: DragEvent) => void>`

A set of callback functions for each action of the drag & drop workflow.

### dragSelector

Type: `null | string`

The HTML selector which identifies draggable elements.

### dropSelector

Type: `null | string`

The HTML selector which identifies drop targets.

### permissions

Type: `Record<"dragstart" | "drop", (selector: string) => boolean>`

A set of functions to control authorization to begin drag workflows, and drop content.

## Accessors

### implementation

```typescript
get implementation(): typeof DragDrop
```

Retrieve the configured DragDrop implementation.

**Returns**  
`typeof DragDrop`

## Methods

### bind

```typescript
bind(html: HTMLElement): DragDrop
```

Bind the DragDrop controller to an HTML application.

**Parameters**

- **html**: `HTMLElement`  
  The HTML element to which the handler is bound.

**Returns**  
`DragDrop`

### callback

```typescript
callback(event: DragEvent, action: string): any
```

Execute a callback function associated with a certain action in the workflow.

**Parameters**

- **event**: `DragEvent`  
  The drag event being handled.

- **action**: `string`  
  The action being attempted.

**Returns**  
`any`

### can

```typescript
can(action: string, selector: string): boolean
```

Test whether the current user has permission to perform a step of the workflow.

**Parameters**

- **action**: `string`  
  The action being attempted.

- **selector**: `string`  
  The selector being targeted.

**Returns**  
`boolean`  
Can the action be performed?

---

### Protected Methods

> These methods are intended for internal use within the class or subclasses.

#### _handleDragEnd

```typescript
_handleDragEnd(event: DragEvent): void
```

Handle a drag workflow ending for any reason.

**Parameters**

- **event**: `DragEvent`  
  The drag event.

**Returns**  
`void`

#### _handleDragEnter

```typescript
_handleDragEnter(event: DragEvent): void
```

Handle entering a drop target while dragging.

**Parameters**

- **event**: `DragEvent`  
  The drag event.

**Returns**  
`void`

#### _handleDragLeave

```typescript
_handleDragLeave(event: DragEvent): void
```

Handle leaving a drop target while dragging.

**Parameters**

- **event**: `DragEvent`  
  The drag event.

**Returns**  
`void`

#### _handleDragOver

```typescript
_handleDragOver(event: DragEvent): boolean
```

Handle a dragged element over a droppable target.

**Parameters**

- **event**: `DragEvent`  
  The drag event being handled.

**Returns**  
`boolean`

#### _handleDragStart

```typescript
_handleDragStart(event: DragEvent): void
```

Handle the start of a drag workflow.

**Parameters**

- **event**: `DragEvent`  
  The drag event being handled.

**Returns**  
`void`

#### _handleDrop

```typescript
_handleDrop(event: DragEvent): any
```

Handle a dragged element dropped on a droppable target.

**Parameters**

- **event**: `DragEvent`  
  The drag event being handled.

**Returns**  
`any`

## Static Methods

### createDragImage

```typescript
createDragImage(
  img: HTMLImageElement,
  width: number,
  height: number,
): HTMLDivElement
```

A helper to create an image preview element for use during HTML element dragging.

**Parameters**

- **img**: `HTMLImageElement`  
  The image element to use for the drag preview.

- **width**: `number`  
  The width of the drag image.

- **height**: `number`  
  The height of the drag image.

**Returns**  
`HTMLDivElement`

---

For more details, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).