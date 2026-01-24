# Dialog | Foundry Virtual Tabletop - API Documentation - Version 13

Create a dialog window displaying a title, a message, and a set of buttons which trigger callback functions.

**Example: Constructing a custom dialog instance**

```typescript
let d = new Dialog({
  title: "Test Dialog",
  content: "<p>You must choose either Option 1, or Option 2</p>",
  buttons: {
    one: {
      icon: '<i class="fa-solid fa-check"></i>',
      label: "Option One",
      callback: () => console.log("Chose One")
    },
    two: {
      icon: '<i class="fa-solid fa-xmark"></i>',
      label: "Option Two",
      callback: () => console.log("Chose Two")
    }
  },
  default: "two",
  render: html => console.log("Register interactivity in the rendered dialog"),
  close: html => console.log("This always is logged no matter which option is chosen")
});
d.render(true);
```

---

## Class Hierarchy

- [Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html)
- **Dialog**

---

## Constructors

### constructor

```typescript
new Dialog(
  data: DialogData,
  options?: ApplicationV1Options & DialogV1Options,
): Dialog
```

**Parameters:**

- **data**: `DialogData`  
  An object of dialog data which configures how the modal window is rendered

- **options** (optional): `ApplicationV1Options & DialogV1Options`  
  Dialog rendering options, see [foundry.appv1.api.Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html)

**Returns:**  
`Dialog`

Overrides [Application.constructor](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#constructor)

---

## Properties

### appId

`appId: number`  
The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT  
Inherited from: [Application.appId](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#appid)

### options

`options: object`  
The options provided to this application upon initialization  
Inherited from: [Application.options](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#options)

### position

`position: object`  
Track the current position and dimensions of the Application UI  
Inherited from: [Application.position](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#position)

### _priorState (protected)

`_priorState: number`  
The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.  
Inherited from: [Application._priorState](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_priorstate)

### _state (protected)

`_state: number`  
The current render state of the Application  
See: [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)  
Inherited from: [Application._state](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_state)

### RENDER_STATES (static)

```typescript
static RENDER_STATES: Readonly<{
  CLOSED: -1;
  CLOSING: -2;
  ERROR: -3;
  NONE: 0;
  RENDERED: 2;
  RENDERING: 1;
}>
```

The sequence of rendering states that track the Application life-cycle.  
Inherited from: [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)

---

## Accessors

### closing

```typescript
get closing(): boolean
```

Whether the Application is currently closing.  
Returns: `boolean`  
Inherited from: Application.closing

### element

```typescript
get element(): jQuery
```

Return the active application element, if it currently exists in the DOM.  
Returns: `jQuery`  
Inherited from: Application.element

### id

```typescript
get id(): string
```

Return the CSS application ID which uniquely references this UI element.  
Returns: `string`  
Inherited from: Application.id

### popOut

```typescript
get popOut(): boolean
```

Control the rendering style of the application. If popOut is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.  
Returns: `boolean`  
Inherited from: Application.popOut

### rendered

```typescript
get rendered(): boolean
```

Return a flag for whether the Application instance is currently rendered.  
Returns: `boolean`  
Inherited from: Application.rendered

### template

```typescript
get template(): string
```

The path to the HTML template file which should be used to render the inner content of the app.  
Returns: `string`  
Inherited from: Application.template

### title

```typescript
get title(): string
```

An Application window should define its own title definition logic which may be dynamic depending on its data.  
Returns: `string`  
Overrides Application.title

### defaultOptions (static)

```typescript
static get defaultOptions(): DialogV1Options
```

Returns: `DialogV1Options`  
Overrides Application.defaultOptions

---

## Methods

### _renderOuter

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.  
Returns: `Promise<jQuery>` - A promise resolving to the constructed jQuery object  
Overrides [Application._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_renderouter)

### activateListeners

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters:**

- **html**: `any`  

**Returns:** `void`  
Overrides [Application.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#activatelisteners)

### activateTab

```typescript
activateTab(
  tabName: string,
  options?: { group: string; triggerCallback: boolean },
): void
```

Change the currently active tab.

**Parameters:**

- **tabName**: `string`  
  The target tab name to switch to

- **options** (optional): `{ group: string; triggerCallback: boolean } = {}`  
  Options which configure changing the tab

  - **group**: `string`  
    A specific named tab group, useful if multiple sets of tabs are present

  - **triggerCallback**: `boolean`  
    Whether to trigger tab-change callback functions

**Returns:** `void`  
Inherited from [Application.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#activatetab)

### bringToFront

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an Application or an ApplicationV2.

**Returns:** `void`  
Inherited from [Application.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtofront)

### bringToTop

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

**Returns:** `void`  
Inherited from [Application.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop)

### close

```typescript
close(options?: {}): Promise<void>
```

Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters:**

- **options**: `{}` (optional)  
  Options which affect how the Application is closed

**Returns:** `Promise<void>`  
Fires: `closeApplication`  
Overrides [Application.close](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#close)

### getData

```typescript
getData(_options: any): { buttons: {}; content: string }
```

An application should define the data object used to render its template. This function may either return an Object directly, or a Promise which resolves to an Object. If undefined, the default implementation will return an empty object allowing only for rendering of static HTML.

**Parameters:**

- **_options**: `any`  

**Returns:**  
```typescript
{
  buttons: {};
  content: string;
}
```

Overrides [Application.getData](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#getdata)

### maximize

```typescript
maximize(): Promise<void>
```

Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

**Returns:** `Promise<void>`  
Inherited from [Application.maximize](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#maximize)

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

**Returns:** `Promise<void>`  
Inherited from [Application.minimize](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#minimize)

### render

```typescript
render(
  force?: boolean,
  options?: {
    focus?: boolean;
    height?: number;
    left?: number;
    renderContext?: string;
    renderData?: object;
    scale?: number;
    top?: number;
    width?: number;
  },
): Application
```

Render the Application by evaluating its HTML template against the object of data provided by the getData method. If the Application is rendered as a pop-out window, wrap the contained HTML in an outer frame with window controls.

**Parameters:**

- **force** (optional): `boolean = false`  
  Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.

- **options** (optional):  
  - **focus**?: `boolean`  
    Apply focus to the application, maximizing it and bringing it to the top of the vertical stack.  
  - **height**?: `number`  
    The rendered height  
  - **left**?: `number`  
    The left positioning attribute  
  - **renderContext**?: `string`  
    A context-providing string which suggests what event triggered the render  
  - **renderData**?: `object`  
    The data change which motivated the render request  
  - **scale**?: `number`  
    The rendered transformation scale  
  - **top**?: `number`  
    The top positioning attribute  
  - **width**?: `number`  
    The rendered width  

**Returns:**  
`Application`  
Inherited from [Application.render](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render)

### setPosition

```typescript
setPosition(
  position?: {
    height: null | string | number;
    left: null | number;
    scale: null | number;
    top: null | number;
    width: null | number;
  },
): void | {
  height: number;
  left: number;
  scale: number;
  top: number;
  width: number;
}
```

Set the application position and store its new location. Returns the updated position object for the application containing the new values.

**Parameters:**

- **position** (optional):  
  Positional data

  - **height**: `null | string | number`  
    The application height in pixels

  - **left**: `null | number`  
    The left offset position in pixels

  - **scale**: `null | number`  
    The application scale as a numeric factor where 1.0 is default

  - **top**: `null | number`  
    The top offset position in pixels

  - **width**: `null | number`  
    The application width in pixels

**Returns:** `void | { height: number; left: number; scale: number; top: number; width: number; }`  
Inherited from [Application.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#setposition)

### submit

```typescript
submit(button: Object, event: PointerEvent): void
```

Submit the Dialog by selecting one of its buttons.

**Parameters:**

- **button**: `Object`  
  The configuration of the chosen button

- **event**: `PointerEvent`  
  The originating click event

**Returns:** `void`

### _activateCoreListeners (protected)

```typescript
_activateCoreListeners(html: jQuery): void
```

Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters:**

- **html**: `jQuery`

**Returns:** `void`  
Inherited from [Application._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_activatecorelisteners)

### _callHooks (protected)

```typescript
_callHooks(
  hookName: string | ((className: string) => string),
  ...hookArgs: any[],
): void
```

Call all hooks for all applications in the inheritance chain.

**Parameters:**

- **hookName**: `string | (className: string) => string`  
  The hook being triggered, formatted with the Application class name

- **...hookArgs**: `any[]`  
  The arguments passed to the hook calls

**Returns:** `void`  
Inherited from [Application._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_callhooks)

### _canDragDrop (protected)

```typescript
_canDragDrop(selector: string): boolean
```

Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters:**

- **selector**: `string`  
  The candidate HTML selector for the drop target

**Returns:** `boolean` - Can the current user drop on this selector?  
Inherited from [Application._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_candragdrop)

### _canDragStart (protected)

```typescript
_canDragStart(selector: string): boolean
```

Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters:**

- **selector**: `string`  
  The candidate HTML selector for dragging

**Returns:** `boolean` - Can the current user drag this selector?  
Inherited from [Application._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_candragstart)

### _getHeaderButtons (protected)

```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```

Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the `getApplicationV1HeaderButtons` hook.

**Returns:** `ApplicationV1HeaderButton[]`  
Fires: `getApplicationHeaderButtons`  
Inherited from [Application._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_getheaderbuttons)

### _onChangeTab (protected)

```typescript
_onChangeTab(event: null | MouseEvent, tabs: Tabs, active: string): void
```

Handle changes to the active tab in a configured Tabs controller.

**Parameters:**

- **event**: `null | MouseEvent`  
  A left click event

- **tabs**: `Tabs`  
  The Tabs controller

- **active**: `string`  
  The new active tab name

**Returns:** `void`  
Inherited from [Application._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_onchangetab)

### _onDragOver (protected)

```typescript
_onDragOver(event: DragEvent): void
```

Callback actions which occur when a dragged element is over a drop target.

**Parameters:**

- **event**: `DragEvent`  
  The originating DragEvent

**Returns:** `void`  
Inherited from [Application._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_ondragover)

### _onDragStart (protected)

```typescript
_onDragStart(event: DragEvent): void
```

Callback actions which occur at the beginning of a drag start workflow.

**Parameters:**

- **event**: `DragEvent`  
  The originating DragEvent

**Returns:** `void`  
Inherited from [Application._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_ondragstart)

### _onDrop (protected)

```typescript
_onDrop(event: DragEvent): void
```

Callback actions which occur when a dragged element is dropped on a target.

**Parameters:**

- **event**: `DragEvent`  
  The originating DragEvent

**Returns:** `void`  
Inherited from [Application._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_ondrop)

### _onKeyDown (protected)

```typescript
_onKeyDown(event: KeyboardEvent): void | Promise<void>
```

Handle a keydown event while the dialog is active.

**Parameters:**

- **event**: `KeyboardEvent`  
  The keydown event

**Returns:** `void | Promise<void>`

### _onSearchFilter (protected)

```typescript
_onSearchFilter(
  event: KeyboardEvent,
  query: string,
  rgx: RegExp,
  html: HTMLElement,
): void
```

Handle changes to search filtering controllers which are bound to the Application.

**Parameters:**

- **event**: `KeyboardEvent`  
  The key-up event from keyboard input

- **query**: `string`  
  The raw string input to the search field

- **rgx**: `RegExp`  
  The regular expression to test against

- **html**: `HTMLElement`  
  The HTML element which should be filtered

**Returns:** `void`  
Inherited from [Application._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_onsearchfilter)

### _render (protected)

```typescript
_render(force?: boolean, options?: object): Promise<void>
```

An asynchronous inner function which handles the rendering of the Application.

**Parameters:**

- **force** (optional): `boolean = false`  
  Render and display the application even if it is not currently displayed.

- **options** (optional): `object = {}`  
  Additional options which update the current values of the Application#options object

**Returns:** `Promise<void>`  
Fires: `renderApplication`  
Inherited from [Application._render](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_render)

### _restoreScrollPositions (protected)

```typescript
_restoreScrollPositions(html: jQuery): void
```

Restore the scroll positions of containers within the app after re-rendering the content

**Parameters:**

- **html**: `jQuery`  
  The HTML object being traversed

**Returns:** `void`  
Inherited from [Application._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_restorescrollpositions)

### _saveScrollPositions (protected)

```typescript
_saveScrollPositions(html: jQuery): void
```

Persist the scroll positions of containers within the app before re-rendering the content

**Parameters:**

- **html**: `jQuery`  
  The HTML object being traversed

**Returns:** `void`  
Inherited from [Application._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_savescrollpositions)

### _waitForImages (protected)

```typescript
_waitForImages(): Promise<void>
```

Wait for any images present in the Application to load.

**Returns:** `Promise<void>`  
A Promise that resolves when all images have loaded.  
Inherited from [Application._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_waitforimages)

---

## Static Methods

### confirm

```typescript
static confirm(config?: DialogData & DialogV1ConfirmOptions): Promise<any>
```

A helper factory method to create simple confirmation dialog windows which consist of simple yes/no prompts. If you require more flexibility, a custom Dialog instance is preferred.

**Parameters:**

- **config** (optional): `DialogData & DialogV1ConfirmOptions = {}`  
  Dialog configuration options

**Returns:**  
`Promise<any>` - A promise which resolves once the user makes a choice or closes the window

**Example: Prompt the user with a yes or no question**

```typescript
let d = Dialog.confirm({
  title: "A Yes or No Question",
  content: "<p>Choose wisely.</p>",
  yes: () => console.log("You chose ... wisely"),
  no: () => console.log("You chose ... poorly"),
  defaultYes: false
});
```

### prompt

```typescript
static prompt(config?: any): Promise<any>
```

A helper factory method to display a basic "prompt" style Dialog with a single button.

**Parameters:**

- **config** (optional): `any = {}`  
  Dialog configuration options

**Returns:**  
`Promise<any>` - The returned value from the provided callback function, if any

### wait

```typescript
static wait(
  data?: DialogData,
  options?: ApplicationV1Options & DialogV1Options,
  renderOptions?: object,
): Promise<any>
```

Wrap the Dialog with an enclosing Promise which resolves or rejects when the client makes a choice.

**Parameters:**

- **data** (optional): `DialogData = {}`  
  Data passed to the Dialog constructor.

- **options** (optional): `ApplicationV1Options & DialogV1Options = {}`  
  Options passed to the Dialog constructor.

- **renderOptions** (optional): `object = {}`  
  Options passed to the Dialog render call.

**Returns:**  
`Promise<any>` - A Promise that resolves to the chosen result.

---

**For the full details, see the [Foundry Virtual Tabletop API Documentation - Dialog](https://foundryvtt.com/api/classes/foundry.appv1.api.Dialog.html)**