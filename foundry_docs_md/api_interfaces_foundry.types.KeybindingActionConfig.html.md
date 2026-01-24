# KeybindingActionConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface KeybindingActionConfig {
    editable?: KeybindingActionBinding[];
    hint?: string;
    name: string;
    namespace?: string;
    onDown?: Function;
    onUp?: Function;
    order?: number;
    precedence?: number;
    repeat?: boolean;
    reservedModifiers?: string[];
    restricted?: boolean;
    uneditable?: KeybindingActionBinding[];
}
```

A Client Keybinding Action Configuration.

## Properties

- **editable?**: `KeybindingActionBinding[]`  
  The default bindings that can be changed by the user.  
  See also [KeybindingActionBinding](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingActionBinding.html)

- **hint?**: `string`  
  An additional human-readable hint.

- **name**: `string`  
  The human-readable name.

- **namespace?**: `string`  
  The namespace within which the action was registered.

- **onDown?**: `Function`  
  A function to execute when a key down event occurs. If `true` is returned, the event is consumed and no further keybinds execute.

- **onUp?**: `Function`  
  A function to execute when a key up event occurs. If `true` is returned, the event is consumed and no further keybinds execute.

- **order?**: `number`  
  The recorded registration order of the action.

- **precedence?**: `number`  
  The preferred precedence of running this Keybinding Action.

- **repeat?**: `boolean`  
  If `true`, allows repeat events to execute the Action's `onDown`. Defaults to `false`.

- **reservedModifiers?**: `string[]`  
  Modifiers such as `["CONTROL"]` that can also be pressed when executing this Action. Prevents using one of these modifiers as a binding.

- **restricted?**: `boolean`  
  If `true`, only a GM can edit and execute this Action.

- **uneditable?**: `KeybindingActionBinding[]`  
  The default bindings that can never be changed nor removed.  
  See also [KeybindingActionBinding](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingActionBinding.html)

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).