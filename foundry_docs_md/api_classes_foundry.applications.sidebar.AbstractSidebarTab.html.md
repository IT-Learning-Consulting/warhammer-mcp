# AbstractSidebarTab

The sidebar tab interface that allows any sidebar tab to also be rendered as a popout.

## Type Parameters

- **Configuration** = [ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html)
- **RenderOptions** = [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sidebar.AbstractSidebarTab), Expand

- [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)
- **AbstractSidebarTab**
- [ChatLog](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ChatLog.html)
- [CombatTracker](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CombatTracker.html)
- [CompendiumDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CompendiumDirectory.html)
- [Settings](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.Settings.html)
- [DocumentDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html)

---

## Constructors

### constructor

```typescript
new AbstractSidebarTab<
    Configuration extends ApplicationConfiguration = ApplicationConfiguration,
    RenderOptions extends ApplicationRenderOptions = ApplicationRenderOptions,
>(
    options?: Partial<Configuration>,
): AbstractSidebarTab<Configuration, RenderOptions>
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options** (Optional): `Partial<Configuration>` = {}  
  Options used to configure the Application instance.

**Returns**  
`AbstractSidebarTab<Configuration, RenderOptions>`

Inherited from ApplicationV2.constructor

---

## Properties

### options

```typescript
options: Readonly<Configuration>
```

Application instance configuration options.

Inherited from ApplicationV2.options

---

### position

```typescript
position: ApplicationPosition = ...
```

The current position of the application with respect to the window.document.body.

Inherited from ApplicationV2.position

---

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
changeTab method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from ApplicationV2.tabGroups

---

### BASE_APPLICATION

```typescript
BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

Inherited from ApplicationV2.BASE_APPLICATION

---

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    classes: string[];
    tag: string;
    window: { frame: boolean; positioned: boolean; };
} = ...
```

Overrides ApplicationV2.DEFAULT_OPTIONS

---

### emittedEvents

```typescript
emittedEvents: readonly [
    "render",
    "close",
    "position",
    "activate",
    "deactivate",
] = ...
```

Overrides ApplicationV2.emittedEvents

---

### RENDER_STATES

```typescript
RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

Inherited from ApplicationV2.RENDER_STATES

---

### tabName

```typescript
tabName: string
```

The base name of the sidebar tab.

---

### TABS

```typescript
TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

Inherited from ApplicationV2.TABS

---

## Accessors

### active

```typescript
get active(): boolean
```

Whether this tab is currently active in the sidebar.

**Returns**  
`boolean`

---

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

**Returns**  
`DOMTokenList`

Inherited from ApplicationV2.classList

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns**  
`HTMLElement`

Inherited from ApplicationV2.element

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns**  
`null | HTMLFormElement`

Inherited from ApplicationV2.form

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns**  
`boolean`

Inherited from ApplicationV2.hasFrame

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.

**Returns**  
`string`

Inherited from ApplicationV2.id

---

### isPopout

```typescript
get isPopout(): boolean
```

Whether this is the popped-out tab or the in-sidebar one.

**Returns**  
`boolean`

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns**  
`boolean`

Inherited from ApplicationV2.minimized

---

### popout

```typescript
get popout(): void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>
```

A reference to the popped-out version of this tab, if one exists.

**Returns**  
`void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns**  
`boolean`

Inherited from ApplicationV2.rendered

---

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns**  
`number`

Inherited from ApplicationV2.state

---

### tabName

```typescript
get tabName(): string
```

The base name of the sidebar tab.

**Returns**  
`string`

---

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

**Returns**  
`string`

Inherited from ApplicationV2.title

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
- **pointerStartPosition**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)
- **resize**: `HTMLElement`
- **title**: `HTMLHeadingElement`

Inherited from ApplicationV2.window

---

## Methods

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): ApplicationConfiguration
```

Overrides ApplicationV2._initializeApplicationOptions

**Parameters**

- **options**: any

**Returns**  
`ApplicationConfiguration`

---

### _onClose

```typescript
_onClose(options: any): void
```

Overrides ApplicationV2._onClose

**Parameters**

- **options**: any

**Returns**  
`void`

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

Overrides ApplicationV2._onFirstRender

**Parameters**

- **context**: any
- **options**: any

**Returns**  
`Promise<void>`

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides ApplicationV2._onRender

**Parameters**

- **context**: any
- **options**: any

**Returns**  
`Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<ApplicationRenderContext>
```

Overrides ApplicationV2._prepareContext

**Parameters**

- **options**: any

**Returns**  
`Promise<ApplicationRenderContext>`

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

Overrides ApplicationV2._renderFrame

**Parameters**

- **options**: any

**Returns**  
`Promise<HTMLElement>`

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: RenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Context data for the render operation  
- **options**: RenderOptions  
  Options which configure application rendering behavior

**Returns**  
`Promise<any>`  
The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to _replaceHTML

Overrides ApplicationV2._renderHTML

---

### activate

```typescript
activate(): void
```

Activate this tab in the sidebar.

**Returns**  
`void`

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
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs
- **options** (Optional): `{ once?: boolean }` = {}  
  Options which configure the event listener
  - **once**? : `boolean` — Should the event only be responded to once and then removed

**Returns**  
`void`

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from ApplicationV2.addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp

**Returns**  
`void`

Inherited from ApplicationV2.bringToFront

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
- **options** (Optional): `{ event?: Event; force?: boolean; navElement?: HTMLElement; updatePosition?: boolean }` = {}  
  Additional options which affect tab navigation  
  - **event**? : `Event` — An interaction event which caused the tab change, if any  
  - **force**? : `boolean` — Force changing the tab even if the new tab is already active  
  - **navElement**? : `HTMLElement` — An explicit navigation element being modified  
  - **updatePosition**? : `boolean` — Update application position after changing the tab?

**Returns**  
`void`

Inherited from ApplicationV2.changeTab

---

### close

```typescript
close(
    options?: Partial<ApplicationClosingOptions>,
): Promise<AbstractSidebarTab<Configuration, RenderOptions>>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (Optional): `Partial<ApplicationClosingOptions>` = {}  
  Options which modify how the application is closed.

**Returns**  
`Promise<AbstractSidebarTab<Configuration, RenderOptions>>`  
A Promise which resolves to the closed Application instance

Inherited from ApplicationV2.close

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
`boolean` — Was default behavior for the event prevented?

See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from ApplicationV2.dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from ApplicationV2.maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from ApplicationV2.minimize

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being removed
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function being removed

**Returns**  
`void`

See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from ApplicationV2.removeEventListener

---

### render

```typescript
render(options: any, _options: any): Promise<AbstractSidebarTab<Configuration, RenderOptions>>
```

Overrides ApplicationV2.render

**Parameters**

- **options**: any
- **_options**: any

**Returns**  
`Promise<AbstractSidebarTab<Configuration, RenderOptions>>`

---

### renderPopout

```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```

Pop-out this sidebar tab as a new application.

**Returns**  
`Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>`

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position** (Optional): `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**  
`void | ApplicationPosition`  
The updated application position

Inherited from ApplicationV2.setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions** (Optional): `object` = {}  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns**  
`Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

Inherited from ApplicationV2.submit

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

- **expanded** (Optional): `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value  
- **options** (Optional): `{ animate?: boolean }` = {}  
  Options to configure the toggling behavior.  
  - **animate**? : `boolean` — Animate the controls toggling.

**Returns**  
`Promise<void>`  
A Promise which resolves once the control expansion animation is complete

Inherited from ApplicationV2.toggleControls

---

### _attachFrameListeners

```typescript
_protect _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns**  
`void`

Inherited from ApplicationV2._attachFrameListeners

---

### _canRender

```typescript
_protect _canRender(options: RenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: RenderOptions  
  Provided render options

**Returns**  
`false | void`  
Return false to prevent rendering

**Throws**  
An Error to display a warning message

Inherited from ApplicationV2._canRender

---

### _configureRenderOptions

```typescript
_protect _configureRenderOptions(options: RenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: RenderOptions  
  Options which configure application rendering behavior

**Returns**  
`void`

Inherited from ApplicationV2._configureRenderOptions

---

### _createContextMenu

```typescript
_protect _createContextMenu(
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
- **options** (Optional): `{ container?: HTMLElement; hookName?: string; parentClassHooks?: boolean }` = {}  
  Additional options which affect ContextMenu construction  
  - **container**? : `HTMLElement` — A parent HTMLElement which contains the selector target  
  - **hookName**? : `string` — The hook name  
  - **parentClassHooks**? : `boolean` — Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

Inherited from ApplicationV2._createContextMenu

---

### _getHeaderControls

```typescript
_protect _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from ApplicationV2._getHeaderControls

---

### _getTabsConfig

```typescript
_protect _getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns**  
`null | ApplicationTabsConfiguration`

Inherited from ApplicationV2._getTabsConfig

---

### _headerControlButtons

```typescript
_protect _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

**Yields**  
`ApplicationHeaderControlsEntry`

Inherited from ApplicationV2._headerControlButtons

---

### _insertElement

```typescript
_protect _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns**  
`void`

Inherited from ApplicationV2._insertElement

---

### _onActivate

```typescript
_protect _onActivate(): void
```

Actions performed when this tab is activated in the sidebar.

**Returns**  
`void`

---

### _onChangeForm

```typescript
_protect _onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event`  
  An input change event within the form

**Returns**  
`void`

Inherited from ApplicationV2._onChangeForm

---

### _onClickAction

```typescript
_protect _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a [data-action]

**Returns**  
`void`

Inherited from ApplicationV2._onClickAction

---

### _onClickTab

```typescript
_protect _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

Inherited from ApplicationV2._onClickTab

---

### _onDeactivate

```typescript
_protect _onDeactivate(): void
```

Actions performed when this tab is deactivated in the sidebar.

**Returns**  
`void`

---

### _onPosition

```typescript
_protect _onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
  The requested application position

**Returns**  
`void`

Inherited from ApplicationV2._onPosition

---

### _onSubmitForm

```typescript
_protect _onSubmitForm(
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

**Returns**  
`Promise<void>`

Inherited from ApplicationV2._onSubmitForm

---

### _preClose

```typescript
_protect _preClose(options: RenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: RenderOptions  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from ApplicationV2._preClose

---

### _preFirstRender

```typescript
_protect _preFirstRender(
    context: ApplicationRenderContext,
    options: RenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters**

- **context**: ApplicationRenderContext  
  Prepared context data
- **options**: RenderOptions  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from ApplicationV2._preFirstRender

---

### _prepareTabs

```typescript
_protect _prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**  
`Record<string, ApplicationTab>`

Inherited from ApplicationV2._prepareTabs

---

### _prePosition

```typescript
_protect _prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: ApplicationPosition  
  The requested application position

**Returns**  
`void`

Inherited from ApplicationV2._prePosition

---

### _preRender

```typescript
_protect _preRender(
    context: ApplicationRenderContext,
    options: RenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

**Parameters**

- **context**: ApplicationRenderContext  
  Prepared context data
- **options**: RenderOptions  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from ApplicationV2._preRender

---

### _removeElement

```typescript
_protect _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: HTMLElement  
  The element to be removed

**Returns**  
`void`

Inherited from ApplicationV2._removeElement

---

### _renderHeaderControl

```typescript
_protect _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: ApplicationHeaderControlsEntry

**Returns**  
`HTMLLIElement`

Inherited from ApplicationV2._renderHeaderControl

---

### _replaceHTML

```typescript
_protect _replaceHTML(result: any, content: HTMLElement, options: RenderOptions): void
```

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: any  
  The result returned by the application rendering backend
- **content**: HTMLElement  
  The content element into which the rendered result must be inserted
- **options**: RenderOptions  
  Options which configure application rendering behavior

**Returns**  
`void`

Inherited from ApplicationV2._replaceHTML

---

### _tearDown

```typescript
_protect _tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: ApplicationClosingOptions

**Returns**  
`void`

Inherited from ApplicationV2._tearDown

---

### _updateFrame

```typescript
_protect _updateFrame(options: RenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: RenderOptions  
  Options provided at render-time

**Returns**  
`void`

Inherited from ApplicationV2._updateFrame

---

### _updatePosition

```typescript
_protect _updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: ApplicationPosition  
  Requested Application positioning data

**Returns**  
`ApplicationPosition`

Inherited from ApplicationV2._updatePosition

---

### static inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

Inherited from ApplicationV2.inheritanceChain

---

### static parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: string  
  The CSS style rule
- **parentDimension**: number  
  The relevant dimension of the parent element

**Returns**  
`number | void`  
The parsed style dimension in pixels

Inherited from ApplicationV2.parseCSSDimension

---

### static waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: HTMLElement  
  The element.

**Returns**  
`Promise<void>`

Inherited from ApplicationV2.waitForImages

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)