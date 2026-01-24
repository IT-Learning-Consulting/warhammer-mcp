# Class ItemSheet

The Application responsible for displaying and editing a single Item document.

**Deprecated** since v13.

## Description

- **Param: item**  
  The Item instance being displayed within the sheet.

- **Param: options**  
  Additional application configuration options.

## Hierarchy

- [DocumentSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html)  
  ↳ **ItemSheet**

---

## Constructors

```typescript
// Constructor
new ItemSheet(
    object: Document<object, DocumentConstructionContext>,
    options?: any,
): ItemSheet
```

**Parameters:**

- **object**: `Document<object, DocumentConstructionContext>`  
  A Document instance which should be managed by this form.

- **options**: `any = {}` (Optional)  
  Optional configuration parameters for how the form behaves.

**Returns:**  
`ItemSheet`

*Inherited from [DocumentSheet.constructor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#constructor)*

---

## Properties

- **appId**: `number`  
  The application ID is a unique incrementing integer used to identify every application window drawn by the VTT.

  *Inherited from [DocumentSheet.appId](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#appid)*

- **editors**: `Record<string, object>`  
  Keeps track of any TinyMCE editors active as part of this form. The values are inner-objects with references to the editor and other metadata.

  *Inherited from [DocumentSheet.editors](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#editors)*

- **form**: `HTMLElement`  
  A convenience reference to the form HTMLElement.

  *Inherited from [DocumentSheet.form](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#form)*

- **object**: `any`  
  The object target which this form modifies.

  *Inherited from [DocumentSheet.object](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#object)*

- **options**: `object`  
  The options provided to this application upon initialization.

  *Inherited from [DocumentSheet.options](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#options)*

- **position**: `object`  
  Tracks the current position and dimensions of the Application UI.

  *Inherited from [DocumentSheet.position](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#position)*

- **_priorState**: `number` *(Protected)*  
  The prior render state of this Application. Allows rendering logic to understand if the application is being rendered for the first time.

  *Inherited from [DocumentSheet._priorState](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_priorstate)*

- **_secrets**: `HTMLSecret[]` *(Protected)*  
  List of handlers for secret block functionality.

  *Inherited from [DocumentSheet._secrets](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_secrets)*

---

## Accessors

- **_state**: `number` *(Protected)*  
  The current render state of the Application.

  **See:**   
  [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)  
  *Inherited from [DocumentSheet._state](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_state)*

- **RENDER_STATES**: `Readonly<{ CLOSED: -1; CLOSING: -2; ERROR: -3; NONE: 0; RENDERED: 2; RENDERING: 1; }>` (Static)  
  The sequence of rendering states that track the Application life-cycle.

  *Inherited from [DocumentSheet.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#render_states)*

- **actor**: `Actor`  
  The Actor instance which owns this item. May be null if the item is unowned.

  **Returns:** `Actor`

- **closing**: `boolean`  
  Whether the Application is currently closing.

  **Returns:** `boolean`  
  *Inherited from DocumentSheet.closing*

- **document**: `ClientDocument`  
  A semantic convenience reference to the Document instance which is the target for this form.

  **Returns:** `ClientDocument`  
  *Inherited from DocumentSheet.document*

- **element**: `jQuery`  
  Returns the active application element if it exists in the DOM.

  **Returns:** `jQuery`  
  *Inherited from DocumentSheet.element*

- **id**: `string`  
  Returns the CSS application ID which uniquely references this UI element.

  **Returns:** `string`  
  *Inherited from DocumentSheet.id*

- **isEditable**: `any`  
  Indicates if the Form Application is currently editable.

  **Returns:** `any`  
  *Inherited from DocumentSheet.isEditable*

- **item**: `documents.Item`  
  A convenience reference to the Item document.

  **Returns:** `documents.Item`

- **popOut**: `boolean`  
  Controls the rendering style. If true, the application is rendered in its own wrapper window; otherwise only the inner app content.

  **Returns:** `boolean`  
  *Inherited from DocumentSheet.popOut*

- **rendered**: `boolean`  
  Returns a flag for whether the Application instance is currently rendered.

  **Returns:** `boolean`  
  *Inherited from DocumentSheet.rendered*

- **template**: `string`  
  The path to the HTML template file used to render the inner content of the app.

  **Returns:** `string`  
  *Inherited from DocumentSheet.template*

- **title**: `any`  
  Defines the Application window’s title dynamically depending on its data.

  **Returns:** `any`  
  Overrides DocumentSheet.title

- **defaultOptions**: `object` (Static)  
  Default options that override DocumentSheet.defaultOptions.

- **_customElements**: `string[]` *(Protected, Static)*  
  An array of custom element tag names that should be listened to for changes.

  **Returns:** `string[]`  
  *Inherited from DocumentSheet._customElements*

---

## Methods

### _activateCoreListeners

```typescript
_activateCoreListeners(html: any): void
```

Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters:**
- **html**: `any`

**Returns:** `void`

*Inherited from [DocumentSheet._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_activatecorelisteners)*

---

### _getHeaderButtons

```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```

Specify the set of config buttons which should appear in the Application header. Buttons are returned as an array of objects. The header buttons can be modified by the `getApplicationV1HeaderButtons` hook.

**Returns:** `ApplicationV1HeaderButton[]`

**Fires:** `getApplicationHeaderButtons`

*Inherited from [DocumentSheet._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getheaderbuttons)*

---

### _render

```typescript
_render(force: any, options?: {}): Promise<void>
```

An asynchronous inner function that handles rendering of the Application.

**Parameters:**
- **force**: `any`  
  Render and display the application even if it is not currently displayed.

- **options**: `{}` = {} (Optional)  
  Additional options which update the Application#options.

**Returns:** `Promise<void>`

**Fires:** `renderApplication`

*Inherited from [DocumentSheet._render](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_render)*

---

### _renderOuter

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.

**Returns:** `Promise<jQuery>`  
A promise resolving to the constructed jQuery object.

*Inherited from [DocumentSheet._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_renderouter)*

---

### _updateObject

```typescript
_updateObject(_event: any, formData: any): Promise<any>
```

Called upon form submission after form data is validated.

**Parameters:**
- **_event**: `any`  
  The initial triggering submission event.

- **formData**: `any`  
  The object of validated form data with which to update the object.

**Returns:** `Promise<any>`

*Inherited from [DocumentSheet._updateObject](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_updateobject)*

---

### activateEditor

```typescript
activateEditor(
    name: any,
    options?: {},
    initialContent?: string,
): Promise<Editor | EditorView>
```

Activate a named TinyMCE text editor.

**Parameters:**
- **name**: `any`  
  The named data field which the editor modifies.

- **options**: `{}` = {} (Optional)  
  Editor initialization options passed to [foundry.applications.ux.TextEditor.create](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create).

- **initialContent**: `string` = "" (Optional)  
  Initial text content for the editor area.

**Returns:** `Promise<Editor | EditorView>`

*Inherited from [DocumentSheet.activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activateeditor)*

---

### activateListeners

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses attach event-handling logic.

**Parameters:**
- **html**: `any`

**Returns:** `void`

*Inherited from [DocumentSheet.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activatelisteners)*

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
- **tabName**: `string`  
  The target tab name to switch to.

- **options**: `{ group: string; triggerCallback: boolean } = {}` (Optional)  
  Options which configure changing the tab.

  - **group**: `string`  
    A specific named tab group, useful if multiple sets of tabs are present.

  - **triggerCallback**: `boolean`  
    Whether to trigger tab-change callback functions.

**Returns:** `void`

*Inherited from [DocumentSheet.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activatetab)*

---

### bringToFront

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) when operating on an Application or ApplicationV2.

**Returns:** `void`

*Inherited from [DocumentSheet.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#bringtofront)*

---

### bringToTop

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

**Returns:** `void`

*Inherited from [DocumentSheet.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#bringtotop)*

---

### close

```typescript
close(options?: {}): Promise<void>
```

Close the application and unregister references to it within UI mappings. Returns a Promise which resolves once the window closing animation concludes.

**Parameters:**
- **options**: `{}` = {} (Optional)  
  Options which affect how the Application is closed.

**Returns:** `Promise<void>`

**Fires:** `closeApplication`

*Inherited from [DocumentSheet.close](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#close)*

---

### getData

```typescript
getData(
    options?: {},
): {
    cssClass: string;
    data: any;
    document: ClientDocument;
    editable: any;
    limited: any;
    options: object;
    owner: any;
    title: string;
}
```

Defines the data object used to render the template. May return an Object directly or a Promise resolving to an Object. If undefined, default returns an empty object allowing static HTML rendering.

**Parameters:**
- **options**: `{}` = {} (Optional)

**Returns:**
- **cssClass**: `string`
- **data**: `any`
- **document**: `ClientDocument`
- **editable**: `any`
- **limited**: `any`
- **options**: `object`
- **owner**: `any`
- **title**: `string`

Overrides [DocumentSheet.getData](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#getdata)

---

### maximize

```typescript
maximize(): Promise<void>
```

Maximize the pop-out window, expanding it to its original size. No action for non-pop-out or already maximized windows.

**Returns:** `Promise<void>`

*Inherited from [DocumentSheet.maximize](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#maximize)*

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. No action for non-pop-out or already minimized windows.

**Returns:** `Promise<void>`

*Inherited from [DocumentSheet.minimize](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#minimize)*

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

Render the Application by evaluating its template against the data provided by `getData`.  
If rendered as a pop-out, wraps HTML in an outer frame with window controls.

**Parameters:**

- **force**: `boolean` = false (Optional)  
  Add rendered app to the DOM if not present. Otherwise only rerender if present.

- **options**: (Optional)  
  - **focus?**: `boolean` - Applies focus, maximizing and bringing to top of stack.  
  - **height?**: `number` - Rendered height.  
  - **left?**: `number` - Left positioning.  
  - **renderContext?**: `string` - Suggests what event triggered the render.  
  - **renderData?**: `object` - Data change triggering render request.  
  - **scale?**: `number` - Rendered transformation scale.  
  - **top?**: `number` - Top positioning.  
  - **width?**: `number` - Rendered width.  

**Returns:**  
`Application`

*Inherited from [DocumentSheet.render](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#render)*

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

- **name**: `string`  
  The named editor to save.

- **options**: `{ preventRender?: boolean; remove?: boolean } = {}` (Optional)  
  - **preventRender?**: `boolean` - Prevent re-rendering after saving.  
  - **remove?**: `boolean` - Remove editor after saving content.

**Returns:** `Promise<void>`

*Inherited from [DocumentSheet.saveEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#saveeditor)*

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

Set the application position and store its new location. Returns the updated position object containing new values.

**Parameters:**

- **position**: (Optional)  
  - **height**: `null | string | number` - Height in pixels.  
  - **left**: `null | number` - Left offset in pixels.  
  - **scale**: `null | number` - Scale factor, 1.0 is default.  
  - **top**: `null | number` - Top offset in pixels.  
  - **width**: `null | number` - Width in pixels.

**Returns:**  
`void` or updated position object.

*Inherited from [DocumentSheet.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#setposition)*

---

### submit

```typescript
submit(options?: object): Promise<ItemSheet>
```

Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters:**

- **options**: `object = {}` (Optional)  
  Passed to the `_onSubmit` event handler.

**Returns:** `Promise<ItemSheet>`  
Returns a self-reference for convenient method chaining.

*Inherited from [DocumentSheet.submit](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#submit)*

---

### _activateEditor

```typescript
_activateEditor(div: HTMLElement): void
```

*(Protected)* Activate an editor instance present within the form.

**Parameters:**

- **div**: `HTMLElement`  
  The element containing the editor.

**Returns:** `void`

*Inherited from [DocumentSheet._activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_activateeditor)*

---

### _callHooks

```typescript
_callHooks(
    hookName: string | ((className: string) => string),
    ...hookArgs: any[],
): void
```

*(Protected)* Call all hooks for all applications in the inheritance chain.

**Parameters:**

- **hookName**: `string | (className: string) => string`  
  The hook being triggered, formatted with the Application class name.

- **...hookArgs**: `any[]`  
  Arguments passed to the hook calls.

**Returns:** `void`

*Inherited from [DocumentSheet._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_callhooks)*

---

### _canDragDrop

```typescript
_canDragDrop(selector: string): boolean
```

*(Protected)* Define whether a user can conclude a drag-and-drop workflow for a given drop selector.

**Parameters:**

- **selector**: `string`  
  The candidate HTML selector for the drop target.

**Returns:** `boolean`  
Whether the user can drop on this selector.

*Inherited from [DocumentSheet._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_candragdrop)*

---

### _canDragStart

```typescript
_canDragStart(selector: string): boolean
```

*(Protected)* Define whether a user can begin a drag start workflow for a given drag selector.

**Parameters:**

- **selector**: `string`  
  The candidate HTML selector for dragging.

**Returns:** `boolean`  
Whether the user can drag this selector.

*Inherited from [DocumentSheet._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_candragstart)*

---

### _canUserView

```typescript
_canUserView(user: User): boolean
```

*(Protected)* Test whether a certain User has permission to view this Document Sheet.

**Parameters:**

- **user**: `User`  
  The user requesting to render the sheet.

**Returns:** `boolean`  
Whether the user has permission.

*Inherited from [DocumentSheet._canUserView](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_canuserview)*

---

### _configureProseMirrorPlugins

```typescript
_configureProseMirrorPlugins(
    name: string,
    options?: { remove?: boolean },
): object
```

*(Protected)* Configure ProseMirror plugins for this sheet.

**Parameters:**

- **name**: `string`  
  The name of the editor.

- **options**: `{ remove?: boolean } = {}` (Optional)  
  Additional options to configure plugins.

  - **remove?**: `boolean`  
    Whether the editor should destroy itself on save.

**Returns:** `object`

*Inherited from [DocumentSheet._configureProseMirrorPlugins](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_configureprosemirrorplugins)*

---

### _createDocumentIdLink

```typescript
_createDocumentIdLink(html: jQuery): void
```

*(Protected)* Create an ID link button in the document sheet header which displays the document ID and copies it to clipboard.

**Parameters:**

- **html**: `jQuery`

**Returns:** `void`

*Inherited from [DocumentSheet._createDocumentIdLink](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_createdocumentidlink)*

---

### _createSecretHandlers

```typescript
_createSecretHandlers(): HTMLSecret[]
```

*(Protected)* Create objects for managing secret blocks within this Document's content.

**Returns:** `HTMLSecret[]`

*Inherited from [DocumentSheet._createSecretHandlers](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_createsecrethandlers)*

---

### _disableFields

```typescript
_disableFields(form: HTMLElement): void
```

*(Protected)* If the form is not editable, disable its input fields.

**Parameters:**

- **form**: `HTMLElement`  
  The form HTML element.

**Returns:** `void`

*Inherited from [DocumentSheet._disableFields](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_disablefields)*

---

### _getSecretContent

```typescript
_getSecretContent(secret: HTMLElement): string | void
```

*(Protected)* Get the HTML content that a given secret block is embedded in.

**Parameters:**

- **secret**: `HTMLElement`  
  The secret block.

**Returns:** `string | void`

*Inherited from [DocumentSheet._getSecretContent](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getsecretcontent)*

---

### _getSubmitData

```typescript
_getSubmitData(updateData?: object): object
```

*(Protected)* Get an object of update data used to update the form's target object.

**Parameters:**

- **updateData**: `object = {}` (Optional)  
  Additional data to merge with form data.

**Returns:** `object`  
The prepared update data.

*Inherited from [DocumentSheet._getSubmitData](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getsubmitdata)*

---

### _onChangeColorPicker

```typescript
_onChangeColorPicker(event: Event): void
```

*(Protected)* Handle change of a color picker input, entering the chosen value into a related input field.

**Parameters:**

- **event**: `Event`  
  The color picker change event.

**Returns:** `void`

*Inherited from [DocumentSheet._onChangeColorPicker](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangecolorpicker)*

---

### _onChangeInput

```typescript
_onChangeInput(event: Event): Promise<any>
```

*(Protected)* Handles changes to an input element, submitting the form if `options.submitOnChange` is true.  
Do not `preventDefault` in this handler.

**Parameters:**

- **event**: `Event`  
  The initial change event.

**Returns:** `Promise<any>`

*Inherited from [DocumentSheet._onChangeInput](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangeinput)*

---

### _onChangeRange

```typescript
_onChangeRange(event: Event): void
```

*(Protected)* Handle changes to a range input, propagating changes to the sibling range-value element.

**Parameters:**

- **event**: `Event`  
  The initial change event.

**Returns:** `void`

*Inherited from [DocumentSheet._onChangeRange](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangerange)*

---

### _onChangeTab

```typescript
_onChangeTab(event: null | MouseEvent, tabs: Tabs, active: string): void
```

*(Protected)* Handle changes to the active tab in a configured Tabs controller.

**Parameters:**

- **event**: `null | MouseEvent`  
  A left-click event.

- **tabs**: `Tabs`  
  The Tabs controller instance.

- **active**: `string`  
  The new active tab name.

**Returns:** `void`

*Inherited from [DocumentSheet._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangetab)*

---

### _onConfigureSheet

```typescript
_onConfigureSheet(event: ClickEvent): void
```

*(Protected)* Handle requests to configure the default sheet used by this Document.

**Parameters:**

- **event**: `ClickEvent`

**Returns:** `void`

*Inherited from [DocumentSheet._onConfigureSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onconfiguresheet)*

---

### _onDragOver

```typescript
_onDragOver(event: DragEvent): void
```

*(Protected)* Callback when a dragged element is over a drop target.

**Parameters:**

- **event**: `DragEvent`

**Returns:** `void`

*Inherited from [DocumentSheet._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondragover)*

---

### _onDragStart

```typescript
_onDragStart(event: DragEvent): void
```

*(Protected)* Callback at the beginning of a drag start workflow.

**Parameters:**

- **event**: `DragEvent`

**Returns:** `void`

*Inherited from [DocumentSheet._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondragstart)*

---

### _onDrop

```typescript
_onDrop(event: DragEvent): void
```

*(Protected)* Callback when a dragged element is dropped on a target.

**Parameters:**

- **event**: `DragEvent`

**Returns:** `void`

*Inherited from [DocumentSheet._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondrop)*

---

### _onEditImage

```typescript
_onEditImage(event: MouseEvent): Promise<FilePicker>
```

*(Protected)* Handle changing a Document's image.

**Parameters:**

- **event**: `MouseEvent`  
  The click event.

**Returns:** `Promise<FilePicker>`

*Inherited from [DocumentSheet._onEditImage](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_oneditimage)*

---

### _onSearchFilter

```typescript
_onSearchFilter(
    event: KeyboardEvent,
    query: string,
    rgx: RegExp,
    html: HTMLElement,
): void
```

*(Protected)* Handle changes to search filtering controllers which are bound to the Application.

**Parameters:**

- **event**: `KeyboardEvent`  
  The key-up event.

- **query**: `string`  
  The raw string input to the search field.

- **rgx**: `RegExp`  
  Regular expression to test against.

- **html**: `HTMLElement`  
  The HTML element to be filtered.

**Returns:** `void`

*Inherited from [DocumentSheet._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onsearchfilter)*

---

### _onSubmit

```typescript
_onSubmit(
    event: Event,
    options?: {
        preventClose?: boolean;
        preventRender?: boolean;
        updateData?: null | object;
    },
): Promise<any>
```

*(Protected)* Handle standard form submission steps.

**Parameters:**

- **event**: `Event`  
  The submit event which triggered this handler.

- **options**: (Optional)  
  - **preventClose?**: `boolean`  
    Override the standard closing behavior.  
  - **preventRender?**: `boolean`  
    Prevent app from re-rendering after submission.  
  - **updateData?**: `null | object`  
    Additional specific data to override or extend parsed form data.

**Returns:** `Promise<any>`  
A promise resolving to the validated update data.

*Inherited from [DocumentSheet._onSubmit](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onsubmit)*

---

### _restoreScrollPositions

```typescript
_restoreScrollPositions(html: jQuery): void
```

*(Protected)* Restore scroll positions of containers within the app after re-rendering content.

**Parameters:**

- **html**: `jQuery`  
  The HTML object being traversed.

**Returns:** `void`

*Inherited from [DocumentSheet._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_restorescrollpositions)*

---

### _saveScrollPositions

```typescript
_saveScrollPositions(html: jQuery): void
```

*(Protected)* Persist scroll positions of containers within the app before re-rendering content.

**Parameters:**

- **html**: `jQuery`  
  The HTML object being traversed.

**Returns:** `void`

*Inherited from [DocumentSheet._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_savescrollpositions)*

---

### _updateSecret

```typescript
_updateSecret(secret: HTMLElement, content: string): void | Promise<any>
```

*(Protected)* Update the HTML content that a given secret block is embedded in.

**Parameters:**

- **secret**: `HTMLElement`  
  The secret block element.

- **content**: `string`  
  The new content.

**Returns:**  
`void` or `Promise<any>` - The updated Document.

*Inherited from [DocumentSheet._updateSecret](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_updatesecret)*

---

### _waitForImages

```typescript
_waitForImages(): Promise<void>
```

*(Protected)* Wait for any images present in the Application to load.

**Returns:** `Promise<void>`  
A Promise that resolves when all images have loaded.

*Inherited from [DocumentSheet._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_waitforimages)*

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)