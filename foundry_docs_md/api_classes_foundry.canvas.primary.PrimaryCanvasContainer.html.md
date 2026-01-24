# PrimaryCanvasContainer | Foundry Virtual Tabletop - API Documentation - Version 13

Primary canvas container are reserved for advanced usage. They allow to group PrimarySpriteMesh in a single Container. The container elevation is replacing individual sprite elevation.

## Hierarchy

* _any_
* **PrimaryCanvasContainer**

## Accessors

### elevation

```typescript
get elevation(): number
```

The elevation of this container.

**Returns:** `number`

---

### shouldRenderDepth

```typescript
get shouldRenderDepth(): boolean
```

To know if this container has at least one child that should render its depth.

**Returns:** `boolean`

---

### sort

```typescript
get sort(): number
```

A key which resolves ties amongst objects at the same elevation within the same layer.

**Returns:** `number`

## Methods

### renderDepthData

```typescript
renderDepthData(renderer: any): void
```

**Parameters:**

- **renderer**: `any`

**Returns:** `void`

---

### sortChildren

```typescript
sortChildren(): void
```

**Returns:** `void`

---

### updateCanvasTransform

```typescript
updateCanvasTransform(): void
```

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)