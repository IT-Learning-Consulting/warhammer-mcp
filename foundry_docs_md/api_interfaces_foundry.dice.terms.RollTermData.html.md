# RollTermData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface RollTermData {
  class?: string;
  evaluated?: boolean;
  options?: RollOptions;
}
```

## Properties

- **class?**: `string`  
  The name of the [foundry.dice.terms.RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html) class with which this data should be constructed.

- **evaluated?**: `boolean`  
  Has this term been evaluated?

- **options?**: [`RollOptions`](https://foundryvtt.com/api/types/foundry.dice.RollOptions.html)  
  Options modifying or describing the Roll.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)