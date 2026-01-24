# BaseEffectSource | Foundry Virtual Tabletop - API Documentation - Version 13

TODO - Re-document after ESM refactor. An abstract base class which defines a framework for effect sources which originate radially from a specific point. This abstraction is used by the LightSource, VisionSource, SoundSource, and MovementSource subclasses.

**Example: A standard PointSource lifecycle:**

```typescript
const source = new PointSource({object});  // Create the point source
source.initialize(data);                   // Configure the point source with new data
source.refresh();                         // Refresh the point source
source.destroy();                         // Destroy the point source
```

## Type Parameters

- **TSourceData** = [BaseEffectSourceData](https://foundryvtt.com/api/interfaces/foundry.BaseEffectSourceData.html)
- **TSourceShape** = `PIXI.Polygon`

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.sources.BaseEffectSource)  

- BaseEffectSource  
  - [PointMovementSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointMovementSource.html)  
  - [PointSoundSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointSoundSource.html)  
  - [RenderedEffectSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html)  

---

## Constructors

### constructor

```typescript
new BaseEffectSource<
    TSourceData extends BaseEffectSourceData = BaseEffectSourceData,
    TSourceShape extends Polygon = Polygon,
>(options?: BaseEffectSourceOptions): BaseEffectSource<TSourceData, TSourceShape>
```

An effect source is constructed by providing configuration options.

**Type Parameters:**

- `TSourceData` extends [BaseEffectSourceData](https://foundryvtt.com/api/interfaces/foundry.BaseEffectSourceData.html) = `BaseEffectSourceData`
- `TSourceShape` extends `Polygon` = `Polygon`

**Parameters:**

- **options?**: [BaseEffectSourceOptions](https://foundryvtt.com/api/interfaces/foundry.BaseEffectSourceOptions.html) = `{}`  
  Options which modify the base effect source instance

**Returns:**  
`BaseEffectSource<TSourceData, TSourceShape>`

---

## Properties

- **data: TSourceData**  
  The data of this source.

- **object: null | object**  
  Some other object which is responsible for this source.

- **shape: TSourceShape**  
  The geometric shape of the effect source which is generated later.

- **sourceId: string**  
  The source id linked to this effect source.

- **suppression: Record<string, boolean> = {}**  
  Records of suppression strings with a boolean value. If any of this record is true, the source is suppressed.

### Protected

- **_flags: Record<string, number | boolean> = {}**  
  A collection of boolean flags which control rendering and refresh behavior for the source.

### Static

- **defaultData: BaseEffectSourceData = ...**  
  Effect source default data.

- **effectsCollection: string**  
  The target collection into the effects canvas group.

- **sourceType: string**  
  The type of source represented by this data structure. Each subclass must implement this attribute.

---

## Accessors

- **sourceType: string**  
  The type of source represented by this data structure. Each subclass must implement this attribute.

- **get active(): boolean**  
  Is this source currently active? A source is active if it is attached to an effect collection and is not disabled or suppressed.  

  **Returns:** `boolean`

- **get attached(): boolean**  
  Is this source attached to an effect collection?  

  **Returns:** `boolean`

- **get effectsCollection(): Collection<  
    string,  
    BaseEffectSource<BaseEffectSourceData, Polygon>  
>**  
  The EffectsCanvasGroup collection linked to this effect source.  

  **Returns:**  
  [Collection](https://foundryvtt.com/api/classes/foundry.utils.Collection.html)<string, BaseEffectSource<BaseEffectSourceData, Polygon>>

- **get elevation(): number**  
  The elevation bound to this source.  

  **Returns:** `number`

- **get suppressed(): boolean**  
  Is this source temporarily suppressed?  

  **Returns:** `boolean`

- **get updateId(): number**  
  Returns the update ID associated with this source. The update ID is increased whenever the shape of the source changes.  

  **Returns:** `number`

- **get x(): number**  
  The x-coordinate of the point source origin.  

  **Returns:** `number`

- **get y(): number**  
  The y-coordinate of the point source origin.  

  **Returns:** `number`

---

## Methods

### _initialize

```typescript
_initialize(data: Partial<TSourceData>): void
```

Subclass specific data initialization steps.

**Parameters:**

- **data**: Partial<TSourceData>  
  Provided data for configuration

**Returns:** `void`

---

### add

```typescript
add(): void
```

Add this BaseEffectSource instance to the active collection.

**Returns:** `void`

---

### destroy

```typescript
destroy(): void
```

Steps that must be performed when the source is destroyed.

**Returns:** `void`

---

### initialize

```typescript
initialize(
    data?: Partial<TSourceData>, 
    options?: { reset?: boolean }
): BaseEffectSource<BaseEffectSourceData, Polygon>
```

Initialize and configure the source using provided data.

**Parameters:**

- **data?**: Partial<TSourceData> = `{}`  
  Provided data for configuration

- **options?**: `{ reset?: boolean }` = `{}`  
  Additional options which modify source initialization  
  
  - **reset?**: boolean  
    Should source data be reset to default values before applying changes?

**Returns:**  
The initialized source: `BaseEffectSource<BaseEffectSourceData, Polygon>`

---

### refresh

```typescript
refresh(): void
```

Refresh the state and uniforms of the source. Only active sources are refreshed.

**Returns:** `void`

---

### remove

```typescript
remove(): void
```

Remove this BaseEffectSource instance from the active collection.

**Returns:** `void`

---

### testPoint

```typescript
testPoint(point: ElevatedPoint): boolean
```

Test whether the point is contained within the shape of the source.

**Parameters:**

- **point**: [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
  The point.

**Returns:** `boolean`  
Is inside the source?

---

### _configure

```typescript
_configure(changes: Partial<TSourceData>): void
```

**Protected**  
Subclass specific configuration steps. Occurs after data initialization and shape computation. Only called if the source is attached and not disabled.

**Parameters:**

- **changes**: Partial<TSourceData>  
  Changes to the source data which were applied

**Returns:** `void`

---

### _createShapes

```typescript
_createShapes(): void
```

**Protected | Abstract**  
Create the polygon shape (or shapes) for this source using configured data.

**Returns:** `void`

---

### _destroy

```typescript
_destroy(): void
```

**Protected**  
Subclass specific destruction steps.

**Returns:** `void`

---

### _refresh

```typescript
_refresh(): void
```

**Protected | Abstract**  
Subclass-specific refresh steps.

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)