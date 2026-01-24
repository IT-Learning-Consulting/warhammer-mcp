# FormApplication | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract pattern for defining an Application responsible for updating some object using an HTML form.

A few critical assumptions:

1. This application is used to only edit one object at a time  
2. The template used contains one (and only one) HTML form as its outermost element  
3. This abstract layer has no knowledge of what is being updated, so the implementation must define `_updateObject`

**Deprecated**  
since V13

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.appv1.api.FormApplication))  
- *Application*  
- **FormApplication**  
- *DocumentSheet*  

---

## Constructors

### constructor

```typescript
new FormApplication(
    object?: object,
    options?: FormApplicationOptions & ApplicationV1Options,
): FormApplication
```

**Parameters:**

- **object**: `object` = {}  
  Some object which is the target data structure to be updated by the form.  
  Optional

- **options**: `FormApplicationOptions & ApplicationV1Options` = {}  
  Additional options which modify the rendering of the sheet.

**Returns:** `FormApplication`  

Overrides [Application.constructor](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#constructor)

---

## Properties

### appId

`number`  
The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.  
Inherited from [Application.appId](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#appid)

### editors

`Record<string, object>`  
Keep track of any TinyMCE editors which may be active as part of this form. The values of this object are inner-objects with references to the editor and other metadata.

### form

`HTMLElement`  
A convenience reference to the form HTMLElement.

### object

`any`  
The object target which we are using this form to modify.

### options

`object`  
The options provided to this application upon initialization.  
Inherited from [Application.options](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#options)

### position

`object`  
Track the current position and dimensions of the Application UI.  
Inherited from [Application.position](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#position)

### _priorState

`number`  
The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.  
See [Application._priorState](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_priorstate)  
Inherited from Application.

### _state

`number`  
The current render state of the Application.  
See [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)  
Inherited from Application.

### RENDER_STATES

`Readonly<{
    CLOSED: -1;
    CLOSING: -2;
    ERROR: -3;
    NONE: 0;
    RENDERED: 2;
    RENDERING: 1;
}>`  
The sequence of rendering states that track the Application life-cycle.  
Inherited from [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)

---

## Accessors

### closing

```typescript
get closing(): boolean
```
Whether the Application is currently closing.  
Returns `boolean`  
Inherited from Application.

### element

```typescript
get element(): jQuery
```
Return the active application element, if it currently exists in the DOM.  
Returns `jQuery`  
Inherited from Application.

### id

```typescript
get id(): string
```
Return the CSS application ID which uniquely references this UI element.  
Returns `string`  
Inherited from Application.

### isEditable

```typescript
get isEditable(): boolean
```
Is the Form Application currently editable?  
Returns `boolean`

### popOut

```typescript
get popOut(): boolean
```
Control the rendering style of the application. If popOut is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.  
Returns `boolean`  
Inherited from Application.

### rendered

```typescript
get rendered(): boolean
```
Return a flag for whether the Application instance is currently rendered.  
Returns `boolean`  
Inherited from Application.

### template

```typescript
get template(): string
```
The path to the HTML template file which should be used to render the inner content of the app.  
Returns `string`  
Inherited from Application.

### title

```typescript
get title(): string
```
An Application window should define its own title definition logic which may be dynamic depending on its data.  
Returns `string`  
Inherited from Application.

### defaultOptions

```typescript
get defaultOptions(): ApplicationV1Options & FormApplicationOptions
```
Assign the default options which are supported by the document edit sheet. In addition to the default options object supported by the parent Application class, the Form Application supports the following additional keys and values.

Returns: `ApplicationV1Options & FormApplicationOptions`  
Overrides Application.defaultOptions

### _customElements

```typescript
get _customElements(): string[]
```
Protected  
An array of custom element tag names that should be listened to for changes.  
Returns `string[]`

---

## Methods

### _activateCoreListeners

```typescript
_activateCoreListeners(html: any): void
```
Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters:**

- **html**: `any` - HTML element or fragment on which to activate listeners

**Returns:** `void`  
Overrides [Application._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_activatecorelisteners)

---

### _render

```typescript
_render(force: any, options: any): Promise<void>
```
An asynchronous inner function which handles the rendering of the Application.

**Parameters:**

- **force**: `any` - Render and display the application even if it is not currently displayed.  
- **options**: `any` - Additional options which update the current values of the Application#options object.

**Returns:** `Promise<void>`  
Fires: `renderApplication`  
Overrides [Application._render](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_render)

---

### _updateObject

```typescript
_updateObject(event: Event, formData: object): Promise<any>
```
This method is called upon form submission after form data is validated.

**Parameters:**

- **event**: `Event` - The initial triggering submission event.  
- **formData**: `object` - The object of validated form data with which to update the object.

**Returns:** `Promise<any>`

---

### activateEditor

```typescript
activateEditor(
    name: string,
    options?: object,
    initialContent?: string,
): Promise<Editor | EditorView>
```
Activate a named TinyMCE text editor.

**Parameters:**

- **name**: `string` - The named data field which the editor modifies.  
- **options**: `object` = {} - Editor initialization options passed to [foundry.applications.ux.TextEditor.create](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create).  
- **initialContent**: `string` = "" - Initial text content for the editor area.

**Returns:** `Promise<Editor | EditorView>`

---

### activateListeners

```typescript
activateListeners(html: any): void
```
After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters:**

- **html**: `any` - The HTML fragment to bind listeners to.

**Returns:** `void`  
Overrides [Application.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#activatelisteners)

---

### activateTab

```typescript
activateTab(
    tabName: string,
    options?: { group: string; triggerCallback: boolean },
): void
```
Change the currently active tab.

**Parameters:**

- **tabName**: `string` - The target tab name to switch to.  
- **options**: `{ group: string; triggerCallback: boolean }` = {} - Options which configure changing the tab.
  - **group**: `string` - A specific named tab group, useful if multiple sets of tabs are present.  
  - **triggerCallback**: `boolean` - Whether to trigger tab-change callback functions.

**Returns:** `void`  
Inherited from [Application.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#activatetab)

---

### bringToFront

```typescript
bringToFront(): void
```
A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an Application or an ApplicationV2.

**Returns:** `void`  
Inherited from [Application.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtofront)

---

### bringToTop

```typescript
bringToTop(): void
```
Bring the application to the top of the rendering stack.

**Returns:** `void`  
Inherited from [Application.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop)

---

### close

```typescript
close(options?: {}): Promise<void>
```
Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters:**

- **options**: `{}` = {} - Options which affect how the Application is closed.

**Returns:** `Promise<void>`  
Fires: `closeApplication`  
Overrides [Application.close](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#close)

---

### getData

```typescript
getData(_options: any): object | Promise<object>
```
An application should define the data object used to render its template. This function may either return an Object directly, or a Promise which resolves to an Object. If undefined, the default implementation will return an empty object allowing only for rendering of static HTML.

**Parameters:**

- **_options**: `any`

**Returns:** `object | Promise<object>`  
Overrides [Application.getData](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#getdata)

---

### maximize

```typescript
maximize(): Promise<void>
```
Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

**Returns:** `Promise<void>`  
Inherited from [Application.maximize](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#maximize)

---

### minimize

```typescript
minimize(): Promise<void>
```
Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or which are already minimized.

**Returns:** `Promise<void>`  
Inherited from [Application.minimize](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#minimize)

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
    },
): Application
```
Render the Application by evaluating its HTML template against the object of data provided by the getData method. If the Application is rendered as a pop-out window, wrap the contained HTML in an outer frame with window controls.

**Parameters:**

- **force**: `boolean` = `false` - Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.
- **options**: *optional rendering options*  
  - **focus**?: `boolean` - Apply focus to the application, maximizing it and bringing it to the top of the vertical stack.  
  - **height**?: `number` - The rendered height.  
  - **left**?: `number` - The left positioning attribute.  
  - **renderContext**?: `string` - A context-providing string which suggests what event triggered the render.  
  - **renderData**?: `object` - The data change which motivated the render request.  
  - **scale**?: `number` - The rendered transformation scale.  
  - **top**?: `number` - The top positioning attribute.  
  - **width**?: `number` - The rendered width.

**Returns:** `Application`  
Inherited from [Application.render](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render)

---

### saveEditor

```typescript
saveEditor(
    name: string,
    options?: { preventRender?: boolean; remove?: boolean },
): Promise<void>
```
Handle saving the content of a specific editor by name.

**Parameters:**

- **name**: `string` - The named editor to save.
- **options**: *optional*  
  - **preventRender**?: `boolean` - Prevent normal re-rendering of the sheet after saving.  
  - **remove**?: `boolean` - Remove the editor after saving its content.

**Returns:** `Promise<void>`

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

- **position**: *optional* position object  
  - **height**: `null | string | number` - The application height in pixels.  
  - **left**: `null | number` - The left offset position in pixels.  
  - **scale**: `null | number` - The application scale as a numeric factor where 1.0 is default.  
  - **top**: `null | number` - The top offset position in pixels.  
  - **width**: `null | number` - The application width in pixels.

**Returns:** `void` or updated position object.  
Inherited from [Application.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#setposition)

---

### submit

```typescript
submit(options?: object): Promise<FormApplication>
```
Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters:**

- **options**: *optional* object = {} - Options passed to the _onSubmit event handler.

**Returns:** `Promise<FormApplication>`  
Return a self-reference for convenient method chaining.

---

### _activateEditor

```typescript
_protected _activateEditor(div: HTMLElement): void
```
Activate an editor instance present within the form.

**Parameters:**

- **div**: `HTMLElement` - The element which contains the editor.

**Returns:** `void`

---

### _callHooks

```typescript
_protected _callHooks(
    hookName: string | ((className: string) => string),
    ...hookArgs: any[],
): void
```
Call all hooks for all applications in the inheritance chain.

**Parameters:**

- **hookName**: `string` | `(className: string) => string` - The hook being triggered, formatted with the Application class name.  
- **...hookArgs**: `any[]` - The arguments passed to the hook calls.

**Returns:** `void`  
Inherited from [Application._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_callhooks)

---

### _canDragDrop

```typescript
_protected _canDragDrop(selector: string): boolean
```
Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters:**

- **selector**: `string` - The candidate HTML selector for the drop target.

**Returns:** `boolean` - Can the current user drop on this selector?  
Inherited from [Application._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_candragdrop)

---

### _canDragStart

```typescript
_protected _canDragStart(selector: string): boolean
```
Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters:**

- **selector**: `string` - The candidate HTML selector for dragging.

**Returns:** `boolean` - Can the current user drag this selector?  
Inherited from [Application._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_candragstart)

---

### _configureProseMirrorPlugins

```typescript
_protected _configureProseMirrorPlugins(
    name: string,
    options?: { remove?: boolean },
): object
```
Configure ProseMirror plugins for this sheet.

**Parameters:**

- **name**: `string` - The name of the editor.  
- **options**: *optional*  
  - **remove**?: `boolean` - Whether the editor should destroy itself on save.

**Returns:** `object`

---

### _disableFields

```typescript
_protected _disableFields(form: HTMLElement): void
```
If the form is not editable, disable its input fields.

**Parameters:**

- **form**: `HTMLElement` - The form HTML element.

**Returns:** `void`

---

### _getHeaderButtons

```typescript
_protected _getHeaderButtons(): ApplicationV1HeaderButton[]
```
Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the `getApplicationV1HeaderButtons` hook.

**Returns:** `ApplicationV1HeaderButton[]`  
Fires: `getApplicationHeaderButtons`  
Inherited from [Application._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_getheaderbuttons)

---

### _getSubmitData

```typescript
_protected _getSubmitData(updateData?: object): object
```
Get an object of update data used to update the form's target object.

**Parameters:**

- **updateData**: `object` = {} - Additional data that should be merged with the form data.

**Returns:** `object` - The prepared update data.

---

### _onChangeColorPicker

```typescript
_protected _onChangeColorPicker(event: Event): void
```
Handle the change of a color picker input which enters its chosen value into a related input field.

**Parameters:**

- **event**: `Event` - The color picker change event.

**Returns:** `void`

---

### _onChangeInput

```typescript
_protected _onChangeInput(event: Event): Promise<any>
```
Handle changes to an input element, submitting the form if `options.submitOnChange` is true. Do not preventDefault in this handler as other interactions on the form may also be occurring.

**Parameters:**

- **event**: `Event` - The initial change event.

**Returns:** `Promise<any>`

---

### _onChangeRange

```typescript
_protected _onChangeRange(event: Event): void
```
Handle changes to a range type input by propagating those changes to the sibling range-value element.

**Parameters:**

- **event**: `Event` - The initial change event.

**Returns:** `void`

---

### _onChangeTab

```typescript
_protected _onChangeTab(
    event: null | MouseEvent,
    tabs: Tabs,
    active: string,
): void
```
Handle changes to the active tab in a configured Tabs controller.

**Parameters:**

- **event**: `null | MouseEvent` - A left click event.  
- **tabs**: `Tabs` - The Tabs controller.  
- **active**: `string` - The new active tab name.

**Returns:** `void`  
Inherited from [Application._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_onchangetab)

---

### _onDragOver

```typescript
_protected _onDragOver(event: DragEvent): void
```
Callback actions which occur when a dragged element is over a drop target.

**Parameters:**

- **event**: `DragEvent` - The originating DragEvent.

**Returns:** `void`  
Inherited from [Application._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_ondragover)

---

### _onDragStart

```typescript
_protected _onDragStart(event: DragEvent): void
```
Callback actions which occur at the beginning of a drag start workflow.

**Parameters:**

- **event**: `DragEvent` - The originating DragEvent.

**Returns:** `void`  
Inherited from [Application._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_ondragstart)

---

### _onDrop

```typescript
_protected _onDrop(event: DragEvent): void
```
Callback actions which occur when a dragged element is dropped on a target.

**Parameters:**

- **event**: `DragEvent` - The originating DragEvent.

**Returns:** `void`  
Inherited from [Application._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_ondrop)

---

### _onSearchFilter

```typescript
_protected _onSearchFilter(
    event: KeyboardEvent,
    query: string,
    rgx: RegExp,
    html: HTMLElement,
): void
```
Handle changes to search filtering controllers which are bound to the Application.

**Parameters:**

- **event**: `KeyboardEvent` - The key-up event from keyboard input.  
- **query**: `string` - The raw string input to the search field.  
- **rgx**: `RegExp` - The regular expression to test against.  
- **html**: `HTMLElement` - The HTML element which should be filtered.

**Returns:** `void`  
Inherited from [Application._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_onsearchfilter)

---

### _onSubmit

```typescript
_protected _onSubmit(
    event: Event,
    options?: {
        preventClose?: boolean;
        preventRender?: boolean;
        updateData?: null | object;
    },
): Promise<any>
```
Handle standard form submission steps.

**Parameters:**

- **event**: `Event` - The submit event which triggered this handler.  
- **options**: *optional*  
  - **preventClose**?: `boolean` - Override the standard behavior of whether to close the form on submit.  
  - **preventRender**?: `boolean` - Prevent the application from re-rendering as a result of form submission.  
  - **updateData**?: `null | object` - Additional specific data keys/values which override or extend the contents of the parsed form. This can be used to update other flags or data fields at the same time as processing a form submission to avoid multiple database operations.

**Returns:** `Promise<any>`

---

### _renderOuter

```typescript
_protected _renderOuter(): Promise<jQuery>
```
Render the outer application wrapper.

**Returns:** `Promise<jQuery>`  
A promise resolving to the constructed jQuery object.  
Inherited from [Application._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_renderouter)

---

### _restoreScrollPositions

```typescript
_protected _restoreScrollPositions(html: jQuery): void
```
Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters:**

- **html**: `jQuery` - The HTML object being traversed.

**Returns:** `void`  
Inherited from [Application._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_restorescrollpositions)

---

### _saveScrollPositions

```typescript
_protected _saveScrollPositions(html: jQuery): void
```
Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters:**

- **html**: `jQuery` - The HTML object being traversed.

**Returns:** `void`  
Inherited from [Application._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_savescrollpositions)

---

### _waitForImages

```typescript
_protected _waitForImages(): Promise<void>
```
Wait for any images present in the Application to load.

**Returns:** `Promise<void>`  
A Promise that resolves when all images have loaded.  
Inherited from [Application._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#_waitforimages)