# RegionEvent | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface RegionEvent<Data = object> {
  data: object;
  name: string;
  region: RegionDocument;
  user: documents.User;
}
```

## Type Parameters

- **Data** = `object`

## Properties

- **data**: `object`  
  The data of the event

- **name**: `string`  
  The name of the event

- **region**: [`RegionDocument`](https://foundryvtt.com/api/classes/foundry.documents.RegionDocument.html)  
  The Region the event was triggered on

- **user**: [`documents.User`](https://foundryvtt.com/api/classes/foundry.documents.User.html)  
  The User that triggered the event

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)