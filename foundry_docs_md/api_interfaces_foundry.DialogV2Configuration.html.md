# DialogV2Configuration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DialogV2Configuration {
    buttons: DialogV2Button[];
    content?: string | HTMLDivElement;
    modal?: boolean;
    submit?: DialogV2SubmitCallback;
}
```

## Properties

- **buttons**: `DialogV2Button[]`  
  Button configuration.

- **content?**: `string | HTMLDivElement`  
  The dialog content: a HTML string or a element. If string, the content is cleaned with [foundry.utils.cleanHTML](https://foundryvtt.com/api/functions/foundry.utils.cleanHTML.html). Otherwise, the content is not cleaned.

- **modal?**: `boolean`  
  Modal dialogs prevent interaction with the rest of the UI until they are dismissed or submitted.

- **submit?**: `DialogV2SubmitCallback`  
  A function to invoke when the dialog is submitted. This will not be called if the dialog is dismissed.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)