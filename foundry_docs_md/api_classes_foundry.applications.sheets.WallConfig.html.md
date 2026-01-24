# WallConfig

The Application responsible for configuring a single Wall document within a parent Scene.

**Mixes:**  
HandlebarsApplication

**Hierarchy:** [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.WallConfig)

- DocumentSheetV2<this>
- WallConfig

## Constructors

### constructor

```typescript
new WallConfig(options: any, ...args: any[]): WallConfig
```

**Parameters**

- **options**: `any`
- **...args**: `any[]`

**Returns** `WallConfig`

## Properties

### options

`options: Readonly<ApplicationConfiguration & DocumentSheetConfiguration>`

Application instance configuration options.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).options

### position

`position: ApplicationPosition = ...`

The current position of the application with respect to the window.document.body.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).position

### tabGroups

`tabGroups: Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
changeTab method is called. Reports the active tab for each group, with a value of null  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).tabGroups

### Static BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

### Static DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: { previewSound: (...this: any) => Promise<void> };
    classes: string[];
    form: { closeOnSubmit: boolean };
    position: { width: number };
    window: { contentClasses: string[]; icon: string };
} = ...
```

### Static emittedEvents

`emittedEvents: readonly ["render", "close", "position"] = ...`

### Static PARTS

`PARTS: { body: { template: string }; footer: { template: string } } = ...`

### Static RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

### Static TABS

`TABS: Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).classList

**Returns:** `DOMTokenList`

---

### document

```typescript
get document(): ClientDocument
```

The Document instance associated with the application  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).document

**Returns:** `ClientDocument`

---

### editTargets

```typescript
get editTargets(): ReadonlySet<WallDocument>
```

The set of Wall documents that should all be edited when changes to this config form are  
submitted.

**Returns:** `ReadonlySet<WallDocument>`

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).element

**Returns:** `HTMLElement`

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).form

**Returns:** `null | HTMLFormElement`

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).hasFrame

**Returns:** `boolean`

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in DEFAULT_OPTIONS or by defining a uniqueId during  
_initializeApplicationOptions.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).id

**Returns:** `string`

---

### isEditable

```typescript
get isEditable(): boolean
```

Is this Document sheet editable by the current User? This is governed by the editPermission  
threshold configured for the class.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).isEditable

**Returns:** `boolean`

---

### isVisible

```typescript
get isVisible(): boolean
```

Is this Document sheet visible to the current User? This is governed by the viewPermission  
threshold configured for the class.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).isVisible

**Returns:** `boolean`

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimized

**Returns:** `boolean`

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).rendered

**Returns:** `boolean`

---

### state

```typescript
get state(): number
```

The current render state of the Application.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).state

**Returns:** `number`

---

### title

```typescript
get title(): string
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).title

**Returns:** `string`

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).window

## Methods

### _canRender

```typescript
_canRender(_options: any): void
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._canRender

**Parameters**

- **_options**: `any`

**Returns:** `void`

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._configureRenderOptions

**Parameters**

- **options**: `any`

**Returns:** `void`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, void, unknown>
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._headerControlButtons

**Returns:** Generator<[ApplicationHeaderControlsEntry](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html), void, unknown>

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._initializeApplicationOptions

**Parameters**

- **options**: `any`

**Returns:** `any`

---

### _onChangeForm

```typescript
_onChangeForm(_formConfig: any, event: any): void
```

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._onChangeForm

**Parameters**

- **_formConfig**: `any`
- **event**: `any`

**Returns:** `void`

---

### _onClose

```typescript
_onClose(options: any): void
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClose

**Parameters**

- **options**: `any`

**Returns:** `void`

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onFirstRender

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns:** `Promise<void>`

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onRender

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns:** `Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(
    options: any,
): Promise<
    ApplicationRenderContext &
    {
        document: ClientDocument;
        editable: boolean;
        fields: any;
        rootId: string;
        source: any;
        user: null | documents.User;
    } &
    {
        animation: any;
        animationDirections: { label: string; value: number }[];
        animationFieldsetClass: string;
        animationTypes: Record<string, WallDoorAnimationConfig>;
        buttons: { icon: string; label: string; type: string }[];
        coordinates: string;
        doorSounds: Record<string, WallDoorSound>;
        editingMany: boolean;
        gridUnits: any;
        rootId: string;
        thresholdFields: {
            choices: any;
            disabled: boolean;
            label: any;
            name: string;
        }[];
    }
>
```

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._prepareContext

**Parameters**

- **options**: `any`

**Returns:** `Promise<ApplicationRenderContext & ... >`

---

### _prepareSubmitData

```typescript
_prepareSubmitData(
    event: any,
    form: any,
    formData: any,
    updateData: any,
): object
```

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._prepareSubmitData

**Parameters**

- **event**: `any`
- **form**: `any`
- **formData**: `any`
- **updateData**: `any`

**Returns:** `object`

---

### _processSubmitData

```typescript
_processSubmitData(
    _event: any,
    _form: any,
    submitData: any,
    options: any,
): Promise<void>
```

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._processSubmitData

**Parameters**

- **_event**: `any`
- **_form**: `any`
- **submitData**: `any`
- **options**: `any`

**Returns:** `Promise<void>`

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderFrame

**Parameters**

- **options**: `any`

**Returns:** `Promise<HTMLElement>`

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderHTML

**Parameters**

- **context**: `ApplicationRenderContext`  
  Context data for the render operation
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options which configure application rendering behavior

**Returns:** `Promise<any>`  
The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to _replaceHTML

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
See [MDN EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).addEventListener

**Parameters**

- **type**: `string`  
  The type of event being registered for
- **listener**: `EmittedEventListener`  
  The listener function called when the event occurs
- **options?**:  
  - **once?**: `boolean`  
    Should the event only be responded to once and then removed

**Returns:** `void`

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).bringToFront

**Returns:** `void`

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).changeTab

**Parameters**

- **tab**: `string`  
  The name of the tab which should become active
- **group**: `string`  
  The name of the tab group which defines the set of tabs
- **options?**:
  - **event?**: `Event`  
    An interaction event which caused the tab change, if any
  - **force?**: `boolean`  
    Force changing the tab even if the new tab is already active
  - **navElement?**: `HTMLElement`  
    An explicit navigation element being modified
  - **updatePosition?**: `boolean`  
    Update application position after changing the tab?

**Returns:** `void`

---

### close

```typescript
close(
    options?: Partial<ApplicationClosingOptions>,
): Promise<WallConfig>
```

Close the Application, removing it from the DOM.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).close

**Parameters**

- **options?**: `Partial<ApplicationClosingOptions> = {}`  
  Options which modify how the application is closed.

**Returns:** `Promise<WallConfig>`  
A Promise which resolves to the closed Application instance

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.  
See [MDN EventTarget.dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).dispatchEvent

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns:** `boolean`  
Was default behavior for the event prevented?

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).maximize

**Returns:** `Promise<void>`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimize

**Returns:** `Promise<void>`

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.  
See [MDN EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).removeEventListener

**Parameters**

- **type**: `string`  
  The type of event being removed
- **listener**: `EmittedEventListener`  
  The listener function being removed

**Returns:** `void`

---

### render

```typescript
render(
    options?: boolean | (ApplicationRenderOptions & DocumentSheetRenderOptions),
    _options?: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<WallConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).render

**Parameters**

- **options?**: `boolean | (ApplicationRenderOptions & DocumentSheetRenderOptions) = {}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.
- **_options?**: `ApplicationRenderOptions & DocumentSheetRenderOptions = {}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns:** `Promise<WallConfig>`  
A Promise which resolves to the rendered Application instance

---

### setPosition

```typescript
setPosition(
    position?: Partial<ApplicationPosition>,
): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).setPosition

**Parameters**

- **position?**: `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns:** `void | ApplicationPosition`  
The updated application position

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).submit

**Parameters**

- **submitOptions?**: `object = {}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns:** `Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

---

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).toggleControls

**Parameters**

- **expanded?**: `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value
- **options?**: `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.

  - **animate?**: `boolean`  
    Animate the controls toggling.

**Returns:** `Promise<void>`  
A Promise which resolves once the control expansion animation is complete

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._attachFrameListeners

**Returns:** `void`

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._createContextMenu

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound
- **options?**:
  - **container?**: `HTMLElement`  
    A parent HTMLElement which contains the selector target
  - **hookName?**: `string`  
    The hook name
  - **parentClassHooks?**: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns:** `null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getHeaderControls

**Returns:** `ApplicationHeaderControlsEntry[]`

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getTabsConfig

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns:** `null | ApplicationTabsConfiguration`

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._insertElement

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns:** `void`

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickAction

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a [data-action]

**Returns:** `void`

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickTab

**Parameters**

- **event**: `PointerEvent`

**Returns:** `void`

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onPosition

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns:** `void`

---

### _onRevealSecret

```typescript
_onRevealSecret(event: Event): any
```

Handle toggling the revealed state of a secret embedded in some content.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onRevealSecret

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns:** `any`

---

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onSubmitForm

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event | SubmitEvent`  
  The form submission event

**Returns:** `Promise<void>`

---

### _preClose

```typescript
_preClose(
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preClose

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns:** `Promise<void>`

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preFirstRender

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns:** `Promise<void>`

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareTabs

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns:** `Record<string, ApplicationTab>`

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prePosition

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns:** `void`

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preRender

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns:** `Promise<void>`

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
Subclasses may throw validation errors here to prevent form submission.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._processFormData

**Parameters**

- **event**: `null | SubmitEvent`  
  The originating form submission event
- **form**: `HTMLFormElement`  
  The form element that was submitted
- **formData**: `FormDataExtended`  
  Processed data for the submitted form

**Returns:** `object`  
An expanded object of processed form data

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._removeElement

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns:** `void`

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderHeaderControl

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns:** `HTMLLIElement`

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._replaceHTML

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options which configure application rendering behavior

**Returns:** `void`

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._tearDown

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns:** `void`

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: boolean): void
```

Disable or reenable all form fields in this application.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._toggleDisabled

**Parameters**

- **disabled**: `boolean`  
  Should the fields be disabled?

**Returns:** `void`

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions & DocumentSheetRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updateFrame

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options provided at render-time

**Returns:** `void`

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updatePosition

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns:** `ApplicationPosition`  
Resolved Application positioning data

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns:** Generator<typeof ApplicationV2, void, unknown>

See: [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string`  
  The CSS style rule
- **parentDimension**: `number`  
  The relevant dimension of the parent element

**Returns:** `number | void`  
The parsed style dimension in pixels

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns:** `Promise<void>`

---

[Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.applications.sheets.WallConfig.html)