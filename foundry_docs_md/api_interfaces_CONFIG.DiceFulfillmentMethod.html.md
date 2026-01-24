# DiceFulfillmentMethod | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DiceFulfillmentMethod {
    handler?: DiceFulfillmentHandler;
    icon?: string;
    interactive?: boolean;
    label: string;
    resolver?: typeof RollResolver;
}
```

## Properties

### handler?  
**Type:** [DiceFulfillmentHandler](https://foundryvtt.com/api/types/CONFIG.DiceFulfillmentHandler.html)  
A function to invoke to programmatically fulfil a given term for non-interactive fulfillment methods.

### icon?  
**Type:** string  
An icon to represent the fulfillment method.

### interactive?  
**Type:** boolean  
Whether this method requires input from the user or if it is fulfilled entirely programmatically.

### label  
**Type:** string  
The human-readable label for the fulfillment method.

### resolver?  
**Type:** typeof [RollResolver](https://foundryvtt.com/api/classes/foundry.applications.dice.RollResolver.html)  
A custom RollResolver implementation. If the only interactive methods the user has configured are this method and manual, this resolver will be used to resolve interactive rolls, instead of the default resolver. This resolver must therefore be capable of handling manual rolls.