# GridSnappingBehavior | Foundry Virtual Tabletop - API Documentation - Version 13

A snapping behavior is defined by the snapping mode at the given resolution of the grid.

```typescript
interface GridSnappingBehavior {
    mode: number;
    resolution?: number;
}
```

## Properties

### mode

- **Type:** `number`

The snapping mode (a union of [CONST.GRID_SNAPPING_MODES](https://foundryvtt.com/api/variables/CONST.GRID_SNAPPING_MODES.html)).

### resolution (optional)

- **Type:** `number`

The resolution (a positive integer). Default: 1.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)