# FilePicker

The `FilePicker` application renders contents of the server-side public directory. This app allows for navigating and uploading files to the public path.

## Mixes
- HandlebarsApplication

## Hierarchy  
- [View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.apps.FilePicker)  
`ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions, this>`  
- FilePicker

---

## Constructors

### constructor

```typescript
new FilePicker(options?: any): FilePicker
```

**Parameters**

- **options**: `any` = `{}`  
  Options that configure the behavior of the FilePicker

**Returns**  
`FilePicker`

Overrides `HandlebarsApplicationMixin(ApplicationV2).constructor`

---

## Properties

### activeSource

`activeSource: "data" | "public" | "s3"`

Track the active source tab which is being browsed.

---

### button

`button: null | HTMLElement`

A button controlling the display of the picker UI.

---

### callback

`callback: null | Function`

A callback function to trigger once a file has been selected.

---

### displayMode

`displayMode: string`

The display mode of the FilePicker UI.

---

### extensions

`extensions: string[] = [...]`

The current set of file extensions which are being filtered upon.

---

### field

`field: null | HTMLElement`

The target HTML element this file picker is bound to.

---

### options

`options: Readonly<ApplicationConfiguration>`

Application instance configuration options.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).options`

---

### position

`position: ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).position`

---

### request

`request: string`

The full requested path given by the user.

---

### results

`results: object = {}`

The latest set of results browsed from the server.

---

### sources

```typescript
sources: Record<
    "data" | "public" | "s3",
    undefined | { bucket?: string; buckets?: string[]; target: string }
>
```

The file sources available for browsing.

---

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).tabGroups`

---

### type

`type: string`

The general file type which controls the set of extensions which will be accepted.

---

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

---

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: {
        backTraverse: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        changeDisplayMode: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        goToFavorite: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        makeDirectory: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        pickDirectory: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        pickFile: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        removeFavorite: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        setFavorite: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
        togglePrivacy: (
            event: PointerEvent,
            target: HTMLElement,
        ) => void | Promise<void>;
    };
    form: {
        closeOnSubmit: boolean;
        handler: (
            event: Event | SubmitEvent,
            form: HTMLFormElement,
            formData: FormDataExtended,
        ) => Promise<any>;
        submitOnChange: boolean;
    };
    id: string;
    position: { width: number };
    tag: string;
    tileSize: boolean;
    window: { contentClasses: string[]; icon: string };
} = ...
```

---

### DISPLAY_MODES

`DISPLAY_MODES: string[] = [...]`

Enumerate the allowed FilePicker display modes.

---

### emittedEvents

`emittedEvents: readonly ["render", "close", "position"] = [...]`

---

### FILE_TYPES

`FILE_TYPES: string[] = [...]`

The allowed values for the type of this FilePicker instance.

---

### LAST_BROWSED_DIRECTORY

`LAST_BROWSED_DIRECTORY: string = ""`

Record the last-browsed directory path so that re-opening a different FilePicker instance uses the same target.

---

### LAST_DISPLAY_MODE

`LAST_DISPLAY_MODE: string = "list"`

Record the last-configured display mode so that re-opening a different FilePicker instance uses the same mode.

---

### LAST_TILE_SIZE

`LAST_TILE_SIZE: null | number = null`

Record the last-configured tile size which can automatically be applied to new FilePicker instances.

---

### PARTS

```typescript
PARTS: {
    body: { template: string };
    footer: { template: string };
    subfooter: { template: string };
    subheader: { template: string };
    tabs: { template: string };
} = ...
```

---

### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

---

### S3_BUCKETS

`S3_BUCKETS: null | any[] = null`

Cache the names of S3 buckets which can be used.

---

### TABS

```typescript
TABS: {
    sources: {
        initial: string;
        labelPrefix: string;
        tabs: { icon: string; id: string }[];
    };
} = ...
```

---

## Accessors

### canCreateFolder

```typescript
get canCreateFolder(): boolean
```

Whether the current user is able to create folders.

**Returns:** `boolean`

---

### canUpload

```typescript
get canUpload(): boolean
```

Whether the current use is able to upload file content.

**Returns:** `boolean`

---

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

**Returns:** `DOMTokenList`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).classList`

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns:** `HTMLElement`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).element`

---

### favorites

```typescript
get favorites(): Record<string, FavoriteFolder>
```

Get favorite folders for quick access.

**Returns:** `Record<string, FavoriteFolder>`

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns:** `null | HTMLFormElement`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).form`

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns:** `boolean`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).hasFrame`

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

**Returns:** `string`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).id`

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns:** `boolean`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).minimized`

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns:** `boolean`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).rendered`

---

### source

```typescript
get source(): object
```

Return the source object for the currently active source.

**Returns:** `object`

---

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns:** `number`  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).state`

---

### target

```typescript
get target(): string
```

Return the target directory for the currently active source.

**Returns:** `string`

---

### title

```typescript
get title(): string
```

Overrides `HandlebarsApplicationMixin(ApplicationV2).title`.

**Returns:** `string`

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

- `close`: `HTMLButtonElement`
- `content`: `HTMLElement`
- `controls`: `HTMLButtonElement`
- `controlsDropdown`: `HTMLDivElement`
- `header`: `HTMLElement`
- `icon`: `HTMLElement`
- `onDrag`: `Function`
- `onResize`: `Function`
- `pointerMoveThrottle`: `boolean`
- `pointerStartPosition`: `ApplicationPosition`
- `resize`: `HTMLElement`
- `title`: `HTMLHeadingElement`

Inherited from `HandlebarsApplicationMixin(ApplicationV2).window`

---

### implementation

```typescript
static get implementation(): typeof FilePicker
```

Retrieve the configured FilePicker implementation.

**Returns:** `typeof FilePicker`

---

### uploadURL

```typescript
static get uploadURL(): string
```

Return the upload URL to which the FilePicker should post uploaded files.

**Returns:** `string`

---

## Methods

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides `HandlebarsApplicationMixin(ApplicationV2)._onRender`.

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(
    options: any,
): Promise<ApplicationRenderContext & {
    bucket: any;
    buckets: any;
    buttons: { icon: string; label: string; type: string }[];
    canCreateFolder: boolean;
    canGoBack: boolean;
    canSelect: boolean;
    canUpload: boolean;
    dirs: any;
    displayMode: string;
    extensions: string[];
    favorites: Record<string, FavoriteFolder>;
    files: any;
    isS3: boolean;
    noResults: boolean;
    rootId: string;
    selected: any;
    source: object;
    sources: Record<
        "data" | "public" | "s3",
        undefined | { bucket?: string; buckets?: string[]; target: string }
    >;
    target: string;
    tileSize: any;
    user: null | documents.User;
}>
```

Overrides `HandlebarsApplicationMixin(ApplicationV2)._prepareContext`.

**Parameters**

- **options**: `any`

**Returns**  
Promise with extended `ApplicationRenderContext`.

---

### _prepareTabs

```typescript
_prepareTabs(group: any): Record<string, ApplicationTab>
```

Overrides `HandlebarsApplicationMixin(ApplicationV2)._prepareTabs`.

**Parameters**

- **group**: `any`

**Returns**  
`Record<string, ApplicationTab>`

---

### _renderHTML

```typescript
_abstract _renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Context data for the render operation  
- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`Promise<any>`  
The result of HTML rendering may be implementation specific. Whatever value is returned here is passed to `_replaceHTML`.

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._renderHTML`

---

### _tearDown

```typescript
_tearDown(options: any): void
```

Overrides `HandlebarsApplicationMixin(ApplicationV2)._tearDown`.

**Parameters**

- **options**: `any`

**Returns**  
`void`

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
- **options** (optional): `{ once?: boolean } = {}`  
  Options which configure the event listener  
  - `once`?: `boolean` — Should the event only be responded to once and then removed

**Returns**  
`void`

**See:**  
[MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from `HandlebarsApplicationMixin(ApplicationV2).addEventListener`

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from `_maxZ` to ApplicationV2#maxZ. We should also eliminate `ui.activeWindow` in favor of only ApplicationV2#frontApp.

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(ApplicationV2).bringToFront`

---

### browse

```typescript
browse(target?: string, options?: object): Promise<FilePicker>
```

Browse to a specific location for this FilePicker instance.

**Parameters**

- **target** (optional): `string` = ...  
  The target within the currently active source location.
- **options** (optional): `object` = {}  
  Browsing options

**Returns**  
`Promise<FilePicker>`

---

### changeTab

```typescript
changeTab(tab: any, group: any, options: any): void
```

Overrides `HandlebarsApplicationMixin(ApplicationV2).changeTab`.

**Parameters**

- **tab**: `any`  
- **group**: `any`  
- **options**: `any`

**Returns**  
`void`

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<FilePicker>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (optional): `Partial<ApplicationClosingOptions> = {}`  
  Options which modify how the application is closed.

**Returns**  
`Promise<FilePicker>`

Inherited from `HandlebarsApplicationMixin(ApplicationV2).close`

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
`boolean` — Was default behavior for the event prevented?

**See:**  
[MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from `HandlebarsApplicationMixin(ApplicationV2).dispatchEvent`

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(ApplicationV2).maximize`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(ApplicationV2).minimize`

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

**See:**  
[MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from `HandlebarsApplicationMixin(ApplicationV2).removeEventListener`

---

### render

```typescript
render(...args: any[]): Promise<FilePicker>
```

Overrides `HandlebarsApplicationMixin(ApplicationV2).render`.

**Parameters**

- **...args**: `any[]`

**Returns**  
`Promise<FilePicker>`

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position** (optional): `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**  
`void | ApplicationPosition` — The updated application position

Inherited from `HandlebarsApplicationMixin(ApplicationV2).setPosition`

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters**

- **submitOptions** (optional): `object` = {}  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns**  
`Promise<any>` — A promise that resolves to the returned result of the form submission handler, if any.

Inherited from `HandlebarsApplicationMixin(ApplicationV2).submit`

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

- **expanded** (optional): `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value
- **options** (optional): `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.
  - `animate`? `boolean` — Animate the controls toggling.

**Returns**  
`Promise<void>` — A Promise which resolves once the control expansion animation is complete

Inherited from `HandlebarsApplicationMixin(ApplicationV2).toggleControls`

---

### _attachFrameListeners

```typescript
protected _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners`

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
`false | void` — Return false to prevent rendering

**Throws**  
An Error to display a warning message

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._canRender`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions`

---

### _createContextMenu

```typescript
protected _createContextMenu(
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
- **options** (optional):
  - `container`?: `HTMLElement` — A parent HTMLElement which contains the selector target
  - `hookName`?: `string` — The hook name
  - `parentClassHooks`?: `boolean` — Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null | ContextMenu` — A created ContextMenu or null if no menu items were defined

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._createContextMenu`

---

### _getHeaderControls

```typescript
protected _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig`

---

### _headerControlButtons

```typescript
protected _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

**Yields**

- `ApplicationHeaderControlsEntry`

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons`

---

### _initializeApplicationOptions

```typescript
protected _initializeApplicationOptions(
    options: Partial<ApplicationConfiguration>,
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
`ApplicationConfiguration` — Configured options for the application instance

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._insertElement`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onChangeForm`

---

### _onChangeTileSize

```typescript
protected _onChangeTileSize(event: Event): void
```

Handle changes to the tile size.

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns**  
`void`

---

### _onClickAction

```typescript
protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onClickAction`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onClickTab`

---

### _onClose

```typescript
protected _onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters**

- **options**: `ApplicationRenderOptions`

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onClose`

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

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onFirstRender`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onPosition`

---

### _onSearchFilter

```typescript
protected _onSearchFilter(
    event: KeyboardEvent,
    query: string,
    rgx: RegExp,
    html: HTMLElement,
): void
```

Search among shown directories and files.

**Parameters**

- **event**: `KeyboardEvent`  
  The triggering event
- **query**: `string`  
  The search input value
- **rgx**: `RegExp`  
- **html**: `HTMLElement`

**Returns**  
`void`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._preClose`

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

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._preFirstRender`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._prePosition`

---

### _preRender

```typescript
protected _preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._preRender`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._removeElement`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._renderFrame`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._replaceHTML`

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

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._updateFrame`

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
`ApplicationPosition` — Resolved Application positioning data

Inherited from `HandlebarsApplicationMixin(ApplicationV2)._updatePosition`

---

## Static Methods

### browse

```typescript
static browse(
    source: string,
    target: string,
    options?: { bucket?: string; extensions?: string[]; wildcard?: boolean },
): Promise<object>
```

Browse files for a certain directory location.

**Parameters**

- **source**: `string`  
  The source location in which to browse: see FilePicker#sources for details.
- **target**: `string`  
  The target within the source location
- **options** (optional):  
  - **bucket**?: `string` — A bucket within which to search if using the S3 source  
  - **extensions**?: `string[]` — An Array of file extensions to filter on  
  - **wildcard**?: `boolean` — The requested dir represents a wildcard path

**Returns**  
`Promise<object>` — A Promise that resolves to the directories and files contained in the location

---

### configurePath

```typescript
static configurePath(source: string, target: string, options?: object): Promise<object>
```

Configure metadata settings regarding a certain file system path.

**Parameters**

- **source**: `string`  
  The source location in which to browse: see FilePicker#sources for details.
- **target**: `string`  
  The target within the source location
- **options**: `object` = {}  
  Optional arguments modifying the request

**Returns**  
`Promise<object>`

---

### createDirectory

```typescript
static createDirectory(
    source: string,
    target: string,
    options?: object,
): Promise<object>
```

Create a subdirectory within a given source. The requested subdirectory path must not already exist.

**Parameters**

- **source**: `string`  
  The source location in which to browse. See FilePicker#sources for details
- **target**: `string`  
  The target within the source location
- **options**: `object` = {}  
  Optional arguments which modify the request

**Returns**  
`Promise<object>`

---

### fromButton

```typescript
static fromButton(button: HTMLButtonElement): FilePicker
```

Bind the file picker to a new target field. Assumes the user will provide a `HTMLButtonElement` which has the `data-target` and `data-type` attributes. The `data-target` attribute should provide the name of the input field which should receive the selected file. The `data-type` attribute is a string in `["image", "audio"]` which sets the file extensions which will be accepted.

**Parameters**

- **button**: `HTMLButtonElement`  
  The button element

**Returns**  
`FilePicker`

---

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See:**  
[`ApplicationV2.BASE_APPLICATION`](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### matchS3URL

```typescript
static matchS3URL(url: string): null | RegExpMatchArray
```

Test a URL to see if it matches a well known s3 key pattern.

**Parameters**

- **url**: `string`  
  An input URL to test

**Returns**  
`null | RegExpMatchArray`

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
`number | void` — The parsed style dimension in pixels

---

### upload

```typescript
static upload(
    source: string,
    path: string,
    file: File,
    body?: object,
    options?: { notify?: boolean },
): Promise<object>
```

Dispatch a POST request to the server containing a directory path and a file to upload.

**Parameters**

- **source**: `string`  
  The data source to which the file should be uploaded
- **path**: `string`  
  The destination path
- **file**: `File`  
  The File object to upload
- **body** (optional): `object` = {}  
  Additional file upload options sent in the POST body
- **options** (optional): `{ notify?: boolean } = {}`  
  Additional options to configure how the method behaves  
  - **notify**?: `boolean` — Display a UI notification when the upload is processed

**Returns**  
`Promise<object>` — The response object

---

### uploadPersistent

```typescript
static uploadPersistent(
    packageId: string,
    path: string,
    file: File,
    body?: object,
    options?: { notify?: boolean },
): Promise<object>
```

A convenience function that uploads a file to a given package's persistent `/storage/` directory.

**Parameters**

- **packageId**: `string`  
  The id of the package to which the file should be uploaded. Only supports Systems and Modules.
- **path**: `string`  
  The relative destination path in the package's storage directory
- **file**: `File`  
  The File object to upload
- **body** (optional): `object` = {}  
  Additional file upload options sent in the POST body
- **options** (optional): `{ notify?: boolean } = {}`  
  Additional options to configure how the method behaves  
  - **notify**?: `boolean` — Display a UI notification when the upload is processed

**Returns**  
`Promise<object>` — The response object

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

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
- [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)  
- [ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html)  
- [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
- [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- [ApplicationTab](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTab.html)  
- [ApplicationHeaderControlsEntry](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)  
- [ApplicationTabsConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)  
- [FavoriteFolder](https://foundryvtt.com/api/interfaces/foundry.FavoriteFolder.html)  
- [FormDataExtended](https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html)  
- [ContextMenu](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)  
- [User](https://foundryvtt.com/api/classes/foundry.documents.User.html)  
- [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
- [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
- [ApplicationClosingOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)  
- [ApplicationFormConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationFormConfiguration.html)