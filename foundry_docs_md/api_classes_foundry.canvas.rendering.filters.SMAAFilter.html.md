# SMAAFilter

Foundry Virtual Tabletop - API Documentation - Version 13  
[Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [rendering](https://foundryvtt.com/api/modules/foundry.canvas.rendering.html) / [filters](https://foundryvtt.com/api/modules/foundry.canvas.rendering.filters.html) / [SMAAFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.SMAAFilter.html)

Class **SMAAFilter**  
Hierarchy: *Filter* → **SMAAFilter**

---

## Constructors

### constructor

```typescript
new SMAAFilter(config?: Partial<SMAAFilterConfig>): SMAAFilter
```

**Parameters**

- **config**: `Partial<SMAAFilterConfig>` = `{}` (Optional)  
  Configuration options for the SMAAFilter.

**Returns**  
`SMAAFilter`

> Overrides `PIXI.Filter.constructor`

---

## Accessors

### PRESETS

```typescript
static get PRESETS(): Record<"LOW" | "HIGH" | "MEDIUM" | "ULTRA", SMAAFilterConfig>
```

The presets.

**Returns**  
`Record<"LOW" | "HIGH" | "MEDIUM" | "ULTRA", SMAAFilterConfig>`

---

## Methods

### apply

```typescript
apply(
  filterManager: any,
  input: any,
  output: any,
  clearMode: any,
  currentState: any,
): void
```

**Parameters**

- **filterManager**: `any`  
- **input**: `any`  
- **output**: `any`  
- **clearMode**: `any`  
- **currentState**: `any`  

**Returns**  
`void`

> Overrides `PIXI.Filter.apply`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)