# DialogV2

A lightweight Application that renders a dialog containing a form with arbitrary content, and some buttons.

---

## Examples

**Prompt the user to confirm an action.**

```typescript
const proceed = await foundry.applications.api.DialogV2.confirm({
  content: "Are you sure?",
  rejectClose: false,
  modal: true
});
if (proceed) console.log("Proceed.");
else console.log("Do not proceed.");
```

**Prompt the user for some input.**

```typescript
let guess;
try {
  guess = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Guess a number between 1 and 10" },
    content: '<input name="guess" type="number" min="1" max="10" step="1" autofocus>',
    ok: {
      label: "Submit Guess",
      callback: (event, button, dialog) =>
        button.form.elements.guess.valueAsNumber
    }
  });
} catch {
  console.log("User did not make a guess.");
  return;
}
const n = Math.ceil(CONFIG.Dice.randomUniform() * 10);
if (n === guess) console.log("User guessed correctly.");
else console.log("User guessed incorrectly.");
```

**A custom dialog.**

```typescript
new foundry.applications.api.DialogV2({
  window: { title: "Choose an option" },
  content: `
    <label><input type="radio" name="choice" value="one" checked> Option 1</label>
    <label><input type="radio" name="choice" value="two"> Option 2</label>
    <label><input type="radio" name="choice" value="three"> Options 3</label>
  `,
  buttons: [{
    action: "choice",
    label: "Make Choice",
    default: true,
    callback: (event, button, dialog) =>
      button.form.elements.choice.value
  }, {
    action: "all",
    label: "Take All"
  }],
  submit: result => {
    if (result === "all") console.log("User picked all options.");
    else console.log(`User picked option: ${result}`);
  }
}).render({ force: true });
```

---

## Hierarchy
- [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)
- **DialogV2**
- [ShowToPlayersDialog](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.ShowToPlayersDialog.html)
- [FolderExport](https://foundryvtt.com/api/classes/foundry.applications.sidebar.apps.FolderExport.html)

---

## Constructors

### constructor

```typescript
new DialogV2(
    options?: Partial<foundry.applications.types.ApplicationConfiguration & foundry.DialogV2Configuration>,
): DialogV2
```

- **options?**: `Partial<ApplicationConfiguration & DialogV2Configuration>` = `{}`  
  Options used to configure the Application instance

Returns: `DialogV2`

Inherited from `ApplicationV2.constructor`

---

## Properties

### options

```typescript
options: Readonly<ApplicationConfiguration & DialogV2Configuration>
```

Application instance configuration options.

Inherited from `ApplicationV2.options`

---

### position

```typescript
position: ApplicationPosition = ...
```

The current position of the application with respect to the `window.document.body`.

Inherited from `ApplicationV2.position`

---

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from `ApplicationV2.tabGroups`

---

### BASE_APPLICATION

```typescript
BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the  
`BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the  
`BASE_APPLICATION` are not dispatched.

Inherited from `ApplicationV2.BASE_APPLICATION`

---

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    classes: string[];
    form: { closeOnSubmit: boolean };
    id: string;
    tag: string;
    window: { frame: boolean; minimizable: boolean; positioned: boolean };
} = ...
```

Overrides `ApplicationV2.DEFAULT_OPTIONS`

---

### emittedEvents

```typescript
emittedEvents: readonly ["render", "close", "position"] = ...
```

Inherited from `ApplicationV2.emittedEvents`

---

### RENDER_STATES

```typescript
RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

Inherited from `ApplicationV2.RENDER_STATES`

---

### TABS

```typescript
TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

Inherited from `ApplicationV2.TABS`

---

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

Returns: `DOMTokenList`

Inherited from `ApplicationV2.classList`

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

Returns: `HTMLElement`

Inherited from `ApplicationV2.element`

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

Returns: `null | HTMLFormElement`

Inherited from `ApplicationV2.form`

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

Returns: `boolean`

Inherited from `ApplicationV2.hasFrame`

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
`_initializeApplicationOptions`.

Returns: `string`

Inherited from `ApplicationV2.id`

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

Returns: `boolean`

Inherited from `ApplicationV2.minimized`

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

Returns: `boolean`

Inherited from `ApplicationV2.rendered`

---

### state

```typescript
get state(): number
```

The current render state of the Application.

Returns: `number`

Inherited from `ApplicationV2.state`

---

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

Returns: `string`

Inherited from `ApplicationV2.title`

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

Returns: Object with window elements

Inherited from `ApplicationV2.window`

---

## Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Overrides `ApplicationV2._attachFrameListeners`

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

Overrides `ApplicationV2._initializeApplicationOptions`

- **options**: `any`  
  Options to initialize.

Returns: `any`

---

### _onFirstRender

```typescript
_onFirstRender(_context: any, _options: any): Promise<void>
```

Overrides `ApplicationV2._onFirstRender`

- **_context**: `any`  
- **_options**: `any`

Returns: `Promise<void>`

---

### _renderHTML

```typescript
_renderHTML(_context: any, _options: any): Promise<HTMLFormElement>
```

Overrides `ApplicationV2._renderHTML`

- **_context**: `any`
- **_options**: `any`

Returns: `Promise<HTMLFormElement>`

---

### _replaceHTML

```typescript
_replaceHTML(result: any, content: any, _options: any): void
```

Overrides `ApplicationV2._replaceHTML`

- **result**: `any`  
- **content**: `any`  
- **_options**: `any`

Returns: `void`

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

- **type**: `string`  
  The type of event being registered for.  
- **listener**: [`EmittedEventListener`](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs.  
- **options?**: `{ once?: boolean } = {}`  
  Options which configure the event listener.  
- **once?**: `boolean`  
  Should the event only be responded to once and then removed.

Returns: `void`

See: [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from `ApplicationV2.addEventListener`

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from `_maxZ` to `ApplicationV2#maxZ`. We  
should also eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

Returns: `void`

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

- **tab**: `string`  
  The name of the tab which should become active.  
- **group**: `string`  
  The name of the tab group which defines the set of tabs.  
- **options?**: Object with optional fields:  
  - **event?**: `Event`  
    An interaction event which caused the tab change, if any.  
  - **force?**: `boolean`  
    Force changing the tab even if the new tab is already active.  
  - **navElement?**: `HTMLElement`  
    An explicit navigation element being modified.  
  - **updatePosition?**: `boolean`  
    Update application position after changing the tab?

Returns: `void`

Inherited from `ApplicationV2.changeTab`

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<DialogV2>
```

Close the Application, removing it from the DOM.

- **options?**: `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

Returns: `Promise<DialogV2>`  
A Promise which resolves to the closed Application instance.

Inherited from `ApplicationV2.close`

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

- **event**: `Event`  
  The Event to dispatch.

Returns: `boolean`  
Whether default behavior for the event was prevented.

See: [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from `ApplicationV2.dispatchEvent`

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

Returns: `Promise<void>`

Inherited from `ApplicationV2.maximize`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

Returns: `Promise<void>`

Inherited from `ApplicationV2.minimize`

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

- **type**: `string`  
  The type of event being removed.  
- **listener**: [`EmittedEventListener`](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function being removed.

Returns: `void`

See: [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from `ApplicationV2.removeEventListener`

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<DialogV2>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

- **options?**: `boolean | ApplicationRenderOptions` = `{}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.  
- **_options?**: `ApplicationRenderOptions` = `{}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

Returns: `Promise<DialogV2>`  
A Promise which resolves to the rendered Application instance.

Inherited from `ApplicationV2.render`

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

- **position?**: `Partial<ApplicationPosition>`  
  New Application positioning data.

Returns: `void | ApplicationPosition`  
The updated application position.

Inherited from `ApplicationV2.setPosition`

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

- **submitOptions?**: `object` = `{}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

Returns: `Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

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

- **expanded?**: `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value.  
- **options?**: `{ animate?: boolean }` = `{}`  
  Options to configure the toggling behavior.  
- **animate?**: `boolean`  
  Animate the controls toggling.

Returns: `Promise<void>`  
A Promise which resolves once the control expansion animation is complete.

Inherited from `ApplicationV2.toggleControls`

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Protected method to test whether this Application is allowed to be rendered.

- **options**: `ApplicationRenderOptions`  
  Provided render options.

Returns: `false | void`  
Return false to prevent rendering.

Throws: An Error to display a warning message.

Inherited from `ApplicationV2._canRender`

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Protected method to modify the provided options passed to a render request.

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior.

Returns: `void`

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

Protected method to create a ContextMenu instance used in this Application.

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options.  
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound.  
- **options?**: Object with optional:  
  - `container?`: `HTMLElement`  
    A parent HTMLElement which contains the selector target.  
  - `hookName?`: `string`  
    The hook name.  
  - `parentClassHooks?`: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

Returns: `null | ContextMenu`  
A created ContextMenu or null if no menu items were defined.

Inherited from `ApplicationV2._createContextMenu`

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Protected method to configure the array of header control menu options.

Returns: `ApplicationHeaderControlsEntry[]`

Inherited from `ApplicationV2._getHeaderControls`

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Protected method to get the configuration for a tabs group.

- **group**: `string`  
  The ID of a tabs group.

Returns: `null | ApplicationTabsConfiguration`

Inherited from `ApplicationV2._getTabsConfig`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Protected method to iterate over header control buttons, filtering for controls which are visible for the current client.

Returns: `Generator<ApplicationHeaderControlsEntry, any, any>`

Inherited from `ApplicationV2._headerControlButtons`

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Protected method to insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

- **element**: `HTMLElement`  
  The element to insert.

Returns: `void`

Inherited from `ApplicationV2._insertElement`

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Protected method to handle changes to an input element within the form.

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound.  
- **event**: `Event`  
  An input change event within the form.

Returns: `void`

Inherited from `ApplicationV2._onChangeForm`

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

Protected generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

- **event**: `PointerEvent`  
  The originating click event.  
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`.

Returns: `void`

Inherited from `ApplicationV2._onClickAction`

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Protected method to handle click events on a tab within the Application.

- **event**: `PointerEvent`

Returns: `void`

Inherited from `ApplicationV2._onClickTab`

---

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Protected actions performed after closing the Application. Post-close steps are not awaited by the  
close process.

- **options**: `ApplicationRenderOptions`  
  Provided render options.

Returns: `void`

Inherited from `ApplicationV2._onClose`

---

### _onKeyDown

```typescript
_onKeyDown(event: KeyboardEvent): void
```

Protected method to handle keypresses within the dialog.

- **event**: `KeyboardEvent`  
  The triggering event.

Returns: `void`

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Protected actions performed after the Application is re-positioned.

- **position**: `ApplicationPosition`  
  The requested application position.

Returns: `void`

Inherited from `ApplicationV2._onPosition`

---

### _onRender

```typescript
_onRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected actions performed after any render of the Application.

- **context**: `ApplicationRenderContext`  
  Prepared context data.  
- **options**: `ApplicationRenderOptions`  
  Provided render options.

Returns: `Promise<void>`

Inherited from `ApplicationV2._onRender`

---

### _onSubmit

```typescript
_onSubmit(
    target: HTMLButtonElement,
    event: PointerEvent | SubmitEvent,
): Promise<DialogV2>
```

Protected method to handle submitting the dialog.

- **target**: `HTMLButtonElement`  
  The button that was clicked or the default button.  
- **event**: `PointerEvent | SubmitEvent`  
  The triggering event.

Returns: `Promise<DialogV2>`

---

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Protected method to handle submission for an Application which uses the form element.

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound.  
- **event**: `Event | SubmitEvent`  
  The form submission event.

Returns: `Promise<void>`

Inherited from `ApplicationV2._onSubmitForm`

---

### _preClose

```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```

Protected actions performed before closing the Application. Pre-close steps are awaited by the  
close process.

- **options**: `ApplicationRenderOptions`  
  Provided render options.

Returns: `Promise<void>`

Inherited from `ApplicationV2._preClose`

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected actions performed before a first render of the Application.

- **context**: `ApplicationRenderContext`  
  Prepared context data.  
- **options**: `ApplicationRenderOptions`  
  Provided render options.

Returns: `Promise<void>`

Inherited from `ApplicationV2._preFirstRender`

---

### _prepareContext

```typescript
_prepareContext(
    options: ApplicationRenderOptions,
): Promise<ApplicationRenderContext>
```

Protected method to prepare application rendering context data for a given render request. If exactly one tab  
group is configured for this application, it will be prepared automatically.

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior.

Returns: `Promise<ApplicationRenderContext>`  
Context data for the render operation.

Inherited from `ApplicationV2._prepareContext`

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Protected method to prepare application tab data for a single tab group.

- **group**: `string`  
  The ID of the tab group to prepare.

Returns: `Record<string, ApplicationTab>`

Inherited from `ApplicationV2._prepareTabs`

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Protected actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because `setPosition` is synchronous.

- **position**: `ApplicationPosition`  
  The requested application position.

Returns: `void`

Inherited from `ApplicationV2._prePosition`

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

- **context**: `ApplicationRenderContext`  
  Prepared context data.  
- **options**: `ApplicationRenderOptions`  
  Provided render options.

Returns: `Promise<void>`

Inherited from `ApplicationV2._preRender`

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Protected method to remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

- **element**: `HTMLElement`  
  The element to be removed.

Returns: `void`

Inherited from `ApplicationV2._removeElement`

---

### _renderButtons

```typescript
_renderButtons(): string
```

Protected method to render configured buttons.

Returns: `string`

---

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Protected method to render the outer framing HTMLElement which wraps the inner HTML of the Application.

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior.

Returns: `Promise<HTMLElement>`

Inherited from `ApplicationV2._renderFrame`

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Protected method to render a header control button.

- **control**: `ApplicationHeaderControlsEntry`

Returns: `HTMLLIElement`

Inherited from `ApplicationV2._renderHeaderControl`

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Protected method to remove elements from the DOM and trigger garbage collection as part of application  
closure.

- **options**: `ApplicationClosingOptions`

Returns: `void`

Inherited from `ApplicationV2._tearDown`

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

Protected method when the Application is rendered, optionally update aspects of the window frame.

- **options**: `ApplicationRenderOptions`  
  Options provided at render-time.

Returns: `void`

Inherited from `ApplicationV2._updateFrame`

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Protected method to translate a requested application position update into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning behavior.

- **position**: `ApplicationPosition`  
  Requested Application positioning data.

Returns: `ApplicationPosition`  
Resolved Application positioning data.

Inherited from `ApplicationV2._updatePosition`

---

### confirm (Static)

```typescript
static confirm(
    config?: Partial<
        ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions
    >,
): Promise<any>
```

A utility helper to generate a dialog with yes and no buttons.

- **config?**: `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`  
Optional configuration.

- **yes**:  
Options to overwrite the default yes button configuration.

- **no**:  
Options to overwrite the default no button configuration.

Returns: `Promise<any>`  
Resolves to `true` if the yes button was pressed, or `false` if the no button was pressed. If  
additional buttons were provided, the Promise resolves to the identifier of the one that was  
pressed, or the value returned by its callback. If the dialog was dismissed, and `rejectClose` is  
`false`, the Promise resolves to `null`.

---

### inheritanceChain (Static)

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

Returns: `Generator<typeof ApplicationV2, void, unknown>`

See: [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

Inherited from `ApplicationV2.inheritanceChain`

---

### input (Static)

```typescript
static input(
    config?: Partial<
        ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions
    >,
): Promise<any>
```

A utility helper to generate a dialog for user input.

- **config?**: `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`

- **ok**:  
Options to overwrite the default confirmation button configuration.

Returns: `Promise<any>`  
Resolves to the data of the form if the ok button was pressed, or the value returned by that  
button's callback. If additional buttons were provided, the Promise resolves to the identifier  
of the one that was pressed, or the value returned by its callback. If the dialog was dismissed,  
and `rejectClose` is false, the Promise resolves to `null`.

---

### parseCSSDimension (Static)

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

- **style**: `string`  
  The CSS style rule.  
- **parentDimension**: `number`  
  The relevant dimension of the parent element.

Returns: `number | void`  
The parsed style dimension in pixels.

Inherited from `ApplicationV2.parseCSSDimension`

---

### prompt (Static)

```typescript
static prompt(
    config?: Partial<
        ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions
    >,
): Promise<any>
```

A utility helper to generate a dialog with a single confirmation button.

- **config?**: `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`

- **ok**:  
Options to overwrite the default confirmation button configuration.

Returns: `Promise<any>`  
Resolves to the identifier of the button used to submit the dialog, or the value returned by  
that button's callback. If additional buttons were provided, the Promise resolves to the  
identifier of the one that was pressed, or the value returned by its callback. If the dialog was  
dismissed, and rejectClose is false, the Promise resolves to `null`.

---

### query (Static)

```typescript
static query(
    user: any,
    type: "input" | "wait" | "prompt" | "confirm",
    config?: object,
): Promise<any>
```

Present an asynchronous Dialog query to a specific User for response.

- **user**: `any`  
  A User instance or a User id.  
- **type**: `"input" | "wait" | "prompt" | "confirm"`  
  The type of Dialog to present.  
- **config?**: `object` = `{}`  
  Dialog configuration forwarded on to the Dialog.prompt, Dialog.confirm, Dialog.input, or  
  Dialog.wait function depending on the query type. Callback options are not supported.

Returns: `Promise<any>`  
The query response or `null` if no response was provided.

See:  
[DialogV2.prompt](#prompt)  
[DialogV2.confirm](#confirm)  
[DialogV2.input](#input)  
[DialogV2.wait](#wait)

---

### wait (Static)

```typescript
static wait(
    config?: Partial<
        ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions
    >,
): Promise<any>
```

Spawn a dialog and wait for it to be dismissed or submitted.

- **config?**: `Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>` = `{}`

Returns: `Promise<any>`  
Resolves to the identifier of the button used to submit the dialog, or the value returned by  
that button's callback. If the dialog was dismissed, and `rejectClose` is false, the Promise  
resolves to `null`.

---

### waitForImages (Static)

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

- **element**: `HTMLElement`  
  The element.

Returns: `Promise<void>`

Inherited from `ApplicationV2.waitForImages`

---

### _onClickButton (Static, Protected)

```typescript
static _onClickButton(
    ...this: any,
    event: PointerEvent,
    target: HTMLButtonElement,
): void
```

Protected method to redirect all clicks of buttons with action specifications to the submit handler.

- **...this**: `any`  
- **event**: `PointerEvent`  
  The originating click event.  
- **target**: `HTMLButtonElement`  
  The button element that was clicked.

Returns: `void`
