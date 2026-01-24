# ChatLog | Foundry Virtual Tabletop - API Documentation - Version 13

The sidebar chat tab.

## Mixes

- HandlebarsApplication

## Hierarchy
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sidebar.tabs.ChatLog)

- `AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions, this>`
- **ChatLog**

---

## Constructors

### constructor

```typescript
new ChatLog(options?: Partial<ApplicationConfiguration>): ChatLog
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance.

**Returns**  
`ChatLog`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).constructor

---

## Properties

### options

`options: Readonly<ApplicationConfiguration>`

Application instance configuration options.

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).options

### position

`position: ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).position

### tabGroups

`tabGroups: Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).tabGroups

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the  
`BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the  
`BASE_APPLICATION` are not dispatched.

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: {
        deleteMessage: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        dismissMessage: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        expandRoll: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        export: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        flush: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        jumpToBottom: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        rollMode: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
    };
    classes: string[];
    window: { title: string };
} = ...
```

### emittedEvents

```typescript
readonly emittedEvents: readonly [
    "render",
    "close",
    "position",
    "activate",
    "deactivate",
] = ...
```

### MAX_MESSAGE_HISTORY

`MAX_MESSAGE_HISTORY: number = 16`

The maximum number of messages to retain in the history in a given session.

### MESSAGE_PATTERNS

```typescript
MESSAGE_PATTERNS: {
    blindroll: RegExp;
    emote: RegExp;
    gm: RegExp;
    gmroll: RegExp;
    ic: RegExp;
    invalid: RegExp;
    macro: RegExp;
    ooc: RegExp;
    players: RegExp;
    publicroll: RegExp;
    reply: RegExp;
    roll: RegExp;
    selfroll: RegExp;
    whisper: RegExp;
} = ...
```

An enumeration of regular expression patterns used to match chat messages.

### MULTILINE_COMMANDS

`MULTILINE_COMMANDS: Set<string> = ...`

The set of commands that can be processed over multiple lines.

### NOTIFY_DURATION

`NOTIFY_DURATION: number = 5000`

The number of milliseconds to keep a chat card notification until it is automatically  
dismissed.

### NOTIFY_TICKER

`NOTIFY_TICKER: number = 500`

The notification ticker frequency.

### NOTIFY_UNPAUSE

`NOTIFY_UNPAUSE: number = 2000`

The number of milliseconds to wait before unpausing the notification queue.

### PARTS

```typescript
PARTS: {
    input: { template: string };
    log: { template: string; templates: string[] };
} = ...
```

### PIP_DURATION

`PIP_DURATION: number = 3000`

The number of milliseconds to display the chat notification pip.

### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

### tabName

`tabName: string = "chat"`

---

## Accessors

### TABS

```typescript
static TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

### UPDATE_TIMESTAMP_FREQUENCY

`static UPDATE_TIMESTAMP_FREQUENCY: number = ...`

How often, in milliseconds, to update timestamps.

### active

```typescript
get active(): boolean
```

Whether this tab is currently active in the sidebar.

**Returns** `boolean`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).active

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

**Returns** `DOMTokenList`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).classList

### collection

```typescript
get collection(): Messages
```

A reference to the Messages collection that the chat log displays.

**Returns** `Messages`

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns** `HTMLElement`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).element

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns** `null | HTMLFormElement`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).form

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns** `boolean`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).hasFrame

### history

```typescript
get history(): { index: number; pending: string; queue: string[] }
```

Message history management.

**Returns**  
`{ index: number; pending: string; queue: string[] }`

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.

**Returns** `string`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).id

### isAtBottom

```typescript
get isAtBottom(): boolean
```

A flag for whether the chat log is currently scrolled to the bottom.

**Returns** `boolean`

### isPopout

```typescript
get isPopout(): boolean
```

Whether this is the popped-out tab or the in-sidebar one.

**Returns** `boolean`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).isPopout

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns** `boolean`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).minimized

### popout

```typescript
get popout(): void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>
```

A reference to the popped-out version of this tab, if one exists.

**Returns** `void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).popout

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns** `boolean`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).rendered

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns** `number`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).state

### tabName

```typescript
get tabName(): string
```

The base name of the sidebar tab.

**Returns** `string`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).tabName

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

**Returns** `string`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).title

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

**Properties**

- **close**: HTMLButtonElement
- **content**: HTMLElement
- **controls**: HTMLButtonElement
- **controlsDropdown**: HTMLDivElement
- **header**: HTMLElement
- **icon**: HTMLElement
- **onDrag**: Function
- **onResize**: Function
- **pointerMoveThrottle**: boolean
- **pointerStartPosition**: ApplicationPosition
- **resize**: HTMLElement
- **title**: HTMLHeadingElement

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).window

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

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._configureRenderOptions

**Parameters**

- **options**: `any`

**Returns** `void`

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): ApplicationConfiguration
```

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._initializeApplicationOptions

**Parameters**

- **options**: `any`

**Returns** `ApplicationConfiguration`

### _onActivate

```typescript
_onActivate(): void
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onActivate

**Returns** `void`

### _onClose

```typescript
_onClose(options: any): void
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onClose

**Parameters**

- **options**: `any`

**Returns** `void`

### _onDeactivate

```typescript
_onDeactivate(): void
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onDeactivate

**Returns** `void`

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onFirstRender

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns** `Promise<void>`

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onRender

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns** `Promise<void>`

### _preClose

```typescript
_preClose(options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._preClose

**Parameters**

- **options**: `any`

**Returns** `Promise<void>`

### _prepareContext

```typescript
_prepareContext(options: any): Promise<ApplicationRenderContext>
```

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._prepareContext

**Parameters**

- **options**: `any`

**Returns** `Promise<ApplicationRenderContext>`

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._preparePartContext

**Parameters**

- **partId**: `any`
- **context**: `any`
- **options**: `any`

**Returns** `Promise<any>`

### _preSyncPartState

```typescript
_preSyncPartState(
    partId: any,
    newElement: any,
    priorElement: any,
    state: any,
): void
```

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._preSyncPartState

**Parameters**

- **partId**: `any`
- **newElement**: `any`
- **priorElement**: `any`
- **state**: `any`

**Returns** `void`

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._renderFrame

**Parameters**

- **options**: `any`

**Returns** `Promise<HTMLElement>`

### _renderHTML

```typescript
_renderHTML(context: any, options: any): Promise<any>
```

Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._renderHTML

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns** `Promise<any>`

### _syncPartState

```typescript
_syncPartState(
    partId: any,
    newElement: any,
    priorElement: any,
    state: any,
): void
```

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._syncPartState

**Parameters**

- **partId**: `any`
- **newElement**: `any`
- **priorElement**: `any`
- **state**: `any`

**Returns** `void`

### activate

```typescript
activate(): void
```

Activate this tab in the sidebar.

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).activate

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
- **options**: `{ once?: boolean }` = `{}`  
  Options which configure the event listener

**Optional**

- **once**?: `boolean`  
  Should the event only be responded to once and then removed

**Returns** `void`

See: [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).addEventListener

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate `ui.activeWindow` in favor of only ApplicationV2#frontApp

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).bringToFront

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
- **options**:  
  - **event**?: `Event`  
    An interaction event which caused the tab change, if any  
  - **force**?: `boolean`  
    Force changing the tab even if the new tab is already active  
  - **navElement**?: `HTMLElement`  
    An explicit navigation element being modified  
  - **updatePosition**?: `boolean`  
    Update application position after changing the tab?

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).changeTab

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<ChatLog>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options**: `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

**Returns**  
A Promise which resolves to the closed Application instance

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).close

### deleteMessage

```typescript
deleteMessage(messageId: string, options?: { deleteAll?: boolean }): Promise<void>
```

Delete a single message from the chat log.

**Parameters**

- **messageId**: `string`  
  The ID of the ChatMessage Document to remove from the log.
- **options**: `{ deleteAll?: boolean }` = `{}`  
  Options object

**Optional**

- **deleteAll**?: `boolean`  
  Delete all messages from the log.

**Returns** `Promise<void>`

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns**  
Was default behavior for the event prevented?

**See**: [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).dispatchEvent

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns** `Promise<void>`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).maximize

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns** `Promise<void>`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).minimize

### notify

```typescript
notify(
    message: documents.ChatMessage,
    options?: { existing?: HTMLElement; newMessage?: boolean },
): void
```

Trigger a notification that alerts the user visually and audibly of new chat activity.

**Parameters**

- **message**: `documents.ChatMessage`  
  The created or updated message.
  
- **options**: `{ existing?: HTMLElement; newMessage?: boolean }` = `{}`

  **Optional**
  
  - **existing**?: `HTMLElement`  
    The existing rendered chat card, if it exists.
  - **newMessage**?: `boolean`  
    Whether this is a new message.

**Returns** `void`

### postOne

```typescript
postOne(
    message: documents.ChatMessage,
    options?: { before?: string; notify?: boolean },
): Promise<void>
```

Post a single chat message to the log.

**Parameters**

- **message**: `documents.ChatMessage`  
  The chat message.

- **options**: `{ before?: string; notify?: boolean }` = `{}`

  **Optional**

  - **before**?: `string`  
    An existing message ID to prepend the posted message to, by default the new  
    message is appended to the end of the log.
  - **notify**?: `boolean`  
    Trigger a notification which shows the log as having a new unread message.

**Returns**  
A Promise which resolves once the message has been posted.

### processMessage

```typescript
processMessage(
    message: string,
    options?: { speaker?: any },
): Promise<void | documents.ChatMessage>
```

Prepare the data object of chat message data depending on the type of message being  
posted.

**Parameters**

- **message**: `string`  
  The original string of the message content

- **options**: `{ speaker?: any }` = `{}`

  **Optional**

  - **speaker**?: `any`  
    The speaker data

**Returns**  
The created ChatMessage Document, or void if we were executing a macro instead.

**Throws**  
If an invalid command is found.

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

**See**: [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).removeEventListener

### render

```typescript
render(options: any, _options: any): Promise<ChatLog>
```

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).render

**Parameters**

- **options**: `any`
- **_options**: `any`

**Returns** `Promise<ChatLog>`

### renderBatch

```typescript
renderBatch(size: number): Promise<void>
```

Render a batch of additional messages, prepending them to the top of the log.

**Parameters**

- **size**: `number`  
  The batch size.

**Returns** `Promise<void>`

### renderPopout

```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```

Pop-out this sidebar tab as a new application.

**Returns**  
A Promise that resolves to the popout application.

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).renderPopout

### scrollBottom

```typescript
scrollBottom(options?: {
    popout?: boolean;
    scrollOptions?: ScrollIntoViewOptions;
    waitImages?: boolean;
}): Promise<void>
```

Scroll the chat log to the bottom.

**Parameters**

- **options**:  
  - **popout**?: `boolean`  
    If a popout exists, scroll it to the bottom too.
  - **scrollOptions**?: `ScrollIntoViewOptions`  
    Options to configure scrolling behavior.
  - **waitImages**?: `boolean`  
    Wait for any images embedded in the chat log to load first before scrolling.

**Returns** `Promise<void>`

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position**: `Partial<ApplicationPosition>` (Optional)  
  New Application positioning data.

**Returns**  
`void | ApplicationPosition` - The updated application position.

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).setPosition

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions**: `object` = `{}` (Optional)  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns**  
A promise that resolves to the returned result of the form submission handler, if any.

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).submit

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded**: `boolean` (Optional)  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value.
- **options**: `{ animate?: boolean }` = `{}` (Optional)  
  Options to configure the toggling behavior.

**Optional**

- **animate**?: `boolean`  
  Animate the controls toggling.

**Returns**  
A Promise which resolves once the control expansion animation is complete.

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).toggleControls

### updateMessage

```typescript
updateMessage(
    message: documents.ChatMessage, 
    options?: { notify?: boolean }
): Promise<void>
```

Update the contents of a previously-posted message.

**Parameters**

- **message**: `documents.ChatMessage`  
  The ChatMessage instance to update.

- **options**: `{ notify?: boolean }` = `{}` (Optional)  
  - **notify**?: `boolean`  
    Trigger a notification which shows the log as having a new unread message.

**Returns** `Promise<void>`

### updateTimestamps

```typescript
updateTimestamps(): void
```

Update displayed timestamps for every displayed message in the chat log. Timestamps are  
displayed in a humanized "time-since" format.

**Returns** `void`

---

### Protected Methods

#### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._attachFrameListeners

#### _attachLogListeners

```typescript
_attachLogListeners(
    element: HTMLElement,
    options: ApplicationRenderOptions,
): void
```

Attach listeners to the chat log.

**Parameters**

- **element**: `HTMLElement`  
  The log element.
- **options**: `ApplicationRenderOptions`

**Returns** `void`

#### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
Return false to prevent rendering

**Throws**  
An Error to display a warning message

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._canRender

#### _createContextMenu

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
- **options**: (Optional)  
  - **container**?: `HTMLElement`  
    A parent HTMLElement which contains the selector target  
  - **hookName**?: `string`  
    The hook name  
  - **parentClassHooks**?: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
A created ContextMenu or null if no menu items were defined

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._createContextMenu

#### _getEntryContextOptions

```typescript
_getEntryContextOptions(): ContextMenuEntry[]
```

Get context menu entries for chat messages in the log.

**Returns** `ContextMenuEntry[]`

#### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns** `ApplicationHeaderControlsEntry[]`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._getHeaderControls

#### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns** `null | ApplicationTabsConfiguration`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._getTabsConfig

#### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

**Yields** `ApplicationHeaderControlsEntry`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._headerControlButtons

#### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._insertElement

#### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event`  
  An input change event within the form

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._onChangeForm

#### _onClickAction

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

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._onClickAction

#### _onClickNotification

```typescript
_onClickNotification(event: PointerEvent): void
```

Handle clicking a chat card notification. Treat action button clicks within the Notifications UI  
as action clicks on the ChatLog instance itself.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.

**Returns** `void`

#### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._onClickTab

#### _onKeyDown

```typescript
_onKeyDown(event: KeyboardEvent): void
```

Handle keydown events in the chat message entry textarea.

**Parameters**

- **event**: `KeyboardEvent`  
  The triggering event.

**Returns** `void`

#### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._onPosition

#### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`
- **event**: `Event | SubmitEvent`

**Returns** `Promise<void>`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._onSubmitForm

#### _preFirstRender

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

**Returns** `Promise<void>`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._preFirstRender

#### _prepareInputContext

```typescript
_prepareInputContext(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Prepare rendering context for the chat panel's message input component.

**Parameters**

- **context**: `ApplicationRenderContext`
- **options**: `ApplicationRenderOptions`

**Returns** `Promise<void>`

#### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**  
`Record<string, ApplicationTab>`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._prepareTabs

#### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because `setPosition` is synchronous.

**Parameters**

- **position**: `ApplicationPosition`

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._prePosition

#### _preRender

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
- **options**: `ApplicationRenderOptions`

**Returns** `Promise<void>`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._preRender

#### _preSyncInputState

```typescript
_preSyncInputState(
    newElement: HTMLElement,
    priorElement: HTMLElement,
    state: object,
): void
```

Prepare data used to synchronize the state of the chat input.

**Parameters**

- **newElement**: `HTMLElement`  
  The newly-rendered element.
- **priorElement**: `HTMLElement`  
  The existing element.
- **state**: `object`  
  A state object which is used to synchronize after replacement.

**Returns** `void`

#### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._removeElement

#### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns** `HTMLLIElement`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._renderHeaderControl

#### _replaceHTML

```typescript
_replaceHTML(
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

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._replaceHTML

#### _shouldShowNotifications

```typescript
_shouldShowNotifications(options?: { closing?: boolean }): boolean
```

Determine whether the notifications pane should be visible.

**Parameters**

- **options**: `{ closing?: boolean }` = `{}` (Optional)  
  - **closing**?: `boolean`  
    Whether the chat popout is closing.

**Returns** `boolean`

#### _syncInputState

```typescript
_syncInputState(
    newElement: HTMLElement,
    priorElement: HTMLElement,
    state: object,
): void
```

Synchronize the state of the chat input.

**Parameters**

- **newElement**: `HTMLElement`  
  The newly-rendered element.
- **priorElement**: `HTMLElement`  
  The element being replaced.
- **state**: `object`  
  The state object used to synchronize the pre- and post-render states.

**Returns** `void`

#### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._tearDown

#### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options provided at render-time

**Returns** `void`

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._updateFrame

#### _updatePosition

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
Resolved Application positioning data

Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._updatePosition

---

## Static Methods and Properties

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns**  
A Generator yielding class constructors of ApplicationV2 and its parents.

**See**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

### parse

```typescript
static parse(
    message: string,
): [string, string[] | RegExpMatchArray | RegExpMatchArray[]]
```

Parse a chat string to identify the chat command (if any) which was used.

**Parameters**

- **message**: `string`  
  The message to parse.

**Returns**  
A tuple containing the identified command and regex match.

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
The parsed style dimension in pixels

### renderMessage

```typescript
static renderMessage(
    message: documents.ChatMessage,
    options?: object,
): Promise<HTMLElement>
```

Handles chat message rendering during the `ChatMessage#getHTML` deprecation period.  
After that period ends, calls to this method can be replaced by `ChatMessage#renderHTML`.

**Parameters**

- **message**: `documents.ChatMessage`  
  The chat message to render.
- **options**: `object` (Optional)  
  Options forwarded to the render function.

**Returns** `Promise<HTMLElement>`

**Throws**  
If the message's render methods do not return a usable result.

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`

**Returns** `Promise<void>`