# DiceTermResult | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DiceTermResult {
    active?: boolean;
    count?: number;
    discarded?: boolean;
    exploded?: boolean;
    failure?: boolean;
    rerolled?: boolean;
    result: number;
    success?: boolean;
}
```

## Properties

- **active?**: *boolean*  
  Is this result active, contributing to the total?

- **count?**: *number*  
  A value that the result counts as, otherwise the result is not used directly as

- **discarded?**: *boolean*  
  Was this result discarded?

- **exploded?**: *boolean*  
  Was this result exploded?

- **failure?**: *boolean*  
  Does this result denote a failure?

- **rerolled?**: *boolean*  
  Was this result rerolled?

- **result**: *number*  
  The numeric result

- **success?**: *boolean*  
  Does this result denote a success?

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).