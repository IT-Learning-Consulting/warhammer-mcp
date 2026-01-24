# CanvasHistoryEvent

```typescript
interface CanvasHistoryEvent {
    data: object[];
    options: object;
    type: "update" | "delete" | "create";
}
```

## Properties

- **data**: `object[]`  
  The data corresponding to the action which may later be un-done.

- **options**: `object`  
  The options of the undo operation.

- **type**: `"update" | "delete" | "create"`  
  The type of operation stored as history.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)