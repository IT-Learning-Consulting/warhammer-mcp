# DiceTermFulfillmentDescriptor

> Foundry Virtual Tabletop - API Documentation - Version 13

## Interface DiceTermFulfillmentDescriptor

```typescript
interface DiceTermFulfillmentDescriptor {
    id: string;
    isNew?: boolean;
    method: string;
    term: DiceTerm;
}
```

### Properties

- **id**: `string`  
  A unique identifier for the term.

- **isNew**?: `boolean`  
  Was the term newly-added to this resolver?

- **method**: `string`  
  The fulfillment method.

- **term**: `DiceTerm`  
  The term.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).