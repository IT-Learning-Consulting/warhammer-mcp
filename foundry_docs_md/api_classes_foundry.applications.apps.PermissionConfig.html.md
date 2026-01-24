# PermissionConfig

An application for configuring the permissions which are available to each User role.

**Mixes:**  
- HandlebarsApplication

**Hierarchy:**  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.apps.PermissionConfig)  
`ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions, this>`  
→ **PermissionConfig**

---

## Constructors

### constructor

```typescript
new PermissionConfig(
    options?: Partial<ApplicationConfiguration>
): PermissionConfig
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance

**Returns**  
`PermissionConfig`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).constructor

---

## Properties

### options

`options: Readonly<ApplicationConfiguration>`

Application instance configuration options.

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).options

### position

`position: ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).position

### tabGroups

`tabGroups: Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).tabGroups

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: { reset: (...this: any, event: PointerEvent) => Promise<void> };
    form: {
        closeOnSubmit: boolean;
        handler: (
            ...this: any,
            event: SubmitEvent,
            form: HTMLFormElement,
            formData: FormDataExtended
        ) => Promise<void>;
    };
    id: string;
    position: { width: number };
    tag: string;
    window: { contentClasses: string[]; icon: string; title: string };
} = ...
```

### emittedEvents

`emittedEvents: readonly ["render", "close", "position"] = ...`

### PARTS

```typescript
PARTS: {
    footer: { template: string };
    permissions: { id: string; scrollable: string[]; template: string };
} = ...
```

### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

### TABS

`TABS: Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

**Returns**  
`DOMTokenList`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).classList

### element

```typescript
get element(): HTMLElement
```

The `HTMLElement` which renders this Application into the DOM.

**Returns**  
`HTMLElement`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).element

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns**  
`null | HTMLFormElement`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).form

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).hasFrame

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

**Returns**  
`string`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).id

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).minimized

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).rendered

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns**  
`number`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).state

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

**Returns**  
`string`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).title

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

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).window

---

## Methods

### _prepareContext

```typescript
_prepareContext(
    _options?: {}
): Promise<{
    buttons: (
        | { action: string; icon: string; label: string; type: string }
        | { action?: undefined; icon: string; label: string; type: string }
    )[];
    permissions: object[];
    roles: {};
}>
```

Overrides HandlebarsApplicationMixin(`ApplicationV2`)._prepareContext

**Parameters**

- **_options**: `{}` = `{}`

**Returns**  
`Promise<{ buttons: ..., permissions: object[], roles: {} }>`

---

### _renderHTML

```typescript
_ renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an `HTMLElement` for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Context data for the render operation  
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options which configure application rendering behavior

**Returns**  
`Promise<any>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._renderHTML

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
- **options**: `{ once?: boolean } = {}` (optional)  
  Options which configure the event listener

  - **once**?: `boolean`  
    Should the event only be responded to once and then removed

**Returns**  
`void`

See: [MDN - EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from HandlebarsApplicationMixin(`ApplicationV2`).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once `ApplicationV1` is deprecated we should switch from `_maxZ` to `ApplicationV2#maxZ`.  
We should also eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).bringToFront

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
- **options**? (optional)

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

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).changeTab

---

### close

```typescript
close(
    options?: Partial<ApplicationClosingOptions>
): Promise<PermissionConfig>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options**?: `Partial<ApplicationClosingOptions>` = `{}` (optional)  
  Options which modify how the application is closed.

**Returns**  
`Promise<PermissionConfig>`  
A Promise which resolves to the closed Application instance

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).close

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

See: [MDN - EventTarget.dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from HandlebarsApplicationMixin(`ApplicationV2`).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).minimize

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

See: [MDN - EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from HandlebarsApplicationMixin(`ApplicationV2`).removeEventListener

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions
): Promise<PermissionConfig>
```

Render the Application, creating its `HTMLElement` and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options**?: `boolean | ApplicationRenderOptions` = `{}` (optional)  
  Options which configure application rendering behavior. A boolean is interpreted as the "force" option.  
- **_options**?: `ApplicationRenderOptions` = `{}` (optional)  
  Legacy options for backwards-compatibility with the original `ApplicationV1#render` signature.

**Returns**  
`Promise<PermissionConfig>`  
A Promise which resolves to the rendered Application instance

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).render

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position**?: `Partial<ApplicationPosition>` (optional)  
  New Application positioning data

**Returns**  
`void | ApplicationPosition`  
The updated application position

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an `ApplicationV2` instance which implements a single top-level form.

**Parameters**

- **submitOptions**: `object` = `{}` (optional)  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns**  
`Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).submit

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

- **expanded**?: `boolean` (optional)  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.  
- **options**?: `{ animate?: boolean } = {}` (optional)  
  Options to configure the toggling behavior.

  - **animate**?: `boolean`  
    Animate the controls toggling.

**Returns**  
`Promise<void>`  
A Promise which resolves once the control expansion animation is complete

Inherited from HandlebarsApplicationMixin(`ApplicationV2`).toggleControls

---

### _attachFrameListeners

```typescript
protected _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._attachFrameListeners

---

### _canRender

```typescript
protected _canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`false | void`  
Return false to prevent rendering.

**Throws**  
An `Error` to display a warning message.

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._canRender

---

### _configureRenderOptions

```typescript
protected _configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._configureRenderOptions

---

### _createContextMenu

```typescript
protected _createContextMenu(
    handler: () => ContextMenuEntry[],
    selector: string,
    options?: {
        container?: HTMLElement;
        hookName?: string;
        parentClassHooks?: boolean;
    }
): null | ContextMenu
```

Create a `ContextMenu` instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options  
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound  
- **options**? (optional)

  - **container**?: `HTMLElement`  
    A parent HTMLElement which contains the selector target  
  - **hookName**?: `string`  
    The hook name  
  - **parentClassHooks**?: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._createContextMenu

---

### _getHeaderControls

```typescript
protected _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._getHeaderControls

---

### _getTabsConfig

```typescript
protected _getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns**  
`null | ApplicationTabsConfiguration`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._getTabsConfig

---

### _headerControlButtons

```typescript
protected _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

**Yields**  
`ApplicationHeaderControlsEntry`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._headerControlButtons

---

### _initializeApplicationOptions

```typescript
protected _initializeApplicationOptions(
    options: Partial<ApplicationConfiguration>
): ApplicationConfiguration
```

Initialize configuration options for the Application instance. The default behavior of this method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated  
- Inner objects are merged  
- Otherwise, properties in the subclass replace those defined by a parent

**Parameters**

- **options**: `Partial<ApplicationConfiguration>`  
  Options provided directly to the constructor

**Returns**  
`ApplicationConfiguration`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._initializeApplicationOptions

---

### _insertElement

```typescript
protected _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._insertElement

---

### _onChangeForm

```typescript
protected _onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound  
- **event**: `Event`  
  An input change event within the form

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onChangeForm

---

### _onClickAction

```typescript
protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event  
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onClickAction

---

### _onClickTab

```typescript
protected _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onClickTab

---

### _onClose

```typescript
protected _onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onClose

---

### _onFirstRender

```typescript
protected _onFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions
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

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onFirstRender

---

### _onPosition

```typescript
protected _onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onPosition

---

### _onRender

```typescript
protected _onRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions
): Promise<void>
```

Actions performed after any render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data  
- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onRender

---

### _onSubmitForm

```typescript
protected _onSubmitForm(
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

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._onSubmitForm

---

### _preClose

```typescript
protected _preClose(options: ApplicationRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close process.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._preClose

---

### _preFirstRender

```typescript
protected _preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions
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

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._preFirstRender

---

### _prepareTabs

```typescript
protected _prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**  
`Record<string, ApplicationTab>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._prepareTabs

---

### _prePosition

```typescript
protected _prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._prePosition

---

### _preRender

```typescript
protected _preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data  
- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._preRender

---

### _removeElement

```typescript
protected _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._removeElement

---

### _renderFrame

```typescript
protected _renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`Promise<HTMLElement>`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._renderFrame

---

### _renderHeaderControl

```typescript
protected _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**  
`HTMLLIElement`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._renderHeaderControl

---

### _replaceHTML

```typescript
protected _replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend  
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted  
- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._replaceHTML

---

### _tearDown

```typescript
protected _tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._tearDown

---

### _updateFrame

```typescript
protected _updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options provided at render-time

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._updateFrame

---

### _updatePosition

```typescript
protected _updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position update into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns**  
`ApplicationPosition`  
Resolved Application positioning data

Inherited from HandlebarsApplicationMixin(`ApplicationV2`)._updatePosition

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

See: [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

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