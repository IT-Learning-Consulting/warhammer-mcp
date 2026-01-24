# PointSoundSource | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized subclass of the `BaseEffectSource` which describes a point-based source of sound.

#### Mixes
- PointEffectSource

#### Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.sources.PointSoundSource), Expand)

- [BaseEffectSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html)<`BaseEffectSourceData`, `Polygon`, `this`>
- **PointSoundSource**

---

## Constructors

### constructor

```typescript
new PointSoundSource(options?: BaseEffectSourceOptions): PointSoundSource
```

An effect source is constructed by providing configuration options.

**Parameters**

- **options**: `BaseEffectSourceOptions = {}`  
  Options which modify the base effect source instance

**Returns**  
`PointSoundSource`

_Inherited from [BaseEffectSource.constructor](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#constructor)_

---

## Properties

### data

```typescript
data: BaseEffectSourceData = ...
```

The data of this source.

_Inherited from [BaseEffectSource.data](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#data)_

### object

```typescript
object: null | object
```

Some other object which is responsible for this source.

_Inherited from [BaseEffectSource.object](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#object)_

### shape

```typescript
shape: Polygon
```

The geometric shape of the effect source which is generated later.

_Inherited from [BaseEffectSource.shape](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#shape)_

### sourceId

```typescript
sourceId: string
```

The source id linked to this effect source.

_Inherited from [BaseEffectSource.sourceId](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#sourceid)_

### suppression

```typescript
suppression: Record<string, boolean> = {}
```

Records of suppression strings with a boolean value. If any of this record is true, the source is suppressed.

---

### _flags _(Protected)_

```typescript
_flags: Record<string, number | boolean> = {}
```

A collection of boolean flags which control rendering and refresh behavior for the source.

_Inherited from [BaseEffectSource._flags](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_flags)_

---

## Static Properties

### defaultData

```typescript
defaultData: BaseEffectSourceData = ...
```

Effect source default data.

_Inherited from [BaseEffectSource.defaultData](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#defaultdata)_

### effectsCollection

```typescript
effectsCollection: string
```

The target collection into the effects canvas group.

_Inherited from [BaseEffectSource.effectsCollection](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#effectscollection)_

### sourceType

```typescript
sourceType: string = "sound"
```

_Inherited from [BaseEffectSource.sourceType](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#sourcetype)_

---

## Accessors

### active

```typescript
get active(): boolean
```

Is this source currently active? A source is active if it is attached to an effect collection and is not disabled or suppressed.

**Returns**  
`boolean`

_Inherited from PointEffectSourceMixin(BaseEffectSource).active_

### attached

```typescript
get attached(): boolean
```

Is this source attached to an effect collection?

**Returns**  
`boolean`

_Inherited from PointEffectSourceMixin(BaseEffectSource).attached_

### effectsCollection

```typescript
get effectsCollection(): any
```

**Returns**  
`any`

Overrides PointEffectSourceMixin(BaseEffectSource).effectsCollection

### elevation

```typescript
get elevation(): number
```

The elevation bound to this source.

**Returns**  
`number`

_Inherited from PointEffectSourceMixin(BaseEffectSource).elevation_

### suppressed

```typescript
get suppressed(): boolean
```

Is this source temporarily suppressed?

**Returns**  
`boolean`

_Inherited from PointEffectSourceMixin(BaseEffectSource).suppressed_

### updateId

```typescript
get updateId(): number
```

Returns the update ID associated with this source. The update ID is increased whenever the shape of the source changes.

**Returns**  
`number`

_Inherited from PointEffectSourceMixin(BaseEffectSource).updateId_

### x

```typescript
get x(): number
```

The x-coordinate of the point source origin.

**Returns**  
`number`

_Inherited from PointEffectSourceMixin(BaseEffectSource).x_

### y

```typescript
get y(): number
```

The y-coordinate of the point source origin.

**Returns**  
`number`

_Inherited from PointEffectSourceMixin(BaseEffectSource).y_

---

## Methods

### _getPolygonConfiguration

```typescript
_getPolygonConfiguration(): any
```

**Returns**  
`any`

_Abstract method_

---

### _initialize

```typescript
_initialize(data: Partial<BaseEffectSourceData>): void
```

Subclass specific data initialization steps.

**Parameters**

- **data**: `Partial<BaseEffectSourceData>`  
  Provided data for configuration

**Returns**  
`void`

_Inherited from [BaseEffectSource._initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_initialize)_

---

### add

```typescript
add(): void
```

Add this BaseEffectSource instance to the active collection.

**Returns**  
`void`

_Inherited from [BaseEffectSource.add](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#add)_

---

### destroy

```typescript
destroy(): void
```

Steps that must be performed when the source is destroyed.

**Returns**  
`void`

_Inherited from [BaseEffectSource.destroy](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#destroy)_

---

### getVolumeMultiplier

```typescript
getVolumeMultiplier(
  listener: ElevatedPoint,
  options?: { easing?: boolean }
): number
```

Get the effective volume at which an AmbientSound source should be played for a certain listener.

**Parameters**

- **listener**: `ElevatedPoint`
- **options** (optional): `{ easing?: boolean } = {}`

**Returns**  
`number`

---

### initialize

```typescript
initialize(
  data?: Partial<BaseEffectSourceData>,
  options?: { reset?: boolean }
): BaseEffectSource<BaseEffectSourceData, Polygon>
```

Initialize and configure the source using provided data.

**Parameters**

- **data** (optional): `Partial<BaseEffectSourceData> = {}`
- **options** (optional):  
  - **reset?**: `boolean`  
    Should source data be reset to default values before applying changes?

**Returns**  
`BaseEffectSource<BaseEffectSourceData, Polygon>`

_Inherited from [BaseEffectSource.initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#initialize)_

---

### refresh

```typescript
refresh(): void
```

Refresh the state and uniforms of the source. Only active sources are refreshed.

**Returns**  
`void`

_Inherited from [BaseEffectSource.refresh](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#refresh)_

---

### remove

```typescript
remove(): void
```

Remove this BaseEffectSource instance from the active collection.

**Returns**  
`void`

_Inherited from [BaseEffectSource.remove](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#remove)_

---

### testPoint

```typescript
testPoint(point: ElevatedPoint): boolean
```

Test whether the point is contained within the shape of the source.

**Parameters**

- **point**: `ElevatedPoint`  
  The point.

**Returns**  
`boolean`  
Is inside the source?

_Inherited from [BaseEffectSource.testPoint](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#testpoint)_

---

### _configure _(Protected)_

```typescript
_configure(changes: Partial<BaseEffectSourceData>): void
```

Subclass specific configuration steps. Occurs after data initialization and shape computation. Only called if the source is attached and not disabled.

**Parameters**

- **changes**: `Partial<BaseEffectSourceData>`  
  Changes to the source data which were applied

**Returns**  
`void`

_Inherited from [BaseEffectSource._configure](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_configure)_

---

### _createShapes _(Protected, Abstract)_

```typescript
_createShapes(): void
```

Create the polygon shape (or shapes) for this source using configured data.

**Returns**  
`void`

_Inherited from [BaseEffectSource._createShapes](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_createshapes)_

---

### _destroy _(Protected)_

```typescript
_destroy(): void
```

Subclass specific destruction steps.

**Returns**  
`void`

_Inherited from [BaseEffectSource._destroy](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_destroy)_

---

### _refresh _(Protected, Abstract)_

```typescript
_refresh(): void
```

Subclass-specific refresh steps.

**Returns**  
`void`

_Inherited from [BaseEffectSource._refresh](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseEffectSource.html#_refresh)_