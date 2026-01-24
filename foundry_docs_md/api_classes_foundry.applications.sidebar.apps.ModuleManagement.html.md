# ModuleManagement

The Module Management Application. This application provides a view of which modules are available to be used and allows for configuration of the set of modules which are active within the World.

---

## Mixes

- HandlebarsApplication

---

## Hierarchy  

[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sidebar.apps.ModuleManagement) | Expand

`ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions, this>`

→ ModuleManagement

---

## Constructors

### constructor

```typescript
new ModuleManagement(
    options?: Partial<ApplicationConfiguration>,
): ModuleManagement
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options?**: `Partial<ApplicationConfiguration>` = {}

  Options used to configure the Application instance.

**Returns** `ModuleManagement`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).constructor

---

## Properties

### options

```typescript
options: Readonly<ApplicationConfiguration>
```

Application instance configuration options.  

Inherited from HandlebarsApplicationMixin(ApplicationV2).options

---

### position

```typescript
position: ApplicationPosition = ...
```

The current position of the application with respect to the window.document.body.  

Inherited from HandlebarsApplicationMixin(ApplicationV2).position

---

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
changeTab method is called. Reports the active tab for each group, with a value of  null  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.  

Inherited from HandlebarsApplicationMixin(ApplicationV2).tabGroups

---

## Static Properties

### BASE_APPLICATION

```typescript
static BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

---

### DEFAULT_OPTIONS

```typescript
static DEFAULT_OPTIONS: {
    actions: {
        changeFilter: (
            ...this: any,
            _event: PointerEvent,
            target: HTMLButtonElement,
        ) => void;
        deactivateAll: (...this: any, event: PointerEvent) => void;
        toggleExpanded: (...this: any) => void;
    };
    form: {
        closeOnSubmit: boolean;
        handler: (
            event: Event | SubmitEvent,
            form: HTMLFormElement,
            formData: FormDataExtended,
        ) => Promise<any>;
        submitOnClose: boolean;
    };
    id: string;
    position: { width: number };
    tag: string;
    window: { contentClasses: string[]; icon: string; title: string };
} = ...
```

---

### emittedEvents

```typescript
static emittedEvents: readonly ["render", "close", "position"] = ...
```

---

### PARTS

```typescript
static PARTS: {
    body: { root: boolean; template: string; templates: string[] };
    footer: { template: string };
} = ...
```

---

### RENDER_STATES

```typescript
static RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

---

### SETTING

```typescript
static SETTING: string = "moduleConfiguration"
```

The named game setting which persists module configuration.

---

### TABS

```typescript
static TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance  

**Returns** `DOMTokenList`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).classList

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.  

**Returns** `HTMLElement`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).element

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?  

**Returns** `null | HTMLFormElement`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).form

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?  

**Returns** `boolean`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).hasFrame

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in  DEFAULT_OPTIONS  or by defining a  uniqueId  during  
_initializeApplicationOptions.

**Returns** `string`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).id

---

### isEditable

```typescript
get isEditable(): boolean
```

Can the current User manage modules?  

**Returns** `boolean`  

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?  

**Returns** `boolean`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).minimized

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?  

**Returns** `boolean`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).rendered

---

### state

```typescript
get state(): number
```

The current render state of the Application.  

**Returns** `number`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).state

---

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.  

**Returns** `string`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).title

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

Inherited from HandlebarsApplicationMixin(ApplicationV2).window

---

## Methods

### _attachPartListeners

```typescript
_attachPartListeners(partId: any, element: any, options: any): void
```

**Parameters**

- **partId**: `any`
- **element**: `any`
- **options**: `any`

**Returns** `void`

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._onRender

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns** `Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<ApplicationRenderContext>
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._prepareContext

**Parameters**

- **options**: `any`

**Returns** `Promise<ApplicationRenderContext>`

---

### _renderHTML

```typescript
_abstract _renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

**Parameters**

- **context**: `ApplicationRenderContext` - Context data for the render operation.
- **options**: `ApplicationRenderOptions` - Options which configure application rendering behavior.

**Returns** `Promise<any>`  

The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to _replaceHTML.  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHTML

---

### _tearDown

```typescript
_tearDown(options: any): void
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._tearDown

**Parameters**

- **options**: `any`

**Returns** `void`

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
- **options?**: `{ once?: boolean }` = {}  
  Options which configure the event listener

  - **once?**: `boolean`  
    Should the event only be responded to once and then removed

**Returns** `void`

**See** [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  

Inherited from HandlebarsApplicationMixin(ApplicationV2).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).bringToFront

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
- **options?**:

  - **event?**: `Event`  
    An interaction event which caused the tab change, if any
  - **force?**: `boolean`  
    Force changing the tab even if the new tab is already active
  - **navElement?**: `HTMLElement`  
    An explicit navigation element being modified
  - **updatePosition?**: `boolean`  
    Update application position after changing the tab?

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).changeTab

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<ModuleManagement>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options?**: `Partial<ApplicationClosingOptions>` = {}  
  Options which modify how the application is closed.

**Returns** `Promise<ModuleManagement>`  
A Promise which resolves to the closed Application instance  

Inherited from HandlebarsApplicationMixin(ApplicationV2).close

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns** `boolean`  
Was default behavior for the event prevented?

**See** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  

Inherited from HandlebarsApplicationMixin(ApplicationV2).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns** `Promise<void>`  

Inherited from HandlebarsApplicationMixin(ApplicationV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns** `Promise<void>`  

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

**Returns** `void`

**See** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  

Inherited from HandlebarsApplicationMixin(ApplicationV2).removeEventListener

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<ModuleManagement>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options?**: `boolean | ApplicationRenderOptions` = {}  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.
- **_options?**: `ApplicationRenderOptions` = {}  
  Legacy options for backwards-compatibility with the original ApplicationV1#render  
  signature.

**Returns** `Promise<ModuleManagement>`  
A Promise which resolves to the rendered Application instance  

Inherited from HandlebarsApplicationMixin(ApplicationV2).render

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position?**: `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns** `void | ApplicationPosition`  
The updated application position  

Inherited from HandlebarsApplicationMixin(ApplicationV2).setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions?**: `object` = {}  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns** `Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.  

Inherited from HandlebarsApplicationMixin(ApplicationV2).submit

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

- **expanded?**: `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value.
- **options?**: `{ animate?: boolean }` = {}  
  Options to configure the toggling behavior.

  - **animate?**: `boolean`  
    Animate the controls toggling.

**Returns** `Promise<void>`  
A Promise which resolves once the control expansion animation is complete  

Inherited from HandlebarsApplicationMixin(ApplicationV2).toggleControls

---

### _attachFrameListeners

```typescript
protected _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners

---

### _canRender

```typescript
protected _canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns** `false | void`  
Return false to prevent rendering

**Throws**  
An Error to display a warning message  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._canRender

---

### _configureRenderOptions

```typescript
protected _configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions

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
    },
): null | ContextMenu
```

Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound
- **options?**:

  - **container?**: `HTMLElement`  
    A parent HTMLElement which contains the selector target
  - **hookName?**: `string`  
    The hook name
  - **parentClassHooks?**: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns** `null | ContextMenu`  
A created ContextMenu or null if no menu items were defined  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._createContextMenu

---

### _getHeaderControls

```typescript
protected _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns** `ApplicationHeaderControlsEntry[]`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls

---

### _getTabsConfig

```typescript
protected _getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns** `null | ApplicationTabsConfiguration`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig

---

### _headerControlButtons

```typescript
protected _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

**Yields** `ApplicationHeaderControlsEntry`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons

---

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

**Parameters**

- **options**: `Partial<ApplicationConfiguration>`  
  Options provided directly to the constructor

**Returns** `ApplicationConfiguration`  
Configured options for the application instance  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions

---

### _insertElement

```typescript
protected _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._insertElement

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

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onChangeForm

---

### _onClickAction

```typescript
protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickAction

---

### _onClickTab

```typescript
protected _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickTab

---

### _onClose

```typescript
protected _onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the  
close process.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClose

---

### _onFirstRender

```typescript
protected _onFirstRender(
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

**Returns** `Promise<void>`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onFirstRender

---

### _onPosition

```typescript
protected _onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onPosition

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

**Returns** `Promise<void>`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm

---

### _preClose

```typescript
protected _preClose(options: ApplicationRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns** `Promise<void>`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preClose

---

### _preFirstRender

```typescript
protected _preFirstRender(
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

**Returns** `Promise<void>`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preFirstRender

---

### _prepareTabs

```typescript
protected _prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns** `Record<string, ApplicationTab>`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareTabs

---

### _prePosition

```typescript
protected _prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prePosition

---

### _preRender

```typescript
protected _preRender(
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

**Returns** `Promise<void>`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preRender

---

### _removeElement

```typescript
protected _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._removeElement

---

### _renderFrame

```typescript
protected _renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns** `Promise<HTMLElement>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderFrame

---

### _renderHeaderControl

```typescript
protected _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns** `HTMLLIElement`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl

---

### _replaceHTML

```typescript
protected _replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted
- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._replaceHTML

---

### _updateFrame

```typescript
protected _updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options provided at render-time

**Returns** `void`  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updateFrame

---

### _updatePosition

```typescript
protected _updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns** `ApplicationPosition`  
Resolved Application positioning data  

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updatePosition

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns** `Generator<typeof ApplicationV2, void, unknown>`

**See** [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

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

**Returns** `number | void`  
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

**Returns** `Promise<void>`

---

# Links

- Foundry Virtual Tabletop - API Documentation - Version 13: [https://foundryvtt.com/api/modules.html](https://foundryvtt.com/api/modules.html)
- foundry namespace: [https://foundryvtt.com/api/modules/foundry.html](https://foundryvtt.com/api/modules/foundry.html)
- applications namespace: [https://foundryvtt.com/api/modules/foundry.applications.html](https://foundryvtt.com/api/modules/foundry.applications.html)
- sidebar namespace: [https://foundryvtt.com/api/modules/foundry.applications.sidebar.html](https://foundryvtt.com/api/modules/foundry.applications.sidebar.html)
- apps namespace: [https://foundryvtt.com/api/modules/foundry.applications.sidebar.apps.html](https://foundryvtt.com/api/modules/foundry.applications.sidebar.apps.html)
- ModuleManagement class: [https://foundryvtt.com/api/classes/foundry.applications.sidebar.apps.ModuleManagement.html](https://foundryvtt.com/api/classes/foundry.applications.sidebar.apps.ModuleManagement.html)
- ApplicationConfiguration interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html)
- ApplicationRenderOptions interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)
- ApplicationRenderContext interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)
- ApplicationPosition interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)
- ApplicationTabsConfiguration interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)
- ApplicationHeaderControlsEntry interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)
- ApplicationTab interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTab.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTab.html)
- ContextMenu class: [https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)
- FormDataExtended class: [https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html](https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html)
- EmittedEventListener type: [https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)
- ApplicationClosingOptions interface: [https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)
- ApplicationFormConfiguration interface (used in methods): Referenced from Application context

---

*This documentation captures all technical details and adheres to the conventions of TypeScript and Markdown formatting.*