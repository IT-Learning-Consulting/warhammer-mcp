# DashLineShader

**Foundry Virtual Tabletop - API Documentation - Version 13**

A modified version of the `PIXI.smooth.DashLineShader` that supports an offset.

## Hierarchy
- *any*
- **DashLineShader**

## Constructors

### constructor

```typescript
new DashLineShader(
  options?: { dash?: number; gap?: number; offset?: number },
): DashLineShader
```

**Parameters**

- **options**?: *{ dash?: number; gap?: number; offset?: number }* = `{}`  
  The options

  - **dash**?: *number*  
    The length of the dash

  - **gap**?: *number*  
    The length of the gap

  - **offset**?: *number*  
    The offset of the dashes

**Returns**: *DashLineShader*

---

Overrides `PIXI.smooth.SmoothGraphicsShader.constructor`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)