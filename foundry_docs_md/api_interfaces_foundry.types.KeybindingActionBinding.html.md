# KeybindingActionBinding | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface KeybindingActionBinding

A Client Keybinding Action Binding

```typescript
interface KeybindingActionBinding {
    index?: number;
    key: string;
    modifiers?: string[];
}
```

### Properties

- **index?**: `number`  
  A numeric index which tracks this binding's position during form rendering.

- **key**: `string`  
  The `KeyboardEvent#code` value from [MDN KeyboardEvent.code values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values).

- **modifiers?**: `string[]`  
  An array of modifier keys from [foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS](https://foundryvtt.com/api/classes/foundry.helpers.interaction.KeyboardManager.html#modifier_keys) which are required for this binding to be activated.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)