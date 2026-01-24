# DocumentSheetConfig | Foundry Virtual Tabletop - API Documentation - Version 13

An Application for configuring Document sheet settings.

**Mixes:**  
HandlebarsApplication

**Hierarchy:**  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.apps.DocumentSheetConfig)

> `ApplicationV2< ApplicationConfiguration & DocumentSheetConfiguration, ApplicationRenderOptions & DocumentSheetRenderOptions, this >`  
> DocumentSheetConfig

---

## Constructors

### constructor

```typescript
new DocumentSheetConfig(
  options?: Partial<ApplicationConfiguration & DocumentSheetConfiguration>
): DocumentSheetConfig
```

Applications are constructed by providing an object of configuration options.

- **Parameters**  
  - **options**: `Partial<ApplicationConfiguration & DocumentSheetConfiguration> = {}`  
    Options used to configure the Application instance

- **Returns**  
  `DocumentSheetConfig`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).constructor

---

## Properties

### options

- **Type:** `Readonly<ApplicationConfiguration & DocumentSheetConfiguration>`

Application instance configuration options.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).options

---

### position

- **Type:** `ApplicationPosition`

The current position of the application with respect to the window.document.body.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).position

---

### tabGroups

- **Type:** `Record<string, null | string>`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).tabGroups

---

### BASE_APPLICATION

- **Type:** `typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

---

### DEFAULT_OPTIONS

```typescript
{
  classes: string[];
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
  sheetConfig: boolean;
  window: { contentClasses: string[]; icon: string };
}
```

---

### emittedEvents

- **Type:** `readonly ["render", "close", "position"]`

---

### PARTS

```typescript
{
  footer: { template: string };
  form: { classes: string[]; template: string };
}
```

---

### RENDER_STATES

- **Type:** `Record<string, number>`

The sequence of rendering states that describe the Application life-cycle.

---

### TABS

- **Type:** `Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

- **Returns**  
  `DOMTokenList`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).classList

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

- **Returns**  
  `HTMLElement`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).element

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

- **Returns**  
  `null | HTMLFormElement`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).form

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

- **Returns**  
  `boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).hasFrame

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.

- **Returns**  
  `string`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).id

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

- **Returns**  
  `boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimized

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

- **Returns**  
  `boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).rendered

---

### state

```typescript
get state(): number
```

The current render state of the Application.

- **Returns**  
  `number`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).state

---

### title

```typescript
get title(): string
```

- **Returns**  
  `string`

Overrides HandlebarsApplicationMixin(DocumentSheetV2).title

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

- **Returns**  
  ```
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

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).window

---

## Methods

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): void
```

- **Parameters**  
  - **formConfig**: `any`  
  - **event**: `any`

- **Returns**  
  `void`

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._onChangeForm

---

### _onClose

```typescript
_onClose(_options: any): void
```

- **Parameters**  
  - **_options**: `any`

- **Returns**  
  `void`

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._onClose

---

### _onFirstRender

```typescript
_onFirstRender(_context: any, _options: any): void
```

- **Parameters**  
  - **_context**: `any`  
  - **_options**: `any`

- **Returns**  
  `void`

Overrides HandlebarsApplicationMixin(DocumentSheetV2)._onFirstRender

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

- **Parameters**  
  - **partId**: `any`  
  - **context**: `any`  
  - **options**: `any`

- **Returns**  
  `Promise<any>`

Abstract method.

---

### _renderHTML

```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

- **Parameters**  
  - **context**: `ApplicationRenderContext` - Context data for the render operation  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior

- **Returns**  
  `Promise<any>`

The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to `_replaceHTML`.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderHTML

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

- **Parameters**  
  - **type**: `string` - The type of event being registered for  
  - **listener**: `EmittedEventListener` - The listener function called when the event occurs  
  - **options?**: `{ once?: boolean } = {}` - Options which configure the event listener  
    - **once?**: `boolean` - Should the event only be responded to once and then removed

- **Returns**  
  `void`

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ  
We should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).bringToFront

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

- **Parameters**  
  - **tab**: `string` - The name of the tab which should become active  
  - **group**: `string` - The name of the tab group which defines the set of tabs  
  - **options?**: Object (default `{}`) - Additional options which affect tab navigation  
    - **event?**: `Event` - An interaction event which caused the tab change, if any  
    - **force?**: `boolean` - Force changing the tab even if the new tab is already active  
    - **navElement?**: `HTMLElement` - An explicit navigation element being modified  
    - **updatePosition?**: `boolean` - Update application position after changing the tab?

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).changeTab

---

### close

```typescript
close(
  options?: Partial<ApplicationClosingOptions>
): Promise<DocumentSheetConfig>
```

Close the Application, removing it from the DOM.

- **Parameters**  
  - **options?**: `Partial<ApplicationClosingOptions> = {}` - Options which modify how the application is closed.

- **Returns**  
  `Promise<DocumentSheetConfig>`

A Promise which resolves to the closed Application instance

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).close

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

- **Parameters**  
  - **event**: `Event` - The Event to dispatch

- **Returns**  
  `boolean` - Was default behavior for the event prevented?

See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimize

---

### removeEventListener

```typescript
removeEventListener(
  type: string,
  listener: EmittedEventListener
): void
```

Remove an event listener for a certain type of event.

- **Parameters**  
  - **type**: `string` - The type of event being removed  
  - **listener**: `EmittedEventListener` - The listener function being removed

- **Returns**  
  `void`

See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).removeEventListener

---

### render

```typescript
render(
  options?:
    | boolean
    | (ApplicationRenderOptions & DocumentSheetRenderOptions),
  _options?: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<DocumentSheetConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

- **Parameters**  
  - **options?**: `boolean` | `(ApplicationRenderOptions & DocumentSheetRenderOptions) = {}`  
    Options which configure application rendering behavior. A boolean is interpreted as the  
    "force" option.  
  - **_options?**: `ApplicationRenderOptions & DocumentSheetRenderOptions = {}`  
    Legacy options for backwards-compatibility with the original ApplicationV1#render  
    signature.

- **Returns**  
  `Promise<DocumentSheetConfig>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).render

---

### setPosition

```typescript
setPosition(
  position?: Partial<ApplicationPosition>
): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

- **Parameters**  
  - **position?**: `Partial<ApplicationPosition>` - New Application positioning data

- **Returns**  
  `void | ApplicationPosition` - The updated application position

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).setPosition

---

### submit

```typescript
submit(
  submitOptions?: object
): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

- **Parameters**  
  - **submitOptions?**: `object = {}`  
    Arbitrary options which are supported by and provided to the configured form submission  
    handler.

- **Returns**  
  `Promise<any>` - A promise that resolves to the returned result of the form submission handler, if any.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).submit

---

### toggleControls

```typescript
toggleControls(
  expanded?: boolean,
  options?: { animate?: boolean }
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

- **Parameters**  
  - **expanded?**: `boolean`  
    Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
    current value  
  - **options?**: `{ animate?: boolean } = {}`  
    Options to configure the toggling behavior.  
    - **animate?**: `boolean` - Animate the controls toggling.

- **Returns**  
  `Promise<void>` - A Promise which resolves once the control expansion animation is complete

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).toggleControls

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Protected: Attach event listeners to the Application frame.

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._attachFrameListeners

---

### _canRender

```typescript
_canRender(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): false | void
```

Protected: Test whether this Application is allowed to be rendered.

- **Parameters**  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

- **Returns**  
  `false | void`  
  Return false to prevent rendering

- **Throws**  
  An Error to display a warning message

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._canRender

---

### _configureRenderOptions

```typescript
_configureRenderOptions(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): void
```

Protected: Modify the provided options passed to a render request.

- **Parameters**  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
    Options which configure application rendering behavior

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._configureRenderOptions

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
  }
): null | ContextMenu
```

Protected: Create a ContextMenu instance used in this Application.

- **Parameters**  
  - **handler**: `() => ContextMenuEntry[]` - A handler function that provides initial context options  
  - **selector**: `string` - A CSS selector to which the ContextMenu will be bound  
  - **options?**: Object (default `{}`) - Additional options which affect ContextMenu construction  
    - **container?**: `HTMLElement` - A parent HTMLElement which contains the selector target  
    - **hookName?**: `string` - The hook name  
    - **parentClassHooks?**: `boolean` - Whether to call hooks for the parent classes in the inheritance chain.

- **Returns**  
  `null | ContextMenu` - A created ContextMenu or null if no menu items were defined

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._createContextMenu

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Protected: Configure the array of header control menu options

- **Returns**  
  `ApplicationHeaderControlsEntry[]`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Protected: Get the configuration for a tabs group.

- **Parameters**  
  - **group**: `string` - The ID of a tabs group

- **Returns**  
  `null | ApplicationTabsConfiguration`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getTabsConfig

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Protected: Iterate over header control buttons, filtering for controls which are visible for the current  
client.

- **Returns**  
  `Generator<ApplicationHeaderControlsEntry, any, any>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._headerControlButtons

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(
  options: Partial<ApplicationConfiguration>
): ApplicationConfiguration
```

Protected: Initialize configuration options for the Application instance. The default behavior of this  
method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated  
- Inner objects are merged  
- Otherwise, properties in the subclass replace those defined by a parent

- **Parameters**  
  - **options**: `Partial<ApplicationConfiguration>` - Options provided directly to the constructor

- **Returns**  
  `ApplicationConfiguration` - Configured options for the application instance

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._initializeApplicationOptions

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Protected: Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

- **Parameters**  
  - **element**: `HTMLElement` - The element to insert

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._insertElement

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

Protected: A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

- **Parameters**  
  - **event**: `PointerEvent` - The originating click event  
  - **target**: `HTMLElement` - The capturing HTML element which defined a `[data-action]`

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickAction

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Protected: Handle click events on a tab within the Application.

- **Parameters**  
  - **event**: `PointerEvent`

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickTab

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Protected: Actions performed after the Application is re-positioned.

- **Parameters**  
  - **position**: `ApplicationPosition` - The requested application position

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onPosition

---

### _onRender

```typescript
_onRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<void>
```

Protected: Actions performed after any render of the Application.

- **Parameters**  
  - **context**: `ApplicationRenderContext` - Prepared context data  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onRender

---

### _onSubmitForm

```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent
): Promise<void>
```

Protected: Handle submission for an Application which uses the form element.

- **Parameters**  
  - **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound  
  - **event**: `Event | SubmitEvent` - The form submission event

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onSubmitForm

---

### _preClose

```typescript
_preClose(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<void>
```

Protected: Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

- **Parameters**  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<void>
```

Protected: Actions performed before a first render of the Application.

- **Parameters**  
  - **context**: `ApplicationRenderContext` - Prepared context data  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preFirstRender

---

### _prepareContext

```typescript
_prepareContext(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<ApplicationRenderContext>
```

Protected: Prepare application rendering context data for a given render request. If exactly one tab  
group is configured for this application, it will be prepared automatically.

- **Parameters**  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior

- **Returns**  
  `Promise<ApplicationRenderContext>` - Context data for the render operation

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareContext

---

### _prepareFooterContext

```typescript
_prepareFooterContext(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions
): Promise<void>
```

Protected: Prepare render context for the footer part.

- **Parameters**  
  - **context**: `ApplicationRenderContext`  
  - **options**: `ApplicationRenderOptions`

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareFooterContext

---

### _prepareFormContext

```typescript
_prepareFormContext(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions
): Promise<void>
```

Protected: Prepare render context for the form part.

- **Parameters**  
  - **context**: `ApplicationRenderContext`  
  - **options**: `ApplicationRenderOptions`

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareFormContext

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Protected: Prepare application tab data for a single tab group.

- **Parameters**  
  - **group**: `string` - The ID of the tab group to prepare

- **Returns**  
  `Record<string, ApplicationTab>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareTabs

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Protected: Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because `setPosition` is synchronous.

- **Parameters**  
  - **position**: `ApplicationPosition` - The requested application position

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prePosition

---

### _preRender

```typescript
_preRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<void>
```

Protected: Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

- **Parameters**  
  - **context**: `ApplicationRenderContext`  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`

- **Returns**  
  `Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preRender

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Protected: Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

- **Parameters**  
  - **element**: `HTMLElement` - The element to be removed

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._removeElement

---

### _renderFrame

```typescript
_renderFrame(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): Promise<HTMLElement>
```

Protected: Render the outer framing HTMLElement which wraps the inner HTML of the Application.

- **Parameters**  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`

- **Returns**  
  `Promise<HTMLElement>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderFrame

---

### _renderHeaderControl

```typescript
_renderHeaderControl(
  control: ApplicationHeaderControlsEntry
): HTMLLIElement
```

Protected: Render a header control button.

- **Parameters**  
  - **control**: `ApplicationHeaderControlsEntry`

- **Returns**  
  `HTMLLIElement`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): void
```

Protected: Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

- **Parameters**  
  - **result**: `any` - The result returned by the application rendering backend  
  - **content**: `HTMLElement` - The content element into which the rendered result must be inserted  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._replaceHTML

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Protected: Remove elements from the DOM and trigger garbage collection as part of application  
closure.

- **Parameters**  
  - **options**: `ApplicationClosingOptions`

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._tearDown

---

### _updateFrame

```typescript
_updateFrame(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions
): void
```

Protected: When the Application is rendered, optionally update aspects of the window frame.

- **Parameters**  
  - **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options provided at render-time

- **Returns**  
  `void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Protected: Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

- **Parameters**  
  - **position**: `ApplicationPosition` - Requested Application positioning data

- **Returns**  
  `ApplicationPosition` - Resolved Application positioning data

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updatePosition

---

## Static Methods

### getSheetClassesForSubType

```typescript
static getSheetClassesForSubType(
  documentName: string,
  subType?: string
): {
  defaultClass: string;
  defaultClasses: Record<string, string>;
  sheetClasses: Record<string, string>;
}
```

Marshal information on the available sheet classes for a given document type and sub-type,  
and format it for display.

- **Parameters**  
  - **documentName**: `string` - The Document type.  
  - **subType?**: `string` - The Document sub-type, if applicable.

- **Returns**  
  Object containing:  
  - **defaultClass**: `string`  
  - **defaultClasses**: `Record<string, string>`  
  - **sheetClasses**: `Record<string, string>`

---

### getSheetThemeForDocument

```typescript
static getSheetThemeForDocument(document: ClientDocument): string
```

Retrieve the user's theme preference for the given Document.

- **Parameters**  
  - **document**: `ClientDocument` - The Document.

- **Returns**  
  `string` - The theme identifier, or a blank string if the user has no preference.

---

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

- **Returns**  
  `Generator<typeof ApplicationV2, void, unknown>`

- **See**  
  [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### initializeSheets

```typescript
static initializeSheets(): Promise<void>
```

Initialize the configured sheet preferences for Documents which support dynamic sheet  
assignment.

- **Returns**  
  `Promise<void>`

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

- **Parameters**  
  - **style**: `string` - The CSS style rule  
  - **parentDimension**: `number` - The relevant dimension of the parent element

- **Returns**  
  `number | void` - The parsed style dimension in pixels

---

### registerSheet

```typescript
static registerSheet(
  documentClass: any,
  scope: string,
  sheetClass: typeof Application | typeof ApplicationV2,
  options?: SheetRegistrationOptions
): void
```

Register a sheet class as a candidate to be used to display Documents of a given type.

- **Parameters**  
  - **documentClass**: `any` - The Document class to register a new sheet for.  
  - **scope**: `string` - A unique namespace scope for this sheet.  
  - **sheetClass**: `typeof Application | typeof ApplicationV2` - An Application class used to render the sheet.  
  - **options?**: `SheetRegistrationOptions = {}` - Sheet registration configuration options.

- **Returns**  
  `void`

---

### unregisterSheet

```typescript
static unregisterSheet(
  documentClass: any,
  scope: string,
  sheetClass: typeof Application | typeof ApplicationV2,
  options?: { types?: string[] }
): void
```

Unregister a sheet class, removing it from the list of available Applications to use for a  
Document type.

- **Parameters**  
  - **documentClass**: `any` - The Document class to unregister a sheet option for.  
  - **scope**: `string` - A unique namespace scope for this sheet.  
  - **sheetClass**: `typeof Application | typeof ApplicationV2` - An Application class used to render the sheet.  
  - **options?**: `{ types?: string[] } = {}`  
    - **types?**: `string[]`  
      The sub-types this sheet should be removed for, otherwise all sub-types are  
      unregistered.

- **Returns**  
  `void`

---

### updateDefaultSheets

```typescript
static updateDefaultSheets(setting?: Record<string, string>): void
```

Update the current default sheets using a new core World setting.

- **Parameters**  
  - **setting?**: `Record<string, string> = {}` - The stored default sheet settings.

- **Returns**  
  `void`

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

- **Parameters**  
  - **element**: `HTMLElement` - The element.

- **Returns**  
  `Promise<void>`

---

# Links

- Foundry Virtual Tabletop API Documentation: [https://foundryvtt.com/api/modules.html](https://foundryvtt.com/api/modules.html)  
- HandlebarsApplication: [foundry.applications.html](https://foundryvtt.com/api/modules/foundry.applications.html)  
- ApplicationV2: [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)  
- ApplicationConfiguration: [ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html)  
- DocumentSheetConfiguration: [DocumentSheetConfiguration](https://foundryvtt.com/api/interfaces/foundry.DocumentSheetConfiguration.html)  
- ApplicationRenderOptions: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
- DocumentSheetRenderOptions: [DocumentSheetRenderOptions](https://foundryvtt.com/api/interfaces/foundry.DocumentSheetRenderOptions.html)  
- EmittedEventListener: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
- ContextMenu: [ContextMenu](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)  
- ApplicationHeaderControlsEntry: [ApplicationHeaderControlsEntry](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)  
- ApplicationTabsConfiguration: [ApplicationTabsConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)  
- ClientDocument: Available in Foundry API as ClientDocument  
- ApplicationFormConfiguration: Found in Foundry API types  
- ApplicationPosition: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
- SheetRegistrationOptions: [SheetRegistrationOptions](https://foundryvtt.com/api/types/foundry.SheetRegistrationOptions.html)  
- ApplicationClosingOptions: [ApplicationClosingOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)  
- FormDataExtended: [FormDataExtended](https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html)