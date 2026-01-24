# SceneDirectory

The World Scene directory listing.

## Hierarchy
- [DocumentDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html)
- **SceneDirectory**

---

## Properties

### options
**Type:** `Readonly<DocumentDirectoryConfiguration>`  
Application instance configuration options.  
Inherited from DocumentDirectory.options

### position
**Type:** `ApplicationPosition = ...`  
The current position of the application with respect to the `window.document.body`.  
Inherited from DocumentDirectory.position

### tabGroups
**Type:** `Record<string, null | string> = ...`  
If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.  
Inherited from DocumentDirectory.tabGroups

### _entryPartial (static)
**Type:** `string = "templates/sidebar/partials/scene-partial.hbs"`  
Overrides DocumentDirectory._entryPartial

### BASE_APPLICATION (static)
**Type:** `typeof ApplicationV2 = ApplicationV2`  
Designates which upstream Application class in this class' inheritance chain is the base  
application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the  
`BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the  
`BASE_APPLICATION` are not dispatched.  
Inherited from DocumentDirectory.BASE_APPLICATION

### DEFAULT_OPTIONS (static)
**Type:** `{ collection: string; renderUpdateKeys: string[] } = ...`  
Overrides DocumentDirectory.DEFAULT_OPTIONS

### emittedEvents (static)
**Type:** `readonly ["render", "close", "position", "activate", "deactivate"] = ...`  
Inherited from DocumentDirectory.emittedEvents

### PARTS (static)
**Type:** `{ directory: { scrollable: string[]; template: string }; footer: { template: string }; header: { template: string } } = ...`  
Inherited from DocumentDirectory.PARTS

### RENDER_STATES (static)
**Type:** `Record<string, number> = ...`  
The sequence of rendering states that describe the Application life-cycle.  
Inherited from DocumentDirectory.RENDER_STATES

### tabName (static)
**Type:** `string = "scenes"`  
Overrides DocumentDirectory.tabName

### TABS (static)
**Type:** `Record<string, ApplicationTabsConfiguration> = {}`  
Configuration of application tabs, with an entry per tab group.  
Inherited from DocumentDirectory.TABS

### _folderPartial (static, protected)
**Type:** `string = "templates/sidebar/partials/folder-partial.hbs"`  
The path to the template used to render a single folder within the directory.  
Inherited from DocumentDirectory._folderPartial

---

## Accessors

### active
**Type:** `boolean`  
Whether this tab is currently active in the sidebar.  
**Returns:** `boolean`  
Inherited from DocumentDirectory.active

### classList
**Type:** `DOMTokenList`  
The CSS class list of this Application instance  
**Returns:** `DOMTokenList`  
Inherited from DocumentDirectory.classList

### collection
**Type:** `DirectoryCollection`  
The Document collection that this directory represents.  
**Returns:** `DirectoryCollection`  
Inherited from DocumentDirectory.collection

### documentClass
**Type:** `Constructor<TDocument>`  
The implementation of the Document type that this directory represents.  
**Returns:** `Constructor<TDocument>`  
Inherited from DocumentDirectory.documentClass

### documentName
**Type:** `string`  
The named Document type that this directory represents.  
**Returns:** `string`  
Inherited from DocumentDirectory.documentName

### element
**Type:** `HTMLElement`  
The HTMLElement which renders this Application into the DOM.  
**Returns:** `HTMLElement`  
Inherited from DocumentDirectory.element

### form
**Type:** `null | HTMLFormElement`  
Does this Application have a top-level form element?  
**Returns:** `null | HTMLFormElement`  
Inherited from DocumentDirectory.form

### hasFrame
**Type:** `boolean`  
Does this Application instance render within an outer window frame?  
**Returns:** `boolean`  
Inherited from DocumentDirectory.hasFrame

### id
**Type:** `string`  
The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.  
**Returns:** `string`  
Inherited from DocumentDirectory.id

### isPopout
**Type:** `boolean`  
Whether this is the popped-out tab or the in-sidebar one.  
**Returns:** `boolean`  
Inherited from DocumentDirectory.isPopout

### minimized
**Type:** `boolean`  
Is this Application instance currently minimized?  
**Returns:** `boolean`  
Inherited from DocumentDirectory.minimized

### popout
**Type:** `void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`  
A reference to the popped-out version of this tab, if one exists.  
**Returns:** `void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`  
Inherited from DocumentDirectory.popout

### rendered
**Type:** `boolean`  
Is this Application instance currently rendered?  
**Returns:** `boolean`  
Inherited from DocumentDirectory.rendered

### state
**Type:** `number`  
The current render state of the Application.  
**Returns:** `number`  
Inherited from DocumentDirectory.state

### tabName
**Type:** `string`  
The base name of the sidebar tab.  
**Returns:** `string`  
Inherited from DocumentDirectory.tabName

### title
**Type:** `string`  
**Returns:** `string`  
Inherited from DocumentDirectory.title

### window
**Type:** `{ close: HTMLButtonElement; content: HTMLElement; controls: HTMLButtonElement; controlsDropdown: HTMLDivElement; header: HTMLElement; icon: HTMLElement; onDrag: Function; onResize: Function; pointerMoveThrottle: boolean; pointerStartPosition: ApplicationPosition; resize: HTMLElement; title: HTMLHeadingElement; }`  
Convenience references to window header elements.  
**Returns:** Object with the above properties  
Inherited from DocumentDirectory.window

---

## Methods

### _canRender
```typescript
_canRender(options: any): false | void
```
**Parameters:**
- **options**: `any`  
**Returns:** `false | void`  
Overrides DocumentDirectory._canRender

---

### _configureRenderParts
```typescript
_configureRenderParts(options: any): any
```
**Parameters:**
- **options**: `any`  
**Returns:** `any`  
Inherited from DocumentDirectory._configureRenderParts

---

### _getEntryContextOptions
```typescript
_getEntryContextOptions(): ( 
  | {
      callback: (li: any) => any;
      condition?: undefined;
      icon: string;
      name: string;
    }
  | {
      callback: (li: any) => void;
      condition: (li: any) => any;
      icon: string;
      name: string;
    }
)[]
```
**Returns:** Array of objects each with:
- **callback**: Function called with a list item
- **condition** (optional): Function returning a condition
- **icon**: string
- **name**: string

Overrides DocumentDirectory._getEntryContextOptions

---

### _getFolderContextOptions
```typescript
_getFolderContextOptions(): ContextMenuEntry[]
```
**Returns:** `ContextMenuEntry[]`  
Overrides DocumentDirectory._getFolderContextOptions

---

### _initializeApplicationOptions
```typescript
_initializeApplicationOptions(options: any): any
```
**Parameters:**
- **options**: `any`  
**Returns:** `any`  
Inherited from DocumentDirectory._initializeApplicationOptions

---

### _onClose
```typescript
_onClose(options: any): void
```
**Parameters:**
- **options**: `any`  
**Returns:** `void`  
Inherited from DocumentDirectory._onClose

---

### _onDragStart
```typescript
_onDragStart(event: any): void
```
**Parameters:**
- **event**: `any`  
**Returns:** `void`  
Inherited from DocumentDirectory._onDragStart

---

### _onDrop
```typescript
_onDrop(event: any): undefined | Promise<void>
```
**Parameters:**
- **event**: `any`  
**Returns:** `undefined | Promise<void>`  
Inherited from DocumentDirectory._onDrop

---

### _onFirstRender
```typescript
_onFirstRender(context: any, options: any): Promise<void>
```
**Parameters:**
- **context**: `any`
- **options**: `any`  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._onFirstRender

---

### _onRender
```typescript
_onRender(context: any, options: any): Promise<void>
```
**Parameters:**
- **context**: `any`
- **options**: `any`  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._onRender

---

### _prepareContext
```typescript
_prepareContext(
  options: any
): Promise<ApplicationRenderContext & {
  canCreateEntry: boolean;
  canCreateFolder: boolean;
  documentName: string;
  folderIcon: string;
  sidebarIcon: any;
}>
```
**Parameters:**
- **options**: `any`  
**Returns:** `Promise` resolving to an object extending `ApplicationRenderContext` with additional properties:  
`canCreateEntry`, `canCreateFolder`, `documentName`, `folderIcon`, `sidebarIcon`  
Inherited from DocumentDirectory._prepareContext

---

### _preparePartContext
```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```
**Parameters:**
- **partId**: `any`
- **context**: `any`
- **options**: `any`  
**Returns:** `Promise<any>`  
Inherited from DocumentDirectory._preparePartContext

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
**Parameters:**
- **partId**: `any`
- **newElement**: `any`
- **priorElement**: `any`
- **state**: `any`  
**Returns:** `void`  
Inherited from DocumentDirectory._preSyncPartState

---

### _renderFrame
```typescript
_renderFrame(options: any): Promise<HTMLElement>
```
**Parameters:**
- **options**: `any`  
**Returns:** `Promise<HTMLElement>`  
Inherited from DocumentDirectory._renderFrame

---

### _renderHTML (abstract)
```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<any>
```
Render an HTMLElement for the Application.  
An Application subclass **must** implement this method to be renderable.  
**Parameters:**
- **context**: `ApplicationRenderContext` - Context data for the render operation  
- **options**: `HandlebarsRenderOptions` - Options which configure application rendering behavior  
**Returns:** `Promise<any>` - The result of HTML rendering passed to `_replaceHTML`  
Inherited from DocumentDirectory._renderHTML

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
**Parameters:**
- **partId**: `any`
- **newElement**: `any`
- **priorElement**: `any`
- **state**: `any`  
**Returns:** `void`  
Inherited from DocumentDirectory._syncPartState

---

### activate
```typescript
activate(): void
```
Activate this tab in the sidebar.  
**Returns:** `void`  
Inherited from DocumentDirectory.activate

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
- **type**: `string` - The type of event being registered for  
- **listener**: `EmittedEventListener` - The listener function called when the event occurs  
- **options** (optional): `{ once?: boolean }` - Options which configure the event listener  
  - **once** (optional): `boolean` - Should the event only be responded to once and then removed  
**Returns:** `void`  
See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from DocumentDirectory.addEventListener

---

### bringToFront
```typescript
bringToFront(): void
```
Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ  
We should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp  
**Returns:** `void`  
Inherited from DocumentDirectory.bringToFront

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
- **tab**: `string` - The name of the tab which should become active  
- **group**: `string` - The name of the tab group which defines the set of tabs  
- **options** (optional):
  - **event** (optional): `Event` - An interaction event which caused the tab change, if any  
  - **force** (optional): `boolean` - Force changing the tab even if the new tab is already active  
  - **navElement** (optional): `HTMLElement` - An explicit navigation element being modified  
  - **updatePosition** (optional): `boolean` - Update application position after changing the tab?  
**Returns:** `void`  
Inherited from DocumentDirectory.changeTab

---

### close
```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<SceneDirectory>
```
Close the Application, removing it from the DOM.  
**Parameters:**
- **options** (optional): `Partial<ApplicationClosingOptions> = {}` - Options which modify how the application is closed.  
**Returns:** `Promise<SceneDirectory>` - A Promise which resolves to the closed Application instance  
Inherited from DocumentDirectory.close

---

### collapseAll
```typescript
collapseAll(): void
```
Collapse all open folders in this directory.  
**Returns:** `void`  
Inherited from DocumentDirectory.collapseAll

---

### dispatchEvent
```typescript
dispatchEvent(event: Event): boolean
```
Dispatch an event on this target.  
**Parameters:**
- **event**: `Event` - The Event to dispatch  
**Returns:** `boolean` - Was default behavior for the event prevented?  
See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from DocumentDirectory.dispatchEvent

---

### maximize
```typescript
maximize(): Promise<void>
```
Restore the Application to its original dimensions.  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory.maximize

---

### minimize
```typescript
minimize(): Promise<void>
```
Minimize the Application, collapsing it to a minimal header.  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory.minimize

---

### removeEventListener
```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```
Remove an event listener for a certain type of event.  
**Parameters:**
- **type**: `string` - The type of event being removed  
- **listener**: `EmittedEventListener` - The listener function being removed  
**Returns:** `void`  
See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from DocumentDirectory.removeEventListener

---

### render
```typescript
render(options: any, _options: any): Promise<SceneDirectory>
```
**Parameters:**
- **options**: `any`
- **_options**: `any`  
**Returns:** `Promise<SceneDirectory>`  
Inherited from DocumentDirectory.render

---

### renderPopout
```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```
Pop-out this sidebar tab as a new application.  
**Returns:** `Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>`  
Inherited from DocumentDirectory.renderPopout

---

### setPosition
```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```
Update the Application element position using provided data which is merged with the prior position.  
**Parameters:**
- **position** (optional): `Partial<ApplicationPosition>` - New Application positioning data  
**Returns:** `void | ApplicationPosition` - The updated application position  
Inherited from DocumentDirectory.setPosition

---

### submit
```typescript
submit(submitOptions?: object): Promise<any>
```
Programmatically submit an ApplicationV2 instance which implements a single top-level form.  
**Parameters:**
- **submitOptions** (optional): `object = {}` - Arbitrary options which are supported by and provided to the configured form submission handler  
**Returns:** `Promise<any>` - A promise that resolves to the returned result of the form submission handler, if any.  
Inherited from DocumentDirectory.submit

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
- **expanded** (optional): `boolean` - Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value  
- **options** (optional): `{ animate?: boolean } = {}` - Options to configure the toggling behavior  
  - **animate** (optional): `boolean` - Animate the controls toggling  
**Returns:** `Promise<void>` - A Promise which resolves once the control expansion animation is complete  
Inherited from DocumentDirectory.toggleControls

---

### _attachFrameListeners (protected)
```typescript
_attachFrameListeners(): void
```
Attach event listeners to the Application frame.  
Returns: `void`  
Inherited from DocumentDirectory._attachFrameListeners

---

### _canCreateEntry (protected)
```typescript
_canCreateEntry(): boolean
```
Determine if the current user has permission to create directory entries.  
Returns: `boolean`  
Inherited from DocumentDirectory._canCreateEntry

---

### _canCreateFolder (protected)
```typescript
_canCreateFolder(): boolean
```
Determine if the current user has permission to create folders in this directory.  
Returns: `boolean`  
Inherited from DocumentDirectory._canCreateFolder

---

### _canDragDrop (protected)
```typescript
_canDragDrop(selector: string): boolean
```
Determine if drop operations are permitted.  
**Parameters:**
- **selector**: `string` - The candidate HTML selector for dragging  
Returns: `boolean`  
Inherited from DocumentDirectory._canDragDrop

---

### _canDragStart (protected)
```typescript
_canDragStart(selector: string): boolean
```
Determine if drag operations are permitted.  
**Parameters:**
- **selector**: `string` - The candidate HTML selector for dragging  
Returns: `boolean`  
Inherited from DocumentDirectory._canDragStart

---

### _configureRenderOptions (protected)
```typescript
_configureRenderOptions(options: HandlebarsRenderOptions): void
```
Modify the provided options passed to a render request.  
**Parameters:**
- **options**: `HandlebarsRenderOptions` - Options which configure application rendering behavior  
Returns: `void`  
Inherited from DocumentDirectory._configureRenderOptions

---

### _createContextMenu (protected)
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
**Parameters:**
- **handler**: `() => ContextMenuEntry[]` - A handler function that provides initial context options  
- **selector**: `string` - A CSS selector to which the ContextMenu will be bound  
- **options** (optional):
  - **container** (optional): `HTMLElement` - A parent HTMLElement which contains the selector target  
  - **hookName** (optional): `string` - The hook name  
  - **parentClassHooks** (optional): `boolean` - Whether to call hooks for the parent classes in the inheritance chain  
**Returns:** `null | ContextMenu` - A created ContextMenu or null if no menu items were defined  
Inherited from DocumentDirectory._createContextMenu

---

### _createContextMenus (protected)
```typescript
_createContextMenus(): void
```
Register context menu entries and fire hooks.  
Returns: `void`  
Inherited from DocumentDirectory._createContextMenus

---

### _createDroppedEntry (protected)
```typescript
_createDroppedEntry(
  entry: DirectoryMixinEntry,
  updates?: object,
): Promise<documents.Scene>
```
Create a new entry in this directory from one that was dropped on it.  
**Parameters:**
- **entry**: `DirectoryMixinEntry` - The dropped entry.  
- **updates** (optional): `object = {}` - Modifications to the creation data.  
**Returns:** `Promise<documents.Scene>`  
Inherited from DocumentDirectory._createDroppedEntry

---

### _createDroppedFolderContent (protected)
```typescript
_createDroppedFolderContent(
  folder: documents.Folder,
  targetFolder?: documents.Folder,
): Promise<documents.Folder[]>
```
Import a dropped folder and its children into this collection if they do not already exist.  
**Parameters:**
- **folder**: `documents.Folder` - The folder being dropped.  
- **targetFolder** (optional): `documents.Folder` - A folder to import into if not the directory root.  
**Returns:** `Promise<documents.Folder[]>`  
Inherited from DocumentDirectory._createDroppedFolderContent

---

### _createDroppedFolderDocuments (protected)
```typescript
_createDroppedFolderDocuments(
  folder: documents.Folder,
  documents: object[] | documents.Scene[],
): Promise<void>
```
Create a set of documents in a dropped folder.  
**Parameters:**
- **folder**: `documents.Folder` - The dropped folder.  
- **documents**: `object[] | documents.Scene[]` - The documents to create, or their indices.  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._createDroppedFolderDocuments

---

### _entryAlreadyExists (protected)
```typescript
_entryAlreadyExists(entry: ClientDocument): boolean
```
Test if the given entry is already present in this directory.  
**Parameters:**
- **entry**: `ClientDocument` - The directory entry.  
**Returns:** `boolean`  
Inherited from DocumentDirectory._entryAlreadyExists

---

### _entryBelongsToFolder (protected)
```typescript
_entryBelongsToFolder(entry: DirectoryMixinEntry, folder: string): boolean
```
Determine whether a given directory entry belongs to the given folder.  
**Parameters:**
- **entry**: `DirectoryMixinEntry` - The entry.  
- **folder**: `string` - The target folder ID.  
**Returns:** `boolean`  
Inherited from DocumentDirectory._entryBelongsToFolder

---

### _getDroppedEntryFromData (protected)
```typescript
_getDroppedEntryFromData(data: object): Promise<ClientDocument>
```
Get the entry instance from its dropped data.  
**Parameters:**
- **data**: `object` - The drag data.  
**Returns:** `Promise<ClientDocument>`  
**Throws:** If the correct instance type could not be retrieved.  
Inherited from DocumentDirectory._getDroppedEntryFromData

---

### _getEntryDragData (protected)
```typescript
_getEntryDragData(entryId: string): any
```
Get drag data for an entry in this directory.  
**Parameters:**
- **entryId**: `string` - The entry's ID.  
**Returns:** `any`  
Inherited from DocumentDirectory._getEntryDragData

---

### _getFolderDragData (protected)
```typescript
_getFolderDragData(folderId: string): any
```
Get drag data for a folder in this directory.  
**Parameters:**
- **folderId**: `string` - The folder ID.  
**Returns:** `any`  
Inherited from DocumentDirectory._getFolderDragData

---

### _getHeaderControls (protected)
```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```
Configure the array of header control menu options.  
**Returns:** `ApplicationHeaderControlsEntry[]`  
Inherited from DocumentDirectory._getHeaderControls

---

### _getTabsConfig (protected)
```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```
Get the configuration for a tabs group.  
**Parameters:**
- **group**: `string` - The ID of a tabs group  
**Returns:** `null | ApplicationTabsConfiguration`  
Inherited from DocumentDirectory._getTabsConfig

---

### _handleDroppedEntry (protected)
```typescript
_handleDroppedEntry(target: HTMLElement, data: object): Promise<void>
```
Handle dropping a new entry into this directory.  
**Parameters:**
- **target**: `HTMLElement` - The drop target element.  
- **data**: `object` - The drop data.  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._handleDroppedEntry

---

### _handleDroppedFolder (protected)
```typescript
_handleDroppedFolder(target: HTMLElement, data: object): Promise<void>
```
Handle dropping a folder onto the directory.  
**Parameters:**
- **target**: `HTMLElement` - The drop target element.  
- **data**: `object` - The drop data.  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._handleDroppedFolder

---

### _handleDroppedForeignFolder (protected)
```typescript
_handleDroppedForeignFolder(
  folder: documents.Folder,
  closestFolderId: string,
  sortData: object,
): Promise<null | { folder: documents.Folder; sortNeeded: boolean }>
```
Handle importing a new folder into the directory.  
**Parameters:**
- **folder**: `documents.Folder` - The dropped folder.  
- **closestFolderId**: `string` - The ID of the closest folder to the drop target.  
- **sortData**: `object` - Sort data for the folder.  
**Returns:** `Promise<null | { folder: documents.Folder; sortNeeded: boolean }>`  
Inherited from DocumentDirectory._handleDroppedForeignFolder

---

### _headerControlButtons (protected)
```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```
Iterate over header control buttons, filtering for controls which are visible for the current client.  
**Returns:** `Generator<ApplicationHeaderControlsEntry, any, any>`  
Inherited from DocumentDirectory._headerControlButtons

---

### _insertElement (protected)
```typescript
_insertElement(element: HTMLElement): void
```
Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.  
**Parameters:**
- **element**: `HTMLElement` - The element to insert  
**Returns:** `void`  
Inherited from DocumentDirectory._insertElement

---

### _matchSearchEntries (protected)
```typescript
_matchSearchEntries(
  query: RegExp,
  entryIds: Set<string>,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object,
): void
```
Identify entries in the collection which match a provided search query.  
**Parameters:**
- **query**: `RegExp` - The search query.  
- **entryIds**: `Set<string>` - The set of matched entry IDs.  
- **folderIds**: `Set<string>` - The set of matched folder IDs.  
- **autoExpandIds**: `Set<string>` - The set of folder IDs that should be auto-expanded.  
- **options** (optional): `object = {}` - Additional options for subclass-specific behavior.  
**Returns:** `void`  
Inherited from DocumentDirectory._matchSearchEntries

---

### _matchSearchFolders (protected)
```typescript
_matchSearchFolders(
  query: RegExp,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object,
): void
```
Identify folders in the collection which match a provided search query.  
**Parameters:**
- **query**: `RegExp` - The search query.  
- **folderIds**: `Set<string>` - The set of matched folder IDs.  
- **autoExpandIds**: `Set<string>` - The set of folder IDs that should be auto-expanded.  
- **options** (optional): `object = {}` - Additional options for subclass-specific behavior.  
**Returns:** `void`  
Inherited from DocumentDirectory._matchSearchFolders

---

### _onActivate (protected)
```typescript
_onActivate(): void
```
Actions performed when this tab is activated in the sidebar.  
**Returns:** `void`  
Inherited from DocumentDirectory._onActivate

---

### _onChangeForm (protected)
```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```
Handle changes to an input element within the form.  
**Parameters:**
- **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound  
- **event**: `Event` - An input change event within the form  
**Returns:** `void`  
Inherited from DocumentDirectory._onChangeForm

---

### _onClickAction (protected)
```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```
A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.  
**Parameters:**
- **event**: `PointerEvent` - The originating click event  
- **target**: `HTMLElement` - The capturing HTML element which defined a [data-action]  
**Returns:** `void`  
Inherited from DocumentDirectory._onClickAction

---

### _onClickEntry (protected)
```typescript
_onClickEntry(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean },
): Promise<void>
```
Handle activating a directory entry.  
**Parameters:**
- **event**: `PointerEvent` - The triggering click event  
- **target**: `HTMLElement` - The action target element  
- **options** (optional):
  - **_skipDeprecation** (optional): `boolean` - Internal use only  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._onClickEntry

---

### _onClickTab (protected)
```typescript
_onClickTab(event: PointerEvent): void
```
Handle click events on a tab within the Application.  
**Parameters:**
- **event**: `PointerEvent`  
**Returns:** `void`  
Inherited from DocumentDirectory._onClickTab

---

### _onCreateEntry (protected)
```typescript
_onCreateEntry(event: PointerEvent, target: HTMLElement): any
```
Handle creating a new entry in this directory.  
**Parameters:**
- **event**: `PointerEvent` - The triggering click event  
- **target**: `HTMLElement` - The action target element  
**Returns:** `any`  
Inherited from DocumentDirectory._onCreateEntry

---

### _onCreateFolder (protected)
```typescript
_onCreateFolder(event: PointerEvent, target: HTMLElement): void
```
Handle creating a new folder in this directory.  
**Parameters:**
- **event**: `PointerEvent` - The triggering click event  
- **target**: `HTMLElement` - The action target element  
**Returns:** `void`  
Inherited from DocumentDirectory._onCreateFolder

---

### _onDeactivate (protected)
```typescript
_onDeactivate(): void
```
Actions performed when this tab is deactivated in the sidebar.  
**Returns:** `void`  
Inherited from DocumentDirectory._onDeactivate

---

### _onDragHighlight (protected)
```typescript
_onDragHighlight(event: DragEvent): void
```
Highlight folders as drop targets when a drag event enters or exits their area.  
**Parameters:**
- **event**: `DragEvent` - The in-progress drag event  
**Returns:** `void`  
Inherited from DocumentDirectory._onDragHighlight

---

### _onDragOver (protected)
```typescript
_onDragOver(event: DragEvent): void
```
Handle drag events over the directory.  
**Parameters:**
- **event**: `DragEvent`  
**Returns:** `void`  
Inherited from DocumentDirectory._onDragOver

---

### _onMatchSearchEntry (protected)
```typescript
_onMatchSearchEntry(
  query: string,
  entryIds: Set<string>,
  element: HTMLElement,
  options?: object,
): void
```
Handle matching a given directory entry with the search filter.  
**Parameters:**
- **query**: `string` - The input search string  
- **entryIds**: `Set<string>` - The matched directory entry IDs  
- **element**: `HTMLElement` - The candidate entry element  
- **options** (optional): `object = {}` - Additional options for subclass-specific behavior  
**Returns:** `void`  
Inherited from DocumentDirectory._onMatchSearchEntry

---

### _onPosition (protected)
```typescript
_onPosition(position: ApplicationPosition): void
```
Actions performed after the Application is re-positioned.  
**Parameters:**
- **position**: `ApplicationPosition` - The requested application position  
**Returns:** `void`  
Inherited from DocumentDirectory._onPosition

---

### _onSearchFilter (protected)
```typescript
_onSearchFilter(
  event: KeyboardEvent,
  query: string,
  rgx: RegExp,
  html: HTMLElement,
): void
```
Handle directory searching and filtering.  
**Parameters:**
- **event**: `KeyboardEvent` - The keyboard input event  
- **query**: `string` - The input search string  
- **rgx**: `RegExp` - The regular expression query that should be matched against  
- **html**: `HTMLElement` - The container to filter entries from  
**Returns:** `void`  
Inherited from DocumentDirectory._onSearchFilter

---

### _onSubmitForm (protected)
```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```
Handle submission for an Application which uses the form element.  
**Parameters:**
- **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound  
- **event**: `Event | SubmitEvent` - The form submission event  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._onSubmitForm

---

### _onToggleFolder (protected)
```typescript
_onToggleFolder(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean },
): any
```
Handle toggling a folder's expanded state.  
**Parameters:**
- **event**: `PointerEvent` - The triggering click event  
- **target**: `HTMLElement` - The action target element  
- **options** (optional):
  - **_skipDeprecation** (optional): `boolean` - Internal use only  
**Returns:** `any`  
Inherited from DocumentDirectory._onToggleFolder

---

### _organizeDroppedFoldersAndDocuments (protected)
```typescript
_organizeDroppedFoldersAndDocuments(
  folder: documents.Folder,
  targetFolder?: documents.Folder,
): Promise<{
  documentsToCreate: object[] | documents.Scene[];
  foldersToCreate: documents.Folder[];
}>
```
Organize a dropped folder and its children into a list of folders and documents to create.  
**Parameters:**
- **folder**: `documents.Folder` - The dropped folder  
- **targetFolder** (optional): `documents.Folder` - A folder to import into if not the directory root  
**Returns:** `Promise` resolving to an object containing:
- **documentsToCreate**: `object[] | documents.Scene[]`
- **foldersToCreate**: `documents.Folder[]`  
Inherited from DocumentDirectory._organizeDroppedFoldersAndDocuments

---

### _preClose (protected)
```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```
Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.  
**Parameters:**
- **options**: `HandlebarsRenderOptions` - Provided render options  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._preClose

---

### _preFirstRender (protected)
```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
Actions performed before a first render of the Application.  
**Parameters:**
- **context**: `ApplicationRenderContext` - Prepared context data  
- **options**: `HandlebarsRenderOptions` - Provided render options  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._preFirstRender

---

### _prepareDirectoryContext (protected)
```typescript
_prepareDirectoryContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
Prepare render context for the directory part.  
**Parameters:**
- **context**: `ApplicationRenderContext`  
- **options**: `HandlebarsRenderOptions`  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._prepareDirectoryContext

---

### _prepareFooterContext (protected)
```typescript
_prepareFooterContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
Prepare render context for the footer part.  
**Parameters:**
- **context**: `ApplicationRenderContext`  
- **options**: `HandlebarsRenderOptions`  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._prepareFooterContext

---

### _prepareHeaderContext (protected)
```typescript
_prepareHeaderContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
Prepare render context for the header part.  
**Parameters:**
- **context**: `ApplicationRenderContext`  
- **options**: `HandlebarsRenderOptions`  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._prepareHeaderContext

---

### _prepareTabs (protected)
```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```
Prepare application tab data for a single tab group.  
**Parameters:**
- **group**: `string` - The ID of the tab group to prepare  
**Returns:** `Record<string, ApplicationTab>`  
Inherited from DocumentDirectory._prepareTabs

---

### _prePosition (protected)
```typescript
_prePosition(position: ApplicationPosition): void
```
Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.  
**Parameters:**
- **position**: `ApplicationPosition` - The requested application position  
**Returns:** `void`  
Inherited from DocumentDirectory._prePosition

---

### _preRender (protected)
```typescript
_preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.  
**Parameters:**
- **context**: `ApplicationRenderContext` - Prepared context data  
- **options**: `HandlebarsRenderOptions` - Provided render options  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory._preRender

---

### _removeElement (protected)
```typescript
_removeElement(element: HTMLElement): void
```
Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.  
**Parameters:**
- **element**: `HTMLElement` - The element to be removed  
**Returns:** `void`  
Inherited from DocumentDirectory._removeElement

---

### _renderHeaderControl (protected)
```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```
Render a header control button.  
**Parameters:**
- **control**: `ApplicationHeaderControlsEntry`  
**Returns:** `HTMLLIElement`  
Inherited from DocumentDirectory._renderHeaderControl

---

### _replaceHTML (protected)
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
**Parameters:**
- **result**: `any` - The result returned by the application rendering backend  
- **content**: `HTMLElement` - The content element into which the rendered result must be inserted  
- **options**: `HandlebarsRenderOptions` - Options which configure application rendering behavior  
**Returns:** `void`  
Inherited from DocumentDirectory._replaceHTML

---

### _tearDown (protected)
```typescript
_tearDown(options: ApplicationClosingOptions): void
```
Remove elements from the DOM and trigger garbage collection as part of application  
closure.  
**Parameters:**
- **options**: `ApplicationClosingOptions`  
**Returns:** `void`  
Inherited from DocumentDirectory._tearDown

---

### _updateFrame (protected)
```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```
When the Application is rendered, optionally update aspects of the window frame.  
**Parameters:**
- **options**: `HandlebarsRenderOptions` - Options provided at render-time  
**Returns:** `void`  
Inherited from DocumentDirectory._updateFrame

---

### _updatePosition (protected)
```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```
Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.  
**Parameters:**
- **position**: `ApplicationPosition` - Requested Application positioning data  
**Returns:** `ApplicationPosition` - Resolved Application positioning data  
Inherited from DocumentDirectory._updatePosition

---

### inheritanceChain (static)
```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```
Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.  
**Returns:** Generator of Application classes  
See: [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)  
Inherited from DocumentDirectory.inheritanceChain

---

### parseCSSDimension (static)
```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```
Parse a CSS style rule into a number of pixels which apply to that dimension.  
**Parameters:**
- **style**: `string` - The CSS style rule  
- **parentDimension**: `number` - The relevant dimension of the parent element  
**Returns:** `number | void` - The parsed style dimension in pixels  
Inherited from DocumentDirectory.parseCSSDimension

---

### waitForImages (static)
```typescript
waitForImages(element: HTMLElement): Promise<void>
```
Wait for any images in the given element to load.  
**Parameters:**
- **element**: `HTMLElement` - The element  
**Returns:** `Promise<void>`  
Inherited from DocumentDirectory.waitForImages

---

# See also

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)