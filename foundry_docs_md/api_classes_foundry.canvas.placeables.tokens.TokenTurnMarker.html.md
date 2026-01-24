# TokenTurnMarker

The Turn Marker of a [foundry.canvas.placeables.Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html).

## Hierarchy

* Container
* **TokenTurnMarker**

---

## Constructors

### constructor

```typescript
new TokenTurnMarker(token: canvas.placeables.Token): TokenTurnMarker
```

Construct a TokenTurnMarker by providing a Token object instance.

**Parameters**

- **token**: [canvas.placeables.Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html)  
  The Token that this Turn Marker belongs to.

---

## Properties

### animation

- **animation**: `TurnMarkerAnimationConfigData`  
  The animation configuration of the Turn Marker.

### mesh

- **mesh**: [SpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html)  
  The sprite of the Turn Marker.

---

## Accessors

### token

```typescript
get token(): canvas.placeables.Token
```

The Token who this Turn Marker belongs to.

**Returns**

- [canvas.placeables.Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html)

---

## Methods

### animate

```typescript
animate(deltaTime: number): void
```

Animate the Turn Marker.

**Parameters**

- **deltaTime**: `number`  
  The delta time.

**Returns**

- `void`

---

### draw

```typescript
draw(): Promise<void>
```

Draw the Turn Marker.

**Returns**

- `Promise<void>`