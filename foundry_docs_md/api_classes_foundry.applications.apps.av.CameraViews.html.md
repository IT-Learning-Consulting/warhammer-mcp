# CameraViews | Foundry Virtual Tabletop - API Documentation - Version 13

An application that shows docked camera views.

**Mixes:**  
HandlebarsApplication

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.apps.av.CameraViews))  
```typescript
ApplicationV2<
  ApplicationConfiguration, 
  HandlebarsRenderOptions, 
  this
>
CameraViews
```

---

## Constructors

### constructor

```typescript
new CameraViews(options?: Partial<ApplicationConfiguration>): CameraViews
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance.

**Returns**  
`CameraViews`  
Inherited from HandlebarsApplicationMixin(ApplicationV2).constructor

---

## Properties

### DOCK_ICONS

```typescript
DOCK_ICONS: Record<
  { BOTTOM: string; LEFT: string; RIGHT: string; TOP: string },
  [string, string],
> = ...
```

Icons for the docked state of the camera dock.

### options

```typescript
options: Readonly<ApplicationConfiguration>
```

Application instance configuration options.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).options

### position

```typescript
position: ApplicationPosition
```

The current position of the application with respect to the `window.document.body`.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).position

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).tabGroups

### BASE_APPLICATION

```typescript
BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the  
`BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the  
`BASE_APPLICATION` are not dispatched.

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
  actions: {
    blockAudio: (
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<undefined | CameraViews>;
    blockVideo: (
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<undefined | CameraViews>;
    configure: (event: PointerEvent, target: HTMLElement) => Promise<AVConfig>;
    disableVideo: (event: PointerEvent, target: HTMLElement) => Promise<void>;
    hide: (
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<undefined | CameraViews>;
    mutePeers: (event: PointerEvent, target: HTMLElement) => Promise<void>;
    toggleAudio: (
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<
      undefined | Readonly<Notification> | CameraViews
    >;
    toggleDock: (
      ...this: any,
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<CameraViews>;
    toggleDocked: (
      ...this: any,
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<void>;
    toggleVideo: (
      event: PointerEvent,
      target: HTMLElement,
    ) => Promise<
      undefined | Readonly<Notification> | CameraViews
    >;
  };
  id: string;
  window: { frame: boolean };
} = ...
```

### emittedEvents

```typescript
emittedEvents: readonly ["render", "close", "position"] = ...
```

### PARTS

```typescript
PARTS: {
  cameras: { scrollable: string[]; template: string };
  controls: { template: string };
} = ...
```

### RENDER_STATES

```typescript
RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

### TABS

```typescript
TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).classList

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).element

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?  
Inherited from HandlebarsApplicationMixin(ApplicationV2).form

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?  
Inherited from HandlebarsApplicationMixin(ApplicationV2).hasFrame

### hidden

```typescript
get hidden(): boolean
```

If all camera views are popped out, hide the dock.

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
`_initializeApplicationOptions`.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).id

### isHorizontal

```typescript
get isHorizontal(): boolean
```

Whether the AV dock is in a horizontal configuration.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).isHorizontal

### isVertical

```typescript
get isVertical(): boolean
```

Whether the AV dock is in a vertical configuration.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).isVertical

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?  
Inherited from HandlebarsApplicationMixin(ApplicationV2).minimized

### popouts

```typescript
get popouts(): CameraPopout[]
```

Cameras which have been popped-out of this dock.

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?  
Inherited from HandlebarsApplicationMixin(ApplicationV2).rendered

### state

```typescript
get state(): number
```

The current render state of the Application.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).state

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).title

### users

```typescript
get users(): Record<string, CameraViewUserContext>
```

The cached list of processed user entries.

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
Inherited from HandlebarsApplicationMixin(ApplicationV2).window

---

## Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners

**Returns**  
`void`

### _canRender

```typescript
_canRender(options: any): boolean
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._canRender

**Parameters**

- **options**: `any`

**Returns**  
`boolean`

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._configureRenderParts

**Parameters**

- **options**: `any`

**Returns**  
`any`

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._onRender

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._preparePartContext

**Parameters**

- **partId**: `any`  
- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<any>`

### _renderHTML

```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHTML

**Parameters**

- **context**: `ApplicationRenderContext`  
  Context data for the render operation
- **options**: `HandlebarsRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`Promise<any>`  
The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to _replaceHTML

### _replaceHTML

```typescript
_replaceHTML(result: any, content: any, options: any): void
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._replaceHTML

**Parameters**

- **result**: `any`  
- **content**: `any`  
- **options**: `any`

**Returns**  
`void`

### addEventListener

```typescript
addEventListener(
  type: string,
  listener: EmittedEventListener,
  options?: { once?: boolean },
): void
```

Add a new event listener for a certain type of event.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).addEventListener

**Parameters**

- **type**: `string`  
  The type of event being registered for
- **listener**: `EmittedEventListener`  
  The listener function called when the event occurs
- **options**: `{ once?: boolean }` = `{}`  
  Options which configure the event listener

**Optional**

- **once**?: `boolean`  
  Should the event only be responded to once and then removed

**Returns**  
`void`

See: [EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp  
Inherited from HandlebarsApplicationMixin(ApplicationV2).bringToFront

**Returns**  
`void`

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
Inherited from HandlebarsApplicationMixin(ApplicationV2).changeTab

**Parameters**

- **tab**: `string`  
  The name of the tab which should become active
- **group**: `string`  
  The name of the tab group which defines the set of tabs
- **options**: (optional)  
  Additional options which affect tab navigation  
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

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<CameraViews>
```

Close the Application, removing it from the DOM.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).close

**Parameters**

- **options**: `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

**Returns**  
A Promise which resolves to the closed Application instance.

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).dispatchEvent

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns**  
Whether default behavior for the event was prevented (`boolean`).

See: [EventTarget.dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

### getUserCameraView

```typescript
getUserCameraView(userId: string): null | HTMLElement
```

Get a user's camera dock.

**Parameters**

- **userId**: `string`  
  The user's ID.

**Returns**  
`null` or `HTMLElement`

### getUserVideoElement

```typescript
getUserVideoElement(userId: string): null | HTMLVideoElement
```

Get the video element for a user broadcasting video.

**Parameters**

- **userId**: `string`  
  The user's ID.

**Returns**  
`null` or `HTMLVideoElement`

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).maximize

**Returns**  
`Promise<void>`

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).minimize

**Returns**  
`Promise<void>`

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).removeEventListener

**Parameters**

- **type**: `string`  
  The type of event being removed
- **listener**: `EmittedEventListener`  
  The listener function being removed

**Returns**  
`void`

See: [EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

### render

```typescript
render(
  options?: boolean | HandlebarsRenderOptions,
  _options?: HandlebarsRenderOptions,
): Promise<CameraViews>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).render

**Parameters**

- **options**: (optional) `boolean` | `HandlebarsRenderOptions` = `{}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.
- **_options**: (optional) `HandlebarsRenderOptions` = `{}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render  
  signature.

**Returns**  
A Promise which resolves to the rendered Application instance.

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).setPosition

**Parameters**

- **position**: (optional) `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**  
`void` or the updated `ApplicationPosition`

### setUserIsSpeaking

```typescript
setUserIsSpeaking(userId: string, speaking: boolean): void
```

Indicate a user is speaking on their camera dock.

**Parameters**

- **userId**: `string`  
  The user's ID.
- **speaking**: `boolean`  
  Whether the user is speaking.

**Returns**  
`void`

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).submit

**Parameters**

- **submitOptions**: (optional) `object` = `{}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns**  
`Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

### toggleControls

```typescript
toggleControls(
  expanded?: boolean,
  options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.  
Inherited from HandlebarsApplicationMixin(ApplicationV2).toggleControls

**Parameters**

- **expanded**: (optional) `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value.
- **options**: (optional) `{ animate?: boolean }` = `{}`  
  Options to configure the toggling behavior.

**Optional**

- **animate**?: `boolean`  
  Animate the controls toggling.

**Returns**  
`Promise<void>`  
A Promise which resolves once the control expansion animation is complete.

### _configureRenderOptions

```typescript
protected _configureRenderOptions(options: HandlebarsRenderOptions): void
```

Modify the provided options passed to a render request.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`void`

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
Inherited from HandlebarsApplicationMixin(ApplicationV2)._createContextMenu

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound
- **options**: (optional)  
  Additional options which affect ContextMenu construction  
  - **container**?: `HTMLElement`  
    A parent HTMLElement which contains the selector target  
  - **hookName**?: `string`  
    The hook name  
  - **parentClassHooks**?: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null` or a created `ContextMenu`.

### _getHeaderControls

```typescript
protected _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls

**Returns**  
`ApplicationHeaderControlsEntry[]`

### _getTabsConfig

```typescript
protected _getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns**  
`null` or `ApplicationTabsConfiguration`

### _headerControlButtons

```typescript
protected _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons

**Returns**  
A Generator that yields `ApplicationHeaderControlsEntry`.

### _initializeApplicationOptions

```typescript
protected _initializeApplicationOptions(
  options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```

Initialize configuration options for the Application instance. The default behavior of this  
method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated  
- Inner objects are merged  
- Otherwise, properties in the subclass replace those defined by a parent

Inherited from HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions

**Parameters**

- **options**: `Partial<ApplicationConfiguration>`  
  Options provided directly to the constructor

**Returns**  
Configured options for the application instance

### _insertElement

```typescript
protected _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._insertElement

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns**  
`void`

### _onChangeForm

```typescript
protected _onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onChangeForm

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event`  
  An input change event within the form

**Returns**  
`void`

### _onClickAction

```typescript
protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions  
which have no defined handler.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickAction

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns**  
`void`

### _onClickTab

```typescript
protected _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickTab

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

### _onClose

```typescript
protected _onClose(options: HandlebarsRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the  
close process.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClose

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Provided render options

**Returns**  
`void`

### _onFirstRender

```typescript
protected _onFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed after a first render of the Application.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onFirstRender

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `HandlebarsRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

### _onPosition

```typescript
protected _onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onPosition

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

### _onSubmitForm

```typescript
protected _onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event` | `SubmitEvent`  
  The form submission event

**Returns**  
`Promise<void>`

### _onVolumeChange

```typescript
protected _onVolumeChange(event: Event): void
```

Handle changing another user's volume.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._onVolumeChange

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns**  
`void`

### _preClose

```typescript
protected _preClose(options: HandlebarsRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._preClose

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

### _preFirstRender

```typescript
protected _preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._preFirstRender

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `HandlebarsRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

### _prepareContext

```typescript
protected _prepareContext(
  options: HandlebarsRenderOptions,
): Promise<ApplicationRenderContext>
```

Prepare application rendering context data for a given render request. If exactly one tab  
group is configured for this application, it will be prepared automatically.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareContext

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`Promise<ApplicationRenderContext>`

### _prepareControlsContext

```typescript
protected _prepareControlsContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for controls.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareControlsContext

**Parameters**

- **context**: `ApplicationRenderContext`  
- **options**: `HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

### _prepareTabs

```typescript
protected _prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareTabs

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**  
`Record<string, ApplicationTab>`

### _prePosition

```typescript
protected _prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because `setPosition` is synchronous.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._prePosition

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

### _preRender

```typescript
protected _preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._preRender

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `HandlebarsRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

### _removeElement

```typescript
protected _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._removeElement

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns**  
`void`

### _renderFrame

```typescript
protected _renderFrame(
  options: HandlebarsRenderOptions,
): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderFrame

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`Promise<HTMLElement>`

### _renderHeaderControl

```typescript
protected _renderHeaderControl(
  control: ApplicationHeaderControlsEntry,
): HTMLLIElement
```

Render a header control button.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**  
`HTMLLIElement`

### _tearDown

```typescript
protected _tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._tearDown

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**  
`void`

### _updateFrame

```typescript
protected _updateFrame(options: HandlebarsRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._updateFrame

**Parameters**

- **options**: `HandlebarsRenderOptions`  
  Options provided at render-time

**Returns**  
`void`

### _updatePosition

```typescript
protected _updatePosition(
  position: ApplicationPosition,
): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.  
Inherited from HandlebarsApplicationMixin(ApplicationV2)._updatePosition

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns**  
Resolved `ApplicationPosition`

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

See: [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

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

**Returns**  
The parsed style dimension in pixels (`number` or void)

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

### _sortUsers

```typescript
protected static _sortUsers(
  a: CameraViewUserContext,
  b: CameraViewUserContext,
): number
```

Sort users' cameras in the dock.

**Parameters**

- **a**: `CameraViewUserContext`  
- **b**: `CameraViewUserContext`

**Returns**  
`number`