# ClientKeybindings

A class responsible for managing defined game keybindings. Each keybinding is a string key/value pair belonging to a certain namespace and a certain store scope.

When Foundry Virtual Tabletop is initialized, a singleton instance of this class is constructed within the global `game` object as `game.keybindings`.

**See**  
- [foundry.Game#keybindings](https://foundryvtt.com/api/classes/foundry.Game.html#keybindings)  
- [ControlsConfig](https://foundryvtt.com/api/classes/foundry.applications.sidebar.apps.ControlsConfig.html)

---

## Properties

### actions

`actions: Map<string, [KeybindingActionConfig](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingActionConfig.html)>`

Registered Keybinding actions.

### activeKeys

`activeKeys: Map<string, [KeybindingAction](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingAction.html)[]>`

A mapping of a string key to possible Actions that might execute off it.

### bindings

`bindings: Map<string,[KeybindingActionBinding](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingActionBinding.html)[]>`

A stored cache of Keybind Actions Ids to Bindings.

---

## Accessors

### moveKeys

```typescript
get moveKeys(): Set<string>
```

An alias of the movement key set tracked by the keyboard.

**Returns:** `Set<string>`

---

## Methods

### get

```typescript
get(namespace: string, action: string): KeybindingActionBinding[]
```

Get the current Bindings of a given namespace's Keybinding Action.

**Parameters:**

- **namespace**: `string`  
  The namespace under which the setting is registered.
- **action**: `string`  
  The keybind action to retrieve.

**Returns:**  
`KeybindingActionBinding[]`

**Example:**

```typescript
game.keybindings.get("myModule", "showNotification");
```

---

### initialize

```typescript
initialize(): void
```

Initializes the keybinding values for all registered actions.

**Returns:** `void`

---

### register

```typescript
register(namespace: string, action: string, data: KeybindingActionConfig): void
```

Register a new keybinding.

**Parameters:**

- **namespace**: `string`  
  The namespace the Keybinding Action belongs to.
- **action**: `string`  
  A unique machine-readable id for the Keybinding Action.
- **data**: [KeybindingActionConfig](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingActionConfig.html)  
  Configuration for keybinding data.

**Returns:** `void`

**Example:** Define a keybinding which shows a notification

```typescript
game.keybindings.register("myModule", "showNotification", {
  name: "My Settings Keybinding",
  hint: "A description of what will occur when the Keybinding is executed.",
  uneditable: [
    {
      key: "Digit1",
      modifiers: ["Control"]
    }
  ],
  editable: [
    {
      key: "F1"
    }
  ],
  onDown: () => { ui.notifications.info("Pressed!") },
  onUp: () => {},
  restricted: true,              // Restrict this Keybinding to gamemaster only?
  reservedModifiers: ["Alt"],    // On ALT, the notification is permanent instead of temporary
  precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
});
```

---

### resetDefaults

```typescript
resetDefaults(): Promise<any>
```

Reset all client keybindings back to their default configuration.

**Returns:** `Promise<any>`

---

### set

```typescript
set(
  namespace: string,
  action: string,
  bindings: KeybindingActionBinding[],
): Promise<any>
```

Set the editable Bindings of a Keybinding Action for a certain namespace and Action.

**Parameters:**

- **namespace**: `string`  
  The namespace under which the Keybinding is registered.
- **action**: `string`  
  The Keybinding action to set.
- **bindings**: `KeybindingActionBinding[]`  
  The Bindings to assign to the Keybinding.

**Returns:** `Promise<any>`

**Example:** Update the current value of a keybinding

```typescript
game.keybindings.set("myModule", "showNotification", [
  {
    key: "F2",
    modifiers: [ "CONTROL" ]
  }
]);
```