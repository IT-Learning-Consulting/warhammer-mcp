# KeyboardEventContext | Foundry Virtual Tabletop - API Documentation - Version 13

An interface representing a keyboard event context.

```typescript
interface KeyboardEventContext {
    action?: string;
    event: KeyboardEvent;
    hasModifier: boolean;
    isAlt: boolean;
    isControl: boolean;
    isShift: boolean;
    key: string;
    modifiers: string[];
    repeat: boolean;
    up: boolean;
}
```

## Properties

- **action?**: `string`  
  The executing Keybinding Action. May be undefined until the action is known.

- **event**: `KeyboardEvent`  
  The originating keypress event.

- **hasModifier**: `boolean`  
  Are any of the modifiers being pressed.

- **isAlt**: `boolean`  
  Is the Alt modifier being pressed.

- **isControl**: `boolean`  
  Is the Control or Meta modifier being processed.

- **isShift**: `boolean`  
  Is the Shift modifier being pressed.

- **key**: `string`  
  The normalized string key, such as `"KeyA"`.

- **modifiers**: `string[]`  
  A list of string modifiers applied to this context, such as `["CONTROL"]`.

- **repeat**: `boolean`  
  True if the given key is being held down such that it is automatically repeating.

- **up**: `boolean`  
  True if the key is up, else false if down.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)