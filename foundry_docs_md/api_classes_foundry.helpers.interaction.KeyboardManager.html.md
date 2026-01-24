# KeyboardManager

A set of helpers and management functions for dealing with user input from keyboard events.  
[https://keycode.info/](https://keycode.info/)

**See:**  
[foundry.Game#keyboard](https://foundryvtt.com/api/classes/foundry.Game.html#keyboard)

---

## Properties

### downKeys
**Type:** `Set<string>`  
The set of key codes which are currently depressed (down).

### moveKeys
**Type:** `Set<string>`  
The set of movement keys which were recently pressed.

### CONTROL_KEY_STRING
**Type:** `string` (static)  
The OS-specific string display for what their Command key is.

### KEYCODE_DISPLAY_MAPPING
**Type:** `Record<string, string>` (static)  
A special mapping of how special `KeyboardEvent#code` values should map to displayed strings or symbols. Values in this configuration object override any other display formatting rules which may be applied.

### MODIFIER_CODES
**Type:** `{ [key: string]: string[] }` (static)  
Track which `KeyboardEvent#code` presses associate with each modifier.

### MODIFIER_KEYS
**Type:** `{ ALT: string; CONTROL: string; SHIFT: string }` (static)  
Allowed modifier keys.

### PROTECTED_KEYS
**Type:** `string[]` (static)  
Key codes which are "protected" and should not be used because they are reserved for browser-level actions.

---

## Accessors

### hasFocus
```typescript
get hasFocus(): boolean
```
Determines whether an `HTMLElement` currently has focus, which may influence keybinding actions.

An element is considered to have focus if:  
1. It has a `dataset.keyboardFocus` attribute explicitly set to `"true"` or an empty string (`""`).  
2. It is an `<input>`, `<select>`, or `<textarea>` element, all of which inherently accept keyboard input.  
3. It has the `isContentEditable` property set to `true`, meaning it is an editable element.  
4. It is a `<button>` element inside a `<form>`, which suggests interactive use.

An element is considered **not** focused if:  
1. There is no currently active element (`document.activeElement` is not an `HTMLElement`).  
2. It has a `dataset.keyboardFocus` attribute explicitly set to `"false"`.

If none of these conditions are met, the element is assumed to be unfocused.

---

## Methods

### isCoreActionKeyActive
```typescript
isCoreActionKeyActive(action: string): boolean
```
Report whether a core action key is currently actively depressed.

**Parameters:**
- **action**: `string`  
  The core action to verify (ex: `"target"`).

**Returns:**  
`boolean` — Is this core action key currently down (active)?

---

### isModifierActive
```typescript
isModifierActive(modifier: string): boolean
```
Report whether a modifier in `KeyboardManager.MODIFIER_KEYS` is currently actively depressed.

**Parameters:**
- **modifier**: `string`  
  A modifier in `MODIFIER_KEYS`.

**Returns:**  
`boolean` — Is this modifier key currently down (active)?

---

### releaseKeys
```typescript
releaseKeys(options?: { force?: boolean }): void
```
Emulate a key-up event for any currently down keys. When emulating, keys are released in reverse order such that combinations such as `"CONTROL + S"` emulate the `"S"` first in order to capture modifiers.

**Parameters (optional):**
- **options**:  
  - **force**?: `boolean` — Force the keyup events to be handled. Defaults to `{}`.

**Returns:**  
`void`

---

### _onFocusIn
```typescript
protected _onFocusIn(event: FocusEvent): void
```
Protected method. Releases any down keys when focusing a form element.

**Parameters:**
- **event**: `FocusEvent`  
  The focus event.

**Returns:**  
`void`

---

### _processKeyboardContext
```typescript
protected _processKeyboardContext(
  context: KeyboardEventContext,
  options?: { force?: boolean }
): void
```
Protected method. Processes a keyboard event context, checking it against registered keybinding actions.

**Parameters:**
- **context**: [`KeyboardEventContext`](https://foundryvtt.com/api/interfaces/foundry.types.KeyboardEventContext.html)  
  The keyboard event context.
- **options** (optional):  
  - **force**?: `boolean` — Force the event to be handled. Defaults to `{}`.

**Returns:**  
`void`

---

### emulateKeypress (static)
```typescript
static emulateKeypress(
  up: boolean,
  code: string,
  options?: {
    altKey?: boolean;
    ctrlKey?: boolean;
    force?: boolean;
    repeat?: boolean;
    shiftKey?: boolean;
  }
): KeyboardEventContext
```
Emulates a key being pressed, triggering the Keyboard event workflow.

**Parameters:**
- **up**: `boolean`  
  If true, emulates the `keyup` event; else, the `keydown` event.
- **code**: `string`  
  The `KeyboardEvent#code` which is being pressed.
- **options** (optional):  
  - **altKey**?: `boolean` — Emulate the ALT modifier as pressed.  
  - **ctrlKey**?: `boolean` — Emulate the CONTROL modifier as pressed.  
  - **force**?: `boolean` — Force the event to be handled.  
  - **repeat**?: `boolean` — Emulate this as a repeat event.  
  - **shiftKey**?: `boolean` — Emulate the SHIFT modifier as pressed.

**Returns:**  
[`KeyboardEventContext`](https://foundryvtt.com/api/interfaces/foundry.types.KeyboardEventContext.html) — The event context triggered.

---

### getKeyboardEventContext (static)
```typescript
static getKeyboardEventContext(event: KeyboardEvent, up?: boolean): KeyboardEventContext
```
Get a standardized keyboard context for a given event. Every individual keypress is uniquely identified using the `KeyboardEvent#code` property.  
List of possible key codes is documented [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values).

**Parameters:**
- **event**: `KeyboardEvent`  
  The originating keypress event.
- **up**: `boolean` = `false`  
  A flag for whether the key is down (`false`) or up (`true`).

**Returns:**  
[`KeyboardEventContext`](https://foundryvtt.com/api/interfaces/foundry.types.KeyboardEventContext.html) — The standardized context of the event.

---

### getKeycodeDisplayString (static)
```typescript
static getKeycodeDisplayString(code: string): string
```
Format a `KeyboardEvent#code` into a displayed string.

**Parameters:**
- **code**: `string`  
  The input code.

**Returns:**  
`string` — The displayed string for this code.