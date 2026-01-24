# DocumentSheet | Foundry Virtual Tabletop - API Documentation - Version 13

Extend the FormApplication pattern to incorporate specific logic for viewing or editing Document instances. See the [FormApplication documentation](https://foundryvtt.com/api/modules/foundry.appv1.api.html) for more complete description of this interface.

**Deprecated** since V13.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.appv1.api.DocumentSheet) , Expand)

- [FormApplication](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html)
- **DocumentSheet**
  - [ActorSheet](https://foundryvtt.com/api/classes/foundry.appv1.sheets.ActorSheet.html)
  - [AdventureImporter](https://foundryvtt.com/api/classes/foundry.appv1.sheets.AdventureImporter.html)
  - [ItemSheet](https://foundryvtt.com/api/classes/foundry.appv1.sheets.ItemSheet.html)
  - [JournalSheet](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalSheet.html)
  - [JournalPageSheet](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html)

---

## Constructor

```typescript
constructor(
    object: Document<object, DocumentConstructionContext>,
    options?: any,
): DocumentSheet
```

**Parameters**

- **object**: `Document<object, DocumentConstructionContext>`  
  A Document instance which should be managed by this form.

- **options**: `any = {}`  
  Optional configuration parameters for how the form behaves.

---

## Properties

### appId

`appId: number`

The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.

_Inherited from [FormApplication.appId](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#appid)_

### editors

`editors: Record<string, object>`

Keep track of any mce editors which may be active as part of this form. The values of this object are inner-objects with references to the MCE editor and other metadata.

_Inherited from [FormApplication.editors](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#editors)_

### form

`form: HTMLElement`

A convenience reference to the form HTMLElement.

_Inherited from [FormApplication.form](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#form)_

### object

`object: any`

The object target which we are using this form to modify.

_Inherited from [FormApplication.object](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#object)_

### options

`options: object`

The options provided to this application upon initialization.

_Inherited from [FormApplication.options](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#options)_

### position

`position: object`

Track the current position and dimensions of the Application UI.

_Inherited from [FormApplication.position](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#position)_

### _priorState  (Protected)

`_priorState: number`

The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.

_See [FormApplication._priorState](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_priorstate)_

### _secrets  (Protected)

`_secrets: HTMLSecret[]`

The list of handlers for secret block functionality.

### _state  (Protected)

`_state: number`

---

## Accessors

### closing

```typescript
get closing(): boolean
```

Whether the Application is currently closing.  
_Returns:_ `boolean`

_Inherited from FormApplication.closing_

### document

```typescript
get document(): ClientDocument
```

A semantic convenience reference to the Document instance which is the target object for this form.  
_Returns:_ `ClientDocument`

### element

```typescript
get element(): jQuery
```

Return the active application element, if it currently exists in the DOM.  
_Returns:_ `jQuery`

_Inherited from FormApplication.element_

### id

```typescript
get id(): string
```

Return the CSS application ID which uniquely references this UI element.  
_Returns:_ `string`

_Overrides FormApplication.id_

### isEditable

```typescript
get isEditable(): any
```

Is the Form Application currently editable?  
_Returns:_ `any`

_Overrides FormApplication.isEditable_

### popOut

```typescript
get popOut(): boolean
```

Control the rendering style of the application. If popOut is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.  
_Returns:_ `boolean`

_Inherited from FormApplication.popOut_

### rendered

```typescript
get rendered(): boolean
```

Return a flag for whether the Application instance is currently rendered.  
_Returns:_ `boolean`

_Inherited from FormApplication.rendered_

### template

```typescript
get template(): string
```

The path to the HTML template file which should be used to render the inner content of the app.  
_Returns:_ `string`

_Inherited from FormApplication.template_

### title

```typescript
get title(): string
```

An Application window should define its own title definition logic which may be dynamic depending on its data.  
_Returns:_ `string`

_Overrides FormApplication.title_

### defaultOptions  (Static)

```typescript
get defaultOptions(): any
```

Overrides FormApplication.defaultOptions.  
_Returns:_ `any`

### _customElements  (Protected, Static)

```typescript
get _customElements(): string[]
```

An array of custom element tag names that should be listened to for changes.  
_Returns:_ `string[]`

_Inherited from FormApplication._customElements_

### RENDER_STATES  (Static)

```typescript
RENDER_STATES: Readonly<{
    CLOSED: -1;
    CLOSING: -2;
    ERROR: -3;
    NONE: 0;
    RENDERED: 2;
    RENDERING: 1;
},> = ...
```

The sequence of rendering states that track the Application life-cycle.  
_Inherited from [FormApplication.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#render_states)_

---

## Methods

### _activateCoreListeners

```typescript
_activateCoreListeners(html: any): void
```

Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters**

- **html**: `any`

_Returns:_ `void`

_Overrides [FormApplication._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_activatecorelisteners)_

---

### _getHeaderButtons

```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```

Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the `getApplicationV1HeaderButtons` hook.

_Returns:_ `ApplicationV1HeaderButton[]`

_Fires:_ `getApplicationHeaderButtons`

_Overrides [FormApplication._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_getheaderbuttons)_

---

### _render

```typescript
_render(force: any, options?: {}): Promise<void>
```

An asynchronous inner function which handles the rendering of the Application.

**Parameters**

- **force**: `any`  
  Render and display the application even if it is not currently displayed.

- **options**: `{}` = {}  
  Additional options which update the current values of the Application#options object.

_Returns:_ `Promise<void>`

_Fires:_ `renderApplication`

_Overrides [FormApplication._render](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_render)_

---

### _renderOuter

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.

_Returns:_ `Promise<jQuery>`

_Overrides [FormApplication._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_renderouter)_

---

### _updateObject

```typescript
_updateObject(_event: any, formData: any): Promise<any>
```

This method is called upon form submission after form data is validated.

**Parameters**

- **_event**: `any`  
  The initial triggering submission event.

- **formData**: `any`  
  The object of validated form data with which to update the object.

_Returns:_ `Promise<any>`

_Overrides [FormApplication._updateObject](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_updateobject)_

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

**Parameters**

- **name**: `any`  
  The named data field which the editor modifies.

- **options**: `{}` = {}  
  [Editor initialization options passed to foundry.applications.ux.TextEditor.create](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create).

- **initialContent**: `string` = ""  
  Initial text content for the editor area.

_Returns:_ `Promise<Editor | EditorView>`

_Overrides [FormApplication.activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#activateeditor)_

---

### activateListeners

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters**

- **html**: `any`

_Returns:_ `void`

_Inherited from [FormApplication.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#activatelisteners)_

---

### activateTab

```typescript
activateTab(
    tabName: string,
    options?: { group: string; triggerCallback: boolean },
): void
```

Change the currently active tab.

**Parameters**

- **tabName**: `string`  
  The target tab name to switch to.

- **options**: `{ group: string; triggerCallback: boolean }` = {}  
  Options which configure changing the tab.

  - **group**: `string`  
    A specific named tab group, useful if multiple sets of tabs are present.

  - **triggerCallback**: `boolean`  
    Whether to trigger tab-change callback functions.

_Returns:_ `void`

_Inherited from [FormApplication.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#activatetab)_

---

### bringToFront

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an Application or an ApplicationV2.

_Returns:_ `void`

_Inherited from [FormApplication.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#bringtofront)_

---

### bringToTop

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

_Returns:_ `void`

_Inherited from [FormApplication.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#bringtotop)_

---

### close

```typescript
close(options?: {}): Promise<void>
```

Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters**

- **options**: `{}` = {}  
  Options which affect how the Application is closed.

_Returns:_ `Promise<void>`

_Fires:_ `closeApplication`

_Overrides [FormApplication.close](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#close)_

---

### getData

```typescript
getData(
    _options: any,
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

An application should define the data object used to render its template. This function may either return an Object directly, or a Promise which resolves to an Object. If undefined, the default implementation will return an empty object allowing only for rendering of static HTML.

**Parameters**

- **_options**: `any`

_Returns:_ Object with the following properties:

- **cssClass**: `string`
- **data**: `any`
- **document**: `ClientDocument`
- **editable**: `any`
- **limited**: `any`
- **options**: `object`
- **owner**: `any`
- **title**: `string`

_Overrides [FormApplication.getData](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#getdata)_

---

### maximize

```typescript
maximize(): Promise<void>
```

Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

_Returns:_ `Promise<void>`

_Inherited from [FormApplication.maximize](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#maximize)_

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

_Returns:_ `Promise<void>`

_Inherited from [FormApplication.minimize](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#minimize)_

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

**Parameters**

- **force**: `boolean` = false  
  Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.

- **options**:

  - **focus?**: `boolean`  
    Apply focus to the application, maximizing it and bringing it to the top of the vertical stack.

  - **height?**: `number`  
    The rendered height.

  - **left?**: `number`  
    The left positioning attribute.

  - **renderContext?**: `string`  
    A context-providing string which suggests what event triggered the render.

  - **renderData?**: `object`  
    The data change which motivated the render request.

  - **scale?**: `number`  
    The rendered transformation scale.

  - **top?**: `number`  
    The top positioning attribute.

  - **width?**: `number`  
    The rendered width.

_Returns:_ `Application`

_Inherited from [FormApplication.render](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#render)_

---

### saveEditor

```typescript
saveEditor(
    name: string,
    options?: { preventRender?: boolean; remove?: boolean },
): Promise<void>
```

Handle saving the content of a specific editor by name.

**Parameters**

- **name**: `string`  
  The named editor to save.

- **options**: `{ preventRender?: boolean; remove?: boolean }` = {}  
  - **preventRender?**: `boolean`  
    Prevent normal re-rendering of the sheet after saving.

  - **remove?**: `boolean`  
    Remove the editor after saving its content.

_Returns:_ `Promise<void>`

_Inherited from [FormApplication.saveEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#saveeditor)_

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

**Parameters**

- **position**: Object containing positional data (optional).

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

_Returns:_ `void` or updated position object.

_Inherited from [FormApplication.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#setposition)_

---

### submit

```typescript
submit(options?: object): Promise<DocumentSheet>
```

Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters**

- **options**: `object` = {}  
  Options passed to the _onSubmit event handler.

_Returns:_ `Promise<DocumentSheet>`  
Return a self-reference for convenient method chaining.

_Inherited from [FormApplication.submit](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#submit)_

---

### _activateEditor  (Protected)

```typescript
_activateEditor(div: HTMLElement): void
```

Activate an editor instance present within the form.

**Parameters**

- **div**: `HTMLElement`  
  The element which contains the editor.

_Returns:_ `void`

_Inherited from [FormApplication._activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_activateeditor)_

---

### _callHooks  (Protected)

```typescript
_callHooks(
    hookName: string | ((className: string) => string),
    ...hookArgs: any[],
): void
```

Call all hooks for all applications in the inheritance chain.

**Parameters**

- **hookName**: `string` or `(className: string) => string`  
  The hook being triggered, which formatted with the Application class name.

- **...hookArgs**: `any[]`  
  The arguments passed to the hook calls.

_Returns:_ `void`

_Inherited from [FormApplication._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_callhooks)_

---

### _canDragDrop  (Protected)

```typescript
_canDragDrop(selector: string): boolean
```

Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for the drop target.

_Returns:_ `boolean`  
Can the current user drop on this selector?

_Inherited from [FormApplication._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_candragdrop)_

---

### _canDragStart  (Protected)

```typescript
_canDragStart(selector: string): boolean
```

Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for dragging.

_Returns:_ `boolean`  
Can the current user drag this selector?

_Inherited from [FormApplication._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_candragstart)_

---

### _canUserView  (Protected)

```typescript
_canUserView(user: User): boolean
```

Test whether a certain User has permission to view this Document Sheet.

**Parameters**

- **user**: `User`  
  The user requesting to render the sheet.

_Returns:_ `boolean`  
Does the User have permission to view this sheet?

---

### _configureProseMirrorPlugins  (Protected)

```typescript
_configureProseMirrorPlugins(
    name: string,
    options?: { remove?: boolean },
): object
```

Configure ProseMirror plugins for this sheet.

**Parameters**

- **name**: `string`  
  The name of the editor.

- **options**: `{ remove?: boolean }` = {}  
  Additional options to configure the plugins.

  - **remove?**: `boolean`  
    Whether the editor should destroy itself on save.

_Returns:_ `object`

_Inherited from [FormApplication._configureProseMirrorPlugins](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_configureprosemirrorplugins)_

---

### _createDocumentIdLink  (Protected)

```typescript
_createDocumentIdLink(html: jQuery): void
```

Create an ID link button in the document sheet header which displays the document ID and copies to clipboard.

**Parameters**

- **html**: `jQuery`

_Returns:_ `void`

---

### _createSecretHandlers  (Protected)

```typescript
_createSecretHandlers(): HTMLSecret[]
```

Create objects for managing the functionality of secret blocks within this Document's content.

_Returns:_ `HTMLSecret[]`

---

### _disableFields  (Protected)

```typescript
_disableFields(form: HTMLElement): void
```

If the form is not editable, disable its input fields.

**Parameters**

- **form**: `HTMLElement`  
  The form HTML.

_Returns:_ `void`

_Inherited from [FormApplication._disableFields](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_disablefields)_

---

### _getSecretContent  (Protected)

```typescript
_getSecretContent(secret: HTMLElement): string | void
```

Get the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: `HTMLElement`  
  The secret block.

_Returns:_ `string | void`

---

### _getSubmitData  (Protected)

```typescript
_getSubmitData(updateData?: object): object
```

Get an object of update data used to update the form's target object.

**Parameters**

- **updateData**: `object` = {}  
  Additional data that should be merged with the form data.

_Returns:_ `object`  
The prepared update data.

_Inherited from [FormApplication._getSubmitData](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_getsubmitdata)_

---

### _onChangeColorPicker  (Protected)

```typescript
_onChangeColorPicker(event: Event): void
```

Handle the change of a color picker input which enters its chosen value into a related input field.

**Parameters**

- **event**: `Event`  
  The color picker change event.

_Returns:_ `void`

_Inherited from [FormApplication._onChangeColorPicker](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_onchangecolorpicker)_

---

### _onChangeInput  (Protected)

```typescript
_onChangeInput(event: Event): Promise<any>
```

Handle changes to an input element, submitting the form if options.submitOnChange is true. Do not preventDefault in this handler as other interactions on the form may also be occurring.

**Parameters**

- **event**: `Event`  
  The initial change event.

_Returns:_ `Promise<any>`

_Inherited from [FormApplication._onChangeInput](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_onchangeinput)_

---

### _onChangeRange  (Protected)

```typescript
_onChangeRange(event: Event): void
```

Handle changes to a range type input by propagating those changes to the sibling range-value element.

**Parameters**

- **event**: `Event`  
  The initial change event.

_Returns:_ `void`

_Inherited from [FormApplication._onChangeRange](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_onchangerange)_

---

### _onChangeTab  (Protected)

```typescript
_onChangeTab(event: null | MouseEvent, tabs: Tabs, active: string): void
```

Handle changes to the active tab in a configured Tabs controller.

**Parameters**

- **event**: `null | MouseEvent`  
  A left click event.

- **tabs**: `Tabs`  
  The Tabs controller.

- **active**: `string`  
  The new active tab name.

_Returns:_ `void`

_Inherited from [FormApplication._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_onchangetab)_

---

### _onConfigureSheet  (Protected)

```typescript
_onConfigureSheet(event: ClickEvent): void
```

Handle requests to configure the default sheet used by this Document.

**Parameters**

- **event**: `ClickEvent`

_Returns:_ `void`

---

### _onDragOver  (Protected)

```typescript
_onDragOver(event: DragEvent): void
```

Callback actions which occur when a dragged element is over a drop target.

**Parameters**

- **event**: `DragEvent`

_Returns:_ `void`

_Inherited from [FormApplication._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_ondragover)_

---

### _onDragStart  (Protected)

```typescript
_onDragStart(event: DragEvent): void
```

Callback actions which occur at the beginning of a drag start workflow.

**Parameters**

- **event**: `DragEvent`

_Returns:_ `void`

_Inherited from [FormApplication._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_ondragstart)_

---

### _onDrop  (Protected)

```typescript
_onDrop(event: DragEvent): void
```

Callback actions which occur when a dragged element is dropped on a target.

**Parameters**

- **event**: `DragEvent`

_Returns:_ `void`

_Inherited from [FormApplication._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_ondrop)_

---

### _onEditImage  (Protected)

```typescript
_onEditImage(event: MouseEvent): Promise<FilePicker>
```

Handle changing a Document's image.

**Parameters**

- **event**: `MouseEvent`  
  The click event.

_Returns:_ `Promise<FilePicker>`

---

### _onSearchFilter  (Protected)

```typescript
_onSearchFilter(
    event: KeyboardEvent,
    query: string,
    rgx: RegExp,
    html: HTMLElement,
): void
```

Handle changes to search filtering controllers which are bound to the Application.

**Parameters**

- **event**: `KeyboardEvent`  
  The key-up event from keyboard input.

- **query**: `string`  
  The raw string input to the search field.

- **rgx**: `RegExp`  
  The regular expression to test against.

- **html**: `HTMLElement`  
  The HTML element which should be filtered.

_Returns:_ `void`

_Inherited from [FormApplication._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_onsearchfilter)_

---

### _onSubmit  (Protected)

```typescript
_onSubmit(
    event: Event,
    options?: { preventClose?: boolean; preventRender?: boolean; updateData?: null | object },
): Promise<any>
```

Handle standard form submission steps.

**Parameters**

- **event**: `Event`  
  The submit event which triggered this handler.

- **options**:
  - **preventClose?**: `boolean`  
    Override the standard behavior of whether to close the form on submit.

  - **preventRender?**: `boolean`  
    Prevent the application from re-rendering as a result of form submission.

  - **updateData?**: `null | object`  
    Additional specific data keys/values which override or extend the contents of the parsed form. This can be used to update other flags or data fields at the same time as processing a form submission to avoid multiple database operations.

_Returns:_ `Promise<any>`

_Inherited from [FormApplication._onSubmit](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_onsubmit)_

---

### _restoreScrollPositions  (Protected)

```typescript
_restoreScrollPositions(html: jQuery): void
```

Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters**

- **html**: `jQuery`  
  The HTML object being traversed.

_Returns:_ `void`

_Inherited from [FormApplication._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_restorescrollpositions)_

---

### _saveScrollPositions  (Protected)

```typescript
_saveScrollPositions(html: jQuery): void
```

Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters**

- **html**: `jQuery`  
  The HTML object being traversed.

_Returns:_ `void`

_Inherited from [FormApplication._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_savescrollpositions)_

---

### _updateSecret  (Protected)

```typescript
_updateSecret(secret: HTMLElement, content: string): void | Promise<any>
```

Update the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: `HTMLElement`  
  The secret block.

- **content**: `string`  
  The new content.

_Returns:_ `void | Promise<any>`  
The updated Document.

---

### _waitForImages  (Protected)

```typescript
_waitForImages(): Promise<void>
```

Wait for any images present in the Application to load.

_Returns:_ `Promise<void>`  
A Promise that resolves when all images have loaded.

_Inherited from [FormApplication._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.api.FormApplication.html#_waitforimages)_

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)