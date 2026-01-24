# BaseTokenRuler | Foundry Virtual Tabletop - API Documentation - Version 13

The ruler of a Token visualizes:
- the movement history of the Token,
- the movement path the Token currently animating along, and
- the planned movement path while the Token is being dragged.

## Hierarchy
- **BaseTokenRuler**  
- [*TokenRuler*](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.TokenRuler.html)

---

## Constructors

### constructor

```typescript
new BaseTokenRuler(token: canvas.placeables.Token): BaseTokenRuler
```

**Parameters:**

- **token**: `canvas.placeables.Token`  
  The Token that this ruler belongs to.

---

## Accessors

### isVisible

```typescript
get isVisible(): boolean
```

Is the ruler supposed to be visible? `BaseTokenRuler#visible` is set to `BaseTokenRuler#isVisible` in [foundry.canvas.placeables.Token#_refreshState](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_refreshstate).

**Returns:** `boolean`

---

### token

```typescript
get token(): canvas.placeables.Token
```

The reference to the Token this ruler belongs to.

**Returns:** `canvas.placeables.Token`

---

### visible

```typescript
get visible(): boolean
set visible(value: boolean): void
```

Is the ruler visible?

- **Default Value:** `false`

**Parameters for setter:**

- **value**: `boolean`

**Returns:** `void`

Set to `BaseTokenRuler#isVisible` in [foundry.canvas.placeables.Token#_refreshState](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_refreshstate).

---

## Methods

### clear

```typescript
clear(): void
```

Clear the ruler. Called in [foundry.canvas.placeables.Token#clear](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#clear).

**Returns:** `void`

**Abstract**

---

### destroy

```typescript
destroy(): void
```

Destroy the ruler. Called in [foundry.canvas.placeables.Token#_destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_destroy).

**Returns:** `void`

**Abstract**

---

### draw

```typescript
draw(): Promise<void>
```

Draw the ruler. Called in [foundry.canvas.placeables.Token#_draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_draw).

**Returns:** `Promise<void>`

**Abstract**

---

### refresh

```typescript
refresh(rulerData: DeepReadonly<TokenRulerData>): void
```

Refresh the ruler. Called in [foundry.canvas.placeables.Token#_refreshRuler](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_refreshruler).

**Parameters:**

- **rulerData**: `DeepReadonly<TokenRulerData>`

**Returns:** `void`

**Abstract**

---

### _onVisibleChange

```typescript
protected _onVisibleChange(): void
```

Called when the ruler becomes visible or invisible.

**Returns:** `void`

**Abstract**  
**Protected**

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)