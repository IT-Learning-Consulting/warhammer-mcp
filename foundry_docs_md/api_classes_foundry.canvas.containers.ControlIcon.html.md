# ControlIcon | Foundry Virtual Tabletop - API Documentation - Version 13

A generic helper for drawing a standard Control Icon

---

## Hierarchy

*Container*  
**ControlIcon**

---

## Properties

### tintColor

**tintColor**: `null | number`  
The color of the icon tint, if any.

---

## Accessors

### elevation

```typescript
get elevation(): number
```

The elevation of the ControlIcon, which is displayed in its tooltip text.

**Returns**: `number`

---

## Methods

### draw

```typescript
draw(): Promise<ControlIcon>
```

Initial drawing of the ControlIcon.

**Returns**: `Promise<ControlIcon>`

---

### refresh

```typescript
refresh(__namedParameters?: {}): ControlIcon
```

Incremental refresh for ControlIcon appearance.

**Parameters**:

- **__namedParameters**: `{}` = `{}`

**Returns**: `ControlIcon`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)