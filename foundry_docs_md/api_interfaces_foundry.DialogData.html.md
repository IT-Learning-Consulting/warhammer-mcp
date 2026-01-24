# DialogData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DialogData {
    buttons: Record<string, DialogV1Button>;
    close?: (arg0: jQuery) => any;
    content: string;
    default?: string;
    render?: (arg0: jQuery) => any;
    title: string;
}
```

## Properties

- **buttons**: `Record<string, [DialogV1Button](https://foundryvtt.com/api/interfaces/foundry.DialogV1Button.html)>`  
  The buttons which are displayed as action choices for the dialog.

- **close?**: `(arg0: jQuery) => any`  
  Common callback operations to perform when the dialog is closed.

- **content**: `string`  
  HTML content for the dialog form.

- **default?**: `string`  
  The name of the default button which should be triggered on Enter keypress.

- **render?**: `(arg0: jQuery) => any`  
  A callback function invoked when the dialog is rendered.

- **title**: `string`  
  The window title displayed in the dialog header.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)