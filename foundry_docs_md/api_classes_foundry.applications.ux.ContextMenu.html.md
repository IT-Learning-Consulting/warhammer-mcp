# ContextMenu | Foundry Virtual Tabletop - API Documentation - Version 13

Display a right-click activated Context Menu which provides a dropdown menu of options. A ContextMenu is constructed by designating a parent HTML container and a target selector. An Array of menuItems defines the entries of the menu which is displayed.

## Constructors

### constructor

```typescript
new ContextMenu(
    container: any,
    selector: string,
    menuItems: ContextMenuEntry[],
    options?: ContextMenuOptions,
): ContextMenu
```

**Parameters**

- **container**: `any`  
  The HTML element that contains the context menu targets.

- **selector**: `string`  
  A CSS selector which activates the context menu.

- **menuItems**: [`ContextMenuEntry`](https://foundryvtt.com/api/interfaces/foundry.ContextMenuEntry.html)[]  
  An Array of entries to display in the menu.

- **options**?: [`ContextMenuOptions`](https://foundryvtt.com/api/interfaces/foundry.ContextMenuOptions.html) = {}  
  Additional options to configure the context menu.

**Returns**  
`ContextMenu`

---

## Properties

### menuItems

```typescript
menuItems: (ContextMenuEntry & { element: HTMLElement })[]
```

The array of menu items to render.

---

## Accessors

### onClose

```typescript
onClose: ContextMenuCallback
```

A function to call when the context menu is closed.

### onOpen

```typescript
onOpen: ContextMenuCallback
```

A function to call when the context menu is opened.

### element

```typescript
get element(): HTMLElement
```

The menu element.

**Returns**  
`HTMLElement`

### eventName

```typescript
get eventName(): string
```

The event name to listen for.

**Returns**  
`string`

### expandUp

```typescript
get expandUp(): boolean
```

Check which direction the menu is expanded in.

### fixed

```typescript
get fixed(): boolean
```

Whether to position the context menu as a fixed element, or inject it into the target.

**Returns**  
`boolean`

### selector

```typescript
get selector(): string
```

A CSS selector to identify context menu targets.

**Returns**  
`string`

### target

```typescript
get target(): HTMLElement
```

The parent HTML element to which the context menu is attached.

**Returns**  
`HTMLElement`

### implementation

```typescript
static get implementation(): typeof ContextMenu
```

Retrieve the configured DragDrop implementation.

**Returns**  
`typeof ContextMenu`

---

## Methods

### activateListeners

```typescript
activateListeners(menu: HTMLElement): void
```

Local listeners which apply to each ContextMenu instance which is created.

**Parameters**

- **menu**: `HTMLElement`  
  The context menu element.

**Returns**  
`void`

---

### close

```typescript
close(options?: { animate?: boolean }): Promise<void>
```

Closes the menu and removes it from the DOM.

**Parameters**

- **options**?: object = {}  
  Options to configure the closing behavior.

  - **animate**?: `boolean`  
    Animate the context menu closing.

**Returns**  
`Promise<void>`

---

### render

```typescript
render(target: HTMLElement, options?: ContextMenuRenderOptions): Promise<void>
```

Render the Context Menu by iterating over the menuItems it contains. Check the visibility of each menu item, and only render ones which are allowed by the item's logical condition. Attach a click handler to each item which is rendered.

**Parameters**

- **target**: `HTMLElement`  
  The target element to which the context menu is attached.

- **options**?: [`ContextMenuRenderOptions`](https://foundryvtt.com/api/interfaces/foundry.ContextMenuRenderOptions.html) = {}  

**Returns**  
`Promise<void>`  
A Promise that resolves when the open animation has completed.

---

### _animate

```typescript
protected _animate(open?: boolean): Promise<void>
```

Protected. Animate the context menu's height when opening or closing.

**Parameters**

- **open**: `boolean` = false  
  Whether the menu is opening or closing.

**Returns**  
`Promise<void>`  
A Promise that resolves when the animation completes.

---

### _close

```typescript
protected _close(): void
```

Protected. Close the menu and remove it from the DOM.

**Returns**  
`void`

---

### _injectMenu

```typescript
protected _injectMenu(menu: HTMLElement, target: HTMLElement): void
```

Protected. Inject the menu inside the target.

**Parameters**

- **menu**: `HTMLElement`  
  The menu element.

- **target**: `HTMLElement`  
  The context target.

**Returns**  
`void`

---

### _onActivate

```typescript
protected _onActivate(event: Event): undefined | Promise<void>
```

Protected. Handle context menu activation.

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns**  
`undefined` | `Promise<void>`

---

### _onRender

```typescript
protected _onRender(options?: ContextMenuRenderOptions): Promise<void>
```

Protected. Called after the context menu has finished rendering and animating open.

**Parameters**

- **options**?: [`ContextMenuRenderOptions`](https://foundryvtt.com/api/interfaces/foundry.ContextMenuRenderOptions.html) = {}

**Returns**  
`Promise<void>`

---

### _preRender

```typescript
protected _preRender(target: HTMLElement, options?: ContextMenuRenderOptions): Promise<void>
```

Protected. Called before the context menu begins rendering.

**Parameters**

- **target**: `HTMLElement`  
  The context target.

- **options**?: [`ContextMenuRenderOptions`](https://foundryvtt.com/api/interfaces/foundry.ContextMenuRenderOptions.html) = {}

**Returns**  
`Promise<void>`

---

### _setFixedPosition

```typescript
protected _setFixedPosition(menu: HTMLElement, target: HTMLElement, options?: { event?: Event }): void
```

Protected. Set the context menu at a fixed position in the viewport.

**Parameters**

- **menu**: `HTMLElement`  
  The menu element.

- **target**: `HTMLElement`  
  The context target.

- **options**?: object = {}  
  Optional

  - **event**?: `Event`  
    The event that triggered the context menu opening.

**Returns**  
`void`

---

### _setPosition

```typescript
protected _setPosition(menu: HTMLElement, target: HTMLElement, options?: { event?: Event }): void
```

Protected. Set the position of the context menu, taking into consideration whether the menu should expand upward or downward.

**Parameters**

- **menu**: `HTMLElement`  
  The context menu element.

- **target**: `HTMLElement`  
  The element that the context menu was spawned on.

- **options**?: object = {}  
  Optional

  - **event**?: `Event`  
    The event that triggered the context menu opening.

**Returns**  
`void`

---

## Static Methods

### create

```typescript
static create(
    app: Application,
    html: any,
    selector: string,
    menuItems: ContextMenuEntry[],
    options?: { hookName?: string },
): ContextMenu
```

Create a ContextMenu for this Application and dispatch hooks.

**Parameters**

- **app**: [`Application`](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html)  
  The Application this ContextMenu belongs to.

- **html**: `any`  
  The Application's rendered HTML.

- **selector**: `string`  
  The target CSS selector which activates the menu.

- **menuItems**: [`ContextMenuEntry`](https://foundryvtt.com/api/interfaces/foundry.ContextMenuEntry.html)[]  
  The array of menu items being rendered.

- **options**?: object = {}  
  Additional options to configure context menu initialization.

  - **hookName**?: `string`  
    The name of the hook to call.

**Returns**  
`ContextMenu`

**Deprecated**  
since v13

---

### eventListeners

```typescript
static eventListeners(): void
```

Global listeners which apply once only to the document.

**Returns**  
`void`

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).