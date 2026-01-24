# CameraPopout | Foundry Virtual Tabletop - API Documentation - Version 13

An application for a single popped-out camera.

## Mixes

- HandlebarsApplication

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.apps.av.CameraPopout), Expand

```
ApplicationV2<
  CameraPopoutConfiguration,
  HandlebarsRenderOptions,
  this
>
```

---

## Properties

### options

- **Type:** `Readonly<CameraPopoutConfiguration>`
- **Description:** Application instance configuration options.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).options

### position

- **Type:** `ApplicationPosition = ...`  
- [ApplicationPosition type](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)
- **Description:** The current position of the application with respect to the window.document.body.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).position

### tabGroups

- **Type:** `Record<string, null | string> = ...`
- **Description:**  
  If this Application uses tabbed navigation groups, this mapping is updated whenever the  
  `changeTab` method is called. Reports the active tab for each group, with a value of `null`  
  indicating no tab is active. Subclasses may override this property to define default tabs for  
  each group.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).tabGroups

---

## Static Properties

### BASE_APPLICATION

- **Type:** `typeof ApplicationV2 = ApplicationV2`  
- [ApplicationV2 class](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)
- **Description:**  
  Designates which upstream Application class in this class' inheritance chain is the base  
  application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
  BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
  BASE_APPLICATION are not dispatched.

### DEFAULT_OPTIONS

- **Type:**  
```typescript
{
  actions: {
    toggleDocked: (
      ...this: any,
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<void>;
  };
  classes: string[];
  id: string;
  position: { height: string };
  window: { minimizable: boolean; resizable: boolean };
} = ...
```
- **Description:** Default configuration options for the CameraPopout application.

### emittedEvents

- **Type:** `readonly ["render", "close", "position"] = ...`
- **Description:** Events emitted by this Application.

### PARTS

- **Type:**  
```typescript
{ camera: { root: boolean; template: string; templates: string[] } } = ...
```
- **Description:** Part definitions used for rendering.

### RENDER_STATES

- **Type:** `Record<string, number> = ...`
- **Description:** The sequence of rendering states that describe the Application life-cycle.

### TABS

- **Type:**  
```typescript
Record<string, ApplicationTabsConfiguration> = {}
```
- [ApplicationTabsConfiguration interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)
- **Description:** Configuration of application tabs, with an entry per tab group.

---

## Accessors

### classList

- **Type:** `DOMTokenList`
- **Description:** The CSS class list of this Application instance  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).classList

### element

- **Type:** `HTMLElement`
- **Description:** The HTMLElement which renders this Application into the DOM.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).element

### form

- **Type:** `null | HTMLFormElement`
- **Description:** Does this Application have a top-level form element?  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).form

### hasFrame

- **Type:** `boolean`
- **Description:** Does this Application instance render within an outer window frame?  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).hasFrame

### id

- **Type:** `string`
- **Description:**  
  The HTML element ID of this Application instance. This provides a readonly view into the  
  internal ID used by this application. This getter should not be overridden by subclasses,  
  which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
  `_initializeApplicationOptions`.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).id

### minimized

- **Type:** `boolean`
- **Description:** Is this Application instance currently minimized?  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).minimized

### rendered

- **Type:** `boolean`
- **Description:** Is this Application instance currently rendered?  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).rendered

### state

- **Type:** `number`
- **Description:** The current render state of the Application.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).state

### title

- **Type:** `string`
- **Description:** A convenience reference to the title of the Application window.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).title

### user

- **Type:** `User`
- **Description:** The user this camera view is for.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).user

### window

- **Type:**  
```typescript
{
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
- **Description:** Convenience references to window header elements.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).window

---

## Methods

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

- **Parameters:**
  - **options**: `any`
- **Returns:** `any`
- **Description:** Overrides HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions

---

### _onClickAction

```typescript
_onClickAction(event: any, target: any): any
```

- **Parameters:**
  - **event**: `any`
  - **target**: `any`
- **Returns:** `any`
- **Description:** Overrides HandlebarsApplicationMixin(ApplicationV2)._onClickAction

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

- **Parameters:**
  - **context**: `any`
  - **options**: `any`
- **Returns:** `Promise<void>`
- **Description:** Overrides HandlebarsApplicationMixin(ApplicationV2)._onFirstRender

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<ApplicationRenderContext>
```

- **Parameters:**
  - **options**: `any`
- **Returns:** `Promise<ApplicationRenderContext>`
- [ApplicationRenderContext interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)
- **Description:** Overrides HandlebarsApplicationMixin(ApplicationV2)._prepareContext

---

### _renderHTML (Abstract)

```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<any>
```

- **Parameters:**
  - **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
    Context data for the render operation
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Options which configure application rendering behavior
- **Returns:** `Promise<any>`  
The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to `_replaceHTML`.  
- **Description:**  
  Render an HTMLElement for the Application. An Application subclass must implement this  
  method in order for the Application to be renderable.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._renderHTML

---

### addEventListener

```typescript
addEventListener(
  type: string,
  listener: EmittedEventListener,
  options?: { once?: boolean },
): void
```

- **Parameters:**
  - **type**: `string`  
    The type of event being registered for
  - **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
    The listener function called when the event occurs
  - **options** (optional):  
    - **once**?: `boolean`  
      Should the event only be responded to once and then removed  
- **Returns:** `void`
- **See:** [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

- **Description:**  
  Bring this Application window to the front of the rendering stack by increasing its z-index.  
  Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ  
  We should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).bringToFront

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

- **Description:** Change the active tab within a tab group in this Application instance.
- **Parameters:**
  - **tab**: `string`  
    The name of the tab which should become active
  - **group**: `string`  
    The name of the tab group which defines the set of tabs
  - **options** (optional):
    - **event?**: `Event`  
      An interaction event which caused the tab change, if any
    - **force?**: `boolean`  
      Force changing the tab even if the new tab is already active
    - **navElement?**: `HTMLElement`  
      An explicit navigation element being modified
    - **updatePosition?**: `boolean`  
      Update application position after changing the tab?
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).changeTab

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<CameraPopout>
```

- **Description:** Close the Application, removing it from the DOM.
- **Parameters:**
  - **options** (optional): `Partial<ApplicationClosingOptions> = {}`  
    Options which modify how the application is closed.
- **Returns:** `Promise<CameraPopout>`  
  A Promise which resolves to the closed Application instance  
- [ApplicationClosingOptions interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).close

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

- **Description:** Dispatch an event on this target.
- **Parameters:**
  - **event**: `Event`  
    The Event to dispatch
- **Returns:**  
  `boolean` — Was default behavior for the event prevented?
- **See:** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

- **Description:** Restore the Application to its original dimensions.
- **Returns:** `Promise<void>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

- **Description:** Minimize the Application, collapsing it to a minimal header.
- **Returns:** `Promise<void>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).minimize

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

- **Description:** Remove an event listener for a certain type of event.
- **Parameters:**
  - **type**: `string`  
    The type of event being removed
  - **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
    The listener function being removed
- **Returns:** `void`
- **See:** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).removeEventListener

---

### render

```typescript
render(
  options?: boolean | HandlebarsRenderOptions,
  _options?: HandlebarsRenderOptions,
): Promise<CameraPopout>
```

- **Description:**  
  Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
  DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.
- **Parameters:**
  - **options** (optional): `boolean | HandlebarsRenderOptions = {}`  
    Options which configure application rendering behavior. A boolean is interpreted as the  
    "force" option.
  - **_options** (optional, legacy): `HandlebarsRenderOptions = {}`  
    Legacy options for backwards-compatibility with the original ApplicationV1#render signature.
- **Returns:** `Promise<CameraPopout>`  
  A Promise which resolves to the rendered Application instance  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).render

---

### setPosition

```typescript
setPosition(position: any): any
```

- **Parameters:**
  - **position**: `any`
- **Returns:** `any`
- **Description:** Overrides HandlebarsApplicationMixin(ApplicationV2).setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

- **Description:**  
  Programmatically submit an ApplicationV2 instance which implements a single top-level form.
- **Parameters:**
  - **submitOptions** (optional): `object = {}`  
    Arbitrary options which are supported by and provided to the configured form submission  
    handler.
- **Returns:** `Promise<any>`  
  A promise that resolves to the returned result of the form submission handler, if any.  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).submit

---

### toggleControls

```typescript
toggleControls(
  expanded?: boolean,
  options?: { animate?: boolean },
): Promise<void>
```

- **Description:** Toggle display of the Application controls menu. Only applicable to window Applications.
- **Parameters:**
  - **expanded** (optional): `boolean`  
    Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
    current value.
  - **options** (optional): `{ animate?: boolean } = {}`  
    Options to configure the toggling behavior.
    - **animate**?: `boolean`  
      Animate the controls toggling.
- **Returns:** `Promise<void>`  
  A Promise which resolves once the control expansion animation is complete  
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2).toggleControls

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

- **Description:** Protected. Attach event listeners to the Application frame.
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners

---

### _canRender

```typescript
_canRender(options: HandlebarsRenderOptions): false | void
```

- **Description:**  
  Protected. Test whether this Application is allowed to be rendered.
- **Parameters:**
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)
- **Returns:**  
  `false` to prevent rendering, or `void` otherwise.
- **Throws:** An Error to display a warning message
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._canRender

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: HandlebarsRenderOptions): void
```

- **Description:** Protected. Modify the provided options passed to a render request.
- **Parameters:**
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions

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

- **Description:** Protected. Create a ContextMenu instance used in this Application.
- **Parameters:**
  - **handler**: `() => ContextMenuEntry[]`  
    A handler function that provides initial context options
  - **selector**: `string`  
    A CSS selector to which the ContextMenu will be bound
  - **options** (optional):  
    - **container**?: `HTMLElement`  
      A parent HTMLElement which contains the selector target
    - **hookName**?: `string`  
      The hook name
    - **parentClassHooks**?: `boolean`  
      Whether to call hooks for the parent classes in the inheritance chain.
- **Returns:** `null | ContextMenu`  
  A created ContextMenu or null if no menu items were defined  
- [ContextMenu class](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._createContextMenu

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

- **Description:** Protected. Configure the array of header control menu options.
- **Returns:** `ApplicationHeaderControlsEntry[]`
- [ApplicationHeaderControlsEntry interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

- **Description:** Protected. Get the configuration for a tabs group.
- **Parameters:**
  - **group**: `string`  
    The ID of a tabs group
- **Returns:** `null | ApplicationTabsConfiguration`
- [ApplicationTabsConfiguration interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

- **Description:** Protected. Iterate over header control buttons, filtering for controls which are visible for the current client.
- **Returns:** `Generator<ApplicationHeaderControlsEntry, any, any>`
- [ApplicationHeaderControlsEntry interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)
- **Yields:** Controls visible for current client.
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

- **Description:**  
  Protected. Insert the application HTML element into the DOM. Subclasses may override this method to  
  customize how the application is inserted.
- **Parameters:**
  - **element**: `HTMLElement`  
    The element to insert
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._insertElement

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

- **Description:** Protected. Handle changes to an input element within the form.
- **Parameters:**
  - **formConfig**: `ApplicationFormConfiguration`  
    The form configuration for which this handler is bound
  - **event**: `Event`  
    An input change event within the form
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._onChangeForm

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

- **Description:** Protected. Handle click events on a tab within the Application.
- **Parameters:**
  - **event**: `PointerEvent`
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._onClickTab

---

### _onClose

```typescript
_onClose(options: HandlebarsRenderOptions): void
```

- **Description:** Protected. Actions performed after closing the Application. Post-close steps are not awaited by the  
  close process.
- **Parameters:**
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Provided render options
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._onClose

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

- **Description:** Protected. Actions performed after the Application is re-positioned.
- **Parameters:**
  - **position**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
    The requested application position
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._onPosition

---

### _onRender

```typescript
_onRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

- **Description:** Protected. Actions performed after any render of the Application.
- **Parameters:**
  - **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
    Prepared context data
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Provided render options
- **Returns:** `Promise<void>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._onRender

---

### _onSubmitForm

```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```

- **Description:** Protected. Handle submission for an Application which uses the form element.
- **Parameters:**
  - **formConfig**: `ApplicationFormConfiguration`  
    The form configuration for which this handler is bound
  - **event**: `Event | SubmitEvent`  
    The form submission event
- **Returns:** `Promise<void>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm

---

### _preClose

```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```

- **Description:** Protected. Actions performed before closing the Application. Pre-close steps are awaited by the close  
  process.
- **Parameters:**
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Provided render options
- **Returns:** `Promise<void>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

- **Description:** Protected. Actions performed before a first render of the Application.
- **Parameters:**
  - **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
    Prepared context data
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Provided render options
- **Returns:** `Promise<void>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._preFirstRender

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

- **Description:** Protected. Prepare application tab data for a single tab group.
- **Parameters:**
  - **group**: `string`  
    The ID of the tab group to prepare
- **Returns:**  
  `Record<string, ApplicationTab>`
- [ApplicationTab interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTab.html)
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._prepareTabs

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

- **Description:** Protected. Actions performed before the Application is re-positioned. Pre-position steps are not  
  awaited because setPosition is synchronous.
- **Parameters:**
  - **position**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
    The requested application position
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._prePosition

---

### _preRender

```typescript
_preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

- **Description:** Protected. Actions performed before any render of the Application. Pre-render steps are awaited by the  
  render process.
- **Parameters:**
  - **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
    Prepared context data
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Provided render options
- **Returns:** `Promise<void>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._preRender

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

- **Description:**  
  Protected. Remove the application HTML element from the DOM. Subclasses may override this method  
  to customize how the application element is removed.
- **Parameters:**
  - **element**: `HTMLElement`  
    The element to be removed
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._removeElement

---

### _renderFrame

```typescript
_renderFrame(options: HandlebarsRenderOptions): Promise<HTMLElement>
```

- **Description:** Protected. Render the outer framing HTMLElement which wraps the inner HTML of the Application.
- **Parameters:**
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Options which configure application rendering behavior
- **Returns:** `Promise<HTMLElement>`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._renderFrame

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

- **Description:** Protected. Render a header control button.
- **Parameters:**
  - **control**: [ApplicationHeaderControlsEntry](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)
- **Returns:** `HTMLLIElement`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: HandlebarsRenderOptions,
): void
```

- **Description:**  
  Protected. Replace the HTML of the application with the result provided by the rendering backend. An  
  Application subclass should implement this method in order for the Application to be  
  renderable.
- **Parameters:**
  - **result**: `any`  
    The result returned by the application rendering backend
  - **content**: `HTMLElement`  
    The content element into which the rendered result must be inserted
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Options which configure application rendering behavior
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._replaceHTML

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

- **Description:**  
  Protected. Remove elements from the DOM and trigger garbage collection as part of application  
  closure.
- **Parameters:**
  - **options**: [ApplicationClosingOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._tearDown

---

### _updateFrame

```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```

- **Description:** Protected. When the Application is rendered, optionally update aspects of the window frame.
- **Parameters:**
  - **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  
    Options provided at render-time
- **Returns:** `void`
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

- **Description:** Protected.  
  Translate a requested application position updated into a resolved allowed position for the  
  Application. Subclasses may override this method to implement more advanced positioning  
  behavior.
- **Parameters:**
  - **position**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
    Requested Application positioning data
- **Returns:** [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
  Resolved Application positioning data
- **Inherited from:** HandlebarsApplicationMixin(ApplicationV2)._updatePosition

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

- **Description:**  
  Iterate over the inheritance chain of this Application. The chain includes this Application itself  
  and all parents until the base application is encountered.
- **Returns:**  
  `Generator<typeof ApplicationV2, void, unknown>`  
- **See:** [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

- **Description:** Parse a CSS style rule into a number of pixels which apply to that dimension.
- **Parameters:**
  - **style**: `string`  
    The CSS style rule
  - **parentDimension**: `number`  
    The relevant dimension of the parent element
- **Returns:** `number | void`  
  The parsed style dimension in pixels

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

- **Description:** Wait for any images in the given element to load.
- **Parameters:**
  - **element**: `HTMLElement`  
    The element.
- **Returns:** `Promise<void>`
