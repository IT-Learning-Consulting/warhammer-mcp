# Players | Foundry Virtual Tabletop - API Documentation - Version 13

A UI element which displays the Users defined for this world. Currently active users are always displayed, while inactive users can be displayed on toggle.

## Mixes
- HandlebarsApplication

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.ui.Players) | Expand

```typescript
ApplicationV2<
  ApplicationConfiguration,
  ApplicationRenderOptions,
  this
>
```

---

## Class: Players

### Constructors

#### constructor

```typescript
new Players(options?: Partial<ApplicationConfiguration>): Players
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options?**: Partial<[ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html>) = {}

---

### Properties

#### options

Options used to configure the Application instance.

**Type**

```typescript
Readonly<ApplicationConfiguration>
```

Application instance configuration options.

#### position

The current position of the application with respect to the window.document.body.

**Type**

```typescript
ApplicationPosition
```

Default value: inherited from `HandlebarsApplicationMixin(ApplicationV2).position`

#### tabGroups

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.

**Type**

```typescript
Record<string, null | string>
```

---

### Static Properties

#### BASE_APPLICATION

Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

**Type**

```typescript
typeof ApplicationV2 = ApplicationV2
```

#### DEFAULT_OPTIONS

```typescript
{
  actions: { expand: (...this: any) => void };
  classes: string[];
  id: string;
  tag: string;
  window: { frame: boolean; positioned: boolean };
}
```

#### emittedEvents

```typescript
readonly ["render", "close", "position"]
```

#### IDLE_THRESHOLD_MS

A threshold of time in milliseconds after which a player is considered idle if they have no observed activity.

**Type**

```typescript
number
```

#### PARTS

```typescript
{
  players: {
    root: boolean;
    template: string;
  }
}
```

#### REFRESH_LATENCY_FREQUENCY_MS

How often latency is refreshed.

**Type**

```typescript
number
```

#### RENDER_STATES

The sequence of rendering states that describe the Application life-cycle.

**Type**

```typescript
Record<string, number>
```

#### TABS

Configuration of application tabs, with an entry per tab group.

**Type**

```typescript
Record<string, ApplicationTabsConfiguration> = {}
```

---

### Accessors

#### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

Returns: `DOMTokenList`

#### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

Returns: `HTMLElement`

#### expanded

```typescript
get expanded(): boolean
```

Is the application currently expanded?

Returns: `boolean`

#### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

Returns: `null | HTMLFormElement`

#### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

Returns: `boolean`

#### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

Returns: `string`

#### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

Returns: `boolean`

#### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

Returns: `boolean`

#### state

```typescript
get state(): number
```

The current render state of the Application.

Returns: `number`

#### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

Returns: `string`

#### window

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

Returns:

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

---

### Methods

#### _onFirstRender

```typescript
protected _onFirstRender(_context: any, _options: any): Promise<void>
```

Overrides `HandlebarsApplicationMixin(ApplicationV2)._onFirstRender`.

**Parameters**

- **_context**: any
- **_options**: any

Returns: `Promise<void>`

#### _onRender

```typescript
protected _onRender(_context: any, _options: any): Promise<void>
```

Overrides `HandlebarsApplicationMixin(ApplicationV2)._onRender`.

**Parameters**

- **_context**: any
- **_options**: any

Returns: `Promise<void>`

#### _prepareContext

```typescript
protected _prepareContext(
  _options: any,
): Promise<{
  active: {
    border: any;
    color: any;
    cssClass: string;
    id: any;
    isSelf: any;
    name: string;
    role: any;
    tooltip: any;
  }[];
  inactive: {
    border: any;
    color: any;
    cssClass: string;
    id: any;
    isSelf: any;
    name: string;
    role: any;
    tooltip: any;
  }[];
}>
```

Overrides `HandlebarsApplicationMixin(ApplicationV2)._prepareContext`.

**Parameters**

- **_options**: any

Returns: `Promise` of an object containing arrays of active and inactive user data

#### _renderHTML

```typescript
protected abstract _renderHTML(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Context data for the render operation

- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options which configure application rendering behavior

Returns: `Promise<any>`

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

- **type**: string  
  The type of event being registered for

- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs

- **options?**: { once?: boolean } = {}  
  Options which configure the event listener

- **once?**: boolean  
  Should the event only be responded to once and then removed

Returns: `void`

See: [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

#### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index. Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We should also eliminate `ui.activeWindow` in favor of only ApplicationV2#frontApp.

Returns: `void`

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

- **tab**: string  
  The name of the tab which should become active

- **group**: string  
  The name of the tab group which defines the set of tabs

- **options?**: object = {}  
  Additional options which affect tab navigation

  - **event?**: Event  
    An interaction event which caused the tab change, if any

  - **force?**: boolean  
    Force changing the tab even if the new tab is already active

  - **navElement?**: HTMLElement  
    An explicit navigation element being modified

  - **updatePosition?**: boolean  
    Update application position after changing the tab?

Returns: `void`

#### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<Players>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options?**: Partial<[ApplicationClosingOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)> = {}  
  Options which modify how the application is closed.

Returns: `Promise<Players>`  
A Promise which resolves to the closed Application instance

#### collapse

```typescript
collapse(): void
```

Collapse the players list.

Returns: `void`

#### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: Event  
  The Event to dispatch

Returns: `boolean`  
Was default behavior for the event prevented?

See: [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

#### expand

```typescript
expand(): void
```

Expand the players list.

Returns: `void`

#### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

Returns: `Promise<void>`

#### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

Returns: `Promise<void>`

#### refreshFPS

```typescript
refreshFPS(options?: { deactivate?: boolean }): void
```

Update the display which reports average framerate.

**Parameters**

- **options?**: { deactivate?: boolean } = {}  
  Options which customize FPS reporting

- **deactivate?**: boolean  
  Deactivate tracking

Returns: `void`

#### refreshLatency

```typescript
refreshLatency(): void
```

Update the display which reports average latency.

Returns: `void`

#### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: string  
  The type of event being removed

- **listener**: EmittedEventListener  
  The listener function being removed

Returns: `void`

See: [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

#### render

```typescript
render(
  options?: boolean | ApplicationRenderOptions,
  _options?: ApplicationRenderOptions,
): Promise<Players>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options?**: boolean | [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html) = {}  
  Options which configure application rendering behavior. A boolean is interpreted as the "force" option.

- **_options?**: ApplicationRenderOptions = {}  
  Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

Returns: `Promise<Players>`

#### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position?**: Partial<ApplicationPosition>  
  New Application positioning data

Returns: `void | ApplicationPosition`  
The updated application position

#### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters**

- **submitOptions?**: object = {}  
  Arbitrary options which are supported by and provided to the configured form submission handler.

Returns: `Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

#### toggleControls

```typescript
toggleControls(
  expanded?: boolean,
  options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded?**: boolean  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value

- **options?**: { animate?: boolean } = {}  
  Options to configure the toggling behavior.

- **animate?**: boolean  
  Animate the controls toggling.

Returns: `Promise<void>`

#### toggleExpanded

```typescript
toggleExpanded(expanded?: boolean): void
```

Toggle the expanded state of the players list.

**Parameters**

- **expanded?**: boolean  
  Force the expanded state to the provided value, otherwise toggle the state.

Returns: `void`

---

### Protected Methods

#### _attachFrameListeners

```typescript
protected _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

Returns: `void`

#### _canRender

```typescript
protected _canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: ApplicationRenderOptions

Returns: `false | void`  
Return false to prevent rendering

Throws: An Error to display a warning message

#### _configureRenderOptions

```typescript
protected _configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: ApplicationRenderOptions  
  Options which configure application rendering behavior

Returns: `void`

#### _createContextMenu

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

**Parameters**

- **handler**: () => ContextMenuEntry[]  
  A handler function that provides initial context options

- **selector**: string  
  A CSS selector to which the ContextMenu will be bound

- **options?**: object = {}  
  Additional options which affect ContextMenu construction

  - **container?**: HTMLElement  
    A parent HTMLElement which contains the selector target

  - **hookName?**: string  
    The hook name

  - **parentClassHooks?**: boolean  
    Whether to call hooks for the parent classes in the inheritance chain.

Returns: `null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

#### _formatName

```typescript
protected _formatName(user: documents.User): string
```

Format the display of a user's name using their name, pronouns (if defined), and character name (if defined).

**Parameters**

- **user**: [documents.User](https://foundryvtt.com/api/classes/foundry.documents.User.html)

Returns: `string`

#### _getContextMenuOptions

```typescript
protected _getContextMenuOptions(): ContextMenuEntry[]
```

Get the set of ContextMenu options which should be applied to each User in the Players UI.

Returns: `ContextMenuEntry[]`  
The Array of context options passed to the ContextMenu instance

#### _getHeaderControls

```typescript
protected _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

Returns: `ApplicationHeaderControlsEntry[]`

#### _getTabsConfig

```typescript
protected _getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: string  
  The ID of a tabs group

Returns: `null | ApplicationTabsConfiguration`

#### _headerControlButtons

```typescript
protected _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

Yields: `ApplicationHeaderControlsEntry`

#### _initializeApplicationOptions

```typescript
protected _initializeApplicationOptions(
  options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```

Initialize configuration options for the Application instance. The default behavior of this method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated
- Inner objects are merged
- Otherwise, properties in the subclass replace those defined by a parent

**Parameters**

- **options**: Partial<ApplicationConfiguration>  
  Options provided directly to the constructor

Returns: ApplicationConfiguration  
Configured options for the application instance

#### _insertElement

```typescript
protected _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters**

- **element**: HTMLElement  
  The element to insert

Returns: `void`

#### _onChangeForm

```typescript
protected _onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: ApplicationFormConfiguration  
  The form configuration for which this handler is bound

- **event**: Event  
  An input change event within the form

Returns: `void`

#### _onClickAction

```typescript
protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have no defined handler.

**Parameters**

- **event**: PointerEvent  
  The originating click event

- **target**: HTMLElement  
  The capturing HTML element which defined a `[data-action]`

Returns: `void`

#### _onClickTab

```typescript
protected _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: PointerEvent

Returns: `void`

#### _onClose

```typescript
protected _onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters**

- **options**: ApplicationRenderOptions

Returns: `void`

#### _onPosition

```typescript
protected _onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: ApplicationPosition  
  The requested application position

Returns: `void`

#### _onSubmitForm

```typescript
protected _onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: ApplicationFormConfiguration  
  The form configuration for which this handler is bound

- **event**: Event | SubmitEvent  
  The form submission event

Returns: `Promise<void>`

#### _preClose

```typescript
protected _preClose(options: ApplicationRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close process.

**Parameters**

- **options**: ApplicationRenderOptions

Returns: `Promise<void>`

#### _preFirstRender

```typescript
protected _preFirstRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters**

- **context**: ApplicationRenderContext  
  Prepared context data

- **options**: ApplicationRenderOptions  
  Provided render options

Returns: `Promise<void>`

#### _prepareTabs

```typescript
protected _prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: string  
  The ID of the tab group to prepare

Returns: `Record<string, ApplicationTab>`

#### _prePosition

```typescript
protected _prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not awaited because setPosition is synchronous.

**Parameters**

- **position**: ApplicationPosition  
  The requested application position

Returns: `void`

#### _preRender

```typescript
protected _preRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters**

- **context**: ApplicationRenderContext  
  Prepared context data

- **options**: ApplicationRenderOptions  
  Provided render options

Returns: `Promise<void>`

#### _removeElement

```typescript
protected _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters**

- **element**: HTMLElement  
  The element to be removed

Returns: `void`

#### _renderFrame

```typescript
protected _renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: ApplicationRenderOptions  
  Options which configure application rendering behavior

Returns: `Promise<HTMLElement>`

#### _renderHeaderControl

```typescript
protected _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: ApplicationHeaderControlsEntry

Returns: `HTMLLIElement`

#### _replaceHTML

```typescript
protected _replaceHTML(
  result: any,
  content: HTMLElement,
  options: ApplicationRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

**Parameters**

- **result**: any  
  The result returned by the application rendering backend

- **content**: HTMLElement  
  The content element into which the rendered result must be inserted

- **options**: ApplicationRenderOptions  
  Options which configure application rendering behavior

Returns: `void`

#### _tearDown

```typescript
protected _tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters**

- **options**: ApplicationClosingOptions

Returns: `void`

#### _updateFrame

```typescript
protected _updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: ApplicationRenderOptions  
  Options provided at render-time

Returns: `void`

#### _updatePosition

```typescript
protected _updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

**Parameters**

- **position**: ApplicationPosition  
  Requested Application positioning data

Returns: `ApplicationPosition`  
Resolved Application positioning data

---

### Static Methods

#### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

Returns: `Generator<typeof ApplicationV2, void, unknown>`

See: [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

#### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: string  
  The CSS style rule

- **parentDimension**: number  
  The relevant dimension of the parent element

Returns: `number | void`  
The parsed style dimension in pixels

#### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: HTMLElement  
  The element.

Returns: `Promise<void>`

---

**[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)**