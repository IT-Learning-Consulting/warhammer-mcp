# FogManager

A fog of war management class which is the singleton `canvas.fog` instance.

See the [Hierarchy (View Summary)](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.perception.FogManager).

Extends `EventEmitter<Function, this>`

---

## Properties

### exploration

- Type: `null | documents.FogExploration = null`

The FogExploration document which applies to this canvas view.

### COMMIT_THRESHOLD

- Type: `number = 70`

Define the number of fog refresh needed before the fog texture is extracted and pushed to the server.

**Static**

### emittedEvents

- Type: `readonly ["explored"]`

Overrides `EventEmitterMixin().emittedEvents`.

**Static**

---

## Accessors

### extractor

```typescript
get extractor(): TextureExtractor
```

- Returns: `TextureExtractor`

Texture extractor.

[TextureExtractor](https://foundryvtt.com/api/classes/foundry.canvas.TextureExtractor.html)

### fogExploration

```typescript
get fogExploration(): boolean
```

Does the currently viewed Scene support fog of war exploration?

- Returns: `boolean`

### sprite

```typescript
get sprite(): SpriteMesh
```

The exploration `SpriteMesh` which holds the fog exploration texture.

- Returns: `SpriteMesh`

[SpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html)

### textureConfiguration

```typescript
get textureConfiguration(): CanvasVisibilityTextureConfiguration
```

The configured options used for the saved fog-of-war texture.

- Returns: `CanvasVisibilityTextureConfiguration`

[CanvasVisibilityTextureConfiguration](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTextureConfiguration.html)

### tokenVision

```typescript
get tokenVision(): boolean
```

Does the currently viewed Scene support Token field of vision?

- Returns: `boolean`

---

## Methods

### addEventListener

```typescript
addEventListener(
    type: string,
    listener: EmittedEventListener,
    options?: { once?: boolean },
): void
```

Add a new event listener for a certain type of event.

- **Parameters**

  - **type**: `string`  
    The type of event being registered for.

  - **listener**: `EmittedEventListener`  
    The listener function called when the event occurs.

  - **options** (optional): `{ once?: boolean } = {}`  
    Options which configure the event listener.

  - **once?** (optional): `boolean`  
    Should the event only be responded to once and then removed.

- Returns: `void`

See also: [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from `EventEmitterMixin().addEventListener`

---

### clear

```typescript
clear(): Promise<void>
```

Clear the fog and reinitialize properties (commit and save in non-reset mode).

- Returns: `Promise<void>`

---

### commit

```typescript
commit(): void
```

Once a new Fog of War location is explored, composite the explored container with the current staging sprite. Once the number of refresh is greater than the commit threshold, save the fog texture to the database.

- Returns: `void`

---

### destroy

```typescript
destroy(): void
```

Destroy this FogManager.

- Returns: `void`

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

- **Parameters**

  - **event**: `Event` - The Event to dispatch.

- Returns: `boolean` - Was default behavior for the event prevented?

See also: [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from `EventEmitterMixin().dispatchEvent`

---

### initialize

```typescript
initialize(): Promise<void>
```

Initialize fog of war - resetting it when switching scenes or re-drawing the canvas.

- Returns: `Promise<void>`

---

### isPointExplored

```typescript
isPointExplored(position: Point): boolean
```

Is this position explored?

- **Parameters**

  - **position**: `Point`  
    The position to be tested.

- Returns: `boolean`  
  Is this position explored?

[Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)

---

### load

```typescript
load(): Promise<void | Texture<Resource>>
```

Load existing fog of war data from local storage and populate the initial exploration sprite.

- Returns: `Promise<void | Texture<Resource>>`

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

- **Parameters**

  - **type**: `string`  
    The type of event being removed.

  - **listener**: `EmittedEventListener`  
    The listener function being removed.

- Returns: `void`

See also: [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from `EventEmitterMixin().removeEventListener`

---

### reset

```typescript
reset(): Promise<void>
```

Dispatch a request to reset the fog of war exploration status for all users within this Scene. Once the server has deleted existing FogExploration documents, the `_onReset` handler will re-draw the canvas.

- Returns: `Promise<void>`

---

### save

```typescript
save(): Promise<void>
```

Request a fog of war save operation. Note: if a save operation is pending, we're waiting for its conclusion.

- Returns: `Promise<void>`

---

### _extractBase64

```typescript
protected _extractBase64(): Promise<string>
```

Protected method.

Extract fog data as a base64 string.

- Returns: `Promise<string>`

---

### _prepareFogUpdateData

```typescript
protected _prepareFogUpdateData(base64Image: string): FogExplorationData
```

Protected method.

Prepare the data that will be used to update the FogExploration document.

- **Parameters**

  - **base64Image**: `string`  
    The extracted base64 image data.

- Returns: `FogExplorationData`  
  Exploration data to update.