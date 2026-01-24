# _ActiveEffectDuration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface _ActiveEffectDuration {
    _combatTime?: number;
    _worldTime?: number;
    duration: null | number;
    label: string;
    remaining: null | number;
    type: string;
}
```

## Properties

### _combatTime (optional)
- **Type:** `number` (optional)  
- An internal flag used to determine when to recompute turns-based duration.

### _worldTime (optional)
- **Type:** `number` (optional)  
- An internal flag used to determine when to recompute seconds-based duration.

### duration
- **Type:** `null | number`  
- The total effect duration, in seconds of world time or as a decimal number with the format `{rounds}.{turns}`.

### label
- **Type:** `string`  
- A formatted string label that represents the remaining duration.

### remaining
- **Type:** `null | number`  
- The remaining effect duration, in seconds of world time or as a decimal number with the format `{rounds}.{turns}`.

### type
- **Type:** `string`  
- The duration type, either `"seconds"`, `"turns"`, or `"none"`.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)