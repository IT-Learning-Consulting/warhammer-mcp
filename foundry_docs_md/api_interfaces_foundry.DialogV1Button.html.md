# DialogV1Button

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [DialogV1Button](https://foundryvtt.com/api/interfaces/foundry.DialogV1Button.html)

## Interface DialogV1Button

```typescript
interface DialogV1Button {
    callback?: (arg0: jQuery) => any;
    disabled: boolean;
    icon: string;
    label: string;
}
```

## Properties

### Optional

- **callback**?: `(arg0: jQuery) => any`  
  A callback function that fires when the button is clicked

### Required

- **disabled**: `boolean`  
  Whether the button is disabled

- **icon**: `string`  
  A Font Awesome icon for the button

- **label**: `string`  
  The label for the button

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)