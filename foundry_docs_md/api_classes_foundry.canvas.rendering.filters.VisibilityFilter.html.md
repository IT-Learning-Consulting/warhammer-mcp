# VisibilityFilter | Foundry Virtual Tabletop - API Documentation - Version 13

Apply visibility coloration according to the baseLine color. Uses very lightweight gaussian vertical and horizontal blur filter passes.

## Hierarchy
- [AbstractBaseMaskFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html)
- **VisibilityFilter**

## Properties

### Static

#### `defaultUniforms`

```typescript
defaultUniforms: {
  exploredColor: number[];
  hasOverlayTexture: boolean;
  overlayMatrix: Matrix;
  overlayTexture: null;
  primaryTexture: null;
  screenDimensions: number[];
  unexploredColor: number[];
  visionTexture: null;
} = ...
```

Overrides [AbstractBaseMaskFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#defaultuniforms).

#### `vertexShader`

```typescript
vertexShader: string = ...
```

The default vertex shader used by all instances of AbstractBaseMaskFilter.

Overrides [AbstractBaseMaskFilter.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#vertexshader).

## Accessors

### `blur`

```typescript
set blur(value: number): void
```

Set the blur strength.

- **Parameters**
  - `value`: *number* — blur strength

- **Returns** void

## Methods

### `apply`

```typescript
apply(filterManager: any, input: any, output: any, clear: any): void
```

- **Parameters**
  - `filterManager`: *any*
  - `input`: *any*
  - `output`: *any*
  - `clear`: *any*

- **Returns** void

Overrides [AbstractBaseMaskFilter.apply](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#apply).

### `calculateMatrix`

```typescript
calculateMatrix(filterManager: FilterSystem): void
```

Calculate the fog overlay sprite matrix.

- **Parameters**
  - `filterManager`: *FilterSystem*

- **Returns** void

### Static `create`

```typescript
create(initialUniforms?: {}, options?: {}): VisibilityFilter
```

- **Parameters**
  - `initialUniforms`?: *{}* = {}
  - `options`?: *{}* = {}

- **Returns** *VisibilityFilter*

Overrides [AbstractBaseMaskFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#create).

### Static `fragmentShader`

```typescript
fragmentShader(options: any): string
```

- **Parameters**
  - `options`: *any*

- **Returns** *string*

Overrides AbstractBaseMaskFilter.fragmentShader

---

For the full API documentation, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).