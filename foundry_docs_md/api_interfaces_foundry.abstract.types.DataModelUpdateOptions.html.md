# DataModelUpdateOptions

```typescript
interface DataModelUpdateOptions {
    dryRun?: boolean;
    fallback?: boolean;
    recursive?: boolean;
    restoreDelta?: boolean;
}
```

## Properties

- **dryRun?**: `boolean`  
  Do not finally apply the change, but instead simulate the update workflow.

- **fallback?**: `boolean`  
  Allow automatic fallback to a valid initial value if the value provided for a field in the model is invalid.

- **recursive?**: `boolean`  
  Apply changes to inner objects recursively rather than replacing the top-level object.

- **restoreDelta?**: `boolean`  
  An advanced option used specifically and internally by the ActorDelta model.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)