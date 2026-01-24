# DocumentOwnershipConfig

A generic application for configuring permissions for various Document types.

**Mixes:**  
HandlebarsApplication

**Hierarchy:**  
`DocumentSheetV2<this>`  
→ **DocumentOwnershipConfig**

---

## Constructors

### constructor

```typescript
new DocumentOwnershipConfig(
    options: any,
    ...args: any[],
): DocumentOwnershipConfig
```

**Parameters**

- **options**: `any`
- **...args**: `any[]`

**Returns:** `DocumentOwnershipConfig`

---

## Properties

### options

`Readonly<ApplicationConfiguration & DocumentSheetConfiguration>`

Application instance configuration options.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).options_

---

### position

`ApplicationPosition = ...`

The current position of the application with respect to the window.document.body.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).position_

---

### tabGroups

`Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).tabGroups_

---

### BASE_APPLICATION (static)

`typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

---

### DEFAULT_OPTIONS (static)

```typescript
{
    classes: string[];
    form: {
        closeOnSubmit: boolean;
        handler: (
            event: Event | SubmitEvent,
            form: HTMLFormElement,
            formData: FormDataExtended,
        ) => Promise<any>;
    };
    position: { width: number };
    sheetConfig: boolean;
    template: string;
    viewPermission: 3;
    window: { contentClasses: string[]; icon: string };
} = ...
```

_Default options for the application_

---

### emittedEvents (static)

`readonly ["render", "close", "position"] = ...`

---

### PARTS (static)

```typescript
{
    footer: { template: string };
    ownership: { root: boolean; template: string };
} = ...
```

---

### RENDER_STATES (static)

`Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

---

### TABS (static)

`Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).classList_

---

### document

```typescript
get document(): ClientDocument
```

The Document instance associated with the application.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).document_

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).element_

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).form_

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).hasFrame_

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions_.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).id_

---

### isEditable

```typescript
get isEditable(): boolean
```

Is this Document sheet editable by the current User? This is governed by the editPermission  
threshold configured for the class.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).isEditable_

---

### isVisible

```typescript
get isVisible(): boolean
```

Is this Document sheet visible to the current User? This is governed by the viewPermission  
threshold configured for the class.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).isVisible_

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimized_

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).rendered_

---

### state

```typescript
get state(): number
```

The current render state of the Application.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).state_

---

### title

```typescript
get title(): string
```

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).title_

---

### window

```typescript
get window(): {
    close: HTMLButtonElement;
    content: HTMLElement;
    controls: HTMLButtonElement;
    controlsDropdown: HTMLDivElement;
    header: HTMLElement;
    icon: HTMLElement;
    onDrag: Function;
    onResize: Function;
    pointerMoveThrottle: boolean;
    pointerStartPosition: ApplicationPosition;
    resize: HTMLElement;
    title: HTMLHeadingElement;
}
```

Convenience references to window header elements.

---

## Methods

### _canRender

```typescript
_canRender(_options: any): void
```

**Parameters**

- **_options**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._canRender_

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

**Parameters**

- **options**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._configureRenderOptions_

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, void, unknown>
```

Returns a generator for header control buttons.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._headerControlButtons_

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

**Parameters**

- **options**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._initializeApplicationOptions_

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): void
```

**Parameters**

- **formConfig**: `any`
- **event**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onChangeForm_

---

### _onClose

```typescript
_onClose(options: any): void
```

**Parameters**

- **options**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClose_

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onFirstRender_

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onRender_

---

### _prepareContext

```typescript
_prepareContext(
    options: any,
): Promise<
    ApplicationRenderContext & {
        document: ClientDocument;
        editable: boolean;
        fields: any;
        rootId: string;
        source: any;
        user: null | documents.User;
    } & {
        buttons: { icon: string; label: string; type: string }[];
        currentDefault: any;
        defaultLevels: { label: string; level: -20 | -10 }[];
        instructions: string;
        isFolder: boolean;
        playerLevels: { label: string; level: -20 | -10 }[];
        showGM: boolean;
        users: any[];
    }
>
```

**Parameters**

- **options**: `any`

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._prepareContext

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

**Parameters**

- **options**: `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderFrame_

---

### _renderHTML (abstract)

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

**Parameters**

- **context**: `ApplicationRenderContext` - Context data for the render operation
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior

**Returns** `Promise<any>`

**Inherited from** HandlebarsApplicationMixin(DocumentSheetV2)._renderHTML

---

### addEventListener

```typescript
addEventListener(
    type: string,
    listener: EmittedEventListener,
    options?: { once?: boolean }
): void
```

Add a new event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being registered for
- **listener**: `EmittedEventListener`  
  The listener function called when the event occurs
- **options** (optional): `{ once?: boolean } = {}`  
  Options which configure the event listener  
  - **once**? `boolean` - Should the event only be responded to once and then removed

**Returns** `void`

**See:** [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).addEventListener_

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp.

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).bringToFront_

---

### changeTab

```typescript
changeTab(
    tab: string,
    group: string,
    options?: {
        event?: Event;
        force?: boolean;
        navElement?: HTMLElement;
        updatePosition?: boolean;
    }
): void
```

Change the active tab within a tab group in this Application instance.

**Parameters**

- **tab**: `string`  
  The name of the tab which should become active
- **group**: `string`  
  The name of the tab group which defines the set of tabs
- **options** (optional):  
  Additional options which affect tab navigation  
  - **event**? `Event` - An interaction event which caused the tab change, if any  
  - **force**? `boolean` - Force changing the tab even if the new tab is already active  
  - **navElement**? `HTMLElement` - An explicit navigation element being modified  
  - **updatePosition**? `boolean` - Update application position after changing the tab?

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).changeTab_

---

### close

```typescript
close(
    options?: Partial<ApplicationClosingOptions>,
): Promise<DocumentOwnershipConfig>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (optional): `Partial<ApplicationClosingOptions> = {}`  
  Options which modify how the application is closed.

**Returns** `Promise<DocumentOwnershipConfig>`  
A Promise which resolves to the closed Application instance

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).close_

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event` - The Event to dispatch

**Returns** `boolean` - Was default behavior for the event prevented?

**See:** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).dispatchEvent_

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns** `Promise<void>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).maximize_

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns** `Promise<void>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimize_

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being removed
- **listener**: `EmittedEventListener`  
  The listener function being removed

**Returns** `void`

**See:** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).removeEventListener_

---

### render

```typescript
render(
    options?: boolean | (ApplicationRenderOptions & DocumentSheetRenderOptions),
    _options?: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<DocumentOwnershipConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options** (optional): `boolean | (ApplicationRenderOptions & DocumentSheetRenderOptions) = {}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  `"force"` option.
- **_options** (optional): `ApplicationRenderOptions & DocumentSheetRenderOptions = {}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render  
  signature.

**Returns** `Promise<DocumentOwnershipConfig>`  
A Promise which resolves to the rendered Application instance

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).render_

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position** (optional): `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns** `void | ApplicationPosition`  
The updated application position

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).setPosition_

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions** (optional): `object = {}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns** `Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).submit_

---

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded** (optional): `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value
- **options** (optional): `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.  
  - **animate**? `boolean` - Animate the controls toggling.

**Returns** `Promise<void>`  
A Promise which resolves once the control expansion animation is complete

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2).toggleControls_

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._attachFrameListeners_

---

### _createContextMenu

```typescript
_createContextMenu(
    handler: () => ContextMenuEntry[],
    selector: string,
    options?: {
        container?: HTMLElement;
        hookName?: string;
        parentClassHooks?: boolean;
    },
): null | ContextMenu
```

Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound
- **options** (optional):  
  Additional options which affect ContextMenu construction  
  - **container**? `HTMLElement` - A parent HTMLElement which contains the selector target  
  - **hookName**? `string` - The hook name  
  - **parentClassHooks**? `boolean` - Whether to call hooks for the parent classes in the inheritance chain.

**Returns** `null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._createContextMenu_

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns** `ApplicationHeaderControlsEntry[]`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getHeaderControls_

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns** `null | ApplicationTabsConfiguration`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getTabsConfig_

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._insertElement_

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickAction_

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickTab_

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onPosition_

---

### _onRevealSecret

```typescript
_onRevealSecret(event: Event): any
```

Handle toggling the revealed state of a secret embedded in some content.

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns** `any`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onRevealSecret_

---

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event | SubmitEvent`  
  The form submission event

**Returns** `Promise<void>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onSubmitForm_

---

### _preClose

```typescript
_preClose(
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns** `Promise<void>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preClose_

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns** `Promise<void>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preFirstRender_

---

### _prepareSubmitData

```typescript
_prepareSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended,
    updateData?: object,
): object
```

Prepare data used to update the Document upon form submission. This data is cleaned and  
validated before being returned for further processing.

**Parameters**

- **event**: `SubmitEvent`  
  The originating form submission event
- **form**: `HTMLFormElement`  
  The form element that was submitted
- **formData**: `FormDataExtended`  
  Processed data for the submitted form
- **updateData** (optional): `object`  
  Additional data passed in if this form is submitted manually which should be merged with  
  prepared formData.

**Returns** `object`  
Prepared submission data as an object

**Throws**  
Subclasses may throw validation errors here to prevent form submission

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareSubmitData_

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns** `Record<string, ApplicationTab>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareTabs_

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because `setPosition` is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prePosition_

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns** `Promise<void>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preRender_

---

### _processFormData

```typescript
_processFormData(
    event: null | SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended,
): object
```

Customize how form data is extracted into an expanded object.

**Parameters**

- **event**: `null | SubmitEvent`  
  The originating form submission event
- **form**: `HTMLFormElement`  
  The form element that was submitted
- **formData**: `FormDataExtended`  
  Processed data for the submitted form

**Returns** `object`  
An expanded object of processed form data

**Throws**  
Subclasses may throw validation errors here to prevent form submission

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._processFormData_

---

### _processSubmitData

```typescript
_processSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    submitData: object,
    options?: Partial<DatabaseUpdateOperation | DatabaseCreateOperation>,
): Promise<void>
```

Submit a document update or creation request based on the processed form data.

**Parameters**

- **event**: `SubmitEvent`  
  The originating form submission event
- **form**: `HTMLFormElement`  
  The form element that was submitted
- **submitData**: `object`  
  Processed and validated form data to be used for a document update
- **options** (optional): `Partial<DatabaseUpdateOperation | DatabaseCreateOperation> = {}`  
  Additional options altering the request

**Returns** `Promise<void>`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._processSubmitData_

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._removeElement_

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns** `HTMLLIElement`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderHeaderControl_

---

### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options which configure application rendering behavior

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._replaceHTML_

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._tearDown_

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: boolean): void
```

Disable or reenable all form fields in this application.

**Parameters**

- **disabled**: `boolean`  
  Should the fields be disabled?

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._toggleDisabled_

---

### _updateFrame

```typescript
_updateFrame(
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options provided at render-time

**Returns** `void`

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updateFrame_

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns** `ApplicationPosition`  
Resolved Application positioning data

_Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updatePosition_

---

## Static Methods

### inheritanceChain

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns** `Generator<typeof ApplicationV2, void, unknown>`

**See**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string`  
  The CSS style rule
- **parentDimension**: `number`  
  The relevant dimension of the parent element

**Returns** `number | void`  
The parsed style dimension in pixels

---

### waitForImages

```typescript
waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns** `Promise<void>`

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)
- [DocumentSheetV2](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html)
- [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)
- [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)
- [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)
- [DocumentSheetRenderOptions](https://foundryvtt.com/api/interfaces/foundry.DocumentSheetRenderOptions.html)
- [ApplicationHeaderControlsEntry](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)
- [ApplicationTabsConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)
- [ApplicationTab](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTab.html)
- [ContextMenu](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)
- [FormDataExtended](https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html)
- [DatabaseUpdateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseUpdateOperation.html)
- [DatabaseCreateOperation](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DatabaseCreateOperation.html)
- [documents.User](https://foundryvtt.com/api/classes/foundry.documents.User.html)
- [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)
- [ApplicationFormConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationFormConfiguration.html)
- [ApplicationClosingOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)