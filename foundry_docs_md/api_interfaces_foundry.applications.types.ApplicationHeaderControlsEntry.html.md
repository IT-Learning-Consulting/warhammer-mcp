# ApplicationHeaderControlsEntry | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ApplicationHeaderControlsEntry {
    action: string;
    icon: string;
    label: string;
    onClick?: (event: PointerEvent) => void | Promise<void>;
    ownership?: DocumentOwnershipLevel;
    visible?: boolean | (() => boolean);
}
```

## Properties

- **action**: *string*  
  The action name triggered by clicking the control button.

- **icon**: *string*  
  A font-awesome icon class which denotes the control button.

- **label**: *string*  
  The text label for the control button. This label will be automatically localized when the button is rendered.

- **onClick**?: *(event: PointerEvent) => void | Promise<void>*  
  A custom click handler function. Asynchronous functions are not awaited.

- **ownership**?: [*DocumentOwnershipLevel*](https://foundryvtt.com/api/types/CONST.DocumentOwnershipLevel.html)  
  A key or value in [CONST.DOCUMENT_OWNERSHIP_LEVELS](https://foundryvtt.com/api/variables/CONST.DOCUMENT_OWNERSHIP_LEVELS.html) that restricts visibility of this option for the current user. This option only applies to DocumentSheetV2 instances.

- **visible**?: *boolean* | *() => boolean*  
  Is the control button visible for the current client?

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)