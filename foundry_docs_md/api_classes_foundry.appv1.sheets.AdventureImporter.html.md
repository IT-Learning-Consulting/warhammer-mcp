# AdventureImporter | Foundry Virtual Tabletop - API Documentation - Version 13

An interface for importing an adventure from a compendium pack.

**Deprecated** since v13.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.appv1.sheets.AdventureImporter))  
- [DocumentSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html)  
- **AdventureImporter**

---

## Constructors

### constructor

```typescript
new AdventureImporter(
    object: Document<object, DocumentConstructionContext>,
    options?: any,
): AdventureImporter
```

**Parameters**

- **object**: `Document<object, DocumentConstructionContext>`  
  A Document instance which should be managed by this form.

- **options**: `any = {}` (Optional)  
  Optional configuration parameters for how the form behaves.

**Returns**  
`AdventureImporter`

---

## Properties

Inherited from [DocumentSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html)

- **adventure**: `documents.Adventure = ...`  
  An alias for the Adventure document.

- **appId**: `number`  
  The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.

- **editors**: `Record<string, object>`  
  Keep track of any mce editors which may be active as part of this form. The values of this object are inner-objects with references to the MCE editor and other metadata.

- **form**: `HTMLElement`  
  A convenience reference to the form HTMLElement.

- **object**: `any`  
  The object target which we are using this form to modify.

- **options**: `object`  
  The options provided to this application upon initialization.

- **position**: `object`  
  Track the current position and dimensions of the Application UI.

### Protected Properties

- **_priorState**: `number`  
  The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.

- **_secrets**: `HTMLSecret[]`  
  The list of handlers for secret block functionality.

- **_state**: `number`  
  The current render state of the Application.  
  See: [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)

### Static Properties

- **RENDER_STATES**: `Readonly<{ CLOSED: -1; CLOSING: -2; ERROR: -3; NONE: 0; RENDERED: 2; RENDERING: 1; }>`  
  The sequence of rendering states that track the Application life-cycle.

---

## Accessors

Inherited from [DocumentSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html)

- **closing**: `boolean`  
  Whether the Application is currently closing.

- **document**: `ClientDocument`  
  A semantic convenience reference to the Document instance which is the target object for this form.

- **element**: `jQuery`  
  Return the active application element, if it currently exists in the DOM.

- **id**: `string`  
  Return the CSS application ID which uniquely references this UI element.

- **isEditable**: `boolean`  
  Overrides DocumentSheet.isEditable.

- **popOut**: `boolean`  
  Control the rendering style of the application. If popOut is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.

- **rendered**: `boolean`  
  Return a flag for whether the Application instance is currently rendered.

- **template**: `string`  
  The path to the HTML template file which should be used to render the inner content of the app.

- **title**: `string`  
  An Application window should define its own title definition logic which may be dynamic depending on its data.

### Static Accessors

- **defaultOptions**: `object`  
  Overrides DocumentSheet.defaultOptions.

### Protected Accessors

- **_customElements**: `string[]`  
  An array of custom element tag names that should be listened to for changes.

---

## Methods

Inherited from [DocumentSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html)

### _activateCoreListeners

```typescript
_activateCoreListeners(html: any): void
```

Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters**

- **html**: `any`

**Returns**  
`void`

---

### _getHeaderButtons

```typescript
_getHeaderButtons(): ApplicationV1HeaderButton[]
```

Specify the set of config buttons which should appear in the Application header. Buttons should be returned as an Array of objects. The header buttons which are added to the application can be modified by the `getApplicationV1HeaderButtons` hook.

**Returns**  
`ApplicationV1HeaderButton[]`

**Fires**  
`getApplicationHeaderButtons`

---

### _importLegacy

```typescript
_importLegacy(formData: object): Promise<void>
```

Mirror Adventure#import but call AdventureImporter#_importContent and AdventureImport#_prepareImportData

**Parameters**

- **formData**: `object`

**Returns**  
`Promise<void>`

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

**Returns**  
`Promise<void>`

**Fires**  
`renderApplication`

---

### _renderOuter

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.

**Returns**  
`Promise<jQuery>`  
A promise resolving to the constructed jQuery object.

---

### _updateObject

```typescript
_updateObject(event: any, formData: any): Promise<void | AdventureImportResult>
```

Overrides `DocumentSheet._updateObject`.

**Parameters**

- **event**: `any`  
- **formData**: `any`

**Returns**  
`Promise<void | AdventureImportResult>`

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

**Returns**  
`Promise<Editor | EditorView>`

---

### activateListeners

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters**

- **html**: `any`

**Returns**  
`void`

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

**Returns**  
`void`

---

### bringToFront

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an [Application or an ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html).

**Returns**  
`void`

---

### bringToTop

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

**Returns**  
`void`

---

### close

```typescript
close(options?: {}): Promise<void>
```

Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters**

- **options**: `{}` = {}  
  Options which affect how the Application is closed.

**Returns**  
`Promise<void>`

**Fires**  
`closeApplication`

---

### getData

```typescript
getData(
    options?: {},
): Promise<{
    adventure: documents.Adventure;
    contents: { count: number; icon: string; label: string }[];
    imported: boolean;
}>
```

Overrides `DocumentSheet.getData`.

**Parameters**

- **options**: `{}` = {}

**Returns**  
`Promise<{
    adventure: documents.Adventure;
    contents: { count: number; icon: string; label: string }[];
    imported: boolean;
}>`

---

### maximize

```typescript
maximize(): Promise<void>
```

Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

**Returns**  
`Promise<void>`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

**Returns**  
`Promise<void>`

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

- **options**: (Optional)  
  Additional rendering options which are applied to customize the way that the Application is rendered in the DOM.

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

**Returns**  
`Application`  
The rendered Application instance.

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

- **options**: `{ preventRender?: boolean; remove?: boolean }` = {} (Optional)  
  - **preventRender**?: `boolean`  
    Prevent normal re-rendering of the sheet after saving.

  - **remove**?: `boolean`  
    Remove the editor after saving its content.

**Returns**  
`Promise<void>`

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

- **position**: (Optional) positional data:

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

**Returns**  
`void` or the position object with numeric values:

```typescript
{
  height: number;
  left: number;
  scale: number;
  top: number;
  width: number;
}
```

---

### submit

```typescript
submit(options?: object): Promise<AdventureImporter>
```

Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters**

- **options**: `object` = {} (Optional)  
  Options passed to the _onSubmit event handler.

**Returns**  
`Promise<AdventureImporter>`  
Return a self-reference for convenient method chaining.

---

### _activateEditor

```typescript
_activateEditor(div: HTMLElement): void
```

Activate an editor instance present within the form.

**Parameters**

- **div**: `HTMLElement`  
  The element which contains the editor.

**Returns**  
`void`

---

### _callHooks

```typescript
_callHooks(
    hookName: string | ((className: string) => string),
    ...hookArgs: any[],
): void
```

Call all hooks for all applications in the inheritance chain.

**Parameters**

- **hookName**: `string` or function `(className: string) => string`  
  The hook being triggered, formatted with the Application class name.

- **...hookArgs**: `any[]`  
  The arguments passed to the hook calls.

**Returns**  
`void`

---

### _canDragDrop

```typescript
_canDragDrop(selector: string): boolean
```

Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for the drop target.

**Returns**  
`boolean`  
Can the current user drop on this selector?

---

### _canDragStart

```typescript
_canDragStart(selector: string): boolean
```

Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for dragging.

**Returns**  
`boolean`  
Can the current user drag this selector?

---

### _canUserView

```typescript
_canUserView(user: User): boolean
```

Test whether a certain User has permission to view this Document Sheet.

**Parameters**

- **user**: `User`  
  The user requesting to render the sheet.

**Returns**  
`boolean`  
Does the User have permission to view this sheet?

---

### _configureProseMirrorPlugins

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

- **options**: `{ remove?: boolean }` = {} (Optional)  
  Additional options to configure the plugins.

  - **remove**?: `boolean`  
    Whether the editor should destroy itself on save.

**Returns**  
`object`

---

### _createDocumentIdLink

```typescript
_createDocumentIdLink(html: jQuery): void
```

Create an ID link button in the document sheet header which displays the document ID and copies to clipboard.

**Parameters**

- **html**: `jQuery`

**Returns**  
`void`

---

### _createSecretHandlers

```typescript
_createSecretHandlers(): HTMLSecret[]
```

Create objects for managing the functionality of secret blocks within this Document's content.

**Returns**  
`HTMLSecret[]`

---

### _disableFields

```typescript
_disableFields(form: HTMLElement): void
```

If the form is not editable, disable its input fields.

**Parameters**

- **form**: `HTMLElement`  
  The form HTML.

**Returns**  
`void`

---

### _getContentList

```typescript
_getContentList(): { count: number; icon: string; label: string }[]
```

Prepare a list of content types provided by this adventure.

**Returns**  
Array of content type objects with:

- **count**: `number`  
- **icon**: `string`  
- **label**: `string`

---

### _getSecretContent

```typescript
_getSecretContent(secret: HTMLElement): string | void
```

Get the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: `HTMLElement`  
  The secret block.

**Returns**  
`string` or `void`

---

### _getSubmitData

```typescript
_getSubmitData(updateData?: object): object
```

Get an object of update data used to update the form's target object.

**Parameters**

- **updateData**: `object` = {} (Optional)  
  Additional data that should be merged with the form data.

**Returns**  
`object`  
The prepared update data.

---

### _onChangeColorPicker

```typescript
_onChangeColorPicker(event: Event): void
```

Handle the change of a color picker input which enters it's chosen value into a related input field.

**Parameters**

- **event**: `Event`  
  The color picker change event.

**Returns**  
`void`

---

### _onChangeInput

```typescript
_onChangeInput(event: Event): Promise<any>
```

Handle changes to an input element, submitting the form if options.submitOnChange is true. Do not preventDefault in this handler as other interactions on the form may also be occurring.

**Parameters**

- **event**: `Event`  
  The initial change event.

**Returns**  
`Promise<any>`

---

### _onChangeRange

```typescript
_onChangeRange(event: Event): void
```

Handle changes to a range type input by propagating those changes to the sibling range-value element.

**Parameters**

- **event**: `Event`  
  The initial change event.

**Returns**  
`void`

---

### _onChangeTab

```typescript
_onChangeTab(event: null | MouseEvent, tabs: Tabs, active: string): void
```

Handle changes to the active tab in a configured Tabs controller.

**Parameters**

- **event**: `null` | `MouseEvent`  
  A left click event.

- **tabs**: `Tabs`  
  The Tabs controller.

- **active**: `string`  
  The new active tab name.

**Returns**  
`void`

---

### _onConfigureSheet

```typescript
_onConfigureSheet(event: ClickEvent): void
```

Handle requests to configure the default sheet used by this Document.

**Parameters**

- **event**: `ClickEvent`

**Returns**  
`void`

---

### _onDragOver

```typescript
_onDragOver(event: DragEvent): void
```

Callback actions which occur when a dragged element is over a drop target.

**Parameters**

- **event**: `DragEvent`  
  The originating DragEvent.

**Returns**  
`void`

---

### _onDragStart

```typescript
_onDragStart(event: DragEvent): void
```

Callback actions which occur at the beginning of a drag start workflow.

**Parameters**

- **event**: `DragEvent`  
  The originating DragEvent.

**Returns**  
`void`

---

### _onDrop

```typescript
_onDrop(event: DragEvent): void
```

Callback actions which occur when a dragged element is dropped on a target.

**Parameters**

- **event**: `DragEvent`  
  The originating DragEvent.

**Returns**  
`void`

---

### _onEditImage

```typescript
_onEditImage(event: MouseEvent): Promise<FilePicker>
```

Handle changing a Document's image.

**Parameters**

- **event**: `MouseEvent`  
  The click event.

**Returns**  
`Promise<FilePicker>`

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

**Parameters**

- **event**: `KeyboardEvent`  
  The key-up event from keyboard input.

- **query**: `string`  
  The raw string input to the search field.

- **rgx**: `RegExp`  
  The regular expression to test against.

- **html**: `HTMLElement`  
  The HTML element which should be filtered.

**Returns**  
`void`

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

**Parameters**

- **event**: `Event`  
  The submit event which triggered this handler.

- **options**: (Optional)

  - **preventClose**?: `boolean`  
    Override the standard behavior of whether to close the form on submit.

  - **preventRender**?: `boolean`  
    Prevent the application from re-rendering as a result of form submission.

  - **updateData**?: `null` | `object`  
    Additional specific data keys/values which override or extend the contents of the parsed form. This can be used to update other flags or data fields at the same time as processing a form submission to avoid multiple database operations.

**Returns**  
`Promise<any>`  
A promise which resolves to the validated update data.

---

### _onToggleImportAll

```typescript
_onToggleImportAll(event: Event): void
```

Handle toggling the import all checkbox.

**Parameters**

- **event**: `Event`  
  The change event.

**Returns**  
`void`

---

### _restoreScrollPositions

```typescript
_restoreScrollPositions(html: jQuery): void
```

Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters**

- **html**: `jQuery`  
  The HTML object being traversed.

**Returns**  
`void`

---

### _saveScrollPositions

```typescript
_saveScrollPositions(html: jQuery): void
```

Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters**

- **html**: `jQuery`  
  The HTML object being traversed.

**Returns**  
`void`

---

### _updateSecret

```typescript
_updateSecret(secret: HTMLElement, content: string): void | Promise<any>
```

Update the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: `HTMLElement`  
  The secret block.

- **content**: `string`  
  The new content.

**Returns**  
`void` or `Promise<any>`

---

### _waitForImages

```typescript
_waitForImages(): Promise<void>
```

Wait for any images present in the Application to load.

**Returns**  
`Promise<void>`  
A Promise that resolves when all images have loaded.

---

For full details and additional context, visit the official [Foundry Virtual Tabletop API Documentation - AdventureImporter](https://foundryvtt.com/api/classes/foundry.appv1.sheets.AdventureImporter.html).