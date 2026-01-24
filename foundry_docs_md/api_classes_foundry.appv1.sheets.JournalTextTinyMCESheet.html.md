# JournalTextTinyMCESheet

A subclass of [foundry.appv1.sheets.JournalTextPageSheet that implements a TinyMCE editor.](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html)

**Deprecated** since v13 until v14

### Hierarchy

- [JournalTextPageSheet](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html)
- **JournalTextTinyMCESheet**

---

## Constructors

### constructor

```typescript
new JournalTextTinyMCESheet(
    object: Document<object, DocumentConstructionContext>,
    options?: any,
): JournalTextTinyMCESheet
```

**Parameters:**

- **object**: `Document<object, DocumentConstructionContext>`  
  A Document instance which should be managed by this form.
- **options**: `any = {}` *(Optional)*  
  Optional configuration parameters for how the form behaves.

**Returns:**  
`JournalTextTinyMCESheet`  

*Inherited from [JournalTextPageSheet.constructor](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#constructor)*

---

## Properties

### appId

Type: `number`  
The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.

*Inherited from [JournalTextPageSheet.appId](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#appid)*

### editors

Type: `Record<string, object>`  
Keep track of any mce editors which may be active as part of this form. The values of this object are inner-objects with references to the MCE editor and other metadata.

*Inherited from [JournalTextPageSheet.editors](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#editors)*

### form

Type: `HTMLElement`  
A convenience reference to the form HTMLElement.

*Inherited from [JournalTextPageSheet.form](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#form)*

### isV2

Type: `boolean = ...`  
Indicates that the sheet renders with App V2 rather than V1.

*Inherited from [JournalTextPageSheet.isV2](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#isv2)*

### object

Type: `any`  
The object target which we are using this form to modify.

*Inherited from [JournalTextPageSheet.object](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#object)*

### options

Type: `object`  
The options provided to this application upon initialization.

*Inherited from [JournalTextPageSheet.options](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#options)*

### position

Type: `object`  
Track the current position and dimensions of the Application UI.

*Inherited from [JournalTextPageSheet.position](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#position)*

### toc

Type: `Record<string, JournalEntryPageHeading> = {}`  
The table of contents for this JournalTextPageSheet.

*Inherited from [JournalTextPageSheet.toc](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#toc)*

#### Protected Properties

- **_priorState**: `number`  
  The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.  
  *Inherited from [JournalTextPageSheet._priorState](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_priorstate)*

- **_secrets**: `HTMLSecret[]`  
  The list of handlers for secret block functionality.  
  *Inherited from [JournalTextPageSheet._secrets](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_secrets)*

- **_state**: `number`  
  The current render state of the Application.  
  See: [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)  
  *Inherited from [JournalTextPageSheet._state](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_state)*

#### Static Properties

- **isV2**: `boolean = false`  
  Indicates that the sheet renders with App V2 rather than V1.  
  *Inherited from [JournalTextPageSheet.isV2](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#isv2-1)*

---

## Accessors

#### Static Accessors

- **RENDER_STATES**: `Readonly<{ CLOSED: -1; CLOSING: -2; ERROR: -3; NONE: 0; RENDERED: 2; RENDERING: 1; }, >`  
  The sequence of rendering states that track the Application life-cycle.  
  *Inherited from [JournalTextPageSheet.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#render_states)*

#### Protected Static Accessors

- **_converter**: `Converter`  
  Bi-directional HTML <-> Markdown converter.  
  *Inherited from [JournalTextPageSheet._converter](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_converter)*

#### Instance Accessors

- **closing**: `boolean`  
  Whether the Application is currently closing.  
  *Inherited from JournalTextPageSheet.closing*

- **document**: `ClientDocument`  
  A semantic convenience reference to the Document instance which is the target object for this form.  
  *Inherited from JournalTextPageSheet.document*

- **element**: `jQuery`  
  Return the active application element, if it currently exists in the DOM.  
  *Inherited from JournalTextPageSheet.element*

- **id**: `string`  
  Return the CSS application ID which uniquely references this UI element.  
  *Inherited from JournalTextPageSheet.id*

- **isEditable**: `any`  
  Is the Form Application currently editable?  
  *Inherited from JournalTextPageSheet.isEditable*

- **popOut**: `boolean`  
  Control the rendering style of the application. If popOut is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.  
  *Inherited from JournalTextPageSheet.popOut*

- **rendered**: `boolean`  
  Return a flag for whether the Application instance is currently rendered.  
  *Inherited from JournalTextPageSheet.rendered*

- **template**: `string`  
  The path to the HTML template file which should be used to render the inner content of the app.  
  *Inherited from JournalTextPageSheet.template*

- **title**: `any`  
  An Application window should define its own title definition logic which may be dynamic depending on its data.  
  *Inherited from JournalTextPageSheet.title*

---

## Methods

### Static Methods

- **defaultOptions**

```typescript
get defaultOptions(): object
```

Returns default options for the Application.  
*Inherited from JournalTextPageSheet.defaultOptions*

- **format**

```typescript
get format(): number
```

Declare the format that we edit text content in for this sheet so we can perform conversions as necessary.  
*Inherited from JournalTextPageSheet.format*

- **_customElements**

```typescript
get _customElements(): string[]
```

An array of custom element tag names that should be listened to for changes.  
*Inherited from JournalTextPageSheet._customElements*

---

### Instance Methods

- **_activateCoreListeners**

```typescript
_activateCoreListeners(html: any): void
```

Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters:**

- **html**: `any`  
  The HTML object to which listeners are attached.

*Inherited from [JournalTextPageSheet._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_activatecorelisteners)*

- **_getHeaderButtons**

```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```

Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the `getApplicationV1HeaderButtons` hook.

**Returns:**  
`ApplicationV1HeaderButton[]`

**Fires:**  
`getApplicationHeaderButtons`

*Inherited from [JournalTextPageSheet._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_getheaderbuttons)*

- **_getSecretContent**

```typescript
_getSecretContent(secret: any): any
```

Get the HTML content that a given secret block is embedded in.

**Parameters:**

- **secret**: `any`  
  The secret block.

**Returns:**  
`any`

*Inherited from [JournalTextPageSheet._getSecretContent](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_getsecretcontent)*

- **_render**

```typescript
_render(force: any, options: any): Promise<void>
```

An asynchronous inner function which handles the rendering of the Application.

**Parameters:**

- **force**: `any`  
  Render and display the application even if it is not currently displayed.
- **options**: `any`  
  Additional options which update the current values of the Application#options object.

**Returns:**  
`Promise<void>`  
A Promise that resolves to the Application once rendering is complete.

**Fires:**  
`renderApplication`

Overrides [JournalTextPageSheet._render](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_render)

- **_renderOuter**

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.

**Returns:**  
`Promise<jQuery>`  
A promise resolving to the constructed jQuery object.

*Inherited from [JournalTextPageSheet._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_renderouter)*

- **_updateObject**

```typescript
_updateObject(event: any, formData: any): Promise<any>
```

This method is called upon form submission after form data is validated.

**Parameters:**

- **event**: `any`  
  The initial triggering submission event.
- **formData**: `any`  
  The object of validated form data with which to update the object.

**Returns:**  
`Promise<any>`  
A Promise which resolves once the update operation has completed.

*Inherited from [JournalTextPageSheet._updateObject](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_updateobject)*

- **_updateSecret**

```typescript
_updateSecret(secret: any, content: any): any
```

Update the HTML content that a given secret block is embedded in.

**Parameters:**

- **secret**: `any`  
  The secret block.
- **content**: `any`  
  The new content.

**Returns:**  
`any`  
The updated Document.

*Inherited from [JournalTextPageSheet._updateSecret](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_updatesecret)*

- **activateEditor**

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
- **options**: `{}` = {} *(Optional)*  
  [Editor initialization options passed to foundry.applications.ux.TextEditor.create.](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create)
- **initialContent**: `string` = "" *(Optional)*  
  Initial text content for the editor area.

**Returns:**  
`Promise<Editor | EditorView>`

*Inherited from [JournalTextPageSheet.activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#activateeditor)*

- **activateListeners**

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters:**

- **html**: `any`  
  The HTML object to attach listeners to.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#activatelisteners)*

- **activateTab**

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
- **options**: `{ group: string; triggerCallback: boolean } = {}` *(Optional)*  
  Options which configure changing the tab:
  - **group**: `string`  
    A specific named tab group, useful if multiple sets of tabs are present.
  - **triggerCallback**: `boolean`  
    Whether to trigger tab-change callback functions.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#activatetab)*

- **bringToFront**

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an Application or an ApplicationV2.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#bringtofront)*

- **bringToTop**

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#bringtotop)*

- **close**

```typescript
close(options?: {}): Promise<void>
```

Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters:**

- **options**: `{}` = {} *(Optional)*  
  Options which affect how the Application is closed.

**Returns:**  
`Promise<void>`

**Fires:**  
`closeApplication`

Overrides [JournalTextPageSheet.close](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#close)

- **getData**

```typescript
getData(options?: {}): Promise<object>
```

An application should define the data object used to render its template. This function may either return an Object directly, or a Promise which resolves to an Object. If undefined, the default implementation will return an empty object allowing only for rendering of static HTML.

**Parameters:**

- **options**: `{}` = {} *(Optional)*

**Returns:**  
`Promise<object>`

Overrides [JournalTextPageSheet.getData](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#getdata)

- **isEditorDirty**

```typescript
isEditorDirty(): boolean
```

Determine if any editors are dirty.

**Returns:**  
`boolean`

*Inherited from [JournalTextPageSheet.isEditorDirty](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#iseditordirty)*

- **maximize**

```typescript
maximize(): Promise<void>
```

Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

**Returns:**  
`Promise<void>`

*Inherited from [JournalTextPageSheet.maximize](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#maximize)*

- **minimize**

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

**Returns:**  
`Promise<void>`

*Inherited from [JournalTextPageSheet.minimize](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#minimize)*

- **render**

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

- **force**: `boolean = false` *(Optional)*  
  Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.
- **options**: *(Optional)*  
  Additional rendering options which are applied to customize the way that the Application is rendered in the DOM:
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

**Returns:**  
`Application`  
The rendered Application instance.

*Inherited from [JournalTextPageSheet.render](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#render)*

- **saveEditor**

```typescript
saveEditor(
    name: any,
    __namedParameters?: { preventRender?: boolean },
): Promise<void>
```

Handle saving the content of a specific editor by name.

**Parameters:**

- **name**: `any`  
  The named editor to save.
- **__namedParameters**: `{ preventRender?: boolean } = {}` *(Optional)*  
  Controls whether to prevent rendering after saving.

**Returns:**  
`Promise<void>`

*Inherited from [JournalTextPageSheet.saveEditor](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#saveeditor)*

- **setPosition**

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

- **position**: *(Optional)*  
  Positional data:
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
`void` or the updated position object.

*Inherited from [JournalTextPageSheet.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#setposition)*

- **submit**

```typescript
submit(options?: object): Promise<JournalTextTinyMCESheet>
```

Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters:**

- **options**: `object = {}` *(Optional)*  
  Options passed to the _onSubmit event handler.

**Returns:**  
`Promise<JournalTextTinyMCESheet>`  
Returns a self-reference for convenient method chaining.

*Inherited from [JournalTextPageSheet.submit](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#submit)*

---

### Protected Methods

- **_activateEditor**

```typescript
_activateEditor(div: HTMLElement): void
```

Activate an editor instance present within the form.

**Parameters:**

- **div**: `HTMLElement`  
  The element which contains the editor.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_activateeditor)*

- **_callHooks**

```typescript
_callHooks(
    hookName: string | ((className: string) => string),
    ...hookArgs: any[]
): void
```

Call all hooks for all applications in the inheritance chain.

**Parameters:**

- **hookName**: `string | (className: string) => string`  
  The hook being triggered, which is formatted with the Application class name.
- **...hookArgs**: `any[]`  
  The arguments passed to the hook calls.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_callhooks)*

- **_canDragDrop**

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

*Inherited from [JournalTextPageSheet._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_candragdrop)*

- **_canDragStart**

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

*Inherited from [JournalTextPageSheet._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_candragstart)*

- **_canUserView**

```typescript
_canUserView(user: User): boolean
```

Test whether a certain User has permission to view this Document Sheet.

**Parameters:**

- **user**: `User`  
  The user requesting to render the sheet.

**Returns:**  
`boolean`  
Does the User have permission to view this sheet?

*Inherited from [JournalTextPageSheet._canUserView](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_canuserview)*

- **_configureProseMirrorPlugins**

```typescript
_configureProseMirrorPlugins(
    name: string,
    options?: { remove?: boolean },
): object
```

Configure ProseMirror plugins for this sheet.

**Parameters:**

- **name**: `string`  
  The name of the editor.
- **options**: `{ remove?: boolean } = {}` *(Optional)*  
  Additional options to configure the plugins.
  - **remove?**: `boolean`  
    Whether the editor should destroy itself on save.

**Returns:**  
`object`

*Inherited from [JournalTextPageSheet._configureProseMirrorPlugins](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_configureprosemirrorplugins)*

- **_convertFormats**

```typescript
_convertFormats(renderData: object): void
```

Lazily convert text formats if we detect the document being saved in a different format.

**Parameters:**

- **renderData**: `object`  
  Render data.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._convertFormats](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_convertformats)*

- **_createDocumentIdLink**

```typescript
_createDocumentIdLink(html: jQuery): void
```

Create an ID link button in the document sheet header which displays the document ID and copies to clipboard.

**Parameters:**

- **html**: `jQuery`  
  The HTML element.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._createDocumentIdLink](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_createdocumentidlink)*

- **_createSecretHandlers**

```typescript
_createSecretHandlers(): HTMLSecret[]
```

Create objects for managing the functionality of secret blocks within this Document's content.

**Returns:**  
`HTMLSecret[]`

*Inherited from [JournalTextPageSheet._createSecretHandlers](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_createsecrethandlers)*

- **_disableFields**

```typescript
_disableFields(form: HTMLElement): void
```

If the form is not editable, disable its input fields.

**Parameters:**

- **form**: `HTMLElement`  
  The form HTML.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._disableFields](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_disablefields)*

- **_getSubmitData**

```typescript
_getSubmitData(updateData?: object): object
```

Get an object of update data used to update the form's target object.

**Parameters:**

- **updateData**: `object = {}` *(Optional)*  
  Additional data that should be merged with the form data.

**Returns:**  
`object`  
The prepared update data.

*Inherited from [JournalTextPageSheet._getSubmitData](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_getsubmitdata)*

- **_onChangeColorPicker**

```typescript
_onChangeColorPicker(event: Event): void
```

Handle the change of a color picker input which enters its chosen value into a related input field.

**Parameters:**

- **event**: `Event`  
  The color picker change event.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._onChangeColorPicker](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_onchangecolorpicker)*

- **_onChangeInput**

```typescript
_onChangeInput(event: Event): Promise<any>
```

Handle changes to an input element, submitting the form if options.submitOnChange is true. Do not preventDefault in this handler as other interactions on the form may also be occurring.

**Parameters:**

- **event**: `Event`  
  The initial change event.

**Returns:**  
`Promise<any>`

*Inherited from [JournalTextPageSheet._onChangeInput](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_onchangeinput)*

- **_onChangeRange**

```typescript
_onChangeRange(event: Event): void
```

Handle changes to a range type input by propagating those changes to the sibling range-value element.

**Parameters:**

- **event**: `Event`  
  The initial change event.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._onChangeRange](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_onchangerange)*

- **_onChangeTab**

```typescript
_onChangeTab(event: null | MouseEvent, tabs: Tabs, active: string): void
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

*Inherited from [JournalTextPageSheet._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_onchangetab)*

- **_onConfigureSheet**

```typescript
_onConfigureSheet(event: ClickEvent): void
```

Handle requests to configure the default sheet used by this Document.

**Parameters:**

- **event**: `ClickEvent`  
  The click event.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._onConfigureSheet](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_onconfiguresheet)*

- **_onDragOver**

```typescript
_onDragOver(event: DragEvent): void
```

Callback actions which occur when a dragged element is over a drop target.

**Parameters:**

- **event**: `DragEvent`  
  The originating DragEvent.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_ondragover)*

- **_onDragStart**

```typescript
_onDragStart(event: DragEvent): void
```

Callback actions which occur at the beginning of a drag start workflow.

**Parameters:**

- **event**: `DragEvent`  
  The originating DragEvent.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_ondragstart)*

- **_onDrop**

```typescript
_onDrop(event: DragEvent): void
```

Callback actions which occur when a dragged element is dropped on a target.

**Parameters:**

- **event**: `DragEvent`  
  The originating DragEvent.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_ondrop)*

- **_onEditImage**

```typescript
_onEditImage(event: MouseEvent): Promise<FilePicker>
```

Handle changing a Document's image.

**Parameters:**

- **event**: `MouseEvent`  
  The click event.

**Returns:**  
`Promise<FilePicker>`

*Inherited from [JournalTextPageSheet._onEditImage](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_oneditimage)*

- **_onSearchFilter**

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
  The key-up event from keyboard input.
- **query**: `string`  
  The raw string input to the search field.
- **rgx**: `RegExp`  
  The regular expression to test against.
- **html**: `HTMLElement`  
  The HTML element which should be filtered.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_onsearchfilter)*

- **_onSubmit**

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

**Parameters:**

- **event**: `Event`  
  The submit event which triggered this handler.
- **options**: *(Optional)*  
  - **preventClose?**: `boolean`  
    Override the standard behavior of whether to close the form on submit.
  - **preventRender?**: `boolean`  
    Prevent the application from re-rendering as a result of form submission.
  - **updateData?**: `null | object`  
    Additional specific data keys/values which override or extend the contents of the parsed form. This can be used to update other flags or data fields at the same time as processing a form submission to avoid multiple database operations.

**Returns:**  
`Promise<any>`  
A promise which resolves to the validated update data.

*Inherited from [JournalTextPageSheet._onSubmit](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_onsubmit)*

- **_restoreScrollPositions**

```typescript
_restoreScrollPositions(html: jQuery): void
```

Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters:**

- **html**: `jQuery`  
  The HTML object being traversed.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_restorescrollpositions)*

- **_saveScrollPositions**

```typescript
_saveScrollPositions(html: jQuery): void
```

Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters:**

- **html**: `jQuery`  
  The HTML object being traversed.

**Returns:**  
`void`

*Inherited from [JournalTextPageSheet._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_savescrollpositions)*

- **_waitForImages**

```typescript
_waitForImages(): Promise<void>
```

Wait for any images present in the Application to load.

**Returns:**  
`Promise<void>`  
A Promise that resolves when all images have loaded.

*Inherited from [JournalTextPageSheet._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalTextPageSheet.html#_waitforimages)*