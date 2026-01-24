# FolderExport | Foundry Virtual Tabletop - API Documentation - Version 13

A Dialog subclass that allows the user to configure export options for a Folder.

## Hierarchy (View Summary, Expand)

- [DialogV2](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html)  
- **FolderExport**

---

## Constructors

### constructor

```typescript
new FolderExport(
    options?: Partial<ApplicationConfiguration & DialogV2Configuration>,
): FolderExport
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration & DialogV2Configuration>` = `{}`  
  Options used to configure the Application instance

**Returns**  
`FolderExport`

Inherited from DialogV2.constructor

---

## Properties

### options

`options: Readonly<ApplicationConfiguration & DialogV2Configuration>`

Application instance configuration options.

Inherited from DialogV2.options

### position

`position: ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.

Inherited from DialogV2.position

### tabGroups

`tabGroups: Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from DialogV2.tabGroups

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

Inherited from DialogV2.BASE_APPLICATION

---

## Accessors

### DEFAULT_OPTIONS

`DEFAULT_OPTIONS: { id: string; position: { width: number } } = ...`

Overrides DialogV2.DEFAULT_OPTIONS

### emittedEvents

`emittedEvents: readonly ["render", "close", "position"] = ...`

Inherited from DialogV2.emittedEvents

### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

Inherited from DialogV2.RENDER_STATES

### TABS

`TABS: Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

Inherited from DialogV2.TABS

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

Inherited from DialogV2.classList

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

Inherited from DialogV2.element

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

Inherited from DialogV2.form

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

Inherited from DialogV2.hasFrame

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.

Inherited from DialogV2.id

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

Inherited from DialogV2.minimized

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

Inherited from DialogV2.rendered

### state

```typescript
get state(): number
```

The current render state of the Application.

Inherited from DialogV2.state

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

Inherited from DialogV2.title

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

Inherited from DialogV2.window

---

## Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Inherited from DialogV2._attachFrameListeners

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

**Parameters**  
- **options**: `any`

Inherited from DialogV2._initializeApplicationOptions

### _onFirstRender

```typescript
_onFirstRender(_context: any, _options: any): Promise<void>
```

**Parameters**  
- **_context**: `any`  
- **_options**: `any`

Inherited from DialogV2._onFirstRender

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**  
- **context**: `any`  
- **options**: `any`

Inherited from DialogV2._onRender (Overrides)

### _renderHTML

```typescript
_renderHTML(_context: any, _options: any): Promise<HTMLFormElement>
```

**Parameters**  
- **_context**: `any`  
- **_options**: `any`

Inherited from DialogV2._renderHTML

### _replaceHTML

```typescript
_replaceHTML(result: any, content: any, _options: any): void
```

**Parameters**  
- **result**: `any`  
- **content**: `any`  
- **_options**: `any`

Inherited from DialogV2._replaceHTML

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

- **options** (Optional): `{ once?: boolean }` = `{}`  
  Options which configure the event listener

  - **once** (Optional): `boolean`  
    Should the event only be responded to once and then removed

**Returns**  
`void`

See [MDN - addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from DialogV2.addEventListener

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We  
should also eliminate `ui.activeWindow` in favor of only ApplicationV2#frontApp.

**Returns**  
`void`

Inherited from DialogV2.bringToFront

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
  Additional options which affect tab navigation

  - **event** (Optional): `Event`  
    An interaction event which caused the tab change, if any

  - **force** (Optional): `boolean`  
    Force changing the tab even if the new tab is already active

  - **navElement** (Optional): `HTMLElement`  
    An explicit navigation element being modified

  - **updatePosition** (Optional): `boolean`  
    Update application position after changing the tab?

**Returns**  
`void`

Inherited from DialogV2.changeTab

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<FolderExport>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (Optional): `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

**Returns**  
`Promise<FolderExport>`  
A Promise which resolves to the closed Application instance

Inherited from DialogV2.close

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

See [MDN - dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from DialogV2.dispatchEvent

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from DialogV2.maximize

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from DialogV2.minimize

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

See [MDN - removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from DialogV2.removeEventListener

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<FolderExport>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options** (Optional): `boolean | ApplicationRenderOptions` = `{}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  `"force"` option.

- **_options** (Optional): `ApplicationRenderOptions` = `{}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render  
  signature.

**Returns**  
`Promise<FolderExport>`  
A Promise which resolves to the rendered Application instance

Inherited from DialogV2.render

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

Inherited from DialogV2.setPosition

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

Inherited from DialogV2.submit

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

  - **animate** (Optional): `boolean`  
    Animate the controls toggling.

**Returns**  
`Promise<void>`  
A Promise which resolves once the control expansion animation is complete

Inherited from DialogV2.toggleControls

---

## Protected Methods

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

Inherited from DialogV2._canRender

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

Inherited from DialogV2._configureRenderOptions

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
  A handler function that provides initial context options

- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound

- **options** (Optional):  
  Additional options which affect ContextMenu construction

  - **container** (Optional): `HTMLElement`  
    A parent HTMLElement which contains the selector target

  - **hookName** (Optional): `string`  
    The hook name

  - **parentClassHooks** (Optional): `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

Inherited from DialogV2._createContextMenu

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from DialogV2._getHeaderControls

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

Inherited from DialogV2._getTabsConfig

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

**Yields**  
`ApplicationHeaderControlsEntry`

Inherited from DialogV2._headerControlButtons

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

Inherited from DialogV2._insertElement

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

Inherited from DialogV2._onChangeForm

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
  The capturing HTML element which defined a `[data-action]`

**Returns**  
`void`

Inherited from DialogV2._onClickAction

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

Inherited from DialogV2._onClickTab

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the  
close process.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`void`

Inherited from DialogV2._onClose

### _onKeyDown

```typescript
_onKeyDown(event: KeyboardEvent): void
```

Handle keypresses within the dialog.

**Parameters**

- **event**: `KeyboardEvent`  
  The triggering event.

**Returns**  
`void`

Inherited from DialogV2._onKeyDown

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

Inherited from DialogV2._onPosition

### _onSubmit

```typescript
_onSubmit(
    target: HTMLButtonElement,
    event: PointerEvent | SubmitEvent,
): Promise<DialogV2>
```

Handle submitting the dialog.

**Parameters**

- **target**: `HTMLButtonElement`  
  The button that was clicked or the default button.

- **event**: `PointerEvent | SubmitEvent`  
  The triggering event.

**Returns**  
`Promise<DialogV2>`

Inherited from DialogV2._onSubmit

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

Inherited from DialogV2._onSubmitForm

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

Inherited from DialogV2._preClose

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

Inherited from DialogV2._preFirstRender

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

Inherited from DialogV2._prepareContext

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

Inherited from DialogV2._prepareTabs

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

Inherited from DialogV2._prePosition

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

Inherited from DialogV2._preRender

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

Inherited from DialogV2._removeElement

### _renderButtons

```typescript
_renderButtons(): string
```

Render configured buttons.

**Returns**  
`string`

Inherited from DialogV2._renderButtons

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

Inherited from DialogV2._renderFrame

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**  
`HTMLLIElement`

Inherited from DialogV2._renderHeaderControl

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

Inherited from DialogV2._tearDown

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

Inherited from DialogV2._updateFrame

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns**  
`ApplicationPosition`  
Resolved Application positioning data

Inherited from DialogV2._updatePosition

---

## Static Methods

### confirm

```typescript
static confirm(
    config?: Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>,
): Promise<any>
```

A utility helper to generate a dialog with yes and no buttons.

**Parameters**

- **config** (Optional): `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`  

- **yes**  
  Options to overwrite the default yes button configuration.

- **no**  
  Options to overwrite the default no button configuration.

**Returns**  
`Promise<any>`  
Resolves to true if the yes button was pressed, or false if the no button was pressed. If  
additional buttons were provided, the Promise resolves to the identifier of the one that was  
pressed, or the value returned by its callback. If the dialog was dismissed, and rejectClose is  
false, the Promise resolves to null.

Inherited from DialogV2.confirm

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

Inherited from DialogV2.inheritanceChain

### input

```typescript
static input(
    config?: Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>,
): Promise<any>
```

A utility helper to generate a dialog for user input.

**Parameters**

- **config** (Optional): `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`

- **ok**  
  Options to overwrite the default confirmation button configuration.

**Returns**  
`Promise<any>`  
Resolves to the data of the form if the ok button was pressed, or the value returned by that  
button's callback. If additional buttons were provided, the Promise resolves to the identifier  
of the one that was pressed, or the value returned by its callback. If the dialog was dismissed,  
and rejectClose is false, the Promise resolves to null.

Inherited from DialogV2.input

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

Inherited from DialogV2.parseCSSDimension

### prompt

```typescript
static prompt(
    config?: Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>,
): Promise<any>
```

A utility helper to generate a dialog with a single confirmation button.

**Parameters**

- **config** (Optional): `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`

- **ok**  
  Options to overwrite the default confirmation button configuration.

**Returns**  
`Promise<any>`  
Resolves to the identifier of the button used to submit the dialog, or the value returned by  
that button's callback. If additional buttons were provided, the Promise resolves to the  
identifier of the one that was pressed, or the value returned by its callback. If the dialog was  
dismissed, and rejectClose is false, the Promise resolves to null.

Inherited from DialogV2.prompt

### query

```typescript
static query(
    user: any,
    type: "input" | "wait" | "prompt" | "confirm",
    config?: object,
): Promise<any>
```

Present an asynchronous Dialog query to a specific User for response.

**Parameters**

- **user**: `any`  
  A User instance or a User id

- **type**: `"input" | "wait" | "prompt" | "confirm"`  
  The type of Dialog to present

- **config** (Optional): `object` = `{}`  
  Dialog configuration forwarded on to the Dialog.prompt, Dialog.confirm, Dialog.input, or  
  Dialog.wait function depending on the query type. Callback options are not supported.

**Returns**  
`Promise<any>`  
The query response or null if no response was provided

See [DialogV2.prompt](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html#prompt)  
[DialogV2.confirm](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html#confirm)  
[DialogV2.input](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html#input)  
[DialogV2.wait](https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html#wait)

Inherited from DialogV2.query

### wait

```typescript
static wait(
    config?: Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>,
): Promise<any>
```

Spawn a dialog and wait for it to be dismissed or submitted.

**Parameters**

- **config** (Optional): `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`

**Returns**  
`Promise<any>`  
Resolves to the identifier of the button used to submit the dialog, or the value returned by  
that button's callback. If the dialog was dismissed, and rejectClose is false, the Promise  
resolves to null.

Inherited from DialogV2.wait

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

Inherited from DialogV2.waitForImages

### _onClickButton

```typescript
protected static _onClickButton(
    this: any,
    event: PointerEvent,
    target: HTMLButtonElement,
): void
```

Redirect all clicks of buttons with action specifications to the submit handler.

**Parameters**

- **this**: `any`  
- **event**: `PointerEvent`  
  The originating click event.

- **target**: `HTMLButtonElement`  
  The button element that was clicked.

**Returns**  
`void`

Inherited from DialogV2._onClickButton