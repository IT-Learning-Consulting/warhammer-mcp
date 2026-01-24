# DiceFulfillmentConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DiceFulfillmentConfiguration {
    defaultMethod: string;
    dice: Record<string, DiceFulfillmentDenomination>;
    methods: Record<string, DiceFulfillmentMethod>;
}
```

## Properties

- **defaultMethod**: `string`  
  Designate one of the methods to be used by default for dice fulfillment, if the user hasn't specified otherwise. Leave this blank to use the configured `randomUniform` to generate die rolls.

- **dice**: `Record<string, DiceFulfillmentDenomination>`  
  The die denominations available for configuration.  
  See [DiceFulfillmentDenomination](https://foundryvtt.com/api/interfaces/CONFIG.DiceFulfillmentDenomination.html)

- **methods**: `Record<string, DiceFulfillmentMethod>`  
  The methods available for fulfillment.  
  See [DiceFulfillmentMethod](https://foundryvtt.com/api/interfaces/CONFIG.DiceFulfillmentMethod.html)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[CONFIG](https://foundryvtt.com/api/modules/CONFIG.html)  
[DiceFulfillmentConfiguration](https://foundryvtt.com/api/interfaces/CONFIG.DiceFulfillmentConfiguration.html)