# dropActorSheetData | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `dropActorSheetData`

```typescript
dropActorSheetData(
    actor: documents.Actor,
    sheet: ActorSheetV2,
    data: object,
): void
```

A hook event that fires when some useful data is dropped onto an ActorSheet.

#### Parameters

- **actor**: [`documents.Actor`](https://foundryvtt.com/api/classes/foundry.documents.Actor.html)  
  The Actor

- **sheet**: [`ActorSheetV2`](https://foundryvtt.com/api/classes/foundry.applications.sheets.ActorSheetV2.html)  
  The ActorSheet application

- **data**: `object`  
  The data that has been dropped onto the sheet

#### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)