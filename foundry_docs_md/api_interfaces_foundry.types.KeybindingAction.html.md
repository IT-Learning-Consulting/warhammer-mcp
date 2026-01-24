# KeybindingAction

An action that can occur when a key is pressed

```typescript
interface KeybindingAction {
    action: string;
    key: string;
    name: string;
    onDown: Function;
    onUp: Function;
    optionalModifiers: string[];
    order: number;
    precedence: number;
    repeat: boolean;
    requiredModifiers: string[];
    restricted: boolean;
}
```

## Properties

- **action**: `string`  
  The namespaced machine identifier of the Action

- **key**: `string`  
  The Keyboard key

- **name**: `string`  
  The human-readable name

- **onDown**: `Function`  
  The handler that executes onDown

- **onUp**: `Function`  
  The handler that executes onUp

- **optionalModifiers**: `string[]`  
  Optional (reserved) modifiers

- **order**: `number`  
  The registration order

- **precedence**: `number`  
  The registration precedence

- **repeat**: `boolean`  
  If `true`, allows Repeat events to execute this Action's `onDown`

- **requiredModifiers**: `string[]`  
  Required modifiers

- **restricted**: `boolean`  
  If `true`, only a GM can execute this Action

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/)  
[modules](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [types](https://foundryvtt.com/api/modules/foundry.types.html) / [KeybindingAction](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingAction.html)