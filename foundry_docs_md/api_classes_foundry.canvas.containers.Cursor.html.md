# Cursor | Foundry Virtual Tabletop - API Documentation - Version 13

A single Mouse Cursor

## Hierarchy

* _Container_
* **Cursor**

## Properties

### target

**target**: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html) = ...

The target cursor position.

## Methods

### destroy

```typescript
destroy(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**: `void`

Overrides PIXI.Container.destroy

### draw

```typescript
draw(user: User): void
```

Draw the user's cursor as a small dot with their user name attached as text

**Parameters**

- **user**: `User`

**Returns**: `void`

### refreshVisibility

```typescript
refreshVisibility(user: User): void
```

Update visibility and animations

**Parameters**

- **user**: `User`  
  The user

**Returns**: `void`

### updateTransform

```typescript
updateTransform(): void
```

**Returns**: `void`

Overrides PIXI.Container.updateTransform

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)