# Class: CompendiumDirectory

The listing of compendiums available in the World.

## Mixes
- HandlebarsApplication

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sidebar.tabs.CompendiumDirectory)  

```
AbstractSidebarTab<
  ApplicationConfiguration,
  HandlebarsRenderOptions,
  this
>
```

---

## Constructors

### constructor

```typescript
new CompendiumDirectory(
    options?: Partial<ApplicationConfiguration>,
): CompendiumDirectory
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance

---

## Properties

### options

```typescript
options: Readonly<ApplicationConfiguration>
```

Application instance configuration options.

### position

```typescript
position: ApplicationPosition
```

The current position of the application with respect to the window.document.body.

### tabGroups

```typescript
tabGroups: Record<string, null | string>
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

### BASE_APPLICATION

```typescript
BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: {
        activateEntry: (...this: any, ...args: any[]) => void;
        collapseFolders: (...this: any) => void;
        createEntry: (...this: any, ...args: any[]) => Promise<void>;
        createFolder: (...this: any, ...args: any[]) => void;
        toggleFolder: (...this: any, ...args: any[]) => void;
        toggleSort: (...this: any) => Promise<CompendiumDirectory>;
    };
    classes: string[];
    window: { title: string };
}
```

### emittedEvents

```typescript
readonly emittedEvents: [
    "render",
    "close",
    "position",
    "activate",
    "deactivate",
]
```

### PARTS

```typescript
PARTS: {
    directory: {
        scrollable: string[];
        template: string;
        templates: string[];
    };
    footer: { template: string };
    header: { template: string };
}
```

### RENDER_STATES

```typescript
RENDER_STATES: Record<string, number>
```

The sequence of rendering states that describe the Application life-cycle.

### tabName

```typescript
tabName: string = "compendium"
```

### TABS

```typescript
TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### active

```typescript
get active(): boolean
```

Whether this tab is currently active in the sidebar.

### activeFilters

```typescript
get activeFilters(): Set<string>
```

The set of active document type filters.

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.

### isPopout

```typescript
get isPopout(): boolean
```

Whether this is the popped-out tab or the in-sidebar one.

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

### popout

```typescript
get popout(): void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>
```

A reference to the popped-out version of this tab, if one exists.

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

### state

```typescript
get state(): number
```

The current render state of the Application.

### tabName

```typescript
get tabName(): string
```

The base name of the sidebar tab.

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

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

---

## Methods

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): ApplicationConfiguration
```

Initialize application options.

**Parameters**

- **options**: `any`

**Returns**  
`ApplicationConfiguration`

---

### _onClose

```typescript
_onClose(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

---

### _onDragStart

```typescript
_onDragStart(event: any): void
```

**Parameters**

- **event**: `any`

**Returns**  
`void`

---

### _onDrop

```typescript
_onDrop(event: any): undefined | Promise<void>
```

**Parameters**

- **event**: `any`

**Returns**  
`undefined | Promise<void>`

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onFirstRender.

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<void>`

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onRender.

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<ApplicationRenderContext>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._prepareContext.

**Parameters**

- **options**: `any`

**Returns**  
`Promise<ApplicationRenderContext>`

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._preparePartContext.

**Parameters**

- **partId**: `any`
- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<any>`

---

### _preSyncPartState

```typescript
_preSyncPartState(
    partId: any,
    newElement: any,
    priorElement: any,
    state: any,
): void
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._preSyncPartState.

**Parameters**

- **partId**: `any`
- **newElement**: `any`
- **priorElement**: `any`
- **state**: `any`

**Returns**  
`void`

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._renderFrame.

**Parameters**

- **options**: `any`

**Returns**  
`Promise<HTMLElement>`

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

**Parameters**

- **context**: `ApplicationRenderContext` - Context data for the render operation
- **options**: `HandlebarsRenderOptions` - Options which configure application rendering behavior

**Returns**  
`Promise<any>` - The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to _replaceHTML.

---

### _syncPartState

```typescript
_syncPartState(
    partId: any,
    newElement: any,
    priorElement: any,
    state: any,
): void
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._syncPartState.

**Parameters**

- **partId**: `any`
- **newElement**: `any`
- **priorElement**: `any`
- **state**: `any`

**Returns**  
`void`

---

### activate

```typescript
activate(): void
```

Activate this tab in the sidebar.

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

- **type**: `string` - The type of event being registered for
- **listener**: `EmittedEventListener` - The listener function called when the event occurs
- **options** (optional):  
  - **once**?: `boolean` - Should the event only be responded to once and then removed

**Returns**  
`void`

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp.

**Returns**  
`void`

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

- **tab**: `string` - The name of the tab which should become active
- **group**: `string` - The name of the tab group which defines the set of tabs
- **options** (optional):
  - **event**?: `Event` - An interaction event which caused the tab change, if any
  - **force**?: `boolean` - Force changing the tab even if the new tab is already active
  - **navElement**?: `HTMLElement` - An explicit navigation element being modified
  - **updatePosition**?: `boolean` - Update application position after changing the tab?

**Returns**  
`void`

---

### close

```typescript
close(
    options?: Partial<ApplicationClosingOptions>,
): Promise<CompendiumDirectory>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options** (optional): `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

**Returns**  
A Promise which resolves to the closed Application instance

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event` - The Event to dispatch

**Returns**  
`boolean` - Was default behavior for the event prevented?

See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string` - The type of event being removed
- **listener**: `EmittedEventListener` - The listener function being removed

**Returns**  
`void`

See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

---

### render

```typescript
render(options: any, _options: any): Promise<CompendiumDirectory>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab).render

**Parameters**

- **options**: `any`
- **_options**: `any`

**Returns**  
`Promise<CompendiumDirectory>`

---

### renderPopout

```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```

Pop-out this sidebar tab as a new application.

**Returns**  
`Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>`

---

### setPosition

```typescript
setPosition(
    position?: Partial<ApplicationPosition>
): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position** (optional): `Partial<ApplicationPosition>` - New Application positioning data

**Returns**  
`void | ApplicationPosition` - The updated application position

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions** (optional): `object` = `{}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns**  
A promise that resolves to the returned result of the form submission handler, if any.

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

- **expanded** (optional): `boolean` - Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value
- **options** (optional):  
  - **animate**?: `boolean` - Animate the controls toggling.

**Returns**  
A Promise which resolves once the control expansion animation is complete

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

---

### _canDragDrop

```typescript
_canDragDrop(selector: string): boolean
```

Determine if the given user has permission to drop entries into the compendium directory.

**Parameters**

- **selector**: `string` - The CSS selector of the dragged element.

**Returns**  
`boolean`

---

### _canDragStart

```typescript
_canDragStart(selector: string): boolean
```

Determine if the given user has permission to drag packs and folders in the directory.

**Parameters**

- **selector**: `string` - The CSS selector of the target element.

**Returns**  
`boolean`

---

### _canRender

```typescript
_canRender(options: HandlebarsRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `HandlebarsRenderOptions`

**Returns**  
`false | void`

**Throws**  
An Error to display a warning message

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: HandlebarsRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: `HandlebarsRenderOptions`

**Returns**  
`void`

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

**Parameters**

- **handler**: `() => ContextMenuEntry[]` - A handler function that provides initial context options
- **selector**: `string` - A CSS selector to which the ContextMenu will be bound
- **options** (optional):
  - **container**?: `HTMLElement` - A parent HTMLElement which contains the selector target
  - **hookName**?: `string` - The hook name
  - **parentClassHooks**?: `boolean` - Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
A created ContextMenu or null if no menu items were defined

---

### _entryAlreadyExists

```typescript
_entryAlreadyExists(pack: CompendiumCollection): boolean
```

Test if the given pack is already present in this directory.

**Parameters**

- **pack**: `CompendiumCollection` - The compendium pack.

**Returns**  
`boolean`

---

### _entryBelongsToFolder

```typescript
_entryBelongsToFolder(
    pack: CompendiumCollection,
    folder: undefined | string,
): boolean
```

Determine whether a given directory entry belongs to the given folder.

**Parameters**

- **pack**: `CompendiumCollection` - The compendium pack.
- **folder**: `undefined | string` - The target folder ID.

**Returns**  
`boolean`

---

### _getDroppedEntryFromData

```typescript
_getDroppedEntryFromData(data: object): Promise<CompendiumCollection>
```

Get the pack instance from its dropped data.

**Parameters**

- **data**: `object` - The drag data.

**Returns**  
`Promise<CompendiumCollection>`

---

### _getEntryContextOptions

```typescript
_getEntryContextOptions(): ContextMenuEntry[]
```

Get context menu entries for entries in this directory.

**Returns**  
`ContextMenuEntry[]`

---

### _getEntryDragData

```typescript
_getEntryDragData(collection: string): { collection: string; type: string }
```

Get drag data for a compendium in this directory.

**Parameters**

- **collection**: `string` - The pack's collection ID.

**Returns**  
An object containing:

- **collection**: `string`
- **type**: `string`

---

### _getFilterContextOptions

```typescript
_getFilterContextOptions(): ContextMenuEntry[]
```

Get options for filtering the directory by document type.

**Returns**  
`ContextMenuEntry[]`

---

### _getFolderContextOptions

```typescript
_getFolderContextOptions(): ContextMenuEntry[]
```

Get context menu entries for folders in this directory.

**Returns**  
`ContextMenuEntry[]`

---

### _getFolderDragData

```typescript
_getFolderDragData(folderId: string): any
```

Get drag data for a folder in this directory.

**Parameters**

- **folderId**: `string` - The folder ID.

**Returns**  
`any`

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options

**Returns**  
`ApplicationHeaderControlsEntry[]`

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string` - The ID of a tabs group

**Returns**  
`null | ApplicationTabsConfiguration`

---

### _handleDroppedEntry

```typescript
_handleDroppedEntry(target: HTMLElement, data: object): Promise<void>
```

Handle dropping a new pack into this directory.

**Parameters**

- **target**: `HTMLElement` - The drop target element.
- **data**: `object` - The drop data.

**Returns**  
`Promise<void>`

---

### _handleDroppedFolder

```typescript
_handleDroppedFolder(target: HTMLElement, data: object): Promise<void>
```

Handle dropping a folder onto the directory.

**Parameters**

- **target**: `HTMLElement` - The drop target element.
- **data**: `object` - The drop data.

**Returns**  
`Promise<void>`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

**Yields**  
`ApplicationHeaderControlsEntry`

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement` - The element to insert

**Returns**  
`void`

---

### _matchSearchEntries

```typescript
_matchSearchEntries(
    query: RegExp,
    packs: Set<string>,
    folderIds: Set<string>,
    autoExpandIds: Set<string>,
    options?: object,
): void
```

Identify entries in the collection which match a provided search query.

**Parameters**

- **query**: `RegExp` - The search query.
- **packs**: `Set<string>` - The set of matched pack IDs.
- **folderIds**: `Set<string>` - The set of matched folder IDs.
- **autoExpandIds**: `Set<string>` - The set of folder IDs that should be auto-expanded.
- **options** (optional): `object` - Additional options for subclass-specific behavior.

**Returns**  
`void`

---

### _matchSearchFolders

```typescript
_matchSearchFolders(
    query: RegExp,
    folderIds: Set<string>,
    autoExpandIds: Set<string>,
    options?: object,
): void
```

Identify folders in the collection which match a provided search query.

**Parameters**

- **query**: `RegExp` - The search query.
- **folderIds**: `Set<string>` - The set of matched folder IDs.
- **autoExpandIds**: `Set<string>` - The set of folder IDs that should be auto-expanded.
- **options** (optional): `object` - Additional options for subclass-specific behavior.

**Returns**  
`void`

---

### _onActivate

```typescript
_onActivate(): void
```

Actions performed when this tab is activated in the sidebar.

**Returns**  
`void`

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound
- **event**: `Event` - An input change event within the form

**Returns**  
`void`

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters**

- **event**: `PointerEvent` - The originating click event
- **target**: `HTMLElement` - The capturing HTML element which defined a [data-action]

**Returns**  
`void`

---

### _onClickEntry

```typescript
_onClickEntry(event: PointerEvent, target: HTMLElement): void
```

Handle clicking on a compendium entry.

**Parameters**

- **event**: `PointerEvent` - The triggering event.
- **target**: `HTMLElement` - The action target.

**Returns**  
`void`

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

---

### _onCreateEntry

```typescript
_onCreateEntry(event: PointerEvent, target: HTMLElement): Promise<void>
```

Handle creating a new compendium pack.

**Parameters**

- **event**: `PointerEvent` - The triggering event.
- **target**: `HTMLElement` - The action target.

**Returns**  
`Promise<void>`

---

### _onCreateFolder

```typescript
_onCreateFolder(event: PointerEvent, target: HTMLElement): void
```

Handle creating a new folder in this directory.

**Parameters**

- **event**: `PointerEvent` - The triggering click event.
- **target**: `HTMLElement` - The action target element.

**Returns**  
`void`

---

### _onDeactivate

```typescript
_onDeactivate(): void
```

Actions performed when this tab is deactivated in the sidebar.

**Returns**  
`void`

---

### _onDeleteCompendium

```typescript
_onDeleteCompendium(li: HTMLElement): Promise<void>
```

Handle deleting a compendium pack.

**Parameters**

- **li**: `HTMLElement` - The compendium target element.

**Returns**  
`Promise<void>`

---

### _onDragHighlight

```typescript
_onDragHighlight(event: DragEvent): void
```

Highlight folders as drop targets when a drag event enters or exits their area.

**Parameters**

- **event**: `DragEvent` - The in-progress drag event.

**Returns**  
`void`

---

### _onDragOver

```typescript
_onDragOver(event: DragEvent): void
```

Handle drag events over the directory.

**Parameters**

- **event**: `DragEvent`

**Returns**  
`void`

---

### _onDuplicateCompendium

```typescript
_onDuplicateCompendium(li: HTMLElement): Promise<void | CompendiumCollection>
```

Handle duplicating a compendium.

**Parameters**

- **li**: `HTMLElement` - The compendium target element.

**Returns**  
`Promise<void | CompendiumCollection>`

---

### _onMatchSearchEntry

```typescript
_onMatchSearchEntry(
    query: string,
    packs: Set<string>,
    element: HTMLElement,
    options?: object,
): void
```

Handle matching a given directory entry with the search filter.

**Parameters**

- **query**: `string` - The input search string.
- **packs**: `Set<string>` - The matched pack IDs.
- **element**: `HTMLElement` - The candidate entry element.
- **options** (optional): `object` - Additional options for subclass-specific behavior.

**Returns**  
`void`

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition` - The requested application position

**Returns**  
`void`

---

### _onSearchFilter

```typescript
_onSearchFilter(
    event: KeyboardEvent,
    query: string,
    rgx: RegExp,
    html: HTMLElement,
): void
```

Handle directory searching and filtering.

**Parameters**

- **event**: `KeyboardEvent` - The keyboard input event.
- **query**: `string` - The input search string.
- **rgx**: `RegExp` - The regular expression query that should be matched against.
- **html**: `HTMLElement` - The container to filter entries from.

**Returns**  
`void`

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

- **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound
- **event**: `Event | SubmitEvent` - The form submission event

**Returns**  
`Promise<void>`

---

### _onToggleCompendiumFilterType

```typescript
_onToggleCompendiumFilterType(
    event: PointerEvent,
    type?: string,
): Promise<CompendiumDirectory>
```

Handle toggling a compendium type filter.

**Parameters**

- **event**: `PointerEvent` - The triggering event.
- **type** (optional): `string` - The compendium type to filter by. If omitted, clear all filters.

**Returns**  
`Promise<CompendiumDirectory>`

---

### _onToggleFolder

```typescript
_onToggleFolder(event: PointerEvent, target: HTMLElement): void
```

Handle toggling a folder's expanded state.

**Parameters**

- **event**: `PointerEvent` - The triggering click event.
- **target**: `HTMLElement` - The action target element.

**Returns**  
`void`

---

### _onToggleLock

```typescript
_onToggleLock(li: HTMLElement): Promise<boolean | void>
```

Handle toggling locked state on a compendium.

**Parameters**

- **li**: `HTMLElement` - The compendium target element.

**Returns**  
`Promise<boolean | void>`

---

### _preClose

```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: `HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext` - Prepared context data
- **options**: `HandlebarsRenderOptions` - Provided render options

**Returns**  
`Promise<void>`

---

### _prepareDirectoryContext

```typescript
_prepareDirectoryContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the directory part.

**Parameters**

- **context**: `ApplicationRenderContext`
- **options**: `HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

---

### _prepareHeaderContext

```typescript
_prepareHeaderContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the header part.

**Parameters**

- **context**: `ApplicationRenderContext`
- **options**: `HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

---

### _preparePackContext

```typescript
_preparePackContext(pack: CompendiumCollection): CompendiumPackDirectoryContext
```

Prepare render context for an individual compendium pack.

**Parameters**

- **pack**: `CompendiumCollection` - The compendium pack.

**Returns**  
`CompendiumPackDirectoryContext`

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string` - The ID of the tab group to prepare

**Returns**  
`Record<string, ApplicationTab>`

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition` - The requested application position

**Returns**  
`void`

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

**Parameters**

- **context**: `ApplicationRenderContext` - Prepared context data
- **options**: `HandlebarsRenderOptions` - Provided render options

**Returns**  
`Promise<void>`

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement` - The element to be removed

**Returns**  
`void`

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

---

### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: HandlebarsRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: `any` - The result returned by the application rendering backend
- **content**: `HTMLElement` - The content element into which the rendered result must be inserted
- **options**: `HandlebarsRenderOptions` - Options which configure application rendering behavior

**Returns**  
`void`

---

### _sortRelative

```typescript
_sortRelative(pack: CompendiumCollection, sortData: object): void
```

Handle sorting a compendium pack relative to others in the directory.

**Parameters**

- **pack**: `CompendiumCollection` - The compendium pack.
- **sortData**: `object` - Sort data.

**Returns**  
`void`

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

---

### _updateFrame

```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `HandlebarsRenderOptions` - Options provided at render-time

**Returns**  
`void`

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition` - Requested Application positioning data

**Returns**  
`ApplicationPosition` - Resolved Application positioning data

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

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string` - The CSS style rule
- **parentDimension**: `number` - The relevant dimension of the parent element

**Returns**  
`number | void` - The parsed style dimension in pixels

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement` - The element.

**Returns**  
`Promise<void>`