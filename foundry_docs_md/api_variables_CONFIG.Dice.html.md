# Dice | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
Dice: {
    fulfillment: {
        defaultMethod: string;
        dice: Record<string, CONFIG.DiceFulfillmentDenomination>;
        methods: Record<string, CONFIG.DiceFulfillmentMethod>;
    };
    functions: Record<string, CONFIG.RollFunction>;
    parser: typeof RollParser;
    randomUniform: () => number;
    rollModes: {
        blindroll: { icon: string; label: string };
        gmroll: { icon: string; label: string };
        publicroll: { icon: string; label: string };
        selfroll: { icon: string; label: string };
    };
    rolls: typeof Roll[];
    terms: Record<string, typeof DiceTerm>;
    termTypes: Record<string, typeof RollTerm>;
    types: typeof DiceTerm[];
} = ...
```

Configuration for dice rolling behaviors in the Foundry Virtual Tabletop client.

## Properties

### fulfillment

Dice roll fulfillment configuration.

- **defaultMethod**: `string`  
- **dice**: `Record<string, [DiceFulfillmentDenomination](https://foundryvtt.com/api/interfaces/CONFIG.DiceFulfillmentDenomination.html)>`  
- **methods**: `Record<string, [DiceFulfillmentMethod](https://foundryvtt.com/api/interfaces/CONFIG.DiceFulfillmentMethod.html)>`  

### functions

A collection of custom functions that can be included in roll expressions.

- **functions**: `Record<string, [RollFunction](https://foundryvtt.com/api/types/CONFIG.RollFunction.html)>`  

### parser

A parser implementation for parsing Roll expressions.

- **parser**: `typeof [RollParser](https://foundryvtt.com/api/classes/foundry.dice.RollParser.html)`  

### randomUniform

A function used to provide random uniform values.

- **randomUniform**: `() => number`  

### rollModes

Roll modes available, each with an icon and label.

- **blindroll**:  
  - **icon**: `string`  
  - **label**: `string`  
- **gmroll**:  
  - **icon**: `string`  
  - **label**: `string`  
- **publicroll**:  
  - **icon**: `string`  
  - **label**: `string`  
- **selfroll**:  
  - **icon**: `string`  
  - **label**: `string`  

### rolls

Configured Roll class definitions.

- **rolls**: `typeof [Roll](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)[]`  

### terms

Configured roll terms and the classes they map to.

- **terms**: `Record<string, typeof [DiceTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html)>`  

### termTypes

Configured DiceTerm class definitions.

- **termTypes**: `Record<string, typeof [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html)>`  

### types

The Dice types which are supported.

- **types**: `typeof [DiceTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html)[]`  

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)