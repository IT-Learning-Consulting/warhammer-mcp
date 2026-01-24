# Sidebar

The main sidebar application.

## Mixes

- HandlebarsApplication

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sidebar.Sidebar))

- _ApplicationV2_<ApplicationConfiguration, HandlebarsRenderOptions, this>

## Class Sidebar

---

## Constructors

### constructor

```typescript
new Sidebar(options?: Partial<ApplicationConfiguration>): Sidebar
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**?: `Partial<ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance

**Returns**  
`Sidebar`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).constructor_

---

## Properties

### options

`options: Readonly<ApplicationConfiguration>`

Application instance configuration options.

_Inherited from HandlebarsApplicationMixin(ApplicationV2).options_

---

### popouts

`popouts: Record<string, any> = {}`

The currently popped-out sidebar tabs.

---

### position

`position: ApplicationPosition`

The current position of the application with respect to the window.document.body.

_Inherited from HandlebarsApplicationMixin(ApplicationV2).position_

---

### tabGroups

`tabGroups: { primary: string }`

Overrides HandlebarsApplicationMixin(ApplicationV2).tabGroups

---

## Static Properties

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application. Any DEFAULT_OPTIONS of super-classes further upstream of the BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the BASE_APPLICATION are not dispatched.

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
  actions: { toggleState: (...this: any) => void };
  id: string;
  tag: string;
  window: { frame: boolean; positioned: boolean };
} = ...
```

### emittedEvents

`emittedEvents: readonly ["render", "close", "position"]`

### PARTS

`PARTS: { tabs: { id: string; template: string } }`

### RENDER_STATES

`RENDER_STATES: Record<string, number>`

The sequence of rendering states that describe the Application life-cycle.

### TABS

`TABS: Record<string, SidebarTabDescriptor>`

Tab configuration.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

**Returns**  
`DOMTokenList`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).classList_

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns**  
`HTMLElement`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).element_

---

### expanded

```typescript
get expanded(): boolean
```

Whether the sidebar is currently expanded.

**Returns**  
`boolean`

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns**  
`null | HTMLFormElement`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).form_

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns**  
`boolean`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).hasFrame_

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in DEFAULT_OPTIONS or by defining a uniqueId during _initializeApplicationOptions.

**Returns**  
`string`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).id_

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns**  
`boolean`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).minimized_

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns**  
`boolean`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).rendered_

---

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns**  
`number`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).state_

---

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

**Returns**  
`string`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).title_

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

_Inherited from HandlebarsApplicationMixin(ApplicationV2).window_

---

## Methods

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

Overrides HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions

---

### _onClickTab

```typescript
_onClickTab(event: any): void
```

**Parameters**

- **event**: `any`

**Returns**  
`void`

Overrides HandlebarsApplicationMixin(ApplicationV2)._onClickTab

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

Overrides HandlebarsApplicationMixin(ApplicationV2)._onFirstRender

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

Overrides HandlebarsApplicationMixin(ApplicationV2)._preparePartContext

---

### _renderHTML

```typescript
_renderHTML(context: any, options: any): Promise<any>
```

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<any>`

Overrides HandlebarsApplicationMixin(ApplicationV2)._renderHTML

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
- **options**?: `{ once?: boolean } = {}`  
  Options which configure the event listener

  - **once**?: `boolean`  
    Should the event only be responded to once and then removed

**Returns**  
`void`

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

_Inherited from HandlebarsApplicationMixin(ApplicationV2).addEventListener_

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.

Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp.

**Returns**  
`void`

_Inherited from HandlebarsApplicationMixin(ApplicationV2).bringToFront_

---

### changeTab

```typescript
changeTab(tab: any, group: any, options?: {}): void
```

**Parameters**

- **tab**: `any`
- **group**: `any`
- **options**?: `{}` = `{}`

**Returns**  
`void`

Overrides HandlebarsApplicationMixin(ApplicationV2).changeTab

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<Sidebar>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options**?: `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

**Returns**  
`Promise<Sidebar>`

_A Promise which resolves to the closed Application instance_

Inherited from HandlebarsApplicationMixin(ApplicationV2).close

---

### collapse

```typescript
collapse(): void
```

Collapse the sidebar.

**Returns**  
`void`

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
`boolean`  
Was default behavior for the event prevented?

See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from HandlebarsApplicationMixin(ApplicationV2).dispatchEvent

---

### expand

```typescript
expand(): void
```

Expand the sidebar.

**Returns**  
`void`

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2).minimize

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

**Returns**  
`void`

See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from HandlebarsApplicationMixin(ApplicationV2).removeEventListener

---

### render

```typescript
render(
  options?: boolean | HandlebarsRenderOptions,
  _options?: HandlebarsRenderOptions
): Promise<Sidebar>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options**?: `boolean | HandlebarsRenderOptions = {}`  
  Options which configure application rendering behavior. A boolean is interpreted as the "force" option.
- **_options**?: `HandlebarsRenderOptions = {}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns**  
`Promise<Sidebar>`

A Promise which resolves to the rendered Application instance.

Inherited from HandlebarsApplicationMixin(ApplicationV2).render

---

### setPosition

```typescript
setPosition(
  position?: Partial<ApplicationPosition>
): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position**?: `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**  
`void | ApplicationPosition`

The updated application position.

Inherited from HandlebarsApplicationMixin(ApplicationV2).setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters**

- **submitOptions**?: `object` = `{}`  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns**  
`Promise<any>`

A promise that resolves to the returned result of the form submission handler, if any.

Inherited from HandlebarsApplicationMixin(ApplicationV2).submit

---

### toggleControls

```typescript
toggleControls(
  expanded?: boolean,
  options?: { animate?: boolean }
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded**?: `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.
- **options**?: `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.

  - **animate**?: `boolean`  
    Animate the controls toggling.

**Returns**  
`Promise<void>`

A Promise which resolves once the control expansion animation is complete.

Inherited from HandlebarsApplicationMixin(ApplicationV2).toggleControls

---

### toggleExpanded

```typescript
toggleExpanded(expanded?: boolean): void
```

Toggle the expanded state of the sidebar.

**Parameters**

- **expanded**?: `boolean`  
  Force the expanded state to the provided value, otherwise toggle the state.

**Returns**  
`void`

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners

---

### _canRender

```typescript
_canRender(options: HandlebarsRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Provided render options

**Returns**  
`false | void`  
Return false to prevent rendering

**Throws**  
An Error to display a warning message.

Inherited from HandlebarsApplicationMixin(ApplicationV2)._canRender

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
  A handler function that provides initial context options.
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound.
- **options**?:  
  - **container**?: `HTMLElement`  
    A parent HTMLElement which contains the selector target.
  - **hookName**?: `string`  
    The hook name.
  - **parentClassHooks**?: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null | ContextMenu`  
A created ContextMenu or null if no menu items were defined.

Inherited from HandlebarsApplicationMixin(ApplicationV2)._createContextMenu

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group.

**Returns**  
`null | ApplicationTabsConfiguration`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

**Returns**  
`Generator<ApplicationHeaderControlsEntry, any, any>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(
  options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```

Initialize configuration options for the Application instance. The default behavior of this method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated
- Inner objects are merged
- Otherwise, properties in the subclass replace those defined by a parent

**Parameters**

- **options**: `Partial<ApplicationConfiguration>`  
  Options provided directly to the constructor.

**Returns**  
`ApplicationConfiguration`  
Configured options for the application instance.

Inherited from HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._insertElement

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound.
- **event**: `Event`  
  An input change event within the form.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onChangeForm

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event.
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickAction

---

### _onClose

```typescript
_onClose(options: HandlebarsRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Provided render options.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClose

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onPosition

---

### _onRender

```typescript
_onRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```

Actions performed after any render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data.
- **options**: `HandlebarsRenderOptions`  
  Provided render options.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onRender

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
  The form configuration for which this handler is bound.
- **event**: `Event | SubmitEvent`  
  The form submission event.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm

---

### _preClose

```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close process.

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Provided render options.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data.
- **options**: `HandlebarsRenderOptions`  
  Provided render options.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preFirstRender

---

### _prepareContext

```typescript
_prepareContext(
  options: HandlebarsRenderOptions,
): Promise<ApplicationRenderContext>
```

Prepare application rendering context data for a given render request. If exactly one tab group is configured for this application, it will be prepared automatically.

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Options which configure application rendering behavior.

**Returns**  
`Promise<ApplicationRenderContext>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareContext

---

### _prepareTabContext

```typescript
_prepareTabContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```

Prepare render context for the tabs.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Shared context provided by _prepareContext.
- **options**: `HandlebarsRenderOptions`  
  Options for configuring rendering behavior.

**Returns**  
`Promise<void>`

Protected

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare.

**Returns**  
`Record<string, ApplicationTab>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareTabs

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prePosition

---

### _preRender

```typescript
_preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data.
- **options**: `HandlebarsRenderOptions`  
  Provided render options.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preRender

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._removeElement

---

### _renderFrame

```typescript
_renderFrame(options: HandlebarsRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Options which configure application rendering behavior.

**Returns**  
`Promise<HTMLElement>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderFrame

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**  
`HTMLLIElement`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: HandlebarsRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend.
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted.
- **options**: `HandlebarsRenderOptions`  
  Options which configure application rendering behavior.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._replaceHTML

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._tearDown

---

### _updateFrame

```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Options provided at render-time.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data.

**Returns**  
`ApplicationPosition`  
Resolved Application positioning data.

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updatePosition

---

## Static Methods

### inheritanceChain

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
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

---

### waitForImages

```typescript
waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns**  
`Promise<void>`

---

# References

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)
- [ApplicationConfiguration Interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html)
- [HandlebarsRenderOptions Interface](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)
- [ApplicationPosition Interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)
- [SidebarTabDescriptor Interface](https://foundryvtt.com/api/interfaces/foundry.SidebarTabDescriptor.html)
- [EmittedEventListener Type](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)
- [ApplicationClosingOptions Interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)
- [ApplicationFormConfiguration Interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationFormConfiguration.html)
- [ApplicationHeaderControlsEntry Interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)
- [ApplicationTabsConfiguration Interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)
- [ApplicationTab Interface](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTab.html)
- [ContextMenuEntry Type](https://foundryvtt.com/api/types/foundry.applications.ux.ContextMenuEntry.html)
- [ContextMenu Class](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)