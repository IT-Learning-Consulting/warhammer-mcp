# HeadsUpDisplayContainer | Foundry Virtual Tabletop - API Documentation - Version 13

The **Heads-Up Display Container** is a canvas-sized Application which renders HTML overtop of the game canvas.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.hud.HeadsUpDisplayContainer), Expand

- *ApplicationV2*  
- **HeadsUpDisplayContainer**

---

## Constructors

### constructor

```typescript
new HeadsUpDisplayContainer(
    options?: Partial<ApplicationConfiguration>,
): HeadsUpDisplayContainer
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance

**Returns**  
`HeadsUpDisplayContainer`  
_Inherited from [ApplicationV2.constructor](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#constructor)_

---

## Properties

### bubbles

`bubbles: ChatBubbles = ...`  
Chat Bubbles

### drawing

`drawing: DrawingHUD = ...`  
Drawing HUD

### options

`options: Readonly<ApplicationConfiguration>`  
Application instance configuration options.  
_Inherited from [ApplicationV2.options](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#options)_

### position

`position: ApplicationPosition = ...`  
The current position of the application with respect to the window.document.body.  
_Inherited from [ApplicationV2.position](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#position)_

### tabGroups

`tabGroups: Record<string, null | string> = ...`  
If this Application uses tabbed navigation groups, this mapping is updated whenever the  
changeTab method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.  
_Inherited from [ApplicationV2.tabGroups](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#tabGroups)_

### tile

`tile: TileHUD = ...`  
Tile HUD

### token

`token: TokenHUD = ...`  
Token HUD

### BASE_APPLICATION  (static)

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`  
Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.  
_Inherited from [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#BASE_APPLICATION)_

### DEFAULT_OPTIONS  (static)

```typescript
DEFAULT_OPTIONS: {
    id: string;
    position: { zIndex: number };
    window: { frame: boolean; positioned: boolean };
} = ...
```

Overrides ApplicationV2.DEFAULT_OPTIONS  
_Inherited from [ApplicationV2.DEFAULT_OPTIONS](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#DEFAULT_OPTIONS)_

### emittedEvents  (static, readonly)

`emittedEvents: readonly ["render", "close", "position"] = ...`  
_Inherited from [ApplicationV2.emittedEvents](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#emittedEvents)_

### RENDER_STATES  (static)

`RENDER_STATES: Record<string, number> = ...`  
The sequence of rendering states that describe the Application life-cycle.  
_Inherited from [ApplicationV2.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#RENDER_STATES)_

### TABS  (static)

`TABS: Record<string, ApplicationTabsConfiguration> = {}`  
Configuration of application tabs, with an entry per tab group.  
_Inherited from [ApplicationV2.TABS](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#TABS)_

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

**Returns**  
`DOMTokenList`  
_Inherited from [ApplicationV2.classList](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#classList)_

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns**  
`HTMLElement`  
_Inherited from [ApplicationV2.element](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#element)_

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns**  
`null` | `HTMLFormElement`  
_Inherited from [ApplicationV2.form](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#form)_

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns**  
`boolean`  
_Inherited from [ApplicationV2.hasFrame](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#hasFrame)_

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
`_initializeApplicationOptions`.

**Returns**  
`string`  
_Inherited from [ApplicationV2.id](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#id)_

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns**  
`boolean`  
_Inherited from [ApplicationV2.minimized](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#minimized)_

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns**  
`boolean`  
_Inherited from [ApplicationV2.rendered](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#rendered)_

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns**  
`number`  
_Inherited from [ApplicationV2.state](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#state)_

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

**Returns**  
`string`  
_Inherited from [ApplicationV2.title](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#title)_

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

_Inherited from [ApplicationV2.window](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#window)_

---

## Methods

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`  

Overrides [ApplicationV2._onRender](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onRender)

---

### _renderHTML

```typescript
_renderHTML(_context: any, _options: any): Promise<string>
```

**Parameters**

- **_context**: `any`  
- **_options**: `any`

**Returns**  
`Promise<string>`

Overrides [ApplicationV2._renderHTML](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_renderHTML)

---

### _replaceHTML

```typescript
_replaceHTML(result: any, content: any, _options: any): void
```

**Parameters**

- **result**: `any`  
- **content**: `any`  
- **_options**: `any`

**Returns**  
`void`

Overrides [ApplicationV2._replaceHTML](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_replaceHTML)

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

- **listener**: `EmittedEventListener`  
  The listener function called when the event occurs

- **options** (Optional): `{ once?: boolean }` = `{}`  
  Options which configure the event listener

  - **once**? : `boolean`  
    Should the event only be responded to once and then removed

**Returns**  
`void`

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from [ApplicationV2.addEventListener](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#addEventListener)

---

### align

```typescript
align(): void
```

Align the position of the HUD layer to the current position of the canvas

**Returns**  
`void`

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp

**Returns**  
`void`

Inherited from [ApplicationV2.bringToFront](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#bringToFront)

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

- **options** (Optional):
  - **event**? : `Event`  
    An interaction event which caused the tab change, if any

  - **force**? : `boolean`  
    Force changing the tab even if the new tab is already active

  - **navElement**? : `HTMLElement`  
    An explicit navigation element being modified

  - **updatePosition**? : `boolean`  
    Update application position after changing the tab?

**Returns**  
`void`

Inherited from [ApplicationV2.changeTab](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#changeTab)

---

### close

```typescript
close(
    options?: Partial<ApplicationClosingOptions>,
): Promise<HeadsUpDisplayContainer>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (Optional): `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

**Returns**  
`Promise<HeadsUpDisplayContainer>`  
A Promise which resolves to the closed Application instance

Inherited from [ApplicationV2.close](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#close)

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
Inherited from [ApplicationV2.dispatchEvent](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#dispatchEvent)

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from [ApplicationV2.maximize](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#maximize)

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from [ApplicationV2.minimize](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#minimize)

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
Inherited from [ApplicationV2.removeEventListener](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#removeEventListener)

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<HeadsUpDisplayContainer>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options** (Optional): `boolean | ApplicationRenderOptions` = `{}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.

- **_options** (Optional): `ApplicationRenderOptions` = `{}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render  
  signature.

**Returns**  
`Promise<HeadsUpDisplayContainer>`  
A Promise which resolves to the rendered Application instance

Inherited from [ApplicationV2.render](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#render)

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

Inherited from [ApplicationV2.setPosition](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#setPosition)

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions** (Optional): `object` = `{}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns**  
`Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

Inherited from [ApplicationV2.submit](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#submit)

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

- **options** (Optional): `{ animate?: boolean }` = `{}`  
  Options to configure the toggling behavior.

  - **animate**? : `boolean`  
    Animate the controls toggling.

**Returns**  
`Promise<void>`  
A Promise which resolves once the control expansion animation is complete

Inherited from [ApplicationV2.toggleControls](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#toggleControls)

---

## Protected Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns**  
`void`

Inherited from [ApplicationV2._attachFrameListeners](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_attachFrameListeners)

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`false | void`  
Return false to prevent rendering

**Throws**  
An Error to display a warning message

Inherited from [ApplicationV2._canRender](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_canRender)

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`void`

Inherited from [ApplicationV2._configureRenderOptions](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_configureRenderOptions)

---

### _createContextMenu

```typescript
_createContextMenu(
    handler: () => ContextMenuEntry[],
    selector: string,
    options?: { container?: HTMLElement; hookName?: string; parentClassHooks?: boolean },
): null | ContextMenu
```

Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options

- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound

- **options** (Optional):  
  - **container**?: `HTMLElement`  
    A parent HTMLElement which contains the selector target  
  - **hookName**?: `string`  
    The hook name  
  - **parentClassHooks**?: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

Inherited from [ApplicationV2._createContextMenu](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_createContextMenu)

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from [ApplicationV2._getHeaderControls](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_getHeaderControls)

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns**  
`null | ApplicationTabsConfiguration`

Inherited from [ApplicationV2._getTabsConfig](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_getTabsConfig)

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

**Yields**  
`ApplicationHeaderControlsEntry`

Inherited from [ApplicationV2._headerControlButtons](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_headerControlButtons)

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(
    options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```

Initialize configuration options for the Application instance. The default behavior of this  
method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated  
- Inner objects are merged  
- Otherwise, properties in the subclass replace those defined by a parent

**Parameters**

- **options**: `Partial<ApplicationConfiguration>`  
  Options provided directly to the constructor

**Returns**  
`ApplicationConfiguration`  
Configured options for the application instance

Inherited from [ApplicationV2._initializeApplicationOptions](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_initializeApplicationOptions)

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns**  
`void`

Inherited from [ApplicationV2._insertElement](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_insertElement)

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound

- **event**: `Event`  
  An input change event within the form

**Returns**  
`void`

Inherited from [ApplicationV2._onChangeForm](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onChangeForm)

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
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

Inherited from [ApplicationV2._onClickAction](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onClickAction)

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

Inherited from [ApplicationV2._onClickTab](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onClickTab)

---

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the  
close process.

**Parameters**

- **options**: `ApplicationRenderOptions`

**Returns**  
`void`

Inherited from [ApplicationV2._onClose](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onClose)

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

- **context**: `ApplicationRenderContext`  
  Prepared context data

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from [ApplicationV2._onFirstRender](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onFirstRender)

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

Inherited from [ApplicationV2._onPosition](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onPosition)

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
  The form configuration for which this handler is bound

- **event**: `Event | SubmitEvent`  
  The form submission event

**Returns**  
`Promise<void>`

Inherited from [ApplicationV2._onSubmitForm](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_onSubmitForm)

---

### _preClose

```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from [ApplicationV2._preClose](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_preClose)

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

- **context**: `ApplicationRenderContext`  
  Prepared context data

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from [ApplicationV2._preFirstRender](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_preFirstRender)

---

### _prepareContext

```typescript
_prepareContext(
    options: ApplicationRenderOptions,
): Promise<ApplicationRenderContext>
```

Prepare application rendering context data for a given render request. If exactly one tab  
group is configured for this application, it will be prepared automatically.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`Promise<ApplicationRenderContext>`  
Context data for the render operation

Inherited from [ApplicationV2._prepareContext](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_prepareContext)

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**  
`Record<string, ApplicationTab>`

Inherited from [ApplicationV2._prepareTabs](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_prepareTabs)

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

Inherited from [ApplicationV2._prePosition](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_prePosition)

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from [ApplicationV2._preRender](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_preRender)

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns**  
`void`

Inherited from [ApplicationV2._removeElement](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_removeElement)

---

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`Promise<HTMLElement>`

Inherited from [ApplicationV2._renderFrame](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_renderFrame)

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

Inherited from [ApplicationV2._renderHeaderControl](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_renderHeaderControl)

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**  
`void`

Inherited from [ApplicationV2._tearDown](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_tearDown)

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options provided at render-time

**Returns**  
`void`

Inherited from [ApplicationV2._updateFrame](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_updateFrame)

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position update into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns**  
`ApplicationPosition`  
Resolved Application positioning data

Inherited from [ApplicationV2._updatePosition](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_updatePosition)

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

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#BASE_APPLICATION)  
Inherited from [ApplicationV2.inheritanceChain](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#inheritanceChain)

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

**Returns**  
`number | void`  
The parsed style dimension in pixels

Inherited from [ApplicationV2.parseCSSDimension](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#parseCSSDimension)

---

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

Inherited from [ApplicationV2.waitForImages](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#waitForImages)

---

[Back to Foundry Virtual Tabletop API Documentation - Version 13](https://foundryvtt.com/api/index.html)