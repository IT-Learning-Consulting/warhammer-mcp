# TileHUD

An implementation of the `PlaceableHUD` base class which renders a heads-up-display interface for Tile objects. The `TileHUD` implementation can be configured and replaced via [CONFIG.Tile.hudClass](https://foundryvtt.com/api/variables/CONFIG.Tile.html#__typehudclass).

**Mixes:**  
HandlebarsApplication

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.hud.TileHUD))  
_BasePlaceableHUD_ <canvas>.<placeables>.<Tile>, <TileDocument>, <TilesLayer>, this  
**TileHUD**

---

## Constructors

### constructor

```typescript
new TileHUD(options?: Partial<ApplicationConfiguration>): TileHUD
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options?**: Partial<[ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html>) = `{}`  
  Optional configuration options.

---

## Properties

### options

```typescript
options: Readonly<ApplicationConfiguration>
```

Application instance configuration options.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### position

```typescript
position: ApplicationPosition
```

The current position of the application with respect to the `window.document.body`.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### tabGroups

```typescript
tabGroups: Record<string, null | string>
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### BASE_APPLICATION (static)

```typescript
BASE_APPLICATION: typeof BasePlaceableHUD = BasePlaceableHUD
```

---

### DEFAULT_OPTIONS (static)

```typescript
DEFAULT_OPTIONS: {
  actions: {
    video: (
      this: any,
      event: PointerEvent,
      target: HTMLButtonElement,
    ) => Promise<void>;
  };
  id: string;
} = ...
```

---

### emittedEvents (static)

```typescript
emittedEvents: readonly ["render", "close", "position"]
```

---

### PARTS (static)

```typescript
PARTS: { hud: { root: boolean; template: string } } = ...
```

---

### RENDER_STATES (static)

```typescript
RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

---

### TABS (static)

```typescript
TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### activePalette

```typescript
get activePalette(): null | string
```

The palette that is currently expanded, if any.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### document

```typescript
get document(): ActiveHUDDocument
```

Convenience access to the Document which this HUD modifies.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### element

```typescript
get element(): HTMLElement
```

The `HTMLElement` which renders this Application into the DOM.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### layer

```typescript
get layer(): ActiveHUDLayer
```

Convenience access for the canvas layer which this HUD modifies.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### object

```typescript
get object(): ActiveHUDObject
```

Reference a PlaceableObject this HUD is currently bound to.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### state

```typescript
get state(): number
```

The current render state of the Application.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

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

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

## Methods

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

**Parameters**

- **context**: any
- **options**: any

**Returns**  
`Promise<void>`

---

### _preClose

```typescript
_preClose(options: any): Promise<void>
```

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

**Parameters**

- **options**: any

**Returns**  
`Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(
  options: any,
): Promise<{
  appId: any;
  classes: string;
  icons: {
    combat: string;
    defeated: string;
    doorClosed: string;
    doorLocked: string;
    doorOpen: string;
    doorSecret: string;
    down: string;
    effects: string;
    light: string;
    lightOff: string;
    lock: string;
    sound: string;
    soundOff: string;
    template: string;
    up: string;
    visibility: string;
    wallDirection: string;
  };
  id: string;
  isGamePaused: boolean;
  isGM: boolean;
  lockedClass: string;
  visibilityClass: string;
} & { isVideo: boolean; videoIcon: string; videoTitle: string }>;
```

Overrides HandlebarsApplicationMixin(BasePlaceableHUD)._prepareContext

**Parameters**

- **options**: any

**Returns**  
Promise resolving to the enhanced context object.

---

### _renderHTML

```typescript
_ renderHTML(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html) — Context data for the render operation  
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html) — Options which configure application rendering behavior

**Returns**  
Promise which resolves with the HTML rendering result.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _updatePosition

```typescript
_updatePosition(position: any): any
```

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

**Parameters**

- **position**: any

**Returns**  
any

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

- **type**: string — The type of event being registered for  
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html) — The listener function called when the event occurs  
- **options?**: { once?: boolean } = {} — Options which configure the event listener  
  - **once?**: boolean — Should the event only be responded to once and then removed

**Returns**  
void

**See:** [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### bind

```typescript
bind(object: canvas.placeables.Tile): Promise<void>
```

Bind the HUD to a new PlaceableObject and display it.

**Parameters**

- **object**: `canvas.placeables.Tile` — A PlaceableObject instance to which the HUD should be bound

**Returns**  
Promise<void>

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from `_maxZ` to `ApplicationV2#maxZ`. We should also eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

**Returns**  
void

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

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

- **tab**: string — The name of the tab which should become active  
- **group**: string — The name of the tab group which defines the set of tabs  
- **options?**:  
  - **event?**: Event — An interaction event which caused the tab change, if any  
  - **force?**: boolean — Force changing the tab even if the new tab is already active  
  - **navElement?**: HTMLElement — An explicit navigation element being modified  
  - **updatePosition?**: boolean — Update application position after changing the tab?

**Returns**  
void

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<TileHUD>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options?**: Partial<[ApplicationClosingOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)> = `{}` — Options which modify how the application is closed.

**Returns**  
Promise which resolves to the closed Application instance.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: Event — The Event to dispatch

**Returns**  
boolean — Was default behavior for the event prevented?

**See:** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
Promise<void>

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
Promise<void>

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: string — The type of event being removed  
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html) — The listener function being removed

**Returns**  
void

**See:** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### render

```typescript
render(
  options?: boolean | ApplicationRenderOptions,
  _options?: ApplicationRenderOptions,
): Promise<TileHUD>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options?**: boolean | [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html) = `{}`  
  Options which configure application rendering behavior. A boolean is interpreted as the `"force"` option.  
- **_options?**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html) = `{}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns**  
Promise resolving to the rendered Application instance.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position?**: Partial<[ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)>

**Returns**  
void | ApplicationPosition — The updated application position

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters**

- **submitOptions?**: object = `{}`  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns**  
Promise resolving to the result of the form submission handler, if any.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### toggleControls

```typescript
toggleControls(expanded?: boolean, options?: { animate?: boolean }): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded?**: boolean  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.  
- **options?**: { animate?: boolean } = `{}`  
  Options to configure the toggling behavior.  
  - **animate?**: boolean — Animate the controls toggling.

**Returns**  
Promise<void>

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### togglePalette

```typescript
togglePalette(palette: null | string, active?: boolean): void
```

Toggle the expanded state of the given palette.

**Parameters**

- **palette**: null | string — The palette to toggle or null to collapse of the currently expanded palette  
- **active?**: boolean — Force the palette to be active or inactive

**Returns**  
void

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: ApplicationRenderOptions — Provided render options

**Returns**  
false to prevent rendering, otherwise nothing.

**Throws**  
An Error to display a warning message.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: ApplicationRenderOptions — Options which configure application rendering behavior

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

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
  }
): null | ContextMenu
```

Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: () => ContextMenuEntry[] — A handler function that provides initial context options  
- **selector**: string — A CSS selector to which the ContextMenu will be bound  
- **options?**:  
  - **container?**: HTMLElement — A parent HTMLElement which contains the selector target  
  - **hookName?**: string — The hook name  
  - **parentClassHooks?**: boolean — Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`ContextMenu` instance or `null` if no menu items were defined.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns**  
ApplicationHeaderControlsEntry[]

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: string — The ID of a tabs group

**Returns**  
`ApplicationTabsConfiguration` or null

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

_Yields_  
ApplicationHeaderControlsEntry

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(
  options: Partial<ApplicationConfiguration>
): ApplicationConfiguration
```

Initialize configuration options for the Application instance. The default behavior of this method is to intelligently merge options for each class with those of their parents. Array-based options are concatenated; inner objects are merged; otherwise, properties in the subclass replace those defined by a parent.

**Parameters**

- **options**: Partial<ApplicationConfiguration> — Options provided directly to the constructor

**Returns**  
Configured options for the application instance.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters**

- **element**: HTMLElement — The element to insert

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: ApplicationFormConfiguration — The form configuration for which this handler is bound  
- **event**: Event — An input change event within the form

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.

**Parameters**

- **event**: PointerEvent — The originating click event  
- **target**: HTMLElement — The capturing HTML element which defined a `[data-action]`

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: PointerEvent

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters**

- **options**: ApplicationRenderOptions

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _onFirstRender

```typescript
_onFirstRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed after a first render of the Application.

**Parameters**

- **context**: ApplicationRenderContext — Prepared context data  
- **options**: ApplicationRenderOptions — Provided render options

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: ApplicationPosition — The requested application position

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _onSubmit

```typescript
_onSubmit(
  event: SubmitEvent,
  form: HTMLFormElement,
  formData: FormDataExtended,
): Promise<void>
```

Handle submission of the BasePlaceableHUD form.

**Parameters**

- **event**: SubmitEvent  
- **form**: HTMLFormElement  
- **formData**: FormDataExtended

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

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

- **formConfig**: ApplicationFormConfiguration — The form configuration for which this handler is bound  
- **event**: Event | SubmitEvent — The form submission event

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _parseAttributeInput

```typescript
_parseAttributeInput(
  name: string,
  attr: number | object,
  input: string,
): { isBar: boolean; isDelta: boolean; value: number }
```

Parse an attribute bar input string into a new value for the attribute field.

**Parameters**

- **name**: string — The name of the attribute  
- **attr**: number | object — The current value of the attribute  
- **input**: string — The raw string input value

**Returns**

An object containing:  
- **isBar**: boolean  
- **isDelta**: boolean  
- **value**: number

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _preFirstRender

```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters**

- **context**: ApplicationRenderContext  
- **options**: ApplicationRenderOptions

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: string — The ID of the tab group to prepare

**Returns**  
Record mapping tab names to ApplicationTab objects.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.

**Parameters**

- **position**: ApplicationPosition — The requested application position

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _preRender

```typescript
_preRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters**

- **context**: ApplicationRenderContext  
- **options**: ApplicationRenderOptions

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters**

- **element**: HTMLElement — The element to be removed

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: ApplicationRenderOptions — Options which configure application rendering behavior

**Returns**  
Promise resolving to the framing HTMLElement.

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: ApplicationHeaderControlsEntry

**Returns**  
HTMLLIElement

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _replaceHTML

```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: ApplicationRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

**Parameters**

- **result**: any — The result returned by the application rendering backend  
- **content**: HTMLElement — The content element into which the rendered result must be inserted  
- **options**: ApplicationRenderOptions — Options which configure application rendering behavior

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters**

- **options**: ApplicationClosingOptions

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: ApplicationRenderOptions — Options provided at render-time

_Inherited from_ HandlebarsApplicationMixin(BasePlaceableHUD).

---

### inheritanceChain (static)

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**See:**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension (static)

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: string — The CSS style rule  
- **parentDimension**: number — The relevant dimension of the parent element

**Returns**  
The parsed style dimension in pixels, or undefined if invalid.

---

### waitForImages (static)

```typescript
waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: HTMLElement

**Returns**  
Promise<void>