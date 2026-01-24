# JournalSheet | Foundry Virtual Tabletop - API Documentation - Version 13

**Class JournalSheet**  
The Application responsible for displaying and editing a single JournalEntry document.

**Deprecated** since v13

**Parameters**

- **object**: The JournalEntry instance which is being edited
- **options**: Application options

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.appv1.sheets.JournalSheet), Expand)  
- [DocumentSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html)  
- JournalSheet

---

## Constructors

### constructor

```typescript
new JournalSheet(
    object: Document<object, DocumentConstructionContext>,
    options?: any,
): JournalSheet
```

**Parameters**

- **object**: A Document instance which should be managed by this form.
- **options?**: Optional configuration parameters for how the form behaves. Default is `{}`.

**Returns**  
`JournalSheet`

Inherited from [DocumentSheet.constructor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#constructor).

---

## Properties

- **appId**: `number`  
  The application ID is a unique incrementing integer which is used to identify every application window drawn by the VTT.  
  Inherited from [DocumentSheet.appId](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#appid).

- **editors**: `Record<string, object>`  
  Keep track of any mce editors which may be active as part of this form. The values of this object are inner-objects with references to the MCE editor and other metadata.  
  Inherited from [DocumentSheet.editors](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#editors).

- **form**: `HTMLElement`  
  A convenience reference to the form HTMLElement.  
  Inherited from [DocumentSheet.form](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#form).

- **object**: `any`  
  The object target which we are using this form to modify.  
  Inherited from [DocumentSheet.object](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#object).

- **options**: `object`  
  The options provided to this application upon initialization.  
  Inherited from [DocumentSheet.options](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#options).

- **position**: `object`  
  Track the current position and dimensions of the Application UI.  
  Inherited from [DocumentSheet.position](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#position).

- **_pages**: `object[]` (Protected)  
  The cached list of processed page entries. This array is populated in the `getData` method.

- **_priorState**: `number` (Protected)  
  The prior render state of this Application. This allows for rendering logic to understand if the application is being rendered for the first time.  
  Inherited from [DocumentSheet._priorState](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_priorstate).

- **_secrets**: `[HTMLSecret]` (Protected)  
  The list of handlers for secret block functionality.  
  Inherited from [DocumentSheet._secrets](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_secrets).

- **_state**: `number` (Protected)  
  The current render state of the Application.  
  See: [Application.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#render_states)  
  Inherited from [DocumentSheet._state](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_state).

- **INTERSECTION_RATIO**: `number = 0.25` (Static)  
  The minimum amount of content that must be visible before the next page is marked as in view. Cannot be less than 25% without also modifying the IntersectionObserver threshold.

- **OWNERSHIP_ICONS**: `{ "0": string; "2": string; "3": string }` (Static)  
  Icons for page ownership.

- **RENDER_STATES**: `Readonly<{ CLOSED: -1; CLOSING: -2; ERROR: -3; NONE: 0; RENDERED: 2; RENDERING: 1; }>` (Static)  
  The sequence of rendering states that track the Application life-cycle.  
  Inherited from [DocumentSheet.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#render_states).

- **VIEW_MODES**: `{ MULTIPLE: number; SINGLE: number }` (Static)  
  Available view modes for journal entries.

---

## Accessors

- **closing**: `boolean`  
  Whether the Application is currently closing.  
  Returns `boolean`  
  Inherited from `DocumentSheet.closing`.

- **document**: `ClientDocument`  
  A semantic convenience reference to the Document instance which is the target object for this form.  
  Returns `ClientDocument`  
  Inherited from `DocumentSheet.document`.

- **element**: `jQuery`  
  Return the active application element, if it currently exists in the DOM.  
  Returns `jQuery`  
  Inherited from `DocumentSheet.element`.

- **id**: `string`  
  Return the CSS application ID which uniquely references this UI element.  
  Returns `string`  
  Inherited from `DocumentSheet.id`.

- **isEditable**: `any`  
  Is the Form Application currently editable?  
  Returns `any`  
  Inherited from `DocumentSheet.isEditable`.

- **mode**: `number`  
  Get the journal entry's current view mode.  
  Returns `number`  
  See [JournalSheet.VIEW_MODES](#VIEW_MODES).

- **observer**: `IntersectionObserver`  
  The currently active IntersectionObserver.  
  Returns `IntersectionObserver`.

- **pageIndex**: `number`  
  The index of the currently viewed page.  
  Returns `number`.

- **pagesInView**: `HTMLElement[]`  
  The pages that are currently scrolled into view and marked as 'active' in the sidebar.  
  Returns `HTMLElement[]`.

- **popOut**: `boolean`  
  Control the rendering style of the application. If `popOut` is true, the application is rendered in its own wrapper window, otherwise only the inner app content is rendered.  
  Returns `boolean`  
  Inherited from [DocumentSheet.popOut](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#popOut).

- **rendered**: `boolean`  
  Return a flag for whether the Application instance is currently rendered.  
  Returns `boolean`  
  Inherited from [DocumentSheet.rendered](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#rendered).

- **searchMode**: `string`  
  The current search mode for this journal.  
  Returns `string`.

- **sidebarCollapsed**: `boolean`  
  Is the table-of-contents sidebar currently collapsed?  
  Returns `boolean`.

- **template**: `string`  
  The path to the HTML template file which should be used to render the inner content of the app.  
  Returns `string`  
  Inherited from [DocumentSheet.template](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#template).

- **title**: `string`  
  An Application window should define its own title definition logic which may be dynamic depending on its data.  
  Returns `string`  
  Overrides `DocumentSheet.title`.

- **defaultOptions**: `JournalSheetOptions & DocumentSheetV1Options & ApplicationV1Options` (Static)  
  Returns default application options.  
  Overrides `DocumentSheet.defaultOptions`.

- **_customElements**: `string[]` (Protected, Static)  
  An array of custom element tag names that should be listened to for changes.  
  Returns `string[]`  
  Inherited from `DocumentSheet._customElements`.

---

## Methods

### _activateCoreListeners

```typescript
_activateCoreListeners(html: any): void
```

Activate required listeners which must be enabled on every Application. These are internal interactions which should not be overridden by downstream subclasses.

**Parameters**

- **html**: The HTML content to attach listeners to.

**Returns** `void`  
Inherited from [DocumentSheet._activateCoreListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_activatecorelisteners).

---

### _canDragDrop

```typescript
_canDragDrop(selector: any): any
```

Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.

**Parameters**

- **selector**: The candidate HTML selector for the drop target.

**Returns**  
`any` — Can the current user drop on this selector?  
Overrides [DocumentSheet._canDragDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_candragdrop).

---

### _canDragStart

```typescript
_canDragStart(selector: any): any
```

Define whether a user is able to begin a dragstart workflow for a given drag selector.

**Parameters**

- **selector**: The candidate HTML selector for dragging.

**Returns**  
`any` — Can the current user drag this selector?  
Overrides [DocumentSheet._canDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_candragstart).

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

Overrides [DocumentSheet._getHeaderButtons](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getheaderbuttons).

---

### _onDragStart

```typescript
_onDragStart(event: any): void
```

Callback actions which occur at the beginning of a drag start workflow.

**Parameters**

- **event**: The originating DragEvent.

**Returns** `void`  
Overrides [DocumentSheet._onDragStart](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondragstart).

---

### _onDrop

```typescript
_onDrop(event: any): Promise<any>
```

Callback actions which occur when a dragged element is dropped on a target.

**Parameters**

- **event**: The originating DragEvent.

**Returns**  
`Promise<any>`  
Overrides [DocumentSheet._onDrop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondrop).

---

### _onSearchFilter

```typescript
_onSearchFilter(event: any, query: any, rgx: any, html: any): void
```

Handle changes to search filtering controllers which are bound to the Application.

**Parameters**

- **event**: The key-up event from keyboard input.
- **query**: The raw string input to the search field.
- **rgx**: The regular expression to test against.
- **html**: The HTML element which should be filtered.

**Returns** `void`  
Overrides [DocumentSheet._onSearchFilter](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onsearchfilter).

---

### _onShowPlayers

```typescript
_onShowPlayers(event: Event): Promise<void>
```

Handle requests to show the referenced Journal Entry to other Users. Save the form before triggering the show request, in case content has changed.

**Parameters**

- **event**: The triggering click event.

**Returns**  
`Promise<void>`

---

### _render

```typescript
_render(
    force?: boolean,
    options?: {
        anchor?: string;
        collapsed?: boolean;
        mode?: number;
        pageId?: string;
        pageIndex?: number;
        tempOwnership?: boolean;
    },
): Promise<void>
```

Overrides [DocumentSheet._render](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_render).

**Parameters**

- **force?**: Optional, `boolean`.  
- **options?**: Optional object containing:
  - **anchor?**: `string` - Render the sheet with the given anchor for the given page in view.
  - **collapsed?**: `boolean` - Render the sheet with the TOC sidebar collapsed?
  - **mode?**: `number` - Render the sheet in a given view mode, see [JournalSheet.VIEW_MODES](#VIEW_MODES)
  - **pageId?**: `string` - Render the sheet with the page with the given ID in view.
  - **pageIndex?**: `number` - Render the sheet with the page at the given index in view.
  - **tempOwnership?**: `boolean` - Whether the journal entry or one of its pages is being shown to players who might otherwise not have permission to view it.

---

### _renderOuter

```typescript
_renderOuter(): Promise<jQuery>
```

Render the outer application wrapper.

**Returns**  
Promise resolving to the constructed jQuery object.

Inherited from [DocumentSheet._renderOuter](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_renderouter).

---

### _updateObject

```typescript
_updateObject(event: any, formData: any): Promise<any>
```

This method is called upon form submission after form data is validated.

**Parameters**

- **event**: The initial triggering submission event.
- **formData**: The object of validated form data with which to update the object.

**Returns**  
`Promise<any>` - A Promise which resolves once the update operation has completed.

Overrides [DocumentSheet._updateObject](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_updateobject).

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

- **name**: The named data field which the editor modifies.
- **options?**: Editor initialization options passed to [foundry.applications.ux.TextEditor.create](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create).
- **initialContent?**: The initial text content for the editor area. Default is `""`.

**Returns**  
`Promise<Editor | EditorView>`

Inherited from [DocumentSheet.activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activateeditor).

---

### activateListeners

```typescript
activateListeners(html: any): void
```

After rendering, activate event listeners which provide interactivity for the Application. This is where user-defined Application subclasses should attach their event-handling logic.

**Parameters**

- **html**: The HTML to activate listeners within.

**Returns**  
`void`  
Overrides [DocumentSheet.activateListeners](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activatelisteners).

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

- **tabName**: The target tab name to switch to.
- **options?**: Options configuring the tab change.
  - **group**: A specific named tab group, useful if multiple sets of tabs are present.
  - **triggerCallback**: Whether to trigger tab-change callback functions.

**Returns**  
`void`  
Inherited from [DocumentSheet.activateTab](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#activatetab).

---

### bringToFront

```typescript
bringToFront(): void
```

A convenience alias for [bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html#bringtotop) for when operating on an object that is either an Application or an ApplicationV2.

**Returns** `void`  
Inherited from [DocumentSheet.bringToFront](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#bringtofront).

---

### bringToTop

```typescript
bringToTop(): void
```

Bring the application to the top of the rendering stack.

**Returns** `void`  
Inherited from [DocumentSheet.bringToTop](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#bringtotop).

---

### close

```typescript
close(options?: {}): Promise<void>
```

Close the application and un-register references to it within UI mappings. This function returns a Promise which resolves once the window closing animation concludes.

**Parameters**

- **options?**: Options which affect how the Application is closed. Default `{}`.

**Returns**  
`Promise<void>`

**Fires**  
`closeApplication`

Overrides [DocumentSheet.close](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#close).

---

### createPage

```typescript
createPage(): any
```

Prompt the user with a Dialog for creation of a new JournalEntryPage.

**Returns**  
`any`

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

**Parameters**

- **options?**: Optional rendering options. Default `{}`.

**Returns**  
An object containing data context for rendering.

Overrides [DocumentSheet.getData](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#getdata).

---

### getPageSheet

```typescript
getPageSheet(pageId: string): JournalPageSheet
```

Retrieve the sheet instance for rendering this page inline.

**Parameters**

- **pageId**: The ID of the page.

**Returns**  
`JournalPageSheet`

---

### goToPage

```typescript
goToPage(pageId: string, anchor?: string): undefined | Application
```

Turn to a specific page.

**Parameters**

- **pageId**: The ID of the page to turn to.
- **anchor?**: Optionally an anchor slug to focus within that page.

**Returns**  
`undefined | Application`

---

### isPageVisible

```typescript
isPageVisible(page: documents.JournalEntryPage): boolean
```

Determine whether a page is visible to the current user.

**Parameters**

- **page**: The JournalEntryPage to check.

**Returns**  
`boolean`

---

### maximize

```typescript
maximize(): Promise<void>
```

Maximize the pop-out window, expanding it to its original size. Take no action for applications which are not of the pop-out variety or are already maximized.

**Returns**  
`Promise<void>`

Inherited from [DocumentSheet.maximize](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#maximize).

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the pop-out window, collapsing it to a small tab. Take no action for applications which are not of the pop-out variety or apps which are already minimized.

**Returns**  
`Promise<void>`

Inherited from [DocumentSheet.minimize](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#minimize).

---

### nextPage

```typescript
nextPage(): undefined | Application
```

Turn to the next page.

**Returns**  
`undefined | Application`

---

### previousPage

```typescript
previousPage(): undefined | Application
```

Turn to the previous page.

**Returns**  
`undefined | Application`

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

- **force?**: Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present. Default `false`.
- **options?**: Additional rendering options.
  - **focus?**: Apply focus to the application, maximizing it and bringing it to the top of the vertical stack.
  - **height?**, **left?**, **renderContext?**, **renderData?**, **scale?**, **top?**, **width?**: Various rendering and positional options.

**Returns**  
`Application` - The rendered Application instance.

Inherited from [DocumentSheet.render](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#render).

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

- **name**: The named editor to save.
- **options?**: Options to control saving behavior.
  - **preventRender?**: Prevent normal re-rendering of the sheet after saving.
  - **remove?**: Remove the editor after saving its content.

**Returns**  
`Promise<void>`

Inherited from [DocumentSheet.saveEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#saveeditor).

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

- **position?**: Positional data.
  - **height**: The application height in pixels.
  - **left**: The left offset position in pixels.
  - **scale**: The application scale as a numeric factor where 1.0 is default.
  - **top**: The top offset position in pixels.
  - **width**: The application width in pixels.

**Returns**

- `void` or the updated position object.

Inherited from [DocumentSheet.setPosition](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#setposition).

---

### submit

```typescript
submit(options?: object): Promise<JournalSheet>
```

Submit the contents of a Form Application, processing its content as defined by the Application.

**Parameters**

- **options?**: Options passed to the `_onSubmit` event handler. Default `{}`.

**Returns**  
`Promise<JournalSheet>`  
Return a self-reference for convenient method chaining.

Inherited from [DocumentSheet.submit](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#submit).

---

### toggleSearchMode

```typescript
toggleSearchMode(): void
```

Toggle the search mode for this journal between "name" and "full" text search.

**Returns**  
`void`

---

### toggleSidebar

```typescript
toggleSidebar(): void
```

Toggle the collapsed or expanded state of the Journal Entry table-of-contents sidebar.

**Returns**  
`void`

---

### _activateEditor

```typescript
_activateEditor(div: HTMLElement): void
```

Activate an editor instance present within the form.

**Parameters**

- **div**: The element which contains the editor.

**Returns**  
`void`

Inherited from [DocumentSheet._activateEditor](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_activateeditor).

---

### _activatePageListeners

```typescript
_activatePageListeners(): void
```

Activate listeners after page content has been injected.

**Returns**  
`void`

---

### _activatePagesInView

```typescript
_activatePagesInView(): void
```

Highlights the currently viewed page in the sidebar.

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

- **hookName**: The hook being triggered, possibly formatted with the Application class name.
- **...hookArgs**: The arguments passed to the hook calls.

**Returns**  
`void`

Inherited from [DocumentSheet._callHooks](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_callhooks).

---

### _canUserView

```typescript
_canUserView(user: User): boolean
```

Test whether a certain User has permission to view this Document Sheet.

**Parameters**

- **user**: The user requesting to render the sheet.

**Returns**  
`boolean`

Inherited from [DocumentSheet._canUserView](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_canuserview).

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

- **name**: The name of the editor.
- **options?**: Additional options to configure the plugins.
  - **remove?**: Whether the editor should destroy itself on save.

**Returns**  
`object`

Inherited from [DocumentSheet._configureProseMirrorPlugins](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_configureprosemirrorplugins).

---

### _createDocumentIdLink

```typescript
_createDocumentIdLink(html: jQuery): void
```

Create an ID link button in the document sheet header which displays the document ID and copies to clipboard.

**Parameters**

- **html**: The jQuery HTML object.

**Returns**  
`void`

Inherited from [DocumentSheet._createDocumentIdLink](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_createdocumentidlink).

---

### _createSecretHandlers

```typescript
_createSecretHandlers(): HTMLSecret[]
```

Create objects for managing the functionality of secret blocks within this Document's content.

**Returns**  
`HTMLSecret[]`

Inherited from [DocumentSheet._createSecretHandlers](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_createsecrethandlers).

---

### _disableFields

```typescript
_disableFields(form: HTMLElement): void
```

If the form is not editable, disable its input fields.

**Parameters**

- **form**: The form HTMLElement.

**Returns**  
`void`

Inherited from [DocumentSheet._disableFields](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_disablefields).

---

### _getCurrentPage

```typescript
_getCurrentPage(options?: { pageId?: string; pageIndex?: number }): number
```

Identify which page of the journal sheet should be currently rendered. This can be controlled by options passed into the render method or by a subclass override.

**Parameters**

- **options?**: Sheet rendering options. Default `{}`.
  - **pageId?**: The ID of a page to render.
  - **pageIndex?**: A numbered index of page to render.

**Returns**  
The currently displayed page index (`number`).

---

### _getEntryContextOptions

```typescript
_getEntryContextOptions(): ContextMenuEntry[]
```

Get the set of ContextMenu options which should be used for JournalEntryPages in the sidebar.

**Returns**  
`ContextMenuEntry[]` — The array of context options passed to the ContextMenu instance.

---

### _getPageData

```typescript
_getPageData(): documents.JournalEntryPage[]
```

Prepare pages for display.

**Returns**  
The sorted list of pages (`JournalEntryPage[]`).

---

### _getSecretContent

```typescript
_getSecretContent(secret: HTMLElement): string | void
```

Get the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: The secret block HTMLElement.

**Returns**  
Content string or void.

Inherited from [DocumentSheet._getSecretContent](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getsecretcontent).

---

### _getSubmitData

```typescript
_getSubmitData(updateData?: object): object
```

Get an object of update data used to update the form's target object.

**Parameters**

- **updateData?**: Additional data that should be merged with the form data. Default `{}`.

**Returns**  
The prepared update data (`object`).

Inherited from [DocumentSheet._getSubmitData](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_getsubmitdata).

---

### _observeHeadings

```typescript
_observeHeadings(): void
```

Create an intersection observer to maintain a list of headings that are in view. This is much more performant than calling `getBoundingClientRect` on all headings whenever we want to determine this list.

**Returns**  
`void`

---

### _observePages

```typescript
_observePages(): void
```

Create an intersection observer to maintain a list of pages that are in view.

**Returns**  
`void`

---

### _onAction

```typescript
_onAction(event: TriggeredEvent): any
```

Handle clicking the previous and next page buttons.

**Parameters**

- **event**: The button click event.

**Returns**  
`any`

---

### _onChangeColorPicker

```typescript
_onChangeColorPicker(event: Event): void
```

Handle the change of a color picker input which enters its chosen value into a related input field.

**Parameters**

- **event**: The color picker change event.

**Returns**  
`void`

Inherited from [DocumentSheet._onChangeColorPicker](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangecolorpicker).

---

### _onChangeInput

```typescript
_onChangeInput(event: Event): Promise<any>
```

Handle changes to an input element, submitting the form if `options.submitOnChange` is true. Do not preventDefault in this handler as other interactions on the form may also be occurring.

**Parameters**

- **event**: The initial change event.

**Returns**  
`Promise<any>`

Inherited from [DocumentSheet._onChangeInput](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangeinput).

---

### _onChangeRange

```typescript
_onChangeRange(event: Event): void
```

Handle changes to a range type input by propagating those changes to the sibling range-value element.

**Parameters**

- **event**: The initial change event.

**Returns**  
`void`

Inherited from [DocumentSheet._onChangeRange](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangerange).

---

### _onChangeTab

```typescript
_onChangeTab(event: null | MouseEvent, tabs: Tabs, active: string): void
```

Handle changes to the active tab in a configured Tabs controller.

**Parameters**

- **event**: A left click event or `null`.
- **tabs**: The Tabs controller.
- **active**: The new active tab name.

**Returns**  
`void`

Inherited from [DocumentSheet._onChangeTab](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onchangetab).

---

### _onClickImage

```typescript
_onClickImage(event: MouseEvent): void
```

Handle clicking an image to pop it out for fullscreen view.

**Parameters**

- **event**: The click event.

**Returns**  
`void`

---

### _onClickPageLink

```typescript
_onClickPageLink(event: TriggeredEvent): void
```

Handle clicking an entry in the sidebar to scroll that heading into view.

**Parameters**

- **event**: The originating click event.

**Returns**  
`void`

---

### _onConfigureSheet

```typescript
_onConfigureSheet(event: ClickEvent): void
```

Handle requests to configure the default sheet used by this Document.

**Parameters**

- **event**: The click event.

**Returns**  
`void`

Inherited from [DocumentSheet._onConfigureSheet](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onconfiguresheet).

---

### _onContextMenuClose

```typescript
_onContextMenuClose(target: HTMLElement): void
```

Handle closing the context menu.

**Parameters**

- **target**: The element the context menu has been triggered for.

**Returns**  
`void`

---

### _onContextMenuOpen

```typescript
_onContextMenuOpen(target: HTMLElement): void
```

Handle opening the context menu.

**Parameters**

- **target**: The element the context menu has been triggered for.

**Returns**  
`void`

---

### _onDragOver

```typescript
_onDragOver(event: DragEvent): void
```

Callback actions which occur when a dragged element is over a drop target.

**Parameters**

- **event**: The originating DragEvent.

**Returns**  
`void`

Inherited from [DocumentSheet._onDragOver](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_ondragover).

---

### _onEditImage

```typescript
_onEditImage(event: MouseEvent): Promise<FilePicker>
```

Handle changing a Document's image.

**Parameters**

- **event**: The click event.

**Returns**  
`Promise<FilePicker>`

Inherited from [DocumentSheet._onEditImage](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_oneditimage).

---

### _onEditPage

```typescript
_onEditPage(event: TriggeredEvent): any
```

Edit one of this JournalEntry's JournalEntryPages.

**Parameters**

- **event**: The originating page edit event.

**Returns**  
`any`

---

### _onPageScroll

```typescript
_onPageScroll(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void
```

Handle new pages scrolling into view.

**Parameters**

- **entries**: An Array of elements that have scrolled into or out of view.
- **observer**: The IntersectionObserver that invoked this callback.

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

- **event**: The submit event which triggered this handler.
- **options?**: Optional behavior configuration:
  - **preventClose?**: Override the standard behavior of whether to close the form on submit.
  - **preventRender?**: Prevent the application from re-rendering as a result of form submission.
  - **updateData?**: Additional specific data keys/values which override or extend the contents of the parsed form. This can be used to update other flags or data fields at the same time as processing a form submission to avoid multiple database operations.

**Returns**  
`Promise<any>`

Inherited from [DocumentSheet._onSubmit](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_onsubmit).

---

### _renderAppV1PageView

```typescript
_renderAppV1PageView(
    element: HTMLElement,
    sheet: JournalPageSheet,
): Promise<void>
```

Render the page view for an app v1 page sheet.

**Parameters**

- **element**: The existing page element in the journal entry view.
- **sheet**: The page sheet.

**Returns**  
`Promise<void>`

---

### _renderHeadings

```typescript
_renderHeadings(
    pageNode: HTMLElement,
    toc: Record<string, JournalEntryPageHeading>,
): Promise<void>
```

Add headings to the table of contents for the given page node.

**Parameters**

- **pageNode**: The HTML node of the page's rendered contents.
- **toc**: The page's table of contents.

**Returns**  
`Promise<void>`

---

### _renderPageView

```typescript
_renderPageView(
    element: HTMLElement,
    sheet: JournalPageSheet,
): Promise<void>
```

Render the page view for a page sheet.

**Parameters**

- **element**: The existing page element in the journal entry view.
- **sheet**: The page sheet.

**Returns**  
`Promise<void>`

---

### _renderPageViews

```typescript
_renderPageViews(): Promise<void>
```

Update child views inside the main sheet.

**Returns**  
`Promise<void>`

---

### _restoreScrollPositions

```typescript
_restoreScrollPositions(html: jQuery): void
```

Restore the scroll positions of containers within the app after re-rendering the content.

**Parameters**

- **html**: The HTML object being traversed.

**Returns**  
`void`

Inherited from [DocumentSheet._restoreScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_restorescrollpositions).

---

### _saveScrollPositions

```typescript
_saveScrollPositions(html: jQuery): void
```

Persist the scroll positions of containers within the app before re-rendering the content.

**Parameters**

- **html**: The HTML object being traversed.

**Returns**  
`void`

Inherited from [DocumentSheet._saveScrollPositions](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_savescrollpositions).

---

### _synchronizeSidebar

```typescript
_synchronizeSidebar(): void
```

If the set of active pages has changed, various elements in the sidebar will expand and collapse. For particularly long ToCs, this can leave the scroll position of the sidebar in a seemingly random state. We try to do our best to sync the sidebar scroll position with the current journal viewport.

**Returns**  
`void`

---

### _updateButtonState

```typescript
_updateButtonState(): void
```

Update the disabled state of the previous and next page buttons.

**Returns**  
`void`

---

### _updateSecret

```typescript
_updateSecret(secret: HTMLElement, content: string): void | Promise<any>
```

Update the HTML content that a given secret block is embedded in.

**Parameters**

- **secret**: The secret block.
- **content**: The new content.

**Returns**  
`void | Promise<any>` — The updated Document.

Inherited from [DocumentSheet._updateSecret](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_updatesecret).

---

### _waitForImages

```typescript
_waitForImages(): Promise<void>
```

Wait for any images present in the Application to load.

**Returns**  
A Promise that resolves when all images have loaded.

Inherited from [DocumentSheet._waitForImages](https://foundryvtt.com/api/classes/foundry.appv1.api.DocumentSheet.html#_waitforimages).

---

For more details, see the official [JournalSheet documentation](https://foundryvtt.com/api/classes/foundry.appv1.sheets.JournalSheet.html).