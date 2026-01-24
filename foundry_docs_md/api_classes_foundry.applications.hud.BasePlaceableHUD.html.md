# BasePlaceableHUD | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract base class for displaying a heads-up-display interface bound to a Placeable Object on the Canvas.

## Type Parameters

- **ActiveHUDObject**
- **ActiveHUDDocument**
- **ActiveHUDLayer**

## Inheritance Hierarchy

- [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)  
- **BasePlaceableHUD**  
- [TileHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.TileHUD.html)  
- [TokenHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.TokenHUD.html)  
- [DrawingHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.DrawingHUD.html)  

---

## Constructors

### constructor

```typescript
new BasePlaceableHUD<
    ActiveHUDObject extends PlaceableObject,
    ActiveHUDDocument extends CanvasDocument,
    ActiveHUDLayer extends PlaceablesLayer,
>(options?: Partial<ApplicationConfiguration>): BasePlaceableHUD<ActiveHUDObject, ActiveHUDDocument, ActiveHUDLayer>
```

Construct a new BasePlaceableHUD application.

- **options**: `Partial<ApplicationConfiguration>` (optional) — Options used to configure the Application instance.

---

## Properties

### options

- **type**: `Readonly<ApplicationConfiguration>`
- Application instance configuration options.
- Inherited from `ApplicationV2.options`

### position

- **type**: `ApplicationPosition`
- The current position of the application with respect to the `window.document.body`.
- Inherited from `ApplicationV2.position`

### tabGroups

- **type**: `Record<string, null | string>`
- If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.  
- Inherited from `ApplicationV2.tabGroups`

---

## Static Properties

### BASE_APPLICATION

- **type**: `typeof BasePlaceableHUD = BasePlaceableHUD`
- Overrides `ApplicationV2.BASE_APPLICATION`

### DEFAULT_OPTIONS

The default configuration options for the application.

- **actions**: Object with methods to handle various button actions:

  - `config(event: PointerEvent, target: HTMLButtonElement): void`
  - `locked(event: PointerEvent, target: HTMLButtonElement): Promise<Document<object, DocumentConstructionContext>[]>`
  - `sort(event: PointerEvent, target: HTMLButtonElement): void`
  - `togglePalette(event: PointerEvent, target: HTMLButtonElement): void`
  - `visibility(event: PointerEvent, target: HTMLButtonElement): Promise<Document<object, DocumentConstructionContext>[]>`

- **classes**: `string[]`
- **form**: Configuration for the contained form

  - `closeOnSubmit: boolean`
  - `handler(event: SubmitEvent, form: HTMLFormElement, formData: FormDataExtended): Promise<void>`
  - `submitOnChange: boolean`

- **id**: `string`
- **position**: `{}` (default position)
- **tag**: `string`
- **window**: Object describing window frame features:

  - `frame: boolean`
  - `positioned: boolean`

Overrides `ApplicationV2.DEFAULT_OPTIONS`

### emittedEvents

- **readonly** `["render", "close", "position"]`
- Inherited from `ApplicationV2.emittedEvents`

### RENDER_STATES

- **type**: `Record<string, number>`
- The sequence of rendering states that describe the Application life-cycle.
- Inherited from `ApplicationV2.RENDER_STATES`

### TABS

- **type**: `Record<string, ApplicationTabsConfiguration> = {}`
- Configuration of application tabs, with an entry per tab group.
- Inherited from `ApplicationV2.TABS`

---

## Accessors

### activePalette

```typescript
get activePalette(): null | string
```

The palette that is currently expanded, if any.

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.  
Inherited from `ApplicationV2.classList`

### document

```typescript
get document(): ActiveHUDDocument
```

Convenience access to the Document which this HUD modifies.

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.  
Inherited from `ApplicationV2.element`

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?  
Inherited from `ApplicationV2.form`

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?  
Inherited from `ApplicationV2.hasFrame`

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance.  
This provides a readonly view into the internal ID used by this application.  
This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.  
Inherited from `ApplicationV2.id`

### layer

```typescript
get layer(): ActiveHUDLayer
```

Convenience access for the canvas layer which this HUD modifies.

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?  
Inherited from `ApplicationV2.minimized`

### object

```typescript
get object(): ActiveHUDObject
```

Reference a PlaceableObject this HUD is currently bound to.

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?  
Inherited from `ApplicationV2.rendered`

### state

```typescript
get state(): number
```

The current render state of the Application.  
Inherited from `ApplicationV2.state`

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.  
Inherited from `ApplicationV2.title`

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
Inherited from `ApplicationV2.window`

---

## Methods

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides `ApplicationV2._onRender`.

- **Parameters:**
  - `context: any`
  - `options: any`
- **Returns:** `Promise<void>`

---

### _preClose

```typescript
_preClose(options: any): Promise<void>
```

Overrides `ApplicationV2._preClose`.

- **Parameters:**
  - `options: any`
- **Returns:** `Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(_options: any): Promise<{
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
}>
```

Overrides `ApplicationV2._prepareContext`.

- **Parameters:**
  - `_options: any`
- **Returns:** `Promise` of an object containing context information.

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application.  
An Application subclass must implement this method in order for the Application to be renderable.

- **Parameters:**
  - `context: ApplicationRenderContext` — Context data for the render operation
  - `options: ApplicationRenderOptions` — Options which configure application rendering behavior
- **Returns:** `Promise<any>` The result of HTML rendering (implementation specific), passed to `_replaceHTML`  
Inherited from `ApplicationV2._renderHTML`

---

### _updatePosition

```typescript
_updatePosition(position: any): any
```

Overrides `ApplicationV2._updatePosition`.

- **Parameters:**
  - `position: any`
- **Returns:** `any`

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

- **Parameters:**
  - `type: string` — The type of event being registered for
  - `listener: EmittedEventListener` — The listener function called when the event occurs
  - `options?: { once?: boolean }` — Options which configure the event listener
    - `once?: boolean` — Should the event only be responded to once and then removed
- **Returns:** `void`

See [MDN: addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from `ApplicationV2.addEventListener`

---

### bind

```typescript
bind(object: ActiveHUDObject): Promise<void>
```

Bind the HUD to a new PlaceableObject and display it.

- **Parameters:**
  - `object: ActiveHUDObject` — A PlaceableObject instance to which the HUD should be bound
- **Returns:** `Promise<void>`

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
**Note:** Once ApplicationV1 is deprecated, switch from `_maxZ` to `ApplicationV2#maxZ`. The active window tracking will also move to only `ApplicationV2#frontApp`.

- **Returns:** `void`  
Inherited from `ApplicationV2.bringToFront`

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

- **Parameters:**
  - `tab: string` — The name of the tab which should become active
  - `group: string` — The name of the tab group which defines the set of tabs
  - `options` (optional):
    - `event?: Event` — An interaction event which caused the tab change, if any
    - `force?: boolean` — Force changing the tab even if the new tab is already active
    - `navElement?: HTMLElement` — An explicit navigation element being modified
    - `updatePosition?: boolean` — Update application position after changing the tab?
- **Returns:** `void`  
Inherited from `ApplicationV2.changeTab`

---

### close

```typescript
close(
    options?: Partial<ApplicationClosingOptions>,
): Promise<BasePlaceableHUD<ActiveHUDObject, ActiveHUDDocument, ActiveHUDLayer>>
```

Close the Application, removing it from the DOM.

- **Parameters:**
  - `options?: Partial<ApplicationClosingOptions>` (optional) — Options which modify how the application is closed.
- **Returns:** `Promise<BasePlaceableHUD>` — A Promise which resolves to the closed Application instance  
Inherited from `ApplicationV2.close`

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

- **Parameters:**
  - `event: Event` — The Event to dispatch
- **Returns:** `boolean` — Was default behavior for the event prevented?

See [MDN: dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from `ApplicationV2.dispatchEvent`

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

- **Returns:** `Promise<void>`  
Inherited from `ApplicationV2.maximize`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

- **Returns:** `Promise<void>`  
Inherited from `ApplicationV2.minimize`

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

- **Parameters:**
  - `type: string` — The type of event being removed
  - `listener: EmittedEventListener` — The listener function being removed
- **Returns:** `void`

See [MDN: removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from `ApplicationV2.removeEventListener`

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<BasePlaceableHUD<ActiveHUDObject, ActiveHUDDocument, ActiveHUDLayer>>
```

Render the Application, creating its HTMLElement and replacing its innerHTML.  
Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

- **Parameters:**
  - `options?: boolean | ApplicationRenderOptions` (optional) — Options which configure application rendering behavior. A boolean is interpreted as the "force" option.
  - `_options?: ApplicationRenderOptions` (optional) — Legacy options for backwards-compatibility with the original ApplicationV1#render signature.
- **Returns:** Promise which resolves to the rendered Application instance  
Inherited from `ApplicationV2.render`

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

- **Parameters:**
  - `position?: Partial<ApplicationPosition>` (optional) — New Application positioning data
- **Returns:** `void | ApplicationPosition` — The updated application position  
Inherited from `ApplicationV2.setPosition`

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

- **Parameters:**
  - `submitOptions?: object` (optional) — Arbitrary options which are supported by and provided to the configured form submission handler.
- **Returns:** Promise that resolves to the returned result of the form submission handler, if any.  
Inherited from `ApplicationV2.submit`

---

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

- **Parameters:**
  - `expanded?: boolean` (optional) — Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.
  - `options?: { animate?: boolean }` (optional) — Options to configure the toggling behavior.
    - `animate?: boolean` — Animate the controls toggling.
- **Returns:** Promise which resolves once the control expansion animation is complete  
Inherited from `ApplicationV2.toggleControls`

---

### togglePalette

```typescript
togglePalette(palette: null | string, active?: boolean): void
```

Toggle the expanded state of the given palette.

- **Parameters:**
  - `palette: null | string` — The palette to toggle or null to collapse the currently expanded palette
  - `active?: boolean` (optional) — Force the palette to be active or inactive
- **Returns:** `void`

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

- **Returns:** `void`  
Inherited from `ApplicationV2._attachFrameListeners`

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

- **Parameters:**
  - `options: ApplicationRenderOptions`
- **Returns:** `false | void` — Return false to prevent rendering
- **Throws:** An Error to display a warning message  
Inherited from `ApplicationV2._canRender`

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

- **Parameters:**
  - `options: ApplicationRenderOptions`
- **Returns:** `void`  
Inherited from `ApplicationV2._configureRenderOptions`

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

- **Parameters:**
  - `handler: () => ContextMenuEntry[]` — A handler function that provides initial context options
  - `selector: string` — A CSS selector to which the ContextMenu will be bound
  - `options?` (optional) — Additional options which affect ContextMenu construction:
    - `container?: HTMLElement` — A parent HTMLElement which contains the selector target
    - `hookName?: string` — The hook name
    - `parentClassHooks?: boolean` — Whether to call hooks for the parent classes in the inheritance chain.
- **Returns:** Created `ContextMenu` or `null` if no menu items were defined  
Inherited from `ApplicationV2._createContextMenu`

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

- **Returns:** Array of `ApplicationHeaderControlsEntry`  
Inherited from `ApplicationV2._getHeaderControls`

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

- **Parameters:**
  - `group: string` — The ID of a tabs group
- **Returns:** `null | ApplicationTabsConfiguration`  
Inherited from `ApplicationV2._getTabsConfig`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

- **Yields:** `ApplicationHeaderControlsEntry`  
Inherited from `ApplicationV2._headerControlButtons`

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(
    options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```

Initialize configuration options for the Application instance.  
The default behavior of this method is to intelligently merge options for each class with those of their parents.  
Array-based options are concatenated, inner objects are merged, otherwise, properties in the subclass replace those defined by a parent.

- **Parameters:**
  - `options: Partial<ApplicationConfiguration>` — Options provided directly to the constructor
- **Returns:** Configured `ApplicationConfiguration`  
Inherited from `ApplicationV2._initializeApplicationOptions`

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM.  
Subclasses may override this method to customize how the application is inserted.

- **Parameters:**
  - `element: HTMLElement` — The element to insert
- **Returns:** `void`  
Overrides `ApplicationV2._insertElement`

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

- **Parameters:**
  - `formConfig: ApplicationFormConfiguration` — The form configuration for which this handler is bound
  - `event: Event` — An input change event within the form
- **Returns:** `void`  
Inherited from `ApplicationV2._onChangeForm`

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses.  
Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.

- **Parameters:**
  - `event: PointerEvent` — The originating click event
  - `target: HTMLElement` — The capturing HTML element which defined a `[data-action]`
- **Returns:** `void`  
Inherited from `ApplicationV2._onClickAction`

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

- **Parameters:**
  - `event: PointerEvent`
- **Returns:** `void`  
Inherited from `ApplicationV2._onClickTab`

---

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application.  
Post-close steps are not awaited by the close process.

- **Parameters:**
  - `options: ApplicationRenderOptions`
- **Returns:** `void`  
Inherited from `ApplicationV2._onClose`

---

### _onFirstRender

```typescript
_onFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed after a first render of the Application.

- **Parameters:**
  - `context: ApplicationRenderContext` — Prepared context data
  - `options: ApplicationRenderOptions` — Provided render options
- **Returns:** `Promise<void>`  
Inherited from `ApplicationV2._onFirstRender`

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

- **Parameters:**
  - `position: ApplicationPosition` — The requested application position
- **Returns:** `void`  
Inherited from `ApplicationV2._onPosition`

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

- **Parameters:**
  - `event: SubmitEvent`
  - `form: HTMLFormElement`
  - `formData: FormDataExtended`
- **Returns:** `Promise<void>`

---

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

- **Parameters:**
  - `formConfig: ApplicationFormConfiguration` — The form configuration for which this handler is bound
  - `event: Event | SubmitEvent` — The form submission event
- **Returns:** `Promise<void>`  
Inherited from `ApplicationV2._onSubmitForm`

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

- **Parameters:**
  - `name: string` — The name of the attribute
  - `attr: number | object` — The current value of the attribute
  - `input: string` — The raw string input value
- **Returns:** Object containing:
  - `isBar: boolean`
  - `isDelta: boolean`
  - `value: number` — The parsed input value

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

- **Parameters:**
  - `context: ApplicationRenderContext` — Prepared context data
  - `options: ApplicationRenderOptions` — Provided render options
- **Returns:** `Promise<void>`  
Inherited from `ApplicationV2._preFirstRender`

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

- **Parameters:**
  - `group: string` — The ID of the tab group to prepare
- **Returns:** `Record<string, ApplicationTab>`  
Inherited from `ApplicationV2._prepareTabs`

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned.  
Pre-position steps are not awaited because `setPosition` is synchronous.

- **Parameters:**
  - `position: ApplicationPosition`
- **Returns:** `void`  
Inherited from `ApplicationV2._prePosition`

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application.  
Pre-render steps are awaited by the render process.

- **Parameters:**
  - `context: ApplicationRenderContext` — Prepared context data
  - `options: ApplicationRenderOptions` — Provided render options
- **Returns:** `Promise<void>`  
Inherited from `ApplicationV2._preRender`

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM.  
Subclasses may override this method to customize how the application element is removed.

- **Parameters:**
  - `element: HTMLElement` — The element to be removed
- **Returns:** `void`  
Inherited from `ApplicationV2._removeElement`

---

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

- **Parameters:**
  - `options: ApplicationRenderOptions`
- **Returns:** `Promise<HTMLElement>`  
Inherited from `ApplicationV2._renderFrame`

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

- **Parameters:**
  - `control: ApplicationHeaderControlsEntry`
- **Returns:** `HTMLLIElement`  
Inherited from `ApplicationV2._renderHeaderControl`

---

### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend.  
An Application subclass should implement this method in order for the Application to be renderable.

- **Parameters:**
  - `result: any` — The result returned by the application rendering backend
  - `content: HTMLElement` — The content element into which the rendered result must be inserted
  - `options: ApplicationRenderOptions` — Options which configure application rendering behavior
- **Returns:** `void`  
Inherited from `ApplicationV2._replaceHTML`

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

- **Parameters:**
  - `options: ApplicationClosingOptions`
- **Returns:** `void`  
Inherited from `ApplicationV2._tearDown`

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

- **Parameters:**
  - `options: ApplicationRenderOptions` — Options provided at render-time
- **Returns:** `void`  
Inherited from `ApplicationV2._updateFrame`

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application.  
The chain includes this Application itself and all parents until the base application is encountered.

- **Returns:** Generator of `typeof ApplicationV2`

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)  
Inherited from `ApplicationV2.inheritanceChain`

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

- **Parameters:**
  - `style: string` — The CSS style rule
  - `parentDimension: number` — The relevant dimension of the parent element
- **Returns:** Parsed style dimension in pixels or void  
Inherited from `ApplicationV2.parseCSSDimension`

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

- **Parameters:**
  - `element: HTMLElement` — The element.
- **Returns:** `Promise<void>`  
Inherited from `ApplicationV2.waitForImages`

---

For more information and details, refer to the official [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.applications.hud.BasePlaceableHUD.html).