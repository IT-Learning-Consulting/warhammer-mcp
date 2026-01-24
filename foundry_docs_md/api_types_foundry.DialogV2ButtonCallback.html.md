# DialogV2ButtonCallback | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
(event: PointerEvent | SubmitEvent, button: HTMLButtonElement, dialog: DialogV2) => Promise<any>
```

## Type declaration

```typescript
(
    event: PointerEvent | SubmitEvent,
    button: HTMLButtonElement,
    dialog: DialogV2,
): Promise<any>
```

## Parameters

- **event**: `PointerEvent | SubmitEvent`  
  The button click event, or a form submission event if the dialog was submitted via keyboard.

- **button**: `HTMLButtonElement`  
  If the form was submitted via keyboard, this will be the default button, otherwise the button that was clicked.

- **dialog**: [DialogV2](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html)  
  The DialogV2 instance.

## Returns

`Promise<any>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)