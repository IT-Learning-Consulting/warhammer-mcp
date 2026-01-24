# PointMovementSource

A specialized subclass of the `BaseEffectSource` which describes a movement-based source.

Mixes:  
`PointEffectSource`

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.sources.PointMovementSource), Expand)  
- [BaseEffectSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html)<BaseEffectSourceData, Polygon, this>  
- **PointMovementSource**

---

## Constructors

### constructor
```typescript
new PointMovementSource(options?: BaseEffectSourceOptions): PointMovementSource
```
An effect source is constructed by providing configuration options.

**Parameters**
- **options**: `BaseEffectSourceOptions = {}`  
  Options which modify the base effect source instance

**Returns**  
`PointMovementSource`

Inherited from [BaseEffectSource.constructor](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#constructor)

---

## Properties

### data
`BaseEffectSourceData = ...`  
The data of this source.

Inherited from [BaseEffectSource.data](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#data)

### object
`null | object`  
Some other object which is responsible for this source.

Inherited from [BaseEffectSource.object](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#object)

### shape
`Polygon`  
The geometric shape of the effect source which is generated later.

Inherited from [BaseEffectSource.shape](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#shape)

### sourceId
`string`  
The source id linked to this effect source.

Inherited from [BaseEffectSource.sourceId](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#sourceid)

### suppression
`Record<string, boolean> = {}`  
Records of suppression strings with a boolean value. If any of this record is true, the source is suppressed.

Inherited from [BaseEffectSource.suppression](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#suppression)

### _flags (protected)
`Record<string, number | boolean> = {}`  
A collection of boolean flags which control rendering and refresh behavior for the source.

Inherited from [BaseEffectSource._flags](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_flags)

### defaultData (static)
`BaseEffectSourceData = ...`  
Effect source default data.

Inherited from [BaseEffectSource.defaultData](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#defaultdata)

### effectsCollection (static, abstract)
`string`  
The target collection into the effects canvas group.

Inherited from [BaseEffectSource.effectsCollection](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#effectscollection)

### sourceType (static)
`string = "move"`  

Inherited from [BaseEffectSource.sourceType](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#sourcetype)

---

## Accessors

### active
```typescript
get active(): boolean
```
Is this source currently active? A source is active if it is attached to an effect collection and is not disabled or suppressed.

**Returns**  
`boolean`

Inherited from `PointEffectSourceMixin(BaseEffectSource).active`

### attached
```typescript
get attached(): boolean
```
Is this source attached to an effect collection?

**Returns**  
`boolean`

Inherited from `PointEffectSourceMixin(BaseEffectSource).attached`

### effectsCollection
```typescript
get effectsCollection(): Collection<
  string,
  BaseEffectSource<BaseEffectSourceData, Polygon>
>
```
The EffectsCanvasGroup collection linked to this effect source.

**Returns**  
`Collection<string, BaseEffectSource<BaseEffectSourceData, Polygon>>`

Inherited from `PointEffectSourceMixin(BaseEffectSource).effectsCollection`

### elevation
```typescript
get elevation(): number
```
The elevation bound to this source.

**Returns**  
`number`

Inherited from `PointEffectSourceMixin(BaseEffectSource).elevation`

### suppressed
```typescript
get suppressed(): boolean
```
Is this source temporarily suppressed?

**Returns**  
`boolean`

Inherited from `PointEffectSourceMixin(BaseEffectSource).suppressed`

### updateId
```typescript
get updateId(): number
```
Returns the update ID associated with this source. The update ID is increased whenever the shape of the source changes.

**Returns**  
`number`

Inherited from `PointEffectSourceMixin(BaseEffectSource).updateId`

### x
```typescript
get x(): number
```
The x-coordinate of the point source origin.

**Returns**  
`number`

Inherited from `PointEffectSourceMixin(BaseEffectSource).x`

### y
```typescript
get y(): number
```
The y-coordinate of the point source origin.

**Returns**  
`number`

Inherited from `PointEffectSourceMixin(BaseEffectSource).y`

---

## Methods

### _initialize (abstract)
```typescript
_initialize(data: Partial<BaseEffectSourceData>): void
```
Subclass specific data initialization steps.

**Parameters**
- **data**: `Partial<BaseEffectSourceData>`  
  Provided data for configuration

**Returns**  
`void`

Inherited from [BaseEffectSource._initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_initialize)

### add
```typescript
add(): void
```
Add this `BaseEffectSource` instance to the active collection.

**Returns**  
`void`

Inherited from [BaseEffectSource.add](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#add)

### destroy
```typescript
destroy(): void
```
Steps that must be performed when the source is destroyed.

**Returns**  
`void`

Inherited from [BaseEffectSource.destroy](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#destroy)

### initialize
```typescript
initialize(
  data?: Partial<BaseEffectSourceData>,
  options?: { reset?: boolean }
): BaseEffectSource<BaseEffectSourceData, Polygon>
```
Initialize and configure the source using provided data.

**Parameters**
- **data**: `Partial<BaseEffectSourceData> = {}`  
  Provided data for configuration
- **options**: `{ reset?: boolean } = {}`  
  Additional options which modify source initialization  
  - **reset?**: `boolean` — Should source data be reset to default values before applying changes?

**Returns**  
`BaseEffectSource<BaseEffectSourceData, Polygon>` - The initialized source

Inherited from [BaseEffectSource.initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#initialize)

### refresh
```typescript
refresh(): void
```
Refresh the state and uniforms of the source. Only active sources are refreshed.

**Returns**  
`void`

Inherited from [BaseEffectSource.refresh](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#refresh)

### remove
```typescript
remove(): void
```
Remove this `BaseEffectSource` instance from the active collection.

**Returns**  
`void`

Inherited from [BaseEffectSource.remove](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#remove)

### testPoint
```typescript
testPoint(point: ElevatedPoint): boolean
```
Test whether the point is contained within the shape of the source.

**Parameters**
- **point**: [`ElevatedPoint`](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
  The point to test

**Returns**  
`boolean` - Is inside the source?

Inherited from [BaseEffectSource.testPoint](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#testpoint)

### _configure (protected)
```typescript
_configure(changes: Partial<BaseEffectSourceData>): void
```
Subclass specific configuration steps. Occurs after data initialization and shape computation. Only called if the source is attached and not disabled.

**Parameters**
- **changes**: `Partial<BaseEffectSourceData>`  
  Changes to the source data which were applied

**Returns**  
`void`

Inherited from [BaseEffectSource._configure](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_configure)

### _createShapes (protected, abstract)
```typescript
_createShapes(): void
```
Create the polygon shape (or shapes) for this source using configured data.

**Returns**  
`void`

Inherited from [BaseEffectSource._createShapes](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_createshapes)

### _destroy (protected)
```typescript
_destroy(): void
```
Subclass specific destruction steps.

**Returns**  
`void`

Inherited from [BaseEffectSource._destroy](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_destroy)

### _refresh (protected, abstract)
```typescript
_refresh(): void
```
Subclass-specific refresh steps.

**Returns**  
`void`

Inherited from [BaseEffectSource._refresh](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_refresh)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)