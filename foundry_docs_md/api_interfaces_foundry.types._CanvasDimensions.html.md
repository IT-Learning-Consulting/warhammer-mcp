# _CanvasDimensions | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface _CanvasDimensions

```typescript
interface _CanvasDimensions {
    scale: { default: number; max: number; min: number };
    uiScale: number;
}
```

### Properties

- **scale**:  
  `{ default: number; max: number; min: number }`  
  The minimum, maximum, and default canvas scale.

- **uiScale**:  
  `number`  
  The scaling factor for canvas UI elements. Based on the normalized grid size (100px).

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)