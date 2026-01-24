# PrimaryGraphics | Foundry Virtual Tabletop - API Documentation - Version 13

A basic PCO which is handling drawings of any shape.

**Mixes:**  
PrimaryCanvasObject

## Constructor Parameters

- **options**: A config object
  - **options.geometry**: A geometry passed to the graphics.
  - **options.name**: The name of the PCO.
  - **options.object**: Any object that owns this PCO.

## Hierarchy

*Graphics* < this >  
**PrimaryGraphics**

## Methods

### _calculateCanvasBounds

```typescript
_calculateCanvasBounds(): void
```

**Returns:** `void`

---

### containsCanvasPoint

```typescript
containsCanvasPoint(point: any): any
```

**Parameters:**

- **point**: `any`

**Returns:** `any`

---

### updateCanvasTransform

```typescript
updateCanvasTransform(): void
```

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)