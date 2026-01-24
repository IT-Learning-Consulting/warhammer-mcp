# ClientSettings

A class responsible for managing defined game settings or settings menus. Each setting is a string key/value pair belonging to a certain namespace and a certain store scope.

When Foundry Virtual Tabletop is initialized, a singleton instance of this class is constructed within the global Game object as `game.settings`.

**See**

- [foundry.Game#settings](https://foundryvtt.com/api/classes/foundry.Game.html#settings)
- [foundry.applications.sidebar.tabs.Settings](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.Settings.html)
- [foundry.applications.settings.SettingsConfig](https://foundryvtt.com/api/classes/foundry.applications.settings.SettingsConfig.html)

---

## Properties

### menus

`menus: Map< string, Application | ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions> >`

Registered settings menus which trigger secondary applications.

### settings

`settings: Map<string, SettingConfig>`

An object of registered game settings for this scope.

### storage

`storage: Map<"world" | "client", Storage>`

The storage interfaces used for persisting settings. Each storage interface shares the same API as `window.localStorage`.

---

## Accessors

### sheet

```typescript
get sheet(): SettingsConfig
```

Return a singleton instance of the Game Settings Configuration app.

**Returns**  
`SettingsConfig`

---

## Methods

### get

```typescript
get(namespace: string, key: string, options?: { document?: boolean }): any
```

Get the value of a game setting for a certain namespace and setting key.

**Parameters**

- **namespace**: `string`  
  The namespace under which the setting is registered.
- **key**: `string`  
  The setting key to retrieve.
- **options?**: `{ document?: boolean } = {}`  
  Additional options for setting retrieval.
  - **document?**: `boolean`  
    Retrieve the full Setting document instance instead of just its value.

**Returns**  
`any`  
The current value or the Setting document instance.

**Example: Retrieve the current setting value**

```typescript
game.settings.get("myModule", "myClientSetting");
```

---

### register

```typescript
register(namespace: string, key: string, data: SettingConfig): void
```

Register a new game setting under this setting scope.

**Parameters**

- **namespace**: `string`  
  The namespace under which the setting is registered.
- **key**: `string`  
  The key name for the setting under the namespace.
- **data**: `SettingConfig`  
  Configuration for setting data.

**Returns**  
`void`

**Example: Register a client setting**

```typescript
game.settings.register("myModule", "myClientSetting", {
  name: "Register a Module Setting with Choices",
  hint: "A description of the registered setting and its behavior.",
  scope: "client",      // This specifies a client-stored setting
  config: true,         // This specifies that the setting appears in the 
                        // configuration view
  requiresReload: true, // This will prompt the user to reload the application for 
                        // the setting to take effect.
  type: String,
  choices: {            // If choices are defined, the resulting setting will be a 
    "a": "Option A",
    "b": "Option B"
  },
  default: "a",         // The default value for the setting
  onChange: value => {  // A callback function which triggers when the setting is 
    console.log(value)
  }
});
```

**Example: Register a world setting**

```typescript
game.settings.register("myModule", "myWorldSetting", {
  name: "Register a Module Setting with a Range slider",
  hint: "A description of the registered setting and its behavior.",
  scope: "world",       // This specifies a world-level setting
  config: true,         // This specifies that the setting appears in the 
                        // configuration view
  requiresReload: true, // This will prompt the GM to have all clients reload the 
                        // application for the setting to
                        // take effect.
  type: new foundry.fields.NumberField({nullable: false, min: 0, max: 100, step: 10}),
  default: 50,          // The default value for the setting
  onChange: value => {  // A callback function which triggers when the setting is changed
    console.log(value)
  }
});
```

---

### registerMenu

```typescript
registerMenu(namespace: string, key: string, data: SettingSubmenuConfig): void
```

Register a new sub-settings menu.

**Parameters**

- **namespace**: `string`  
  The namespace under which the menu is registered.
- **key**: `string`  
  The key name for the setting under the namespace.
- **data**: `SettingSubmenuConfig`  
  Configuration for setting data.

**Returns**  
`void`

**Example: Define a settings submenu which handles advanced configuration needs**

```typescript
game.settings.registerMenu("myModule", "mySettingsMenu", {
  name: "My Settings Submenu",
  label: "Settings Menu Label",  // The text label used in the button
  hint: "A description of what will occur in the submenu dialog.",
  icon: "fa-solid fa-bars",      // A Font Awesome icon used in the submenu button
  type: MySubmenuApplicationClass,  // A FormApplication subclass which should be created
  restricted: true              // Restrict this submenu to gamemaster only?
});
```

---

### set

```typescript
set(
  namespace: string,
  key: string,
  value: any,
  options?: { document?: boolean },
): Promise<any>
```

Set the value of a game setting for a certain namespace and setting key.

**Parameters**

- **namespace**: `string`  
  The namespace under which the setting is registered.
- **key**: `string`  
  The setting key to retrieve.
- **value**: `any`  
  The data to assign to the setting key.
- **options?**: `{ document?: boolean } = {}`  
  Additional options passed to the server when updating world-scope settings.
  - **document?**: `boolean`  
    Return the updated Setting document instead of just its value.

**Returns**  
`Promise<any>`  
The assigned setting value or the Setting document instance.

**Example: Update the current value of a setting**

```typescript
game.settings.set("myModule", "myClientSetting", "b");
```

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)