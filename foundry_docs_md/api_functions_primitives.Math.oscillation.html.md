# oscillation

## Function oscillation

```typescript
oscillation(
    a: number,
    b: number,
    t: number,
    p?: number,
    f?: (x: number) => number,
): number
```

Returns the value of the oscillation between **a** and **b** at time **t**.

### Parameters

- **a**: `number`  
  The minimum value of the oscillation
- **b**: `number`  
  The maximum value of the oscillation
- **t**: `number`  
  The time
- **p**: `number` = 1 _(Optional)_  
  The period (must be nonzero)
- **f**: `(x: number) => number` = `Math.cos` _(Optional)_  
  The periodic function (its period must be 2π)

### Returns

`number`

```typescript
((b - a) * (f(2π * t / p) + 1) / 2) + a
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)