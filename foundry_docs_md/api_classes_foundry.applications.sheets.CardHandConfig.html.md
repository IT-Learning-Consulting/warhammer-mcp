# CardHandConfig | Foundry Virtual Tabletop - API Documentation - Version 13

A `CardsConfig` subclass providing a sheet representation for Cards documents with the `"hand"` type.

## Hierarchy

- [CardsConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.CardsConfig.html)
- **CardHandConfig**

---

## Constructors

### constructor

```typescript
new CardHandConfig(options: any, ...args: any[]): CardHandConfig
```

**Parameters**

- **options**: `any`  
  Application instance configuration options.

- **...args**: `any[]`

**Returns**  
`CardHandConfig`

**Inheritance**  
Inherited from CardsConfig.constructor

---

## Properties

### options

```typescript
options: Readonly<ApplicationConfiguration & DocumentSheetConfiguration>
```

Application instance configuration options.

Inherited from CardsConfig.options

---

### position

```typescript
position: ApplicationPosition = ...
```

The current position of the application with respect to the `window.document.body`.

Inherited from CardsConfig.position

---

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.

Inherited from CardsConfig.tabGroups

---

### Static Properties

#### BASE_APPLICATION

```typescript
BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

Inherited from CardsConfig.BASE_APPLICATION

---

#### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
  actions: {
    draw: (
      event: PointerEvent,
      target: HTMLElement,
    ) => void | Promise<void>;
  };
} = ...
```

Overrides CardsConfig.DEFAULT_OPTIONS

---

#### emittedEvents

```typescript
emittedEvents: readonly ["render", "close", "position"] = ...
```

Inherited from CardsConfig.emittedEvents

---

#### PARTS

```typescript
PARTS: {
  cards: {
    root: boolean;
    scrollable: string[];
    template: string;
  };
  footer: {
    template: string;
  };
} = ...
```

---

#### RENDER_STATES

```typescript
RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

Inherited from CardsConfig.RENDER_STATES

---

#### TABS

```typescript
TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

Inherited from CardsConfig.TABS

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

**Returns**  
`DOMTokenList`

Inherited from CardsConfig.classList

---

### document

```typescript
get document(): ClientDocument
```

The Document instance associated with the application.

**Returns**  
`ClientDocument`

Inherited from CardsConfig.document

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns**  
`HTMLElement`

Inherited from CardsConfig.element

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns**  
`null | HTMLFormElement`

Inherited from CardsConfig.form

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns**  
`boolean`

Inherited from CardsConfig.hasFrame

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

**Returns**  
`string`

Inherited from CardsConfig.id

---

### isEditable

```typescript
get isEditable(): boolean
```

Is this Document sheet editable by the current User? This is governed by the editPermission threshold configured for the class.

**Returns**  
`boolean`

Inherited from CardsConfig.isEditable

---

### isVisible

```typescript
get isVisible(): boolean
```

Is this Document sheet visible to the current User? This is governed by the viewPermission threshold configured for the class.

**Returns**  
`boolean`

Inherited from CardsConfig.isVisible

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns**  
`boolean`

Inherited from CardsConfig.minimized

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns**  
`boolean`

Inherited from CardsConfig.rendered

---

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns**  
`number`

Inherited from CardsConfig.state

---

### title

```typescript
get title(): string
```

**Returns**  
`string`

Inherited from CardsConfig.title

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

**Returns**  
- **close**: `HTMLButtonElement`  
- **content**: `HTMLElement`  
- **controls**: `HTMLButtonElement`  
- **controlsDropdown**: `HTMLDivElement`  
- **header**: `HTMLElement`  
- **icon**: `HTMLElement`  
- **onDrag**: `Function`  
- **onResize**: `Function`  
- **pointerMoveThrottle**: `boolean`  
- **pointerStartPosition**: [`ApplicationPosition`](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
- **resize**: `HTMLElement`  
- **title**: `HTMLHeadingElement`

Inherited from CardsConfig.window

---

## Methods

### _canRender

```typescript
_canRender(_options: any): void
```

**Parameters**

- **_options**: `any`

**Returns**  
`void`

Inherited from CardsConfig._canRender

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

Inherited from CardsConfig._configureRenderOptions

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, void, unknown>
```

**Returns**  
`Generator<ApplicationHeaderControlsEntry, void, unknown>`

Inherited from CardsConfig._headerControlButtons

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**  
`any`

Inherited from CardsConfig._initializeApplicationOptions

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): any
```

**Parameters**

- **formConfig**: `any`  
- **event**: `any`

**Returns**  
`any`

Inherited from CardsConfig._onChangeForm

---

### _onClose

```typescript
_onClose(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

Inherited from CardsConfig._onClose

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

Inherited from CardsConfig._onFirstRender

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

Inherited from CardsConfig._onRender

---

### _prepareButtons

```typescript
_prepareButtons(): FormFooterButton[]
```

**Returns**  
`FormFooterButton[]`

Overrides CardsConfig._prepareButtons

---

### _prepareContext

```typescript
_prepareContext(
  options: any,
): Promise<ApplicationRenderContext & {
  document: ClientDocument;
  editable: boolean;
  fields: any;
  rootId: string;
  source: any;
  user: null | documents.User;
}>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<ApplicationRenderContext & {...}>`

Inherited from CardsConfig._prepareContext

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

**Parameters**

- **partId**: `any`  
- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<any>`

Inherited from CardsConfig._preparePartContext

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<HTMLElement>`

Inherited from CardsConfig._renderFrame

---

### _renderHTML (Abstract)

```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters**

- **context**: [`ApplicationRenderContext`](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- **options**: [`ApplicationRenderOptions`](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html) & [`DocumentSheetRenderOptions`](https://foundryvtt.com/api/interfaces/foundry.DocumentSheetRenderOptions.html)

**Returns**  
`Promise<any>`

Inherited from CardsConfig._renderHTML

---

### addEventListener

```typescript
addEventListener(
  type: string,
  listener: EmittedEventListener,
  options?: { once?: boolean },
): void
```

Add a new event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being registered for

- **listener**: [`EmittedEventListener`](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs

- **options** (optional): `{ once?: boolean } = {}`  
  Options which configure the event listener

  - **once**? `boolean`  
    Should the event only be responded to once and then removed

**Returns**  
`void`

**See**  
[MDN: EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from CardsConfig.addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index. Once ApplicationV1 is deprecated we should switch from `_maxZ` to `ApplicationV2#maxZ`. We should also eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

**Returns**  
`void`

Inherited from CardsConfig.bringToFront

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
  },
): void
```

Change the active tab within a tab group in this Application instance.

**Parameters**

- **tab**: `string`  
  The name of the tab which should become active

- **group**: `string`  
  The name of the tab group which defines the set of tabs

- **options** (optional):

  - **event**?: `Event`  
    An interaction event which caused the tab change, if any

  - **force**?: `boolean`  
    Force changing the tab even if the new tab is already active

  - **navElement**?: `HTMLElement`  
    An explicit navigation element being modified

  - **updatePosition**?: `boolean`  
    Update application position after changing the tab?

**Returns**  
`void`

Inherited from CardsConfig.changeTab

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<CardHandConfig>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (optional): `Partial<ApplicationClosingOptions> = {}`  
  Options which modify how the application is closed.

**Returns**  
A Promise which resolves to the closed Application instance.

Inherited from CardsConfig.close

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns**  
`boolean` indicating if default behavior for the event was prevented.

**See**  
[MDN: EventTarget.dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from CardsConfig.dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from CardsConfig.maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from CardsConfig.minimize

---

### removeEventListener

```typescript
removeEventListener(
  type: string,
  listener: EmittedEventListener,
): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being removed

- **listener**: [`EmittedEventListener`](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function being removed

**Returns**  
`void`

**See**  
[MDN: EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from CardsConfig.removeEventListener

---

### render

```typescript
render(
  options?: boolean | (ApplicationRenderOptions & DocumentSheetRenderOptions),
  _options?: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<CardHandConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options** (optional): `boolean` | `ApplicationRenderOptions & DocumentSheetRenderOptions = {}`  
  Options which configure application rendering behavior. A boolean is interpreted as the `"force"` option.

- **_options** (optional): `ApplicationRenderOptions & DocumentSheetRenderOptions = {}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns**  
A Promise which resolves to the rendered Application instance.

Inherited from CardsConfig.render

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position** (optional): `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**  
`void | ApplicationPosition`  
The updated application position.

Inherited from CardsConfig.setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters**

- **submitOptions** (optional): `object = {}`  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns**  
A promise that resolves to the returned result of the form submission handler, if any.

Inherited from CardsConfig.submit

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
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.

- **options** (optional): `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.

  - **animate**? `boolean`  
    Animate the controls toggling.

**Returns**  
A Promise which resolves once the control expansion animation is complete.

Inherited from CardsConfig.toggleControls

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Protected: Attach event listeners to the Application frame.

**Returns**  
`void`

Inherited from CardsConfig._attachFrameListeners

---

### _createContextMenu

```typescript
_createContextMenu(
  handler: () => ContextMenuEntry[],
  selector: string,
  options?: { container?: HTMLElement; hookName?: string; parentClassHooks?: boolean },
): null | ContextMenu
```

Protected: Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options.

- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound.

- **options** (optional):

  - **container**?: `HTMLElement`  
    A parent HTMLElement which contains the selector target.

  - **hookName**?: `string`  
    The hook name.

  - **parentClassHooks**?: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null` | [`ContextMenu`](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)  
A created ContextMenu or null if no menu items were defined.

Inherited from CardsConfig._createContextMenu

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Protected: Configure the array of header control menu options.

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from CardsConfig._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Protected: Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group.

**Returns**  
`null | ApplicationTabsConfiguration`

Inherited from CardsConfig._getTabsConfig

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Protected: Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert.

**Returns**  
`void`

Inherited from CardsConfig._insertElement

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

Protected: A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event.

- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`.

**Returns**  
`void`

Inherited from CardsConfig._onClickAction

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Protected: Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

Inherited from CardsConfig._onClickTab

---

### _onDragOver

```typescript
_onDragOver(event: DragEvent): Promise<void>
```

Protected: The `"dragover"` event handler for individual cards.

**Parameters**

- **event**: `DragEvent`

**Returns**  
`Promise<void>`

Inherited from CardsConfig._onDragOver

---

### _onDragStart

```typescript
_onDragStart(event: DragEvent): Promise<void>
```

Protected: The `"dragstart"` event handler for individual cards.

**Parameters**

- **event**: `DragEvent`

**Returns**  
`Promise<void>`

Inherited from CardsConfig._onDragStart

---

### _onDrop

```typescript
_onDrop(event: DragEvent): Promise<any>
```

Protected: The `"dragdrop"` event handler for individual cards.

**Parameters**

- **event**: `DragEvent`

**Returns**  
`Promise<any>`

Inherited from CardsConfig._onDrop

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Protected: Actions performed after the Application is re-positioned.

**Parameters**

- **position**: [`ApplicationPosition`](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
  The requested application position.

**Returns**  
`void`

Inherited from CardsConfig._onPosition

---

### _onRevealSecret

```typescript
_onRevealSecret(event: Event): any
```

Protected: Handle toggling the revealed state of a secret embedded in some content.

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns**  
`any`

Inherited from CardsConfig._onRevealSecret

---

### _onSubmitForm

```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```

Protected: Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound.

- **event**: `Event | SubmitEvent`  
  The form submission event.

**Returns**  
`Promise<void>`

Inherited from CardsConfig._onSubmitForm

---

### _preClose

```typescript
_preClose(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Protected: Actions performed before closing the Application. Pre-close steps are awaited by the close process.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options.

**Returns**  
`Promise<void>`

Inherited from CardsConfig._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Protected: Actions performed before a first render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data.

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options.

**Returns**  
`Promise<void>`

Inherited from CardsConfig._preFirstRender

---

### _prepareCards

```typescript
_prepareCards(sortMode?: "standard" | "shuffled"): Card[]
```

Protected: Prepare a sorted array of cards for display in the sheet.

**Parameters**

- **sortMode** (optional): `"standard" | "shuffled" = ...`

**Returns**  
`Card[]`

Inherited from CardsConfig._prepareCards

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

Protected: Prepare data used to update the Document upon form submission. This data is cleaned and validated before being returned for further processing.

**Parameters**

- **event**: `SubmitEvent`  
  The originating form submission event.

- **form**: `HTMLFormElement`  
  The form element that was submitted.

- **formData**: [`FormDataExtended`](https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html)  
  Processed data for the submitted form.

- **updateData** (optional): `object`  
  Additional data passed in if this form is submitted manually which should be merged with prepared formData.

**Returns**  
`object`  
Prepared submission data as an object.

**Throws**  
Subclasses may throw validation errors here to prevent form submission.

Inherited from CardsConfig._prepareSubmitData

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Protected: Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare.

**Returns**  
`Record<string, ApplicationTab>`

Inherited from CardsConfig._prepareTabs

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Protected: Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position.

**Returns**  
`void`

Inherited from CardsConfig._prePosition

---

### _preRender

```typescript
_preRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Protected: Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data.

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options.

**Returns**  
`Promise<void>`

Inherited from CardsConfig._preRender

---

### _processFormData

```typescript
_processFormData(
  event: null | SubmitEvent,
  form: HTMLFormElement,
  formData: FormDataExtended,
): object
```

Protected: Customize how form data is extracted into an expanded object.

**Parameters**

- **event**: `null | SubmitEvent`  
  The originating form submission event.

- **form**: `HTMLFormElement`  
  The form element that was submitted.

- **formData**: [`FormDataExtended`](https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html)  
  Processed data for the submitted form.

**Returns**  
An expanded object of processed form data.

**Throws**  
Subclasses may throw validation errors here to prevent form submission.

Inherited from CardsConfig._processFormData

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

Protected: Submit a document update or creation request based on the processed form data.

**Parameters**

- **event**: `SubmitEvent`  
  The originating form submission event.

- **form**: `HTMLFormElement`  
  The form element that was submitted.

- **submitData**: `object`  
  Processed and validated form data to be used for a document update.

- **options** (optional): `Partial<DatabaseUpdateOperation | DatabaseCreateOperation> = {}`  
  Additional options altering the request.

**Returns**  
`Promise<void>`

Inherited from CardsConfig._processSubmitData

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Protected: Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed.

**Returns**  
`void`

Inherited from CardsConfig._removeElement

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Protected: Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**  
`HTMLLIElement`

Inherited from CardsConfig._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

Protected: Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend.

- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted.

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options which configure application rendering behavior.

**Returns**  
`void`

Inherited from CardsConfig._replaceHTML

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Protected: Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**  
`void`

Inherited from CardsConfig._tearDown

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: boolean): void
```

Protected: Disable or reenable all form fields in this application.

**Parameters**

- **disabled**: `boolean`  
  Should the fields be disabled?

**Returns**  
`void`

Inherited from CardsConfig._toggleDisabled

---

### _updateFrame

```typescript
_updateFrame(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

Protected: When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options provided at render-time.

**Returns**  
`void`

Inherited from CardsConfig._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Protected: Translate a requested application position update into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data.

**Returns**  
`ApplicationPosition`  
Resolved Application positioning data.

Inherited from CardsConfig._updatePosition

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

Inherited from CardsConfig.inheritanceChain

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string`  
  The CSS style rule.

- **parentDimension**: `number`  
  The relevant dimension of the parent element.

**Returns**  
`number | void`  
The parsed style dimension in pixels.

Inherited from CardsConfig.parseCSSDimension

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns**  
`Promise<void>`

Inherited from CardsConfig.waitForImages

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)