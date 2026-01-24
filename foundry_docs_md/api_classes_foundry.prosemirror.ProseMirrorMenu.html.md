# ProseMirrorMenu | Foundry Virtual Tabletop - API Documentation - Version 13

A class responsible for building a menu for a ProseMirror instance.

## Hierarchy
- [ProseMirrorPlugin](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html)  
- **ProseMirrorMenu**

---

## Constructors

### constructor

```typescript
new ProseMirrorMenu(
    schema: Schema,
    view: EditorView,
    options?: any,
): ProseMirrorMenu
```

**Parameters**

- **schema**: `Schema`  
  The ProseMirror schema to build a menu for.
- **view**: `EditorView`  
  The editor view.
- **options** (optional): `any = {}`  
  Additional options to configure the plugin's behaviour.

**Returns**  
`ProseMirrorMenu`

Overrides [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)

---

## Properties

### options

`options: ProseMirrorMenuOptions`  
Additional options to configure the plugin's behaviour.

### _MENU_ITEM_SCOPES

`_MENU_ITEM_SCOPES: { BOTH: string; HTML: string; TEXT: string } = ...`  
An enumeration of editor scopes in which a menu item can appear.

---

## Accessors

### editingSource

```typescript
get editingSource(): boolean
```

Track whether we are currently in a state of editing the HTML source.

**Returns**  
`boolean`

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

### destroy

```typescript
destroy(): void
```

Called when the view is destroyed or receives a state with different plugins.

**Returns**  
`void`

---

### render

```typescript
render(): ProseMirrorMenu
```

Render the menu's HTML.

**Returns**  
`ProseMirrorMenu`

---

### update

```typescript
update(view: EditorView, prevState: EditorView): void
```

Called whenever the view's state is updated.

**Parameters**

- **view**: `EditorView`  
  The current editor state.
- **prevState**: `EditorView`  
  The previous editor state.

**Returns**  
`void`

---

### _clearFormatting

```typescript
protected _clearFormatting(): void
```

Clear any marks from the current selection.

**Returns**  
`void`

---

### _createDropDowns

```typescript
protected _createDropDowns(): void
```

Instantiate the ProseMirrorDropDown instances and configure them with the defined menu items.

**Returns**  
`void`

---

### _getDropDownMenus

```typescript
protected _getDropDownMenus(): Record<string, ProseMirrorDropDownConfig>
```

Configure dropdowns for this menu. Each entry in the top-level array corresponds to a separate drop-down.

**Returns**  
`Record<string, ProseMirrorDropDownConfig>`

---

### _getMenuItems

```typescript
protected _getMenuItems(): ProseMirrorMenuItem[]
```

Configure the items for this menu.

**Returns**  
`ProseMirrorMenuItem[]`

---

### _handleSave

```typescript
protected _handleSave(): any
```

Handle requests to save the editor contents.

**Returns**  
`any`

---

### _insertImagePrompt

```typescript
protected _insertImagePrompt(): Promise<void>
```

Display the insert image prompt.

**Returns**  
`Promise<void>`

---

### _insertLinkPrompt

```typescript
protected _insertLinkPrompt(): Promise<void>
```

Display the insert link prompt.

**Returns**  
`Promise<void>`

---

### _insertTablePrompt

```typescript
protected _insertTablePrompt(): Promise<void>
```

Display the insert table prompt.

**Returns**  
`Promise<void>`

---

### _isItemActive

```typescript
protected _isItemActive(item: ProseMirrorMenuItem): boolean
```

Determine whether the given menu item is currently active or not.

**Parameters**

- **item**: `ProseMirrorMenuItem`  
  The menu item.

**Returns**  
`boolean`  
Whether the cursor or selection is in a state represented by the given menu item.

---

### _isMarkActive

```typescript
protected _isMarkActive(item: ProseMirrorMenuItem): boolean
```

Determine whether the given menu item representing a mark is active or not.

**Parameters**

- **item**: `ProseMirrorMenuItem`  
  The menu item representing a MarkType.

**Returns**  
`boolean`  
Whether the cursor or selection is in a state represented by the given mark.

---

### _isNodeActive

```typescript
protected _isNodeActive(item: ProseMirrorMenuItem): boolean
```

Determine whether the given menu item representing a node is active or not.

**Parameters**

- **item**: `ProseMirrorMenuItem`  
  The menu item representing a NodeType.

**Returns**  
`boolean`  
Whether the cursor or selection is currently within a block of this menu item's node type.

---

### _onAction

```typescript
protected _onAction(event: MouseEvent): void
```

Handle a button press.

**Parameters**

- **event**: `MouseEvent`  
  The click event.

**Returns**  
`void`

---

### _showDialog

```typescript
protected _showDialog(
    action: string,
    template: string,
    options?: { data?: object },
): HTMLDialogElement
```

Create a dialog for a menu button.

**Parameters**

- **action**: `string`  
  The unique menu button action.
- **template**: `string`  
  The dialog's template.
- **options** (optional): `{ data?: object } = {}`  
  Additional options to configure the dialog's behaviour.
  - **data** (optional): `object`  
    Data to pass to the template.

**Returns**  
`HTMLDialogElement`

---

### _toggleBlock

```typescript
protected _toggleBlock(
    node: NodeType,
    wrap: MenuToggleBlockWrapCommand,
    options?: { attrs?: object },
): void
```

Toggle the given selection by wrapping it in a given block or lifting it out of one.

**Parameters**

- **node**: `NodeType`  
  The type of node being interacted with.
- **wrap**: `MenuToggleBlockWrapCommand`  
  The wrap command specific to the given node.
- **options** (optional): `{ attrs?: object } = {}`  
  Additional options to configure behaviour.
  - **attrs** (optional): `object`  
    Attributes for the node.

**Returns**  
`void`

---

### _toggleMatches

```typescript
protected _toggleMatches(): Promise<void>
```

Toggle link recommendations.

**Returns**  
`Promise<void>`

---

### _toggleTextBlock

```typescript
protected _toggleTextBlock(node: NodeType, options?: { attrs?: object }): void
```

Toggle the given selection by wrapping it in a given text block, or reverting to a paragraph block.

**Parameters**

- **node**: `NodeType`  
  The type of node being interacted with.
- **options** (optional): `{ attrs?: object } = {}`  
  Additional options to configure behaviour.
  - **attrs** (optional): `object`  
    Attributes for the node.

**Returns**  
`void`

---

### _wrapEditor

```typescript
protected _wrapEditor(): void
```

Wrap the editor view element and inject our template ready to be rendered into.

**Returns**  
`void`

---

## Static Methods

### build

```typescript
static build(schema: any, options?: {}): Plugin<any>
```

Build the plugin.

**Parameters**

- **schema**: `any`  
  The ProseMirror schema to build the plugin against.
- **options** (optional): `{ } = {}`  
  Additional options to pass to the plugin.

**Returns**  
`Plugin<any>`

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)

---

### eventListeners

```typescript
static eventListeners(): void
```

Global listeners for the drop-down menu.

**Returns**  
`void`

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).