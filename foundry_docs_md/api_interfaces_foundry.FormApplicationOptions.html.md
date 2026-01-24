# FormApplicationOptions | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface FormApplicationOptions

```typescript
interface FormApplicationOptions {
    closeOnSubmit?: boolean;
    editable?: boolean;
    sheetConfig?: boolean;
    submitOnChange?: boolean;
    submitOnClose?: boolean;
}
```

### Properties

- **closeOnSubmit?**: `boolean`  
  Whether to automatically close the application when its contained form is submitted.

- **editable?**: `boolean`  
  Whether the application form is editable. If `true`, its fields will be unlocked and the form can be submitted. If `false`, all form fields will be disabled and the form cannot be submitted.

- **sheetConfig?**: `boolean`  
  Support configuration of the sheet type used for this application.

- **submitOnChange?**: `boolean`  
  Whether to automatically submit the contained HTML form when an input or select element is changed.

- **submitOnClose?**: `boolean`  
  Whether to automatically submit the contained HTML form when the application window is manually closed.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)