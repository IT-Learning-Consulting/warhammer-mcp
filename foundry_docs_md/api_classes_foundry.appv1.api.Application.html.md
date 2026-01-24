# Application | Foundry Virtual Tabletop - API Documentation - Version 13

**Class Application Abstract**  
The legacy application window that is rendered for some UI elements in Foundry VTT.

**Deprecated**  
since v13

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.appv1.api.Application))  
**Application**  
- _Dialog_ ([Dialog class](https://foundryvtt.com/api/classes/foundry.appv1.api.Dialog.html))  
- _FormApplication_ ([FormApplication class](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html))

---

## Constructors

### constructor
```typescript
new Application(options?: ApplicationV1Options): Application
```

**Parameters**  
- **options**: `ApplicationV1Options = {}` (Optional)  
  The options provided to this application upon initialization.

---

## Properties

### appId
`number`  
The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.

### options
`object`  
The options provided to this application upon initialization.

### position
`object`  
Track the current position and dimensions of the Application UI.

### _priorState _(protected)  
`number`  
The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.

### _state _(protected)  
`number`  
The current render state of the Application.  
See [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#4).

### RENDER_STATES _(static)_
```typescript
static readonly RENDER_STATES: Readonly<{
  CLOSED: -1;
  CLOSING: -2;
  ERROR: -3;
  NONE: 0;
  RENDERED: 2;
  RENDERING: 1;
}>;
```
The sequence of rendering states that track the Application life-cycle.

---

## Accessors

### closing
```typescript
get closing(): boolean
```
Whether the Application is currently closing.  
**Returns:** `boolean`

### element
```typescript
get element(): jQuery
```
Return the active application element, if it currently exists in the DOM.  
**Returns:** `jQuery`

### id
```typescript
get id(): string
```
Return the CSS application ID which uniquely references this UI element.  
**Returns:** `string`

### popOut
```typescript
get popOut(): boolean
```
Control the rendering style of the application. If `popOut` is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.  
**Returns:** `boolean`

### rendered
```typescript
get rendered(): boolean
```
Return a flag for whether the Application instance is currently rendered.  
**Returns:** `boolean`

### template
```typescript
get template(): string
```
The path to the HTML template file which should be used to render the inner content of the app.  
**Returns:** `string`

### title
```typescript
get title(): string
```
An Application window should define its own title definition logic which may be dynamic depending on its data.  
**Returns:** `string`

### defaultOptions _(static)_
```typescript
static get defaultOptions(): ApplicationV1Options
```
Assign the default options configuration which is used by this Application class. The options and values defined in this object are merged with any provided option values which are passed to the constructor upon initialization. Application subclasses may include additional options which are specific to their usage.  
**Returns:** `ApplicationV1Options`

---

## Methods

### activateListeners
```typescript
activateListeners(html: jQuery): void
```
After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters:**  
- **html**: `jQuery`

**Returns:** `void`

---

### activateTab
```typescript
activateTab(
  tabName: string,
  options?: { group: string; triggerCallback: boolean }
): void
```
Change the currently active tab.

**Parameters:**  
- **tabName**: `string`  
  The target tab name to switch to.
- **options**: `{ group: string; triggerCallback: boolean } = {}` (Optional)  
  Options which configure changing the tab.  
  - **group**: `string`  
    A specific named tab group, useful if multiple sets of tabs are present.  
  - **triggerCallback**: `boolean`  
    Whether to trigger tab-change callback functions.

**Returns:** `void`

---

### bringToFront
```typescript
bringToFront(): void
```
A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#7) for when operating on an object that is either an Application or an ApplicationV2.  
**Returns:** `void`

---

### bringToTop
```typescript
bringToTop(): void
```
Bring the application to the top of the rendering stack.  
**Returns:** `void`

---

### close
```typescript
close(options?: object): Promise<void>
```
Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters:**  
- **options**: `object = {}` (Optional)  
  Options which affect how the Application is closed.

**Returns:**  
`Promise<void>`

**Fires:** `closeApplication`

---

### getData
```typescript
getData(options?: object): object | Promise<object>
```
An application should define the data object used to render its template. This function may either return an Object directly, or a Promise which resolves to an Object. If undefined, the default implementation will return an empty object allowing only for rendering of static HTML.

**Parameters:**  
- **options**: `object = {}` (Optional)

**Returns:**  
`object | Promise<object>`

---

### maximize
```typescript
maximize(): Promise<void>
```
Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

**Returns:**  
`Promise<void>`  
A Promise which resolves once the maximization action has completed.

---

### minimize
```typescript
minimize(): Promise<void>
```
Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

**Returns:**  
`Promise<void>`  
A Promise which resolves once the minimization action has completed.

---

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
  }
): Application
```
Render the Application by evaluating its HTML template against the object of data provided by the `getData` method. If the Application is rendered as a pop-out window, wrap the contained HTML in an outer frame with window controls.

**Parameters:**  
- **force**: `boolean = false`  
  Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.
- **options**: (Optional) Additional rendering options:
  - **focus**?: `boolean`  
    Apply focus to the application, maximizing it and bringing it to the top of the vertical stack.
  - **height**?: `number`  
    The rendered height.
  - **left**?: `number`  
    The left positioning attribute.
  - **renderContext**?: `string`  
    A context-providing string which suggests what event triggered the render.
  - **renderData**?: `object`  
    The data change which motivated the render request.
  - **scale**?: `number`  
    The rendered transformation scale.
  - **top**?: `number`  
    The top positioning attribute.
  - **width**?: `number`  
    The rendered width.

**Returns:**  
`Application`  
The rendered Application instance.

---

### setPosition
```typescript
setPosition(
  position?: {
    height: null | string | number;
    left: null | number;
    scale: null | number;
    top: null | number;
    width: null | number;
  }
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
- **position**: (Optional) Positional data:
  - **height**: `null | string | number`  
    The application height in pixels.
  - **left**: `null | number`  
    The left offset position in pixels.
  - **scale**: `null | number`  
    The application scale as a numeric factor where 1.0 is default.
  - **top**: `null | number`  
    The top offset position in pixels.
  - **width**: `null | number`  
    The application width in pixels.

**Returns:**  
`void` or position object

---

### _activateCoreListeners _(protected)
```typescript
_activateCoreListeners(html: jQuery): void
```
Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters:**  
- **html**: `jQuery`

**Returns:** `void`

---

### _callHooks _(protected)
```typescript
_callHooks(
  hookName: string | ((className: string) => string),
  ...hookArgs: any[]
): void
```
Call all hooks for all applications in the inheritance chain.

**Parameters:**  
- **hookName**: `string | ((className: string) => string)`  
  The hook being triggered, which formatted with the Application class name.
- **...hookArgs**: `any[]`  
  The arguments passed to the hook calls.

**Returns:** `void`

---

### _canDragDrop _(protected)
```typescript
_canDragDrop(selector: string): boolean
```
Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters:**  
- **selector**: `string`  
  The candidate HTML selector for the drop target.

**Returns:**  
`boolean`  
Can the current user drop on this selector?

---

### _canDragStart _(protected)
```typescript
_canDragStart(selector: string): boolean
```
Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters:**  
- **selector**: `string`  
  The candidate HTML selector for dragging.

**Returns:**  
`boolean`  
Can the current user drag this selector?

---

### _getHeaderButtons _(protected)
```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```
Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the `getApplicationV1HeaderButtons` hook.

**Returns:**  
`ApplicationV1HeaderButton[]`

**Fires:** `getApplicationHeaderButtons`

---

### _onChangeTab _(protected)
```typescript
_onChangeTab(
  event: null | MouseEvent,
  tabs: Tabs,
  active: string
): void
```
Handle changes to the active tab in a configured Tabs controller.

**Parameters:**  
- **event**: `null | MouseEvent`  
  A left click event.
- **tabs**: `Tabs`  
  The Tabs controller.
- **active**: `string`  
  The new active tab name.

**Returns:**  
`void`

---

### _onDragOver _(protected)
```typescript
_onDragOver(event: DragEvent): void
```
Callback actions which occur when a dragged element is over a drop target.

**Parameters:**  
- **event**: `DragEvent`  
  The originating DragEvent.

**Returns:**  
`void`

---

### _onDragStart _(protected)
```typescript
_onDragStart(event: DragEvent): void
```
Callback actions which occur at the beginning of a drag start workflow.

**Parameters:**  
- **event**: `DragEvent`  
  The originating DragEvent.

**Returns:**  
`void`

---

### _onDrop _(protected)
```typescript
_onDrop(event: DragEvent): void
```
Callback actions which occur when a dragged element is dropped on a target.

**Parameters:**  
- **event**: `DragEvent`  
  The originating DragEvent.

**Returns:**  
`void`

---

### _onSearchFilter _(protected)
```typescript
_onSearchFilter(
  event: KeyboardEvent,
  query: string,
  rgx: RegExp,
  html: HTMLElement
): void
```
Handle changes to search filtering controllers which are bound to the Application.

**Parameters:**  
- **event**: `KeyboardEvent`  
  The key-up event from keyboard input.
- **query**: `string`  
  The raw string input to the search field.
- **rgx**: `RegExp`  
  The regular expression to test against.
- **html**: `HTMLElement`  
  The HTML element which should be filtered.

**Returns:**  
`void`

---

### _render _(protected)
```typescript
_render(
  force?: boolean,
  options?: object
): Promise<void>
```
An asynchronous inner function which handles the rendering of the Application.

**Parameters:**  
- **force**: `boolean = false`  
  Render and display the application even if it is not currently displayed.
- **options**: `object = {}`  
  Additional options which update the current values of the `Application#options` object.

**Returns:**  
`Promise<void>`

**Fires:** `renderApplication`

---

### _renderOuter _(protected)
```typescript
_renderOuter(): Promise<jQuery>
```
Render the outer application wrapper.

**Returns:**  
`Promise<jQuery>`  
A promise resolving to the constructed jQuery object.

---

### _restoreScrollPositions _(protected)
```typescript
_restoreScrollPositions(html: jQuery): void
```
Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters:**  
- **html**: `jQuery`  
  The HTML object being traversed.

**Returns:**  
`void`

---

### _saveScrollPositions _(protected)
```typescript
_saveScrollPositions(html: jQuery): void
```
Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters:**  
- **html**: `jQuery`  
  The HTML object being traversed.

**Returns:**  
`void`

---

### _waitForImages _(protected)
```typescript
_waitForImages(): Promise<void>
```
Wait for any images present in the Application to load.

**Returns:**  
`Promise<void>`  
A Promise that resolves when all images have loaded.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)