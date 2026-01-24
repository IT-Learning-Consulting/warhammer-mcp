# Interface DocumentSocketRequest

```typescript
interface DocumentSocketRequest {
    action: DatabaseAction;
    broadcast: boolean;
    operation: DatabaseOperation;
    type: string;
    userId: string;
}
```

## Properties

- **action**: [DatabaseAction](https://foundryvtt.com/api/types/foundry.abstract.types.DatabaseAction.html)  
  The action of the request

- **broadcast**: `boolean`  
  Should the response be broadcast to other connected clients?

- **operation**: [DatabaseOperation](https://foundryvtt.com/api/index.html)  
  Operation parameters for the request

- **type**: `string`  
  The type of Document being transacted

- **userId**: `string`  
  The id of the requesting User