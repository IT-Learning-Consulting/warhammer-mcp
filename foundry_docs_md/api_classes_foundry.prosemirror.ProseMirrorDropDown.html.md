# ProseMirrorDropDown

A class responsible for creating a drop-down.

## Constructors

```typescript
new ProseMirrorDropDown(
    title: string,
    items: ProseMirrorDropDownEntry[],
    options?: {
        cssClass?: string;
        icon?: string;
        onAction?: (arg0: MouseEvent) => any;
    },
): ProseMirrorDropDown
```

A class responsible for rendering a menu drop-down.

**Parameters**

- **title**: `string`  
  The default title.

- **items**: [`ProseMirrorDropDownEntry`](https://foundryvtt.com/api/types/foundry.prosemirror.types.ProseMirrorDropDownEntry.html)[]  
  The configured menu items.

- **options?**:  
  - **cssClass?**: `string`  
    The menu CSS class name. Required if providing an action.
  - **icon?**: `string`  
    Use an icon for the dropdown rather than a text label.
  - **onAction?**: `(arg0: MouseEvent) => any`  
    A callback to fire when a menu item is clicked.

**Returns**  
`ProseMirrorDropDown`

---

## Methods

### activateListeners

```typescript
activateListeners(html: HTMLMenuElement): void
```

Attach event listeners.

**Parameters**

- **html**: `HTMLMenuElement`  
  The root menu element.

**Returns**  
`void`

---

### forEachItem

```typescript
forEachItem(fn: (arg0: ProseMirrorDropDownEntry) => boolean): void
```

Recurse through the menu structure and apply a function to each item in it.

**Parameters**

- **fn**: `(arg0: ProseMirrorDropDownEntry) => boolean`  
  The function to call on each item. Return `false` to prevent iterating over any further items.

**Returns**  
`void`

---

### render

```typescript
render(): string
```

Construct the drop-down menu's HTML.

**Returns**  
`string` — HTML contents as a string.

---

### #onActivate

```typescript
#onActivate(event: PointerEvent): void
```

*Protected*  
Handle spawning a drop-down menu.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.

**Returns**  
`void`

---

### _renderMenu

```typescript
static _renderMenu(entries: ProseMirrorDropDownEntry[]): string
```

*Protected, Static*  
Render a list of drop-down menu items.

**Parameters**

- **entries**: `ProseMirrorDropDownEntry[]`  
  The menu items.

**Returns**  
`string` — HTML contents as a string.

---

### _renderMenuItem

```typescript
static _renderMenuItem(item: ProseMirrorDropDownEntry): string
```

*Protected, Static*  
Render an individual drop-down menu item.

**Parameters**

- **item**: `ProseMirrorDropDownEntry`  
  The menu item.

**Returns**  
`string` — HTML contents as a string.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)