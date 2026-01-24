# JournalTextPageSheet | Foundry Virtual Tabletop - API Documentation - Version 13

The Application responsible for displaying and editing a single JournalEntryPage text document.

The class hierarchy is:

- _JournalPageSheet_  
- **JournalTextPageSheet**  
- _JournalTextTinyMCESheet_  

---

## Constructors

### constructor

```typescript
new JournalTextPageSheet(
    object: Document<object, DocumentConstructionContext>,
    options?: any,
): JournalTextPageSheet
```

**Parameters**

- **object**: `Document<object, DocumentConstructionContext>`  
  A Document instance which should be managed by this form.

- **options**: `any` = `{}`  
  Optional configuration parameters for how the form behaves.

---

## Properties

### appId

`appId: number`

The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.

*Inherited from [JournalPageSheet.appId](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#appid)*

---

### editors

`editors: Record<string, object>`

Keep track of any mce editors which may be active as part of this form. The values of this object are inner-objects with references to the MCE editor and other metadata.

*Inherited from [JournalPageSheet.editors](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#editors)*

---

### form

`form: HTMLElement`

A convenience reference to the form HTMLElement.

*Inherited from [JournalPageSheet.form](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#form)*

---

### isV2

`isV2: boolean = ...`

Indicates that the sheet renders with App V2 rather than V1.

*Inherited from [JournalPageSheet.isV2](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#isv2)*

---

### object

`object: any`

The object target which we are using this form to modify.

*Inherited from [JournalPageSheet.object](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#object)*

---

### options

`options: object`

The options provided to this application upon initialization.

*Inherited from [JournalPageSheet.options](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#options)*

---

### position

`position: object`

Track the current position and dimensions of the Application UI.

*Inherited from [JournalPageSheet.position](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#position)*

---

### toc

`toc: Record<string, JournalEntryPageHeading> = {}`

The table of contents for this JournalTextPageSheet.

*Inherited from [JournalPageSheet.toc](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#toc)*

---

### Protected: _priorState

`_priorState: number`

The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.

*Inherited from [JournalPageSheet._priorState](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_priorstate)*

---

### Protected: _secrets

`_secrets: HTMLSecret[]`

The list of handlers for secret block functionality.

*Inherited from [JournalPageSheet._secrets](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_secrets)*

---

### Protected: _state

`_state: number`

The current render state of the Application.

See [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states).

*Inherited from [JournalPageSheet._state](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_state)*

---

### Static: isV2

`static isV2: boolean = false`

Indicates that the sheet renders with App V2 rather than V1.

*Inherited from [JournalPageSheet.isV2](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#isv2-1)*

---

### Static: RENDER_STATES

```typescript
static RENDER_STATES: Readonly<{
    CLOSED: -1;
    CLOSING: -2;
    ERROR: -3;
    NONE: 0;
    RENDERED: 2;
    RENDERING: 1;
}> = ...
```

The sequence of rendering states that track the Application life-cycle.

*Inherited from [JournalPageSheet.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#render_states)*

---

## Accessors

### Protected Static: _converter

`static _converter: Converter = ...`

Bi-directional HTML <-> Markdown converter.

---

### closing

```typescript
get closing(): boolean
```

Whether the Application is currently closing.

_Returns_: `boolean`

*Inherited from JournalPageSheet.closing*

---

### document

```typescript
get document(): ClientDocument
```

A semantic convenience reference to the Document instance which is the target object for this form.

_Returns_: `ClientDocument`

*Inherited from JournalPageSheet.document*

---

### element

```typescript
get element(): jQuery
```

Return the active application element, if it currently exists in the DOM.

_Returns_: `jQuery`

*Inherited from JournalPageSheet.element*

---

### id

```typescript
get id(): string
```

Return the CSS application ID which uniquely references this UI element.

_Returns_: `string`

*Inherited from JournalPageSheet.id*

---

### isEditable

```typescript
get isEditable(): any
```

Is the Form Application currently editable?

_Returns_: `any`

*Inherited from JournalPageSheet.isEditable*

---

### popOut

```typescript
get popOut(): boolean
```

Control the rendering style of the application. If **popOut** is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.

_Returns_: `boolean`

*Inherited from JournalPageSheet.popOut*

---

### rendered

```typescript
get rendered(): boolean
```

Return a flag for whether the Application instance is currently rendered.

_Returns_: `boolean`

*Inherited from JournalPageSheet.rendered*

---

### template

```typescript
get template(): string
```

The path to the HTML template file which should be used to render the inner content of the app.

_Returns_: `string`

*Inherited from JournalPageSheet.template*

---

### title

```typescript
get title(): any
```

An Application window should define its own title definition logic which may be dynamic depending on its data.

_Returns_: `any`

*Inherited from JournalPageSheet.title*

---

### Static: defaultOptions

```typescript
static get defaultOptions(): object
```

Overrides JournalPageSheet.defaultOptions

_Returns_: `object`

---

### Static: format

```typescript
static get format(): number
```

Declare the format that we edit text content in for this sheet so we can perform conversions as necessary.

_Returns_: `number`

---

### Protected Static: _customElements

```typescript
static get _customElements(): string[]
```

An array of custom element tag names that should be listened to for changes.

_Returns_: `string[]`

*Inherited from JournalPageSheet._customElements*

---

## Methods

### Protected: _activateCoreListeners

```typescript
_activateCoreListeners(html: any): void
```

Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters**

- **html**: `any`

_Returns_: `void`

*Inherited from [JournalPageSheet._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_activatecorelisteners)*

---

### Protected: _getHeaderButtons

```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```

Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the `getApplicationV1HeaderButtons` hook.

_Returns_: `ApplicationV1HeaderButton[]`

**Fires:** `getApplicationHeaderButtons`

*Inherited from [JournalPageSheet._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_getheaderbuttons)*

---

### Protected: _getSecretContent

```typescript
_getSecretContent(secret: any): any
```

Get the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: `any`  
  The secret block.

_Returns_: `any`

*Inherited from [JournalPageSheet._getSecretContent](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_getsecretcontent)*

---

### Protected: _render

```typescript
_render(force: any, options: any): Promise<void>
```

An asynchronous inner function which handles the rendering of the Application.

**Parameters**

- **force**: `any`  
  Render and display the application even if it is not currently displayed.

- **options**: `any`  
  Additional options which update the current values of the Application#options object.

_Returns_: `Promise<void>`

**Fires:** `renderApplication`

Overrides [JournalPageSheet._render](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_render)

---

### Protected: _renderOuter

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.

_Returns_: `Promise<jQuery>`

A promise resolving to the constructed jQuery object.

*Inherited from [JournalPageSheet._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_renderouter)*

---

### Protected: _updateObject

```typescript
_updateObject(event: any, formData: any): Promise<any>
```

This method is called upon form submission after form data is validated.

**Parameters**

- **event**: `any`  
  The initial triggering submission event.

- **formData**: `any`  
  The object of validated form data with which to update the object.

_Returns_: `Promise<any>`

Overrides [JournalPageSheet._updateObject](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_updateobject)

---

### Protected: _updateSecret

```typescript
_updateSecret(secret: any, content: any): any
```

Update the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: `any`  
  The secret block.

- **content**: `any`  
  The new content.

_Returns_: `any`  
The updated Document.

*Inherited from [JournalPageSheet._updateSecret](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_updatesecret)*

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

- **options**: `{}` = `{}`  
  [Editor initialization options passed to `foundry.applications.ux.TextEditor.create`.](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create)

- **initialContent**: `string` = `""`  
  Initial text content for the editor area.

_Returns_: `Promise<Editor | EditorView>`

*Inherited from [JournalPageSheet.activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#activateeditor)*

---

### activateListeners

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters**

- **html**: `any`

_Returns_: `void`

*Inherited from [JournalPageSheet.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#activatelisteners)*

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

- **options**: `{ group: string; triggerCallback: boolean }` = `{}`  
  Options which configure changing the tab.

  - **group**: `string`  
    A specific named tab group, useful if multiple sets of tabs are present.

  - **triggerCallback**: `boolean`  
    Whether to trigger tab-change callback functions.

_Returns_: `void`

*Inherited from [JournalPageSheet.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#activatetab)*

---

### bringToFront

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an Application or an ApplicationV2.

_Returns_: `void`

*Inherited from [JournalPageSheet.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#bringtofront)*

---

### bringToTop

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

_Returns_: `void`

*Inherited from [JournalPageSheet.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#bringtotop)*

---

### close

```typescript
close(options?: {}): Promise<void>
```

Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters**

- **options**: `{}` = `{}`  
  Options which affect how the Application is closed.

_Returns_: `Promise<void>`

**Fires:** `closeApplication`

Overrides [JournalPageSheet.close](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#close)

---

### getData

```typescript
getData(options?: {}): Promise<object>
```

An application should define the data object used to render its template. This function may either return an Object directly, or a Promise which resolves to an Object. If undefined, the default implementation will return an empty object allowing only for rendering of static HTML.

**Parameters**

- **options**: `{}` = `{}`

_Returns_: `Promise<object>`

Overrides [JournalPageSheet.getData](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#getdata)

---

### isEditorDirty

```typescript
isEditorDirty(): boolean
```

Determine if any editors are dirty.

_Returns_: `boolean`

---

### maximize

```typescript
maximize(): Promise<void>
```

Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

_Returns_: `Promise<void>`

*Inherited from [JournalPageSheet.maximize](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#maximize)*

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

_Returns_: `Promise<void>`

*Inherited from [JournalPageSheet.minimize](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#minimize)*

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

Render the Application by evaluating its HTML template against the object of data provided by the `getData` method. If the Application is rendered as a pop-out window, wrap the contained HTML in an outer frame with window controls.

**Parameters**

- **force**: `boolean` = `false`  
  Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.

- **options**: optional  
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

_Returns_: `Application`

*Inherited from [JournalPageSheet.render](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#render)*

---

### saveEditor

```typescript
saveEditor(
    name: any,
    __namedParameters?: { preventRender?: boolean },
): Promise<void>
```

Handle saving the content of a specific editor by name.

**Parameters**

- **name**: `any`  
  The named editor to save.

- **__namedParameters**: `{ preventRender?: boolean }` = `{}`

_Returns_: `Promise<void>`

Overrides [JournalPageSheet.saveEditor](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#saveeditor)

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

- **position**: optional  
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

_Returns_: `void` or updated position object.

*Inherited from [JournalPageSheet.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#setposition)*

---

### submit

```typescript
submit(options?: object): Promise<JournalTextPageSheet>
```

Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters**

- **options**: `object` = `{}`  
  Options passed to the `_onSubmit` event handler.

_Returns_: `Promise<JournalTextPageSheet>`  
Return a self-reference for convenient method chaining.

*Inherited from [JournalPageSheet.submit](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#submit)*

---

### Protected: _activateEditor

```typescript
_activateEditor(div: HTMLElement): void
```

Activate an editor instance present within the form.

**Parameters**

- **div**: `HTMLElement`  
  The element which contains the editor.

_Returns_: `void`

*Inherited from [JournalPageSheet._activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_activateeditor)*

---

### Protected: _callHooks

```typescript
_callHooks(
    hookName: string | ((className: string) => string),
    ...hookArgs: any[],
): void
```

Call all hooks for all applications in the inheritance chain.

**Parameters**

- **hookName**: `string` | `(className: string) => string`  
  The hook being triggered, which formatted with the Application class name.

- **...hookArgs**: `any[]`  
  The arguments passed to the hook calls.

_Returns_: `void`

*Inherited from [JournalPageSheet._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_callhooks)*

---

### Protected: _canDragDrop

```typescript
_canDragDrop(selector: string): boolean
```

Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for the drop target.

_Returns_: `boolean`  
Can the current user drop on this selector?

*Inherited from [JournalPageSheet._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_candragdrop)*

---

### Protected: _canDragStart

```typescript
_canDragStart(selector: string): boolean
```

Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for dragging.

_Returns_: `boolean`  
Can the current user drag this selector?

*Inherited from [JournalPageSheet._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_candragstart)*

---

### Protected: _canUserView

```typescript
_canUserView(user: User): boolean
```

Test whether a certain User has permission to view this Document Sheet.

**Parameters**

- **user**: `User`  
  The user requesting to render the sheet.

_Returns_: `boolean`  
Does the User have permission to view this sheet?

*Inherited from [JournalPageSheet._canUserView](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_canuserview)*

---

### Protected: _configureProseMirrorPlugins

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

- **options**: `{ remove?: boolean }` = `{}`  
  Additional options to configure the plugins.

  - **remove?**: `boolean`  
    Whether the editor should destroy itself on save.

_Returns_: `object`

*Inherited from [JournalPageSheet._configureProseMirrorPlugins](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_configureprosemirrorplugins)*

---

### Protected: _convertFormats

```typescript
_convertFormats(renderData: object): void
```

Lazily convert text formats if we detect the document being saved in a different format.

**Parameters**

- **renderData**: `object`  
  Render data.

_Returns_: `void`

---

### Protected: _createDocumentIdLink

```typescript
_createDocumentIdLink(html: jQuery): void
```

Create an ID link button in the document sheet header which displays the document ID and copies to clipboard.

**Parameters**

- **html**: `jQuery`

_Returns_: `void`

*Inherited from [JournalPageSheet._createDocumentIdLink](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_createdocumentidlink)*

---

### Protected: _createSecretHandlers

```typescript
_createSecretHandlers(): HTMLSecret[]
```

Create objects for managing the functionality of secret blocks within this Document's content.

_Returns_: `HTMLSecret[]`

*Inherited from [JournalPageSheet._createSecretHandlers](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_createsecrethandlers)*

---

### Protected: _disableFields

```typescript
_disableFields(form: HTMLElement): void
```

If the form is not editable, disable its input fields.

**Parameters**

- **form**: `HTMLElement`  
  The form HTML.

_Returns_: `void`

*Inherited from [JournalPageSheet._disableFields](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_disablefields)*

---

### Protected: _getSubmitData

```typescript
_getSubmitData(updateData?: object): object
```

Get an object of update data used to update the form's target object.

**Parameters**

- **updateData**: `object` = `{}`  
  Additional data that should be merged with the form data.

_Returns_: `object`  
The prepared update data.

*Inherited from [JournalPageSheet._getSubmitData](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_getsubmitdata)*

---

### Protected: _onChangeColorPicker

```typescript
_onChangeColorPicker(event: Event): void
```

Handle the change of a color picker input which enters its chosen value into a related input field.

**Parameters**

- **event**: `Event`  
  The color picker change event.

_Returns_: `void`

*Inherited from [JournalPageSheet._onChangeColorPicker](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_onchangecolorpicker)*

---

### Protected: _onChangeInput

```typescript
_onChangeInput(event: Event): Promise<any>
```

Handle changes to an input element, submitting the form if options.submitOnChange is true. Do not preventDefault in this handler as other interactions on the form may also be occurring.

**Parameters**

- **event**: `Event`  
  The initial change event.

_Returns_: `Promise<any>`

*Inherited from [JournalPageSheet._onChangeInput](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_onchangeinput)*

---

### Protected: _onChangeRange

```typescript
_onChangeRange(event: Event): void
```

Handle changes to a range type input by propagating those changes to the sibling range-value element.

**Parameters**

- **event**: `Event`  
  The initial change event.

_Returns_: `void`

*Inherited from [JournalPageSheet._onChangeRange](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_onchangerange)*

---

### Protected: _onChangeTab

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

_Returns_: `void`

*Inherited from [JournalPageSheet._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_onchangetab)*

---

### Protected: _onConfigureSheet

```typescript
_onConfigureSheet(event: ClickEvent): void
```

Handle requests to configure the default sheet used by this Document.

**Parameters**

- **event**: `ClickEvent`

_Returns_: `void`

*Inherited from [JournalPageSheet._onConfigureSheet](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_onconfiguresheet)*

---

### Protected: _onDragOver

```typescript
_onDragOver(event: DragEvent): void
```

Callback actions which occur when a dragged element is over a drop target.

**Parameters**

- **event**: `DragEvent`  
  The originating DragEvent.

_Returns_: `void`

*Inherited from [JournalPageSheet._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_ondragover)*

---

### Protected: _onDragStart

```typescript
_onDragStart(event: DragEvent): void
```

Callback actions which occur at the beginning of a drag start workflow.

**Parameters**

- **event**: `DragEvent`  
  The originating DragEvent.

_Returns_: `void`

*Inherited from [JournalPageSheet._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_ondragstart)*

---

### Protected: _onDrop

```typescript
_onDrop(event: DragEvent): void
```

Callback actions which occur when a dragged element is dropped on a target.

**Parameters**

- **event**: `DragEvent`  
  The originating DragEvent.

_Returns_: `void`

*Inherited from [JournalPageSheet._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_ondrop)*

---

### Protected: _onEditImage

```typescript
_onEditImage(event: MouseEvent): Promise<FilePicker>
```

Handle changing a Document's image.

**Parameters**

- **event**: `MouseEvent`  
  The click event.

_Returns_: `Promise<FilePicker>`

*Inherited from [JournalPageSheet._onEditImage](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_oneditimage)*

---

### Protected: _onSearchFilter

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

_Returns_: `void`

*Inherited from [JournalPageSheet._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_onsearchfilter)*

---

### Protected: _onSubmit

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

Handle standard form submission steps.

**Parameters**

- **event**: `Event`  
  The submit event which triggered this handler.

- **options**: optional  
  - **preventClose?**: `boolean`  
    Override the standard behavior of whether to close the form on submit.
  - **preventRender?**: `boolean`  
    Prevent the application from re-rendering as a result of form submission.
  - **updateData?**: `null | object`  
    Additional specific data keys/values which override or extend the contents of the parsed form. This can be used to update other flags or data fields at the same time as processing a form submission to avoid multiple database operations.

_Returns_: `Promise<any>`

*Inherited from [JournalPageSheet._onSubmit](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_onsubmit)*

---

### Protected: _restoreScrollPositions

```typescript
_restoreScrollPositions(html: jQuery): void
```

Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters**

- **html**: `jQuery`  
  The HTML object being traversed.

_Returns_: `void`

*Inherited from [JournalPageSheet._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_restorescrollpositions)*

---

### Protected: _saveScrollPositions

```typescript
_saveScrollPositions(html: jQuery): void
```

Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters**

- **html**: `jQuery`  
  The HTML object being traversed.

_Returns_: `void`

*Inherited from [JournalPageSheet._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_savescrollpositions)*

---

### Protected: _waitForImages

```typescript
_waitForImages(): Promise<void>
```

Wait for any images present in the Application to load.

_Returns_: `Promise<void>`

*Inherited from [JournalPageSheet._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalPageSheet.html#_waitforimages)*