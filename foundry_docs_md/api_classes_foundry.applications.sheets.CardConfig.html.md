# CardConfig

A DocumentSheet application responsible for displaying and editing a single embedded Card document.

**Mixes:**  
HandlebarsApplication

**Hierarchy:**  
[DocumentSheetV2<this>](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html)  
→ **CardConfig**

---

## Constructors

### constructor

```typescript
new CardConfig(options: any, ...args: any[]): CardConfig
```

**Parameters:**

- **options**: `any`  
- **...args**: `any[]`

---

## Properties

### options

`options: Readonly<ApplicationConfiguration & DocumentSheetConfiguration>`

Application instance configuration options.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).options](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#options)

### position

`position: ApplicationPosition = ...`

The current position of the application with respect to the window.document.body.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).position](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#position)

### tabGroups

`tabGroups: Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
changeTab method is called. Reports the active tab for each group, with a value of null  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).tabGroups](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#tabGroups)

---

## Static Properties

### BASE_APPLICATION

```typescript
static BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

[ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)

### DEFAULT_OPTIONS

```typescript
static DEFAULT_OPTIONS = {
  actions: {
    addFace: (
      event: PointerEvent,
      target: HTMLElement,
    ) => void | Promise<void>;
    deleteFace: (
      event: PointerEvent,
      target: HTMLElement,
    ) => void | Promise<void>;
  };
  classes: string[];
  form: { closeOnSubmit: boolean };
  position: { width: number };
  window: { contentClasses: string[]; icon: string };
}
```

### emittedEvents

```typescript
static readonly emittedEvents: readonly ["render", "close", "position"] = ...
```

### PARTS

```typescript
static PARTS = {
  back: { template: string };
  details: { template: string };
  faces: { scrollable: string[]; template: string };
  footer: { template: string };
  header: { template: string };
  tabs: { template: string };
}
```

### RENDER_STATES

```typescript
static RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

### TABS

```typescript
static TABS = {
  sheet: {
    initial: string;
    labelPrefix: string;
    tabs: { icon: string; id: string }[];
  };
}
```

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).classList](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#classList)

### document

```typescript
get document(): ClientDocument
```

The Document instance associated with the application.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).document](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#document)

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).element](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#element)

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).form](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#form)

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).hasFrame](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#hasFrame)

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in DEFAULT_OPTIONS or by defining a uniqueId during  
_initializeApplicationOptions.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).id](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#id)

### isEditable

```typescript
get isEditable(): boolean
```

Is this Document sheet editable by the current User? This is governed by the editPermission  
threshold configured for the class.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).isEditable](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#isEditable)

### isVisible

```typescript
get isVisible(): boolean
```

Is this Document sheet visible to the current User? This is governed by the viewPermission  
threshold configured for the class.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).isVisible](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#isVisible)

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).minimized](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#minimized)

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).rendered](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#rendered)

### state

```typescript
get state(): number
```

The current render state of the Application.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).state](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#state)

### title

```typescript
get title(): string
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).title](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#title)

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

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).window](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#window)

### TYPES

```typescript
get TYPES(): Record<string, string>
```

Card types with pre-localized labels.

---

## Methods

### _canRender

```typescript
_canRender(_options: any): void
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._canRender](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_canRender)

**Parameters:**

- **_options**: `any`

Returns: `void`

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._configureRenderOptions](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_configureRenderOptions)

**Parameters:**

- **options**: `any`

Returns: `void`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, void, unknown>
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._headerControlButtons](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_headerControlButtons)

Returns: `Generator<ApplicationHeaderControlsEntry, void, unknown>`

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._initializeApplicationOptions](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_initializeApplicationOptions)

**Parameters:**

- **options**: `any`

Returns: `any`

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): any
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onChangeForm](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onChangeForm)

**Parameters:**

- **formConfig**: `any`  
- **event**: `any`

Returns: `any`

---

### _onClose

```typescript
_onClose(options: any): void
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onClose](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onClose)

**Parameters:**

- **options**: `any`

Returns: `void`

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onFirstRender](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onFirstRender)

**Parameters:**

- **context**: `any`  
- **options**: `any`

Returns: `Promise<void>`

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onRender](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onRender)

**Parameters:**

- **context**: `any`  
- **options**: `any`

Returns: `Promise<void>`

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

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._prepareContext](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_prepareContext)

**Parameters:**

- **options**: `any`

Returns: Promise resolving to an object extending ApplicationRenderContext containing fields such as `document`, `editable`, `fields`, `rootId`, `source`, and `user`.

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._preparePartContext](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_preparePartContext)

**Parameters:**

- **partId**: `any`  
- **context**: `any`  
- **options**: `any`

Returns: `Promise<any>`

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._renderFrame](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_renderFrame)

**Parameters:**

- **options**: `any`

Returns: `Promise<HTMLElement>`

---

### _renderHTML (Abstract)

```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

**Parameters:**

- **context**: `ApplicationRenderContext` - Context data for the render operation  
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior

Returns: `Promise<any>`

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

**Parameters:**

- **type**: `string` - The type of event being registered for  
- **listener**: `EmittedEventListener` - The listener function called when the event occurs  
- **options?**:  
  - **once?** `boolean` - Should the event only be responded to once and then removed

Returns: `void`

See [MDN EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).addEventListener](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#addEventListener)

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).bringToFront](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#bringToFront)

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

**Parameters:**

- **tab**: `string` - The name of the tab which should become active  
- **group**: `string` - The name of the tab group which defines the set of tabs  
- **options?**:  
  - **event?** `Event` - An interaction event which caused the tab change, if any  
  - **force?** `boolean` - Force changing the tab even if the new tab is already active  
  - **navElement?** `HTMLElement` - An explicit navigation element being modified  
  - **updatePosition?** `boolean` - Update application position after changing the tab?

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).changeTab](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#changeTab)

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<CardConfig>
```

Close the Application, removing it from the DOM.

**Parameters:**

- **options?**: `Partial<ApplicationClosingOptions>` - Options which modify how the application is closed.

Returns: `Promise<CardConfig>` - A Promise which resolves to the closed Application instance.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).close](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#close)

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters:**

- **event**: `Event` - The Event to dispatch

Returns: `boolean` - Was default behavior for the event prevented?

See [MDN EventTarget.dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).dispatchEvent](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#dispatchEvent)

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

Returns: `Promise<void>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).maximize](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#maximize)

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

Returns: `Promise<void>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).minimize](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#minimize)

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters:**

- **type**: `string` - The type of event being removed  
- **listener**: `EmittedEventListener` - The listener function being removed

Returns: `void`

See [MDN EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).removeEventListener](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#removeEventListener)

---

### render

```typescript
render(
  options?: boolean | ApplicationRenderOptions & DocumentSheetRenderOptions,
  _options?: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<CardConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters:**

- **options?**: `boolean | ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior. A boolean is interpreted as the "force" option.  
- **_options?**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

Returns: `Promise<CardConfig>` - A Promise which resolves to the rendered Application instance.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).render](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#render)

---

### setPosition

```typescript
setPosition(
  position?: Partial<ApplicationPosition>
): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters:**

- **position?**: `Partial<ApplicationPosition>` - New Application positioning data

Returns: `void | ApplicationPosition` - The updated application position.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).setPosition](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#setPosition)

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters:**

- **submitOptions?**: `object` - Arbitrary options which are supported by and provided to the configured form submission handler.

Returns: `Promise<any>` - A promise that resolves to the returned result of the form submission handler, if any.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).submit](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#submit)

---

### toggleControls

```typescript
toggleControls(
  expanded?: boolean,
  options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters:**

- **expanded?**: `boolean` - Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value  
- **options?**:  
  - **animate?** `boolean` - Animate the controls toggling

Returns: `Promise<void>` - A Promise which resolves once the control expansion animation is complete.

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2).toggleControls](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#toggleControls)

---

### _attachFrameListeners

```typescript
protected _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._attachFrameListeners](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_attachFrameListeners)

---

### _createContextMenu

```typescript
protected _createContextMenu(
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

**Parameters:**

- **handler**: `() => ContextMenuEntry[]` - A handler function that provides initial context options  
- **selector**: `string` - A CSS selector to which the ContextMenu will be bound  
- **options?**:  
  - **container?** `HTMLElement` - A parent HTMLElement which contains the selector target  
  - **hookName?** `string` - The hook name  
  - **parentClassHooks?** `boolean` - Whether to call hooks for the parent classes in the inheritance chain.

Returns: `null` or a created [ContextMenu](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._createContextMenu](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_createContextMenu)

---

### _getHeaderControls

```typescript
protected _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

Returns: `ApplicationHeaderControlsEntry[]`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._getHeaderControls](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_getHeaderControls)

---

### _getTabsConfig

```typescript
protected _getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters:**

- **group**: `string` - The ID of a tabs group

Returns: `null | ApplicationTabsConfiguration`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._getTabsConfig](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_getTabsConfig)

---

### _insertElement

```typescript
protected _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters:**

- **element**: `HTMLElement` - The element to insert

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._insertElement](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_insertElement)

---

### _onClickAction

```typescript
protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters:**

- **event**: `PointerEvent` - The originating click event  
- **target**: `HTMLElement` - The capturing HTML element which defined a [data-action]

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onClickAction](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onClickAction)

---

### _onClickTab

```typescript
protected _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters:**

- **event**: `PointerEvent`

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onClickTab](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onClickTab)

---

### _onPosition

```typescript
protected _onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters:**

- **position**: `ApplicationPosition` - The requested application position

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onPosition](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onPosition)

---

### _onRevealSecret

```typescript
protected _onRevealSecret(event: Event): any
```

Handle toggling the revealed state of a secret embedded in some content.

**Parameters:**

- **event**: `Event` - The triggering event.

Returns: `any`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onRevealSecret](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onRevealSecret)

---

### _onSubmitForm

```typescript
protected _onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

**Parameters:**

- **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound  
- **event**: `Event | SubmitEvent` - The form submission event

Returns: `Promise<void>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._onSubmitForm](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_onSubmitForm)

---

### _preClose

```typescript
protected _preClose(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters:**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

Returns: `Promise<void>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._preClose](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_preClose)

---

### _preFirstRender

```typescript
protected _preFirstRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters:**

- **context**: `ApplicationRenderContext` - Prepared context data  
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

Returns: `Promise<void>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._preFirstRender](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_preFirstRender)

---

### _prepareSubmitData

```typescript
protected _prepareSubmitData(
  event: SubmitEvent,
  form: HTMLFormElement,
  formData: FormDataExtended,
  updateData?: object,
): object
```

Prepare data used to update the Document upon form submission. This data is cleaned and  
validated before being returned for further processing.

**Parameters:**

- **event**: `SubmitEvent` - The originating form submission event  
- **form**: `HTMLFormElement` - The form element that was submitted  
- **formData**: `FormDataExtended` - Processed data for the submitted form  
- **updateData?**: `object` - Additional data passed in if this form is submitted manually which should be merged with prepared formData.

Returns: `object` - Prepared submission data as an object

Throws: Subclasses may throw validation errors here to prevent form submission

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._prepareSubmitData](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_prepareSubmitData)

---

### _prepareTabs

```typescript
protected _prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters:**

- **group**: `string` - The ID of the tab group to prepare

Returns: `Record<string, ApplicationTab>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._prepareTabs](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_prepareTabs)

---

### _prePosition

```typescript
protected _prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters:**

- **position**: `ApplicationPosition` - The requested application position

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._prePosition](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_prePosition)

---

### _preRender

```typescript
protected _preRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

**Parameters:**

- **context**: `ApplicationRenderContext` - Prepared context data  
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

Returns: `Promise<void>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._preRender](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_preRender)

---

### _processFormData

```typescript
protected _processFormData(
  event: null | SubmitEvent,
  form: HTMLFormElement,
  formData: FormDataExtended,
): object
```

Customize how form data is extracted into an expanded object.

**Parameters:**

- **event**: `null | SubmitEvent` - The originating form submission event  
- **form**: `HTMLFormElement` - The form element that was submitted  
- **formData**: `FormDataExtended`

Returns: `object` - An expanded object of processed form data

Throws: Subclasses may throw validation errors here to prevent form submission

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._processFormData](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_processFormData)

---

### _processSubmitData

```typescript
protected _processSubmitData(
  event: SubmitEvent,
  form: HTMLFormElement,
  submitData: object,
  options?: Partial<DatabaseUpdateOperation | DatabaseCreateOperation>,
): Promise<void>
```

Submit a document update or creation request based on the processed form data.

**Parameters:**

- **event**: `SubmitEvent` - The originating form submission event  
- **form**: `HTMLFormElement` - The form element that was submitted  
- **submitData**: `object` - Processed and validated form data to be used for a document update  
- **options?**: `Partial<DatabaseUpdateOperation | DatabaseCreateOperation>` - Additional options altering the request

Returns: `Promise<void>`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._processSubmitData](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_processSubmitData)

---

### _removeElement

```typescript
protected _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters:**

- **element**: `HTMLElement` - The element to be removed

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._removeElement](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_removeElement)

---

### _renderHeaderControl

```typescript
protected _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters:**

- **control**: `ApplicationHeaderControlsEntry`

Returns: `HTMLLIElement`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._renderHeaderControl](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_renderHeaderControl)

---

### _replaceHTML

```typescript
protected _replaceHTML(
  result: any,
  content: HTMLElement,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters:**

- **result**: `any` - The result returned by the application rendering backend  
- **content**: `HTMLElement` - The content element into which the rendered result must be inserted  
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior.

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._replaceHTML](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_replaceHTML)

---

### _tearDown

```typescript
protected _tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters:**

- **options**: `ApplicationClosingOptions`

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._tearDown](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_tearDown)

---

### _toggleDisabled

```typescript
protected _toggleDisabled(disabled: boolean): void
```

Disable or reenable all form fields in this application.

**Parameters:**

- **disabled**: `boolean` - Should the fields be disabled?

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_toggleDisabled)

---

### _updateFrame

```typescript
protected _updateFrame(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters:**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options provided at render-time

Returns: `void`

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._updateFrame](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_updateFrame)

---

### _updatePosition

```typescript
protected _updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters:**

- **position**: `ApplicationPosition` - Requested Application positioning data

Returns: `ApplicationPosition` - Resolved Application positioning data

Inherited from [HandlebarsApplicationMixin(DocumentSheetV2)._updatePosition](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html#_updatePosition)

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

Returns: `Generator<typeof ApplicationV2, void, unknown>`

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters:**

- **style**: `string` - The CSS style rule  
- **parentDimension**: `number` - The relevant dimension of the parent element

Returns: `number | void` - The parsed style dimension in pixels

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters:**

- **element**: `HTMLElement` - The element.

Returns: `Promise<void>`

---

For more details, visit [Foundry Virtual Tabletop API Documentation - CardConfig](https://foundryvtt.com/api/classes/foundry.applications.sheets.CardConfig.html).