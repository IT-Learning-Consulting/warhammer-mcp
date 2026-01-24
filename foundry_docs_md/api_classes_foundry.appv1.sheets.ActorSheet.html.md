# ActorSheet | Foundry Virtual Tabletop - API Documentation - Version 13

**Class ActorSheet**  
The Application responsible for displaying and editing a single Actor document. This Application is responsible for rendering an actor's attributes and allowing the actor to be edited.

**Deprecated:** since v13

**Parameters:**  
- **actor**  
  The Actor instance being displayed within the sheet.  
- **options**  
  Additional application configuration options.

**Hierarchy:**  
- [DocumentSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html)  
- ActorSheet  

---

## Constructors

### constructor

```typescript
new ActorSheet(
    object: Document<object, DocumentConstructionContext>,
    options?: any,
): ActorSheet
```

**Parameters:**  
- **object**: [Document<object, DocumentConstructionContext>](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
  A Document instance which should be managed by this form.  
- **options?**: `any` (optional)  
  Optional configuration parameters for how the form behaves.

**Returns:**  
- `ActorSheet`  

(Inherited from [DocumentSheet.constructor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#constructor))

---

## Properties

- **appId**: `number`  
  The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.  
  (Inherited from [DocumentSheet.appId](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#appid))

- **editors**: `Record<string, object>`  
  Keep track of any mce editors which may be active as part of this form. The values of this object are inner-objects with references to the MCE editor and other metadata.  
  (Inherited from [DocumentSheet.editors](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#editors))

- **form**: `HTMLElement`  
  A convenience reference to the form HTMLElement.  
  (Inherited from [DocumentSheet.form](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#form))

- **object**: `any`  
  The object target which we are using this form to modify.  
  (Inherited from [DocumentSheet.object](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#object))

- **options**: `object`  
  The options provided to this application upon initialization.  
  (Inherited from [DocumentSheet.options](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#options))

- **position**: `object`  
  Track the current position and dimensions of the Application UI.  
  (Inherited from [DocumentSheet.position](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#position))

- **_priorState** (protected): `number`  
  The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.  
  (Inherited from [DocumentSheet._priorState](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_priorstate))

---

## Accessors

- **_secrets** (protected): [HTMLSecret[]](https://foundryvtt.com/api/classes/foundry.applications.ux.HTMLSecret.html)  
  The list of handlers for secret block functionality.  
  (Inherited from [DocumentSheet._secrets](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_secrets))

- **_state** (protected): `number`  
  The current render state of the Application.  
  See: [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)  
  (Inherited from [DocumentSheet._state](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_state))

- **RENDER_STATES** (static) (protected): `Readonly<{  
    CLOSED: -1;  
    CLOSING: -2;  
    ERROR: -3;  
    NONE: 0;  
    RENDERED: 2;  
    RENDERING: 1;  
}>`  
  The sequence of rendering states that track the Application life-cycle.  
  (Inherited from [DocumentSheet.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#render_states))

- **actor**: [documents.Actor](https://foundryvtt.com/api/classes/foundry.documents.Actor.html)  
  A convenience reference to the Actor document.

- **closing**: `boolean`  
  Whether the Application is currently closing.  
  (Inherited from DocumentSheet.closing)

- **document**: `ClientDocument`  
  A semantic convenience reference to the Document instance which is the target object for this form.  
  (Inherited from DocumentSheet.document)

- **element**: `jQuery`  
  Return the active application element, if it currently exists in the DOM.  
  (Inherited from DocumentSheet.element)

- **id**: `string`  
  Return the CSS application ID which uniquely references this UI element.  
  (Inherited from DocumentSheet.id)

- **isEditable**: `any`  
  Is the Form Application currently editable?  
  (Inherited from DocumentSheet.isEditable)

- **popOut**: `boolean`  
  Control the rendering style of the application. If popOut is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.  
  (Inherited from DocumentSheet.popOut)

- **rendered**: `boolean`  
  Return a flag for whether the Application instance is currently rendered.  
  (Inherited from DocumentSheet.rendered)

- **template**: `string`  
  The path to the HTML template file which should be used to render the inner content of the app.  
  (Inherited from DocumentSheet.template)

- **title**: `any`  
  An Application window should define its own title definition logic which may be dynamic depending on its data.  
  Overrides DocumentSheet.title

- **token**: `null | TokenDocument`  
  If this Actor Sheet represents a synthetic Token actor, reference the active Token.  
  Returns: `null | TokenDocument`

- **defaultOptions** (static)  
  Overrides DocumentSheet.defaultOptions  
  Return type: `object`

- **_customElements** (protected static): `string[]`  
  An array of custom element tag names that should be listened to for changes.  
  Returns: `string[]`  
  (Inherited from DocumentSheet._customElements)

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

(Inherited from [DocumentSheet._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_activatecorelisteners))

---

### _canDragDrop

```typescript
_canDragDrop(selector: any): any
```

Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters:**  
- **selector**: `any`  
  The candidate HTML selector for the drop target.

**Returns:** `any`  
Can the current user drop on this selector?

Overrides [DocumentSheet._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_candragdrop)

---

### _canDragStart

```typescript
_canDragStart(selector: any): any
```

Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters:**  
- **selector**: `any`  
  The candidate HTML selector for dragging.

**Returns:** `any`  
Can the current user drag this selector?

Overrides [DocumentSheet._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_candragstart)

---

### _getHeaderButtons

```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```

Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the getApplicationV1HeaderButtons hook.

**Returns:**  
- `ApplicationV1HeaderButton[]`  

**Fires:**  
- getApplicationHeaderButtons

Overrides [DocumentSheet._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getheaderbuttons)

---

### _getSubmitData

```typescript
_getSubmitData(updateData?: {}): object
```

Get an object of update data used to update the form's target object.

**Parameters:**  
- **updateData**: `{}` = {}

Additional data that should be merged with the form data.

**Returns:**  
- `object` The prepared update data.

Overrides [DocumentSheet._getSubmitData](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getsubmitdata)

---

### _onDragStart

```typescript
_onDragStart(event: any): void
```

Callback actions which occur at the beginning of a drag start workflow.

**Parameters:**  
- **event**: `any` The originating DragEvent.

**Returns:** `void`  

Overrides [DocumentSheet._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondragstart)

---

### _onDrop

```typescript
_onDrop(event: any): Promise<undefined | boolean | object>
```

Callback actions which occur when a dragged element is dropped on a target.

**Parameters:**  
- **event**: `any` The originating DragEvent.

**Returns:**  
- `Promise<undefined | boolean | object>`

Overrides [DocumentSheet._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondrop)

---

### _render

```typescript
_render(force: any, options?: {}): Promise<void>
```

An asynchronous inner function which handles the rendering of the Application.

**Parameters:**  
- **force**: `any`  
  Render and display the application even if it is not currently displayed.  
- **options?**: `{}` = {}

Additional options which update the current values of the Application#options object.

**Returns:**  
- `Promise<void>` A Promise that resolves to the Application once rendering is complete.

**Fires:**  
- renderApplication

Inherited from [DocumentSheet._render](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_render)

---

### _renderOuter

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.

**Returns:**  
- `Promise<jQuery>` A promise resolving to the constructed jQuery object.

Inherited from [DocumentSheet._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_renderouter)

---

### _updateObject

```typescript
_updateObject(_event: any, formData: any): Promise<any>
```

This method is called upon form submission after form data is validated.

**Parameters:**  
- **_event**: `any` The initial triggering submission event.  
- **formData**: `any` The object of validated form data with which to update the object.

**Returns:**  
- `Promise<any>` A Promise which resolves once the update operation has completed.

Inherited from [DocumentSheet._updateObject](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_updateobject)

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
- **options?**: `{}` = {}  
  [Editor initialization options passed to foundry.applications.ux.TextEditor.create](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create)  
- **initialContent?**: `string` = ""  
  Initial text content for the editor area.

**Returns:**  
- `Promise<Editor | EditorView>`

Inherited from [DocumentSheet.activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activateeditor)

---

### activateListeners

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters:**  
- **html**: `any`

**Returns:** `void`

Inherited from [DocumentSheet.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activatelisteners)

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
- **options?**: `{ group: string; triggerCallback: boolean }` = {}  
  Options which configure changing the tab.  
  - **group**: `string`  
    A specific named tab group, useful if multiple sets of tabs are present.  
  - **triggerCallback**: `boolean`  
    Whether to trigger tab-change callback functions.

**Returns:** `void`

Inherited from [DocumentSheet.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activatetab)

---

### bringToFront

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an [Application or an ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html).

**Returns:** `void`

Inherited from [DocumentSheet.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#bringtofront)

---

### bringToTop

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

**Returns:** `void`

Inherited from [DocumentSheet.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#bringtotop)

---

### close

```typescript
close(options: any): Promise<void>
```

Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters:**  
- **options**: `any`  
  Options which affect how the Application is closed.

**Returns:**  
- `Promise<void>` A Promise which resolves once the application is closed.

**Fires:**  
- closeApplication  

Overrides [DocumentSheet.close](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#close)

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

An application should define the data object used to render its template. This function may either return an Object directly, or a Promise which resolves to an Object. If undefined, the default implementation will return an empty object allowing only for rendering of static HTML.

**Parameters:**  
- **options?**: `{}` = {}

**Returns:**  
- An object containing:  
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

Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

**Returns:**  
- `Promise<void>` A Promise which resolves once the maximization action has completed.

Inherited from [DocumentSheet.maximize](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#maximize)

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

**Returns:**  
- `Promise<void>` A Promise which resolves once the minimization action has completed.

Inherited from [DocumentSheet.minimize](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#minimize)

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

**Parameters:**  
- **force?**: `boolean` = false  
  Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.  
- **options?**: object (optional)  
  Additional rendering options which are applied to customize the way that the Application is rendered in the DOM.  
  Optional keys:  
  - **focus?**: `boolean` — Apply focus to the application, maximizing it and bringing it to the top of the vertical stack.  
  - **height?**: `number` — The rendered height  
  - **left?**: `number` — The left positioning attribute  
  - **renderContext?**: `string` — A context-providing string which suggests what event triggered the render  
  - **renderData?**: `object` — The data change which motivated the render request  
  - **scale?**: `number` — The rendered transformation scale  
  - **top?**: `number` — The top positioning attribute  
  - **width?**: `number` — The rendered width

**Returns:**  
- `Application` The rendered Application instance.

Inherited from [DocumentSheet.render](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#render)

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
- **options?**: `{ preventRender?: boolean; remove?: boolean }` = {} (optional)  
  - **preventRender?**: `boolean` — Prevent normal re-rendering of the sheet after saving.  
  - **remove?**: `boolean` — Remove the editor after saving its content.

**Returns:**  
- `Promise<void>`

Inherited from [DocumentSheet.saveEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#saveeditor)

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
- **position?**: Object with positional data  
  - **height**: `null | string | number` — The application height in pixels  
  - **left**: `null | number` — The left offset position in pixels  
  - **scale**: `null | number` — The application scale as a numeric factor where 1.0 is default  
  - **top**: `null | number` — The top offset position in pixels  
  - **width**: `null | number` — The application width in pixels

**Returns:**  
- `void` OR an object:  
  - **height**: `number`  
  - **left**: `number`  
  - **scale**: `number`  
  - **top**: `number`  
  - **width**: `number`

Inherited from [DocumentSheet.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#setposition)

---

### submit

```typescript
submit(options?: object): Promise<ActorSheet>
```

Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters:**  
- **options?**: `object` = {} (optional)  
  Options passed to the _onSubmit event handler.

**Returns:**  
- `Promise<ActorSheet>` Return a self-reference for convenient method chaining.

Inherited from [DocumentSheet.submit](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#submit)

---

### _activateEditor

```typescript
_activateEditor(div: HTMLElement): void
```

Activate an editor instance present within the form.

**Parameters:**  
- **div**: `HTMLElement` The element which contains the editor.

**Returns:**  
- `void`

Inherited from [DocumentSheet._activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_activateeditor)

---

### _callHooks

```typescript
_callHooks(
    hookName: string | ((className: string) => string),
    ...hookArgs: any[],
): void
```

Call all hooks for all applications in the inheritance chain.

**Parameters:**  
- **hookName**: `string | (className: string) => string`  
  The hook being triggered, which is formatted with the Application class name.  
- **...hookArgs**: `any[]`  
  The arguments passed to the hook calls.

**Returns:**  
- `void`

Inherited from [DocumentSheet._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_callhooks)

---

### _canUserView

```typescript
_canUserView(user: User): boolean
```

Test whether a certain User has permission to view this Document Sheet.

**Parameters:**  
- **user**: `User` The user requesting to render the sheet.

**Returns:**  
- `boolean` Does the User have permission to view this sheet?

Inherited from [DocumentSheet._canUserView](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_canuserview)

---

### _configureProseMirrorPlugins

```typescript
_configureProseMirrorPlugins(
    name: string,
    options?: { remove?: boolean },
): object
```

Configure ProseMirror plugins for this sheet.

**Parameters:**  
- **name**: `string` The name of the editor.  
- **options?**: `{ remove?: boolean }` = {} (optional)  
  - **remove?**: `boolean` Whether the editor should destroy itself on save.

**Returns:**  
- `object`

Inherited from [DocumentSheet._configureProseMirrorPlugins](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_configureprosemirrorplugins)

---

### _createDocumentIdLink

```typescript
_createDocumentIdLink(html: jQuery): void
```

Create an ID link button in the document sheet header which displays the document ID and copies to clipboard.

**Parameters:**  
- **html**: `jQuery`

**Returns:**  
- `void`

Inherited from [DocumentSheet._createDocumentIdLink](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_createdocumentidlink)

---

### _createSecretHandlers

```typescript
_createSecretHandlers(): HTMLSecret[]
```

Create objects for managing the functionality of secret blocks within this Document's content.

**Returns:**  
- `[HTMLSecret](https://foundryvtt.com/api/classes/foundry.applications.ux.HTMLSecret.html)[]`

Inherited from [DocumentSheet._createSecretHandlers](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_createsecrethandlers)

---

### _disableFields

```typescript
_disableFields(form: HTMLElement): void
```

If the form is not editable, disable its input fields.

**Parameters:**  
- **form**: `HTMLElement` The form HTML.

**Returns:**  
- `void`

Inherited from [DocumentSheet._disableFields](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_disablefields)

---

### _getSecretContent

```typescript
_getSecretContent(secret: HTMLElement): string | void
```

Get the HTML content that a given secret block is embedded in.

**Parameters:**  
- **secret**: `HTMLElement` The secret block.

**Returns:**  
- `string | void`

Inherited from [DocumentSheet._getSecretContent](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getsecretcontent)

---

### _onChangeColorPicker

```typescript
_onChangeColorPicker(event: Event): void
```

Handle the change of a color picker input which enters its chosen value into a related input field.

**Parameters:**  
- **event**: `Event` The color picker change event.

**Returns:** `void`

Inherited from [DocumentSheet._onChangeColorPicker](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangecolorpicker)

---

### _onChangeInput

```typescript
_onChangeInput(event: Event): Promise<any>
```

Handle changes to an input element, submitting the form if options.submitOnChange is true. Do not preventDefault in this handler as other interactions on the form may also be occurring.

**Parameters:**  
- **event**: `Event` The initial change event.

**Returns:**  
- `Promise<any>`

Inherited from [DocumentSheet._onChangeInput](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangeinput)

---

### _onChangeRange

```typescript
_onChangeRange(event: Event): void
```

Handle changes to a range type input by propagating those changes to the sibling range-value element.

**Parameters:**  
- **event**: `Event` The initial change event.

**Returns:** `void`

Inherited from [DocumentSheet._onChangeRange](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangerange)

---

### _onChangeTab

```typescript
_onChangeTab(event: null | MouseEvent, tabs: Tabs, active: string): void
```

Handle changes to the active tab in a configured Tabs controller.

**Parameters:**  
- **event**: `null | MouseEvent` A left click event.  
- **tabs**: `Tabs` The Tabs controller.  
- **active**: `string` The new active tab name.

**Returns:**  
- `void`

Inherited from [DocumentSheet._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangetab)

---

### _onConfigureSheet

```typescript
_onConfigureSheet(event: ClickEvent): void
```

Handle requests to configure the default sheet used by this Document.

**Parameters:**  
- **event**: `ClickEvent`

**Returns:**  
- `void`

Inherited from [DocumentSheet._onConfigureSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onconfiguresheet)

---

### _onDragOver

```typescript
_onDragOver(event: DragEvent): void
```

Callback actions which occur when a dragged element is over a drop target.

**Parameters:**  
- **event**: `DragEvent`

**Returns:** `void`

Inherited from [DocumentSheet._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondragover)

---

### _onDropActiveEffect

```typescript
_onDropActiveEffect(
    event: DragEvent,
    data: object,
): Promise<boolean | documents.ActiveEffect>
```

Handle the dropping of ActiveEffect data onto an Actor Sheet.

**Parameters:**  
- **event**: `DragEvent` The concluding DragEvent which contains drop data.  
- **data**: `object` The data transfer extracted from the event.

**Returns:**  
- `Promise<boolean | documents.ActiveEffect>` The created ActiveEffect object or false if it couldn't be created.

---

### _onDropActor

```typescript
_onDropActor(event: DragEvent, data: object): Promise<boolean | object>
```

Handle dropping of an Actor data onto another Actor sheet.

**Parameters:**  
- **event**: `DragEvent` The concluding DragEvent which contains drop data.  
- **data**: `object` The data transfer extracted from the event.

**Returns:**  
- `Promise<boolean | object>` A data object which describes the result of the drop, or false if the drop was not permitted.

---

### _onDropFolder

```typescript
_onDropFolder(event: DragEvent, data: object): Promise<documents.Item[]>
```

Handle dropping of a Folder on an Actor Sheet. The core sheet currently supports dropping a Folder of Items to create all items as owned items.

**Parameters:**  
- **event**: `DragEvent` The concluding DragEvent which contains drop data.  
- **data**: `object` The data transfer extracted from the event.

**Returns:**  
- `Promise<documents.Item[]>`

---

### _onDropItem

```typescript
_onDropItem(event: DragEvent, data: object): Promise<boolean | documents.Item[]>
```

Handle dropping of an item reference or item data onto an Actor Sheet.

**Parameters:**  
- **event**: `DragEvent` The concluding DragEvent which contains drop data.  
- **data**: `object` The data transfer extracted from the event.

**Returns:**  
- `Promise<boolean | documents.Item[]>` The created or updated Item instances, or false if the drop was not permitted.

---

### _onEditImage

```typescript
_onEditImage(event: MouseEvent): Promise<FilePicker>
```

Handle changing a Document's image.

**Parameters:**  
- **event**: `MouseEvent` The click event.

**Returns:**  
- `Promise<FilePicker>`

Inherited from [DocumentSheet._onEditImage](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_oneditimage)

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

Handle changes to search filtering controllers which are bound to the Application.

**Parameters:**  
- **event**: `KeyboardEvent` The key-up event from keyboard input.  
- **query**: `string` The raw string input to the search field.  
- **rgx**: `RegExp` The regular expression to test against.  
- **html**: `HTMLElement` The HTML element which should be filtered.

**Returns:** `void`

Inherited from [DocumentSheet._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onsearchfilter)

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

Handle standard form submission steps.

**Parameters:**  
- **event**: `Event` The submit event which triggered this handler.  
- **options?**: Object options (optional) with:  
  - **preventClose?**: `boolean` Override the standard behavior of whether to close the form on submit.  
  - **preventRender?**: `boolean` Prevent the application from re-rendering as a result of form submission.  
  - **updateData?**: `null | object` Additional specific data keys/values which override or extend the contents of the parsed form. This can be used to update other flags or data fields at the same time as processing a form submission to avoid multiple database operations.

**Returns:**  
- `Promise<any>` A promise which resolves to the validated update data.

Inherited from [DocumentSheet._onSubmit](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onsubmit)

---

### _restoreScrollPositions

```typescript
_restoreScrollPositions(html: jQuery): void
```

Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters:**  
- **html**: `jQuery` The HTML object being traversed.

**Returns:**  
- `void`

Inherited from [DocumentSheet._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_restorescrollpositions)

---

### _saveScrollPositions

```typescript
_saveScrollPositions(html: jQuery): void
```

Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters:**  
- **html**: `jQuery` The HTML object being traversed.

**Returns:**  
- `void`

Inherited from [DocumentSheet._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_savescrollpositions)

---

### _updateSecret

```typescript
_updateSecret(secret: HTMLElement, content: string): void | Promise<any>
```

Update the HTML content that a given secret block is embedded in.

**Parameters:**  
- **secret**: `HTMLElement` The secret block.  
- **content**: `string` The new content.

**Returns:**  
- `void | Promise<any>` The updated Document.

Inherited from [DocumentSheet._updateSecret](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_updatesecret)

---

### _waitForImages

```typescript
_waitForImages(): Promise<void>
```

Wait for any images present in the Application to load.

**Returns:**  
- `Promise<void>` A Promise that resolves when all images have loaded.

Inherited from [DocumentSheet._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_waitforimages)

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
- [ActorSheet Hierarchy Summary](https://foundryvtt.com/api/hierarchy.html#foundry.appv1.sheets.ActorSheet)