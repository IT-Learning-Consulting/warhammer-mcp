# HiddenCanvasGroup | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized canvas group for rendering hidden containers before all others (like masks).

## Hierarchy

*Container*<*DisplayObject*, *this*>  
**HiddenCanvasGroup**

## Properties

### masks
- **Type:** `Container<DisplayObject>`  
- The container which hold masks.

### groupName (static)
- **Type:** `string`  
- **Value:** `"hidden"`

## Methods

### _draw

```typescript
_draw(options: any): Promise<void>
```

- **Parameters:**
  - **options**: `any`
- **Returns:** `Promise<void>`  
- **Inherit Doc**

### _tearDown

```typescript
_tearDown(options: any): Promise<void>
```

- **Parameters:**
  - **options**: `any`
- **Returns:** `Promise<void>`  
- **Inherit Doc**

### addMask

```typescript
addMask(name: string, displayObject: DisplayObject, position?: number): void
```

Add a mask to this group.

- **Parameters:**
  - **name**: `string`  
    Name of the mask.
  - **displayObject**: `DisplayObject`  
    Display object to add.
  - **position** (optional): `number`  
    Position of the mask.
- **Returns:** `void`

### invalidateMasks

```typescript
invalidateMasks(): void
```

Invalidate the masks: flag them for rerendering.

- **Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)