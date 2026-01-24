# GridLayer | Foundry Virtual Tabletop - API Documentation - Version 13

A `CanvasLayer` responsible for drawing a square grid.

## Hierarchy  
- [CanvasLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html)  
- **GridLayer**

---

## Properties

### highlight

**Type:** `Container<DisplayObject>`  
The Grid Highlight container.

---

### highlightLayers

**Type:** `Record<string, GridHighlight>` = {}  
Map named highlight layers.  
[GridHighlight](https://foundryvtt.com/api/classes/foundry.canvas.containers.GridHighlight.html)

---

### interactiveChildren

**Type:** `boolean` = false  
Whether this event target has any children that need UI events. This can be used to optimize event propagation.  
Inherited from [CanvasLayer.interactiveChildren](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#interactivechildren)

---

### mesh

**Type:** `GridMesh`  
The grid mesh.  
[GridMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.GridMesh.html)

---

### options

**Type:** `{ name: string }` = ...  
Options for this layer instance.  
Inherited from [CanvasLayer.options](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#options)

---

## Accessors

### hookName

```typescript
get hookName(): string
```

The name used by hooks to construct their hook string. Note: You should override this getter if `hookName` should not return the class constructor name.  
Inherited from `CanvasLayer.hookName`

**Returns:** `string`

---

### name

```typescript
get name(): string
```

The canonical name of the CanvasLayer is the name of the constructor that is the immediate child of the defined baseClass for the layer type.  
Inherited from `CanvasLayer.name`

**Returns:** `string`

**Example:**  
`canvas.lighting.name -> "LightingLayer"`

---

### instance

```typescript
get instance(): any
```

Overrides `CanvasLayer.instance`

**Returns:** `any`

---

## Methods

### layerOptions

```typescript
static get layerOptions(): object
```

Customize behaviors of this CanvasLayer by modifying some behaviors at a class level.  
Overrides `CanvasLayer.layerOptions`

**Returns:** `object`

---

### _draw

```typescript
_draw(options: any): Promise<void>
```

Overrides [CanvasLayer._draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#_draw)

**Parameters:**

- **options**: `any`

**Returns:** `Promise<void>`

---

### addHighlightLayer

```typescript
addHighlightLayer(name: string): GridHighlight
```

Define a new Highlight graphic.

**Parameters:**

- **name**: `string`  
  The name for the referenced highlight layer.

**Returns:** `GridHighlight` ([GridHighlight](https://foundryvtt.com/api/classes/foundry.canvas.containers.GridHighlight.html))

---

### clearHighlightLayer

```typescript
clearHighlightLayer(name: string): void
```

Clear a specific Highlight graphic.

**Parameters:**

- **name**: `string`  
  The name for the referenced highlight layer.

**Returns:** `void`

---

### destroyHighlightLayer

```typescript
destroyHighlightLayer(name: string): void
```

Destroy a specific Highlight graphic.

**Parameters:**

- **name**: `string`  
  The name for the referenced highlight layer.

**Returns:** `void`

---

### draw

```typescript
draw(options?: object): Promise<CanvasLayer>
```

Draw the canvas layer, rendering its internal components and returning a Promise. The Promise resolves to the drawn layer once its contents are successfully rendered.  
Inherited from [CanvasLayer.draw](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#draw)

**Parameters:**

- **options**? : `object` = `{}`  
  Options which configure how the layer is drawn.

**Returns:** `Promise<CanvasLayer>`

---

### getHighlightLayer

```typescript
getHighlightLayer(name: string): GridHighlight
```

Obtain the highlight layer graphic by name.

**Parameters:**

- **name**: `string`  
  The name for the referenced highlight layer.

**Returns:** `GridHighlight`

---

### highlightPosition

```typescript
highlightPosition(
    name: string,
    options: {
        alpha?: number;
        border?: null | ColorSource;
        color?: ColorSource;
        shape?: Polygon;
        x?: number;
        y?: number;
    },
): void
```

Add highlighting for a specific grid position to a named highlight graphic.

If gridless you need to pass `shape` but not `x` and `y`. If not gridless you need to pass `x` and `y`, but not `shape`.

**Parameters:**

- **name**: `string`  
  The name for the referenced highlight layer.
- **options**:  
  - **alpha?**: `number`  
    The opacity of the highlight.
  - **border?**: `null | ColorSource`  
    The border color of the highlight.
  - **color?**: `ColorSource`  
    The fill color of the highlight.
  - **shape?**: `Polygon`  
    A predefined shape to highlight.
  - **x?**: `number`  
    The x-coordinate of the highlighted position.
  - **y?**: `number`  
    The y-coordinate of the highlighted position.

**Returns:** `void`

---

### initializeMesh

```typescript
initializeMesh(
    options?: {
        alpha?: number;
        color?: string;
        style?: string;
        thickness?: number;
    },
): void
```

Initialize the grid mesh appearance and configure the grid shader.

**Parameters:**

- **options?**:  
  - **alpha?**: `number`  
    The grid alpha.
  - **color?**: `string`  
    The grid color.
  - **style?**: `string`  
    The grid style.
  - **thickness?**: `number`  
    The grid thickness.

**Returns:** `void`

---

### tearDown

```typescript
tearDown(options?: object): Promise<CanvasLayer>
```

Deconstruct data used in the current layer in preparation to re-draw the canvas.  
Inherited from [CanvasLayer.tearDown](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasLayer.html#teardown)

**Parameters:**

- **options?**: `object` = `{}`  
  Options which configure how the layer is deconstructed.

**Returns:** `Promise<CanvasLayer>`

---

### _drawMesh

```typescript
protected _drawMesh(): Promise<GridMesh>
```

Protected method that creates the grid mesh.

**Returns:** `Promise<GridMesh>`

---

### _tearDown

```typescript
protected _tearDown(options: object): Promise<void>
```

Protected inner `_tearDown` method which may be customized by each CanvasLayer subclass.

**Parameters:**

- **options**: `object`  
  Options which configure how the layer is deconstructed.

**Returns:** `Promise<void>`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)