# GridShader

The grid shader used by [foundry.canvas.containers.GridMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.GridMesh.html).

---

## Hierarchy

- [AbstractBaseShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html)
- **GridShader**

---

## Properties

### initialUniforms

- **Type:** `object`  
- **Description:** The initial values of the shader uniforms.  
- **Inherited from:** [AbstractBaseShader.initialUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#initialuniforms)

---

### Static Properties

#### ANTIALIASED_STEP_FUNCTION

- **Type:** `string`  
- **Description:**  
  The antialiased step function. The edge and x values are given in grid space units.  
- **Value:** (string content omitted for brevity)

#### COLOR_UNIFORM

- **Type:** `string`  
- **Value:** `"uniform vec4 color;"`  
- **Description:** The grid color uniform.

#### defaultUniforms

- **Type:**  
  ```typescript
  {
    alpha: number;
    canvasDimensions: number[];
    color: number[];
    gridSize: number;
    meshDimensions: number[];
    resolution: number;
    sceneDimensions: number[];
    screenDimensions: number[];
    style: number;
    thickness: number;
    type: number;
  }
  ```  
- **Description:** Overrides [AbstractBaseShader.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#defaultuniforms) with default uniform values.  
- **Value:** (object literal content omitted for brevity)

#### DRAW_GRID_FUNCTION

- **Type:** `string`  
- **Description:** A function that draws the grid given a grid point, style, thickness, and color.

#### EDGE_DISTANCE_FUNCTION

- **Type:** `string`  
- **Description:** This function returns the distance to the nearest edge of a grid space given a point.

#### EDGE_OFFSET_FUNCTION

- **Type:** `string`  
- **Description:**  
  This function returns a vector `(x, y, z)`, where  
  - `x` is the x-offset along the nearest edge,  
  - `y` is the y-offset (the distance) from the nearest edge, and  
  - `z` is the length of the nearest edge.

#### HEXAGONAL_FUNCTIONS

- **Type:** `string`  
- **Description:** Hexagonal functions conversion for between grid and cube space.

#### LINE_COVERAGE_FUNCTION

- **Type:** `string`  
- **Description:**  
  The line coverage function, which returns the alpha value at a point with the given distance  
  (in grid space units) from an antialiased line (or point) with the given thickness (in grid space  
  units).

#### NEAREST_VERTEX_FUNCTION

- **Type:** `string`  
- **Description:** Get the nearest vertex of a grid space to the given point.

#### RESOLUTION_UNIFORM

- **Type:** `string`  
- **Value:** `"uniform float resolution;"`  
- **Description:** The resolution (pixels per grid space units) uniform.

#### THICKNESS_UNIFORM

- **Type:** `string`  
- **Value:** `"uniform float thickness;"`  
- **Description:** The grid thickness uniform.

#### TYPE_UNIFORM

- **Type:** `string`  
- **Description:** The grid type uniform.

#### vertexShader

- **Type:** `string`  
- **Description:** Overrides [AbstractBaseShader.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#vertexshader)  
- **Value:** (string content omitted for brevity)

---

## Protected Static Properties

### _fragmentShader

- **Type:** `string`  
- **Description:** The fragment shader source. Subclasses can override it.  
- **Value:** (string content omitted for brevity)

---

## Accessors

### fragmentShader

```typescript
get fragmentShader(): string
```

- **Returns:** `string`  
- **Description:** Overrides AbstractBaseShader.fragmentShader

---

## Methods

### _preRender

```typescript
_preRender(mesh: any, renderer: any): void
```

- **Parameters:**
  - **mesh:** `any`
  - **renderer:** `any`
- **Returns:** `void`  
- **Description:** Overrides [_preRender](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_prerender) from AbstractBaseShader.

---

### configure

```typescript
configure(options: object): void
```

- **Parameters:**
  - **options:** `object`
- **Returns:** `void`  
- **Description:** Configure the shader.

---

### reset

```typescript
reset(): void
```

- **Returns:** `void`  
- **Description:** Reset the shader uniforms back to their initial values.  
- **Inherited from:** [AbstractBaseShader.reset](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#reset)

---

### _configure

```typescript
protected _configure(): void
```

- **Returns:** `void`  
- **Description:**  
  Protected. A one-time initialization performed on creation.  
- **Inherited from:** [AbstractBaseShader._configure](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#_configure)

---

### create

```typescript
static create(initialUniforms: object): AbstractBaseShader
```

- **Parameters:**
  - **initialUniforms:** `object`
- **Returns:** `AbstractBaseShader`  
- **Description:**  
  A factory method for creating the shader using its defined default values.  
- **Inherited from:** [AbstractBaseShader.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.AbstractBaseShader.html#create)

---

_For full API details visit [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.GridShader.html)_