# DialogV2SubmitCallback | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
DialogV2SubmitCallback: (result: any, dialog: DialogV2) => Promise<void>
```

## Type declaration

```typescript
(result: any, dialog: DialogV2): Promise<void>
```

## Parameters

- **result**: `any`  
  Either the identifier of the button that was clicked to submit the dialog, or the result returned by that button's callback.

- **dialog**: [DialogV2](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html)  
  The DialogV2 instance.

## Returns

`Promise<void>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)