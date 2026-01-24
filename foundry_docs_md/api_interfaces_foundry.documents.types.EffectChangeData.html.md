# EffectChangeData

**Foundry Virtual Tabletop - API Documentation - Version 13**

## Interface EffectChangeData

```typescript
interface EffectChangeData {
    key: string;
    mode: number;
    priority: number;
    value: string;
}
```

### Properties

- **key**: `string`  
  The attribute path in the Actor or Item data which the change modifies

- **mode**: `number`  
  The modification mode with which the change is applied

- **priority**: `number`  
  The priority level with which this change is applied

- **value**: `string`  
  The value of the change effect

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)