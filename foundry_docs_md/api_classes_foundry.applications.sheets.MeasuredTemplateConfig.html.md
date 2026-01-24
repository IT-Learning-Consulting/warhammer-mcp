# MeasuredTemplateConfig

The Application responsible for configuring a single MeasuredTemplate document within a parent Scene.

## Class MeasuredTemplateConfig

### Constructor

```typescript
MeasuredTemplateConfig(object, options)
```

- **object**: The document being configured.
- **options**: Application configuration options.

[Hierarchy (View Summary, Expand)](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.MeasuredTemplateConfig)

Extends:

- [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html) &lt; [ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html), [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html), this &gt;

---

## Properties

### options

`options: Readonly<ApplicationConfiguration>`

Application instance configuration options.  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).options`

---

### position

`position: ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).position`

---

### tabGroups

`tabGroups: Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).tabGroups`

---

## Accessors

### Static: DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    canCreate: boolean;
    classes: string[];
    form: { closeOnSubmit: boolean };
    position: { width: number };
    window: { contentClasses: string[]; icon: string };
} = ...
```

---

### Static: PARTS

```typescript
PARTS: {
    footer: { template: string };
    main: { root: boolean; template: string };
} = ...
```

---

### classList

```typescript
get classList(): DOMTokenList
```
The CSS class list of this Application instance.  
Returns: `DOMTokenList`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).classList`

---

### element

```typescript
get element(): HTMLElement
```
The HTMLElement which renders this Application into the DOM.  
Returns: `HTMLElement`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).element`

---

### form

```typescript
get form(): null | HTMLFormElement
```
Does this Application have a top-level form element?  
Returns: `null` | `HTMLFormElement`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).form`

---

### hasFrame

```typescript
get hasFrame(): boolean
```
Does this Application instance render within an outer window frame?  
Returns: `boolean`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).hasFrame`

---

### id

```typescript
get id(): string
```
The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.  
Returns: `string`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).id`

---

### minimized

```typescript
get minimized(): boolean
```
Is this Application instance currently minimized?  
Returns: `boolean`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).minimized`

---

### rendered

```typescript
get rendered(): boolean
```
Is this Application instance currently rendered?  
Returns: `boolean`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).rendered`

---

### state

```typescript
get state(): number
```
The current render state of the Application.  
Returns: `number`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).state`

---

### title

```typescript
get title(): string
```
A convenience reference to the title of the Application window.  
Returns: `string`  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).title`

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
Returns:

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

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).window`

---

## Methods

### _prepareContext

```typescript
_prepareContext(
    options: any,
): Promise<
    ApplicationRenderContext & {
        buttons: { icon: string; label: string; type: string }[];
        templateTypes: {};
        units: { degrees: string; gridUnits: any; pixels: string };
        userColor: any;
    }
>
```

- **Parameters:**
  - **options**: `any`
- **Returns:**  
  A `Promise` resolving to an object extending `ApplicationRenderContext` containing:
  - **buttons**: Array of objects with `icon`, `label`, and `type` strings.
  - **templateTypes**: Object.
  - **units**: Object with `degrees` (string), `gridUnits` (any), `pixels` (string).
  - **userColor**: any.

Overrides `HandlebarsApplicationMixin(DocumentSheetV2)._prepareContext`  
Abstract

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.  

- **Parameters:**
  - **context**: `ApplicationRenderContext` - Context data for the render operation
  - **options**: `ApplicationRenderOptions` - Options which configure application rendering behavior
- **Returns:**  
  A `Promise` of any value. The result is passed to `_replaceHTML`.  

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._renderHTML`

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
  - **type**: `string` - The type of event being registered for
  - **listener**: `EmittedEventListener` - The listener function called when the event occurs
  - **options** (optional): `{ once?: boolean }` - Options which configure the event listener
    - **once** (optional): `boolean` - Should the event only be responded to once and then removed
- **Returns:** `void`

See: [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).addEventListener`

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated, this should switch from `_maxZ` to `ApplicationV2#maxZ`. Also should eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).bringToFront`

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
  - **tab**: `string` - The name of the tab which should become active
  - **group**: `string` - The name of the tab group which defines the set of tabs
  - **options** (optional):
    - **event**?: `Event` - An interaction event which caused the tab change, if any
    - **force**?: `boolean` - Force changing the tab even if the new tab is already active
    - **navElement**?: `HTMLElement` - An explicit navigation element being modified
    - **updatePosition**?: `boolean` - Update application position after changing the tab?
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).changeTab`

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<MeasuredTemplateConfig>
```

Close the Application, removing it from the DOM.

- **Parameters:**
  - **options** (optional): `Partial<ApplicationClosingOptions>` - Options which modify how the application is closed.
- **Returns:**  
  A `Promise` which resolves to the closed Application instance.

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).close`

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

- **Parameters:**
  - **event**: `Event` - The Event to dispatch
- **Returns:**  
  `boolean` - Was default behavior for the event prevented?

See: [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).dispatchEvent`

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).maximize`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).minimize`

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

- **Parameters:**
  - **type**: `string` - The type of event being removed
  - **listener**: `EmittedEventListener` - The listener function being removed
- **Returns:** `void`

See: [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).removeEventListener`

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<MeasuredTemplateConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

- **Parameters:**
  - **options** (optional): `boolean` | `ApplicationRenderOptions` = {}  
    Options which configure application rendering behavior. A boolean is interpreted as the "force" option.
  - **_options** (optional): `ApplicationRenderOptions` = {}  
    Legacy options for backwards-compatibility with the original ApplicationV1#render signature.
- **Returns:**  
  A Promise which resolves to the rendered Application instance.

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).render`

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

- **Parameters:**
  - **position** (optional): `Partial<ApplicationPosition>` - New Application positioning data
- **Returns:**  
  `void` | `ApplicationPosition` - The updated application position

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).setPosition`

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

- **Parameters:**
  - **submitOptions** (optional): `object` = {}  
    Arbitrary options which are supported by and provided to the configured form submission handler.
- **Returns:**  
  A promise that resolves to the returned result of the form submission handler, if any.

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).submit`

---

### toggleControls

```typescript
toggleControls(expanded?: boolean, options?: { animate?: boolean }): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

- **Parameters:**
  - **expanded** (optional): `boolean`  
    Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.
  - **options** (optional): `{ animate?: boolean }` = {}  
    Options to configure the toggling behavior.
    - **animate** (optional): `boolean` - Animate the controls toggling.
- **Returns:**  
  A Promise which resolves once the control expansion animation is complete.

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2).toggleControls`

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._attachFrameListeners`

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

- **Parameters:**
  - **options**: `ApplicationRenderOptions` - Provided render options
- **Returns:**  
  `false` to prevent rendering or `void`
- **Throws:**  
  An Error to display a warning message

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._canRender`

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

- **Parameters:**
  - **options**: `ApplicationRenderOptions` - Options which configure application rendering behavior
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._configureRenderOptions`

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
  - **handler**: `() => ContextMenuEntry[]` - A handler function that provides initial context options
  - **selector**: `string` - A CSS selector to which the ContextMenu will be bound
  - **options** (optional):
    - **container**?: `HTMLElement` - A parent HTMLElement which contains the selector target
    - **hookName**?: `string` - The hook name
    - **parentClassHooks**?: `boolean` - Whether to call hooks for the parent classes in the inheritance chain.
- **Returns:**  
  A created `ContextMenu` or `null` if no menu items were defined

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._createContextMenu`

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

- **Returns:**  
  Array of `ApplicationHeaderControlsEntry`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._getHeaderControls`

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

- **Parameters:**
  - **group**: `string` - The ID of a tabs group
- **Returns:**  
  `null` or `ApplicationTabsConfiguration`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._getTabsConfig`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

- **Yields:**  
  `ApplicationHeaderControlsEntry`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._headerControlButtons`

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

- **Parameters:**
  - **options**: `Partial<ApplicationConfiguration>` - Options provided directly to the constructor
- **Returns:**  
  Configured options for the application instance

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._initializeApplicationOptions`

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

- **Parameters:**
  - **element**: `HTMLElement` - The element to insert
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._insertElement`

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

- **Parameters:**
  - **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound
  - **event**: `Event` - An input change event within the form
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onChangeForm`

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.

- **Parameters:**
  - **event**: `PointerEvent` - The originating click event
  - **target**: `HTMLElement` - The capturing HTML element which defined a `[data-action]`
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onClickAction`

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

- **Parameters:**
  - **event**: `PointerEvent`
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onClickTab`

---

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

- **Parameters:**
  - **options**: `ApplicationRenderOptions` - Provided render options
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onClose`

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
  - **context**: `ApplicationRenderContext` - Prepared context data
  - **options**: `ApplicationRenderOptions` - Provided render options
- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onFirstRender`

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

- **Parameters:**
  - **position**: `ApplicationPosition` - The requested application position
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onPosition`

---

### _onRender

```typescript
_onRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed after any render of the Application.

- **Parameters:**
  - **context**: `ApplicationRenderContext` - Prepared context data  
  - **options**: `ApplicationRenderOptions` - Provided render options
- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onRender`

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
  - **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound
  - **event**: `Event | SubmitEvent` - The form submission event
- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._onSubmitForm`

---

### _preClose

```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close process.

- **Parameters:**
  - **options**: `ApplicationRenderOptions` - Provided render options
- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._preClose`

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
  - **context**: `ApplicationRenderContext` - Prepared context data
  - **options**: `ApplicationRenderOptions` - Provided render options
- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._preFirstRender`

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

- **Parameters:**
  - **group**: `string` - The ID of the tab group to prepare
- **Returns:**  
  Record mapping tab names to `ApplicationTab` objects

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._prepareTabs`

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.

- **Parameters:**
  - **position**: `ApplicationPosition` - The requested application position
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._prePosition`

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

- **Parameters:**
  - **context**: `ApplicationRenderContext` - Prepared context data
  - **options**: `ApplicationRenderOptions` - Provided render options
- **Returns:** `Promise<void>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._preRender`

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

- **Parameters:**
  - **element**: `HTMLElement` - The element to be removed
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._removeElement`

---

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

- **Parameters:**
  - **options**: `ApplicationRenderOptions` - Options which configure application rendering behavior
- **Returns:**  
  `Promise<HTMLElement>`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._renderFrame`

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

- **Parameters:**
  - **control**: `ApplicationHeaderControlsEntry`
- **Returns:**  
  `HTMLLIElement`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._renderHeaderControl`

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

- **Parameters:**
  - **result**: `any` - The result returned by the application rendering backend
  - **content**: `HTMLElement` - The content element into which the rendered result must be inserted
  - **options**: `ApplicationRenderOptions` - Options which configure application rendering behavior
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._replaceHTML`

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

- **Parameters:**
  - **options**: `ApplicationClosingOptions`
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._tearDown`

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

- **Parameters:**
  - **options**: `ApplicationRenderOptions` - Options provided at render-time
- **Returns:** `void`

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._updateFrame`

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

- **Parameters:**
  - **position**: `ApplicationPosition` - Requested Application positioning data
- **Returns:**  
  `ApplicationPosition` - Resolved Application positioning data

Inherited from `HandlebarsApplicationMixin(DocumentSheetV2)._updatePosition`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)