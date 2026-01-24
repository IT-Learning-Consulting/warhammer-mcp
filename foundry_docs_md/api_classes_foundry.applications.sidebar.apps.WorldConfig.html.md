# WorldConfig

The World Management setup application.

## Hierarchy
- Extends: `ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions, this>`

## Constructors

```typescript
new WorldConfig(
    options: Partial<ApplicationConfiguration> & WorldConfigOptions,
): WorldConfig
```

**Parameters:**

- **options**: `Partial<ApplicationConfiguration> & WorldConfigOptions`  
  Application configuration options.

**Returns:**  
`WorldConfig`

_Overrides_ HandlebarsApplicationMixin(ApplicationV2).constructor

---

## Properties

### options

**Type:** `Readonly<ApplicationConfiguration>`

Application instance configuration options.  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).options

---

### position

**Type:** `ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).position

---

### tabGroups

**Type:** `Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).tabGroups

---

### world

**Type:** `World`

The World being configured.

---

### DEFAULT_OPTIONS

**Type:**  
```typescript
{
    form: {
        closeOnSubmit: boolean;
        handler: (
            event: Event | SubmitEvent,
            form: HTMLFormElement,
            formData: FormDataExtended,
        ) => Promise<any>;
    };
    id: string;
    position: { width: number };
    tag: string;
    window: { contentClasses: string[]; icon: string };
} = ...
```

_Static_

---

### PARTS

**Type:**  
```typescript
{
    config: { scrollable: string[]; template: string };
    footer: { template: string };
} = ...
```

_Static_

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.  
**Returns:** `DOMTokenList`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).classList

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.  
**Returns:** `HTMLElement`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).element

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?  
**Returns:** `null | HTMLFormElement`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).form

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?  
**Returns:** `boolean`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).hasFrame

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

**Returns:** `string`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).id

---

### isCreate

```typescript
get isCreate(): boolean
```

Is this World to be created?  
**Returns:** `boolean`

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?  
**Returns:** `boolean`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).minimized

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?  
**Returns:** `boolean`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).rendered

---

### state

```typescript
get state(): number
```

The current render state of the Application.  
**Returns:** `number`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).state

---

### title

```typescript
get title(): string
```

**Returns:** `string`  
_Overrides_ HandlebarsApplicationMixin(ApplicationV2).title

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

**Returns:**

- **close**: `HTMLButtonElement`
- **content**: `HTMLElement`
- **controls**: `HTMLButtonElement`
- **controlsDropdown**: `HTMLDivElement`
- **header**: `HTMLElement`
- **icon**: `HTMLElement`
- **onDrag**: `Function`
- **onResize**: `Function`
- **pointerMoveThrottle**: `boolean`
- **pointerStartPosition**: `ApplicationPosition`
- **resize**: `HTMLElement`
- **title**: `HTMLHeadingElement`

_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).window

---

## Methods

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): void
```

**Parameters:**

- **formConfig**: `any`  
- **event**: `any`

**Returns:** `void`

_Overrides_ HandlebarsApplicationMixin(ApplicationV2)._onChangeForm

---

### _prepareContext

```typescript
_prepareContext(
    options?: {},
): Promise<{
    buttons: { icon: string; label: string; type: string }[];
    fields: any;
    inWorld: boolean;
    isCreate: boolean;
    nextSession: string;
    rootId: string;
    source: any;
    themes: {};
    worldId: any;
    worldKbUrl: string;
    worldTitle: any;
}>
```

**Parameters:**

- **options**: `{}` _(optional, default = {})_

**Returns:**  
`Promise` resolving to an object containing:

- `buttons`: Array of button descriptors `{ icon: string; label: string; type: string }[]`
- `fields`: `any`
- `inWorld`: `boolean`
- `isCreate`: `boolean`
- `nextSession`: `string`
- `rootId`: `string`
- `source`: `any`
- `themes`: `{}`
- `worldId`: `any`
- `worldKbUrl`: `string`
- `worldTitle`: `any`

_Overrides_ HandlebarsApplicationMixin(ApplicationV2)._prepareContext

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters:**

- **context**: `ApplicationRenderContext` — Context data for the render operation
- **options**: `ApplicationRenderOptions` — Options which configure application rendering behavior

**Returns:** `Promise<any>`  
The result of HTML rendering may be implementation specific. Whatever value is returned here is passed to `_replaceHTML`.  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._renderHTML

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

**Parameters:**

- **type**: `string` — The type of event being registered for
- **listener**: `EmittedEventListener` — The listener function called when the event occurs
- **options** (optional): `{ once?: boolean }` — Options which configure the event listener  
  - **once**?: `boolean` — Should the event only be responded to once and then removed

**Returns:** `void`

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp.  

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).bringToFront

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

**Parameters:**

- **tab**: `string` — The name of the tab which should become active
- **group**: `string` — The name of the tab group which defines the set of tabs
- **options** (optional):
  - **event**?: `Event` — An interaction event which caused the tab change, if any
  - **force**?: `boolean` — Force changing the tab even if the new tab is already active
  - **navElement**?: `HTMLElement` — An explicit navigation element being modified
  - **updatePosition**?: `boolean` — Update application position after changing the tab?

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).changeTab

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<WorldConfig>
```

Close the Application, removing it from the DOM.

**Parameters:**

- **options** (optional): `Partial<ApplicationClosingOptions>` — Options which modify how the application is closed.

**Returns:**  
`Promise<WorldConfig>` — A Promise which resolves to the closed Application instance  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).close

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters:**

- **event**: `Event` — The Event to dispatch

**Returns:**  
`boolean` — Was default behavior for the event prevented?

See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).minimize

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters:**

- **type**: `string` — The type of event being removed
- **listener**: `EmittedEventListener` — The listener function being removed

**Returns:** `void`

See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).removeEventListener

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<WorldConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters:**

- **options** (optional): `boolean | ApplicationRenderOptions` — Options which configure application rendering behavior. A boolean is interpreted as the "force" option.
- **_options** (optional): `ApplicationRenderOptions` — Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns:**  
`Promise<WorldConfig>` — A Promise which resolves to the rendered Application instance  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).render

---

### setPosition

```typescript
setPosition(
    position?: Partial<ApplicationPosition>,
): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters:**

- **position** (optional): `Partial<ApplicationPosition>` — New Application positioning data

**Returns:**  
`void | ApplicationPosition` — The updated application position  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters:**

- **submitOptions** (optional): `object` — Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns:**  
`Promise<any>` — A promise that resolves to the returned result of the form submission handler, if any.  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).submit

---

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters:**

- **expanded** (optional): `boolean` — Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value
- **options** (optional): `{ animate?: boolean }` — Options to configure the toggling behavior.
  - **animate**?: `boolean` — Animate the controls toggling.

**Returns:**  
`Promise<void>` — A Promise which resolves once the control expansion animation is complete  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2).toggleControls

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Protected. Attach event listeners to the Application frame.

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Protected. Test whether this Application is allowed to be rendered.

**Parameters:**

- **options**: `ApplicationRenderOptions` — Provided render options

**Returns:**  
`false | void` — Return false to prevent rendering

**Throws:** An `Error` to display a warning message  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._canRender

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Protected. Modify the provided options passed to a render request.

**Parameters:**

- **options**: `ApplicationRenderOptions` — Options which configure application rendering behavior

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions

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

Protected. Create a ContextMenu instance used in this Application.

**Parameters:**

- **handler**: `() => ContextMenuEntry[]` — A handler function that provides initial context options
- **selector**: `string` — A CSS selector to which the ContextMenu will be bound
- **options** (optional):
  - **container**?: `HTMLElement` — A parent HTMLElement which contains the selector target
  - **hookName**?: `string` — The hook name
  - **parentClassHooks**?: `boolean` — Whether to call hooks for the parent classes in the inheritance chain.

**Returns:**  
`null | ContextMenu` — A created ContextMenu or null if no menu items were defined  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._createContextMenu

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Protected. Configure the array of header control menu options.

**Returns:**  
`ApplicationHeaderControlsEntry[]`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Protected. Get the configuration for a tabs group.

**Parameters:**

- **group**: `string` — The ID of a tabs group

**Returns:**  
`null | ApplicationTabsConfiguration`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Protected. Iterate over header control buttons, filtering for controls which are visible for the current client.

**Yields:** `ApplicationHeaderControlsEntry`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(
    options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```

Protected. Initialize configuration options for the Application instance.  
The default behavior of this method is to intelligently merge options for each class with those of their parents.  
- Array-based options are concatenated  
- Inner objects are merged  
- Otherwise, properties in the subclass replace those defined by a parent

**Parameters:**

- **options**: `Partial<ApplicationConfiguration>` — Options provided directly to the constructor

**Returns:**  
`ApplicationConfiguration` — Configured options for the application instance  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Protected. Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters:**

- **element**: `HTMLElement` — The element to insert

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._insertElement

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

Protected. A generic event handler for action clicks which can be extended by subclasses.  
Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have no defined handler.

**Parameters:**

- **event**: `PointerEvent` — The originating click event
- **target**: `HTMLElement` — The capturing HTML element which defined a `[data-action]`

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._onClickAction

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Protected. Handle click events on a tab within the Application.

**Parameters:**

- **event**: `PointerEvent`

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._onClickTab

---

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Protected. Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters:**

- **options**: `ApplicationRenderOptions` — Provided render options

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._onClose

---

### _onFirstRender

```typescript
_onFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected. Actions performed after a first render of the Application.

**Parameters:**

- **context**: `ApplicationRenderContext` — Prepared context data
- **options**: `ApplicationRenderOptions` — Provided render options

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._onFirstRender

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Protected. Actions performed after the Application is re-positioned.

**Parameters:**

- **position**: `ApplicationPosition` — The requested application position

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._onPosition

---

### _onRender

```typescript
_onRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected. Actions performed after any render of the Application.

**Parameters:**

- **context**: `ApplicationRenderContext` — Prepared context data
- **options**: `ApplicationRenderOptions` — Provided render options

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._onRender

---

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Protected. Handle submission for an Application which uses the form element.

**Parameters:**

- **formConfig**: `ApplicationFormConfiguration` — The form configuration for which this handler is bound
- **event**: `Event | SubmitEvent` — The form submission event

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm

---

### _preClose

```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```

Protected. Actions performed before closing the Application. Pre-close steps are awaited by the close process.

**Parameters:**

- **options**: `ApplicationRenderOptions` — Provided render options

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected. Actions performed before a first render of the Application.

**Parameters:**

- **context**: `ApplicationRenderContext` — Prepared context data
- **options**: `ApplicationRenderOptions` — Provided render options

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._preFirstRender

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Protected. Prepare application tab data for a single tab group.

**Parameters:**

- **group**: `string` — The ID of the tab group to prepare

**Returns:**  
`Record<string, ApplicationTab>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._prepareTabs

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Protected. Actions performed before the Application is re-positioned. Pre-position steps are not awaited because setPosition is synchronous.

**Parameters:**

- **position**: `ApplicationPosition` — The requested application position

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._prePosition

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected. Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters:**

- **context**: `ApplicationRenderContext` — Prepared context data
- **options**: `ApplicationRenderOptions` — Provided render options

**Returns:** `Promise<void>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._preRender

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Protected. Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters:**

- **element**: `HTMLElement` — The element to be removed

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._removeElement

---

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Protected. Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters:**

- **options**: `ApplicationRenderOptions` — Options which configure application rendering behavior

**Returns:** `Promise<HTMLElement>`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._renderFrame

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Protected. Render a header control button.

**Parameters:**

- **control**: `ApplicationHeaderControlsEntry`

**Returns:** `HTMLLIElement`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions,
): void
```

Protected. Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

**Parameters:**

- **result**: `any` — The result returned by the application rendering backend
- **content**: `HTMLElement` — The content element into which the rendered result must be inserted
- **options**: `ApplicationRenderOptions` — Options which configure application rendering behavior

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._replaceHTML

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Protected. Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters:**

- **options**: `ApplicationClosingOptions`

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._tearDown

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

Protected. When the Application is rendered, optionally update aspects of the window frame.

**Parameters:**

- **options**: `ApplicationRenderOptions` — Options provided at render-time

**Returns:** `void`  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Protected. Translate a requested application position updated into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

**Parameters:**

- **position**: `ApplicationPosition` — Requested Application positioning data

**Returns:**  
`ApplicationPosition` — Resolved Application positioning data  
_Inherited from_ HandlebarsApplicationMixin(ApplicationV2)._updatePosition

---

For further detailed type definitions refer to the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/).