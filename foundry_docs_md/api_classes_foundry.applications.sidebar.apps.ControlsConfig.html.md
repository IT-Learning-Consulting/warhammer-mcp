# ControlsConfig

View and edit keybinding and (readonly) mouse actions.

Part of [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html)  
Namespace: [foundry.applications.sidebar.apps](https://foundryvtt.com/api/modules/foundry.applications.sidebar.apps.html)  

Extends: [CategoryBrowser](https://foundryvtt.com/api/classes/foundry.applications.api.CategoryBrowser.html)

---

## Constructor

```typescript
new ControlsConfig(
    options?: Partial<
        ApplicationConfiguration & CategoryBrowserConfiguration,
    >,
): ControlsConfig
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration & CategoryBrowserConfiguration>` = `{}`  
  Options used to configure the Application instance.

**Returns**: `ControlsConfig`

---

## Properties

### options

`Readonly<ApplicationConfiguration & CategoryBrowserConfiguration>`

Application instance configuration options.

(Inherited from CategoryBrowser.options)

---

### position

`ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.

(Inherited from CategoryBrowser.position)

---

### tabGroups

`Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called.  
Reports the active tab for each group, with a value of `null` indicating no tab is active.  
Subclasses may override this property to define default tabs for each group.

(Inherited from CategoryBrowser.tabGroups)

---

### BASE_APPLICATION

`typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application.  
Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored.  
Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

(Inherited from CategoryBrowser.BASE_APPLICATION)

---

### DEFAULT_OPTIONS

```ts
{
    actions: {
        addBinding: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        cancelEdit: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        deleteBinding: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        editBinding: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        resetDefaults: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        saveBinding: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
    };
    id: string;
    position: { height: number; width: number };
    subtemplates: { category: string; sidebarFooter: string };
    window: { icon: string; resizable: boolean; title: string };
} = ...
```

Overrides CategoryBrowser.DEFAULT_OPTIONS

---

### emittedEvents

`readonly ["render", "close", "position"] = ...`

(Inherited from CategoryBrowser.emittedEvents)

---

### PARTS

```ts
{
    bindingInput: { template: string };
    main: { scrollable: string[]; template: string };
    sidebar: { scrollable: string[]; template: string };
} = ...
```

Overrides CategoryBrowser.PARTS

---

### POINTER_CONTROLS

`readonly [id: string, name: string, parts: string[], gmOnly?: boolean][] = ...`

Faux "pointer bindings" for displaying as a readonly category

---

### RENDER_STATES

`Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

(Inherited from CategoryBrowser.RENDER_STATES)

---

### TABS

`Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

(Inherited from CategoryBrowser.TABS)

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

**Returns**: `DOMTokenList`

(Inherited from CategoryBrowser.classList)

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns**: `HTMLElement`

(Inherited from CategoryBrowser.element)

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns**: `null | HTMLFormElement`

(Inherited from CategoryBrowser.form)

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns**: `boolean`

(Inherited from CategoryBrowser.hasFrame)

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance.  
This provides a readonly view into the internal ID used by this application.  
This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

**Returns**: `string`

(Inherited from CategoryBrowser.id)

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns**: `boolean`

(Inherited from CategoryBrowser.minimized)

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns**: `boolean`

(Inherited from CategoryBrowser.rendered)

---

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns**: `number`

(Inherited from CategoryBrowser.state)

---

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

**Returns**: `string`

(Inherited from CategoryBrowser.title)

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

- `close`: `HTMLButtonElement`
- `content`: `HTMLElement`
- `controls`: `HTMLButtonElement`
- `controlsDropdown`: `HTMLDivElement`
- `header`: `HTMLElement`
- `icon`: `HTMLElement`
- `onDrag`: `Function`
- `onResize`: `Function`
- `pointerMoveThrottle`: `boolean`
- `pointerStartPosition`: `ApplicationPosition`
- `resize`: `HTMLElement`
- `title`: `HTMLHeadingElement`

(Inherited from CategoryBrowser.window)

---

## Methods

### Protected Methods

---

#### _dataLoaded

```typescript
get _dataLoaded(): boolean
```

Is category and/or entry data loaded? Most subclasses will already have their data close at hand.

**Returns**: `boolean`

(Inherited from CategoryBrowser._dataLoaded)

---

#### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

Overrides CategoryBrowser._configureRenderOptions

**Parameters**

- **options**: `any`

**Returns**: `void`

---

#### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

(Inherited from CategoryBrowser._configureRenderParts)

**Parameters**

- **options**: `any`

**Returns**: `any`

---

#### _getTabsConfig

```typescript
_getTabsConfig(group: any): null | ApplicationTabsConfiguration
```

(Inherited from CategoryBrowser._getTabsConfig)

**Parameters**

- **group**: `any`

**Returns**: `null | ApplicationTabsConfiguration`

---

#### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): ApplicationConfiguration
```

(Inherited from CategoryBrowser._initializeApplicationOptions)

**Parameters**

- **options**: `any`

**Returns**: `ApplicationConfiguration`

---

#### _loadCategoryData

```typescript
_loadCategoryData(): Promise<void>
```

An optional method to make a potentially long-running request to load category data: a temporary message will be displayed until completion.

(Inherited from CategoryBrowser._loadCategoryData)

**Returns**: `Promise<void>`

---

#### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

Overrides CategoryBrowser._onFirstRender

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**: `Promise<void>`

---

#### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

(Inherited from CategoryBrowser._onRender)

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**: `Promise<void>`

---

#### _prepareContext

```typescript
_prepareContext(
    options: any,
): Promise<{
    categories: object;
    loading: null;
    packageList: boolean;
    rootId: string;
    submitButton: boolean;
    subtemplates: {
        category: string;
        filters: null | string;
        sidebarFooter: null | string;
    };
}>
```

(Inherited from CategoryBrowser._prepareContext)

**Parameters**

- **options**: `any`

**Returns**: Promise resolving to an object containing:

- `categories`: `object`
- `loading`: `null`
- `packageList`: `boolean`
- `rootId`: `string`
- `submitButton`: `boolean`
- `subtemplates`:  
  - `category`: `string`  
  - `filters`: `null | string`  
  - `sidebarFooter`: `null | string`

---

#### _renderHTML

```typescript
_ renderHTML(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<any>
```

An Application subclass **must implement** this method to be renderable.  
Render an HTMLElement for the Application.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Context data for the render operation
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Options which configure application rendering behavior

**Returns**: `Promise<any>`

The result of HTML rendering may be implementation specific. Whatever value is returned here is passed to `_replaceHTML`.

(Inherited from CategoryBrowser._renderHTML)

---

#### _tearDown

```typescript
_tearDown(options: any): void
```

(Inherited from CategoryBrowser._tearDown)

**Parameters**

- **options**: `any`

**Returns**: `void`

---

#### addEventListener

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
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs
- **options** (optional): `{ once?: boolean } = {}`  
  Options which configure the event listener  
  - **once** (optional): `boolean` — Should the event only be responded to once and then removed

**Returns**: `void`

[See MDN: addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

(Inherited from CategoryBrowser.addEventListener)

---

#### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from `_maxZ` to ApplicationV2#maxZ.  
We should also eliminate `ui.activeWindow` in favor of only ApplicationV2#frontApp.

**Returns**: `void`

(Inherited from CategoryBrowser.bringToFront)

---

#### changeTab

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
  - **event** (optional): `Event`  
    An interaction event which caused the tab change, if any
  - **force** (optional): `boolean`  
    Force changing the tab even if the new tab is already active
  - **navElement** (optional): `HTMLElement`  
    An explicit navigation element being modified
  - **updatePosition** (optional): `boolean`  
    Update application position after changing the tab?

**Returns**: `void`

(Inherited from CategoryBrowser.changeTab)

---

#### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<ControlsConfig>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (optional): `Partial<ApplicationClosingOptions> = {}`  
  Options which modify how the application is closed.

**Returns**: `Promise<ControlsConfig>`  
A Promise which resolves to the closed Application instance.

(Inherited from CategoryBrowser.close)

---

#### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns**: `boolean`  
Was default behavior for the event prevented?

[See MDN: dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

(Inherited from CategoryBrowser.dispatchEvent)

---

#### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**: `Promise<void>`

(Inherited from CategoryBrowser.maximize)

---

#### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**: `Promise<void>`

(Inherited from CategoryBrowser.minimize)

---

#### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being removed
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function being removed

**Returns**: `void`

[See MDN: removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

(Inherited from CategoryBrowser.removeEventListener)

---

#### render

```typescript
render(options: any): Promise<ControlsConfig>
```

(Inherited from CategoryBrowser.render)

**Parameters**

- **options**: `any`

**Returns**: `Promise<ControlsConfig>`

---

#### search

```typescript
search(query: string): void
```

Perform a text search without a `KeyboardEvent`.

**Parameters**

- **query**: `string`

**Returns**: `void`

(Inherited from CategoryBrowser.search)

---

#### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position** (optional): `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**: `void | ApplicationPosition`  
The updated application position.

(Inherited from CategoryBrowser.setPosition)

---

#### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters**

- **submitOptions** (optional): `object = {}`  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns**: `Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

(Inherited from CategoryBrowser.submit)

---

#### toggleControls

```typescript
toggleControls(expanded?: boolean, options?: { animate?: boolean }): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded** (optional): `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value
- **options** (optional): `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.
  - **animate** (optional): `boolean` — Animate the controls toggling.

**Returns**: `Promise<void>`  
A Promise which resolves once the control expansion animation is complete.

(Inherited from CategoryBrowser.toggleControls)

---

#### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns**: `void`

(Inherited from CategoryBrowser._attachFrameListeners)

---

#### _canRender

```typescript
_canRender(options: HandlebarsRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)

**Returns**: `false | void`  
Return false to prevent rendering.

**Throws**: An Error to display a warning message.

(Inherited from CategoryBrowser._canRender)

---

#### _createContextMenu

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
  - **container**?: `HTMLElement` — A parent HTMLElement which contains the selector target
  - **hookName**?: `string` — The hook name
  - **parentClassHooks**?: `boolean` — Whether to call hooks for the parent classes in the inheritance chain.

**Returns**: `null | ContextMenu`  
A created ContextMenu or null if no menu items were defined.

(Inherited from CategoryBrowser._createContextMenu)

---

#### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options

**Returns**: `ApplicationHeaderControlsEntry[]`

(Inherited from CategoryBrowser._getHeaderControls)

---

#### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

**Yields**: `ApplicationHeaderControlsEntry`

(Inherited from CategoryBrowser._headerControlButtons)

---

#### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns**: `void`

(Inherited from CategoryBrowser._insertElement)

---

#### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event`  
  An input change event within the form

**Returns**: `void`

(Inherited from CategoryBrowser._onChangeForm)

---

#### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses.  
Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns**: `void`

(Inherited from CategoryBrowser._onClickAction)

---

#### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns**: `void`

(Inherited from CategoryBrowser._onClickTab)

---

#### _onClose

```typescript
_onClose(options: HandlebarsRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters**

- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Provided render options

**Returns**: `void`

(Inherited from CategoryBrowser._onClose)

---

#### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**: `void`

(Inherited from CategoryBrowser._onPosition)

---

#### _onSearchFilter

```typescript
_onSearchFilter(
    event: null | KeyboardEvent,
    query: string,
    rgx: RegExp,
    content: HTMLElement,
): void
```

(Inherited from CategoryBrowser._onSearchFilter)

**Parameters**

- **event**: `null | KeyboardEvent`
- **query**: `string`
- **rgx**: `RegExp`
- **content**: `HTMLElement`

**Returns**: `void`

---

#### _onSubmitForm

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

**Returns**: `Promise<void>`

(Inherited from CategoryBrowser._onSubmitForm)

---

#### _preClose

```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close process.

**Parameters**

- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Provided render options

**Returns**: `Promise<void>`

(Inherited from CategoryBrowser._preClose)

---

#### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Prepared context data
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Provided render options

**Returns**: `Promise<void>`

(Inherited from CategoryBrowser._preFirstRender)

---

#### _prepareCategoryData

```typescript
_prepareCategoryData(): Record<
    string,
    { entries: object[]; id: string; label: string }
>
```

Overrides CategoryBrowser._prepareCategoryData

**Returns**: `Record<string, { entries: object[]; id: string; label: string }>`

---

#### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**: `Record<string, ApplicationTab>`

(Inherited from CategoryBrowser._prepareTabs)

---

#### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**: `void`

(Inherited from CategoryBrowser._prePosition)

---

#### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Prepared context data
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Provided render options

**Returns**: `Promise<void>`

(Inherited from CategoryBrowser._preRender)

---

#### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns**: `void`

(Inherited from CategoryBrowser._removeElement)

---

#### _renderFrame

```typescript
_renderFrame(options: HandlebarsRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Options which configure application rendering behavior

**Returns**: `Promise<HTMLElement>`

(Inherited from CategoryBrowser._renderFrame)

---

#### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**: `HTMLLIElement`

(Inherited from CategoryBrowser._renderHeaderControl)

---

#### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: HandlebarsRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend.  
An Application subclass should implement this method in order for the Application to be renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Options which configure application rendering behavior

**Returns**: `void`

(Inherited from CategoryBrowser._replaceHTML)

---

#### _sortCategories

```typescript
_sortCategories(
    a: { label: string; [key: string]: unknown },
    b: { label: string; [key: string]: unknown },
): number
```

Reusable logic for how categories are sorted in relation to each other.

**Parameters**

- **a**: `{ label: string; [key: string]: unknown }`
- **b**: `{ label: string; [key: string]: unknown }`

**Returns**: `number`

(Inherited from CategoryBrowser._sortCategories)

---

#### _updateFrame

```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
  Options provided at render-time

**Returns**: `void`

(Inherited from CategoryBrowser._updateFrame)

---

#### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position update into a resolved allowed position for the Application.  
Subclasses may override this method to implement more advanced positioning behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns**: `ApplicationPosition`  
Resolved Application positioning data

(Inherited from CategoryBrowser._updatePosition)

---

## Static Methods

---

### humanizeBinding

```typescript
static humanizeBinding(binding: KeybindingActionBinding): string
```

Transform an action binding into a human-readable string representation.

**Parameters**

- **binding**: [KeybindingActionBinding](https://foundryvtt.com/api/interfaces/foundry.types.KeybindingActionBinding.html)

**Returns**: `string`

---

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application.  
The chain includes this Application itself and all parents until the base application is encountered.

**Returns**: `Generator<typeof ApplicationV2, void, unknown>`

[See ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

(Inherited from CategoryBrowser.inheritanceChain)

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

**Returns**: `number | void`  
The parsed style dimension in pixels

(Inherited from CategoryBrowser.parseCSSDimension)

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`

**Returns**: `Promise<void>`

(Inherited from CategoryBrowser.waitForImages)