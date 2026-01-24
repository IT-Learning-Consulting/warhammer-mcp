# DialogV1ConfirmOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DialogV1ConfirmOptions {
    defaultYes?: boolean;
    no?: Function;
    rejectClose?: boolean;
    yes?: Function;
}
```

## Properties

- **defaultYes?**: `boolean`  
  Make "yes" the default choice?

- **no?**: `Function`  
  Callback function upon no

- **rejectClose?**: `boolean`  
  Reject the Promise if the Dialog is closed without making a choice.

- **yes?**: `Function`  
  Callback function upon yes

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)