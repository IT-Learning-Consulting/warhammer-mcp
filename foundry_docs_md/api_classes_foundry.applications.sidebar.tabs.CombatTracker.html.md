# CombatTracker | Foundry Virtual Tabletop - API Documentation - Version 13

An Application that manages switching between Combats and tracking the Combatants in those Combats.

## Class CombatTracker

**Mixes:**  
HandlebarsApplication

**Hierarchy:**  
[AbstractSidebarTab](https://foundryvtt.com/api/classes/foundry.applications.sidebar.AbstractSidebarTab.html)<ApplicationConfiguration, ApplicationRenderOptions, this>  
→ **CombatTracker**

---

## Constructors

### constructor

```typescript
new CombatTracker(options?: Partial<ApplicationConfiguration>): CombatTracker
```

Applications are constructed by providing an object of configuration options.

**Parameters**

- **options**: `Partial<ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance

**Returns**  
`CombatTracker`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).constructor`

---

## Properties

### options

```typescript
options: Readonly<ApplicationConfiguration>
```
Application instance configuration options.

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).options`

### position

```typescript
position: ApplicationPosition = ...
```
The current position of the application with respect to the `window.document.body`.

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).position`

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```
If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).tabGroups`

---

## Static Properties

### BASE_APPLICATION

```typescript
BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```
Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the BASE_APPLICATION are not dispatched.

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: {
        activateCombatant: (...this: any, ...args: any[]) => void;
        createCombat: (...this: any, ...args: any[]) => Promise<void>;
        cycleCombat: (...this: any, ...args: any[]) => any;
        panToCombatant: (...this: any, ...args: any[]) => any;
        pingCombatant: (...this: any, ...args: any[]) => any;
        rollInitiative: (...this: any, ...args: any[]) => any;
        toggleDefeated: (...this: any, ...args: any[]) => any;
        toggleHidden: (...this: any, ...args: any[]) => any;
        trackerSettings: (
            ...this: any,
            event: PointerEvent,
            target: HTMLElement,
        ) => Promise<CombatTrackerConfig>;
    };
    window: { title: string };
} = ...
```

### emittedEvents

```typescript
emittedEvents: readonly [
    "render",
    "close",
    "position",
    "activate",
    "deactivate",
] = ...
```

### PARTS

```typescript
PARTS: {
    footer: { template: string };
    header: { template: string };
    tracker: { template: string };
} = ...
```

### RENDER_STATES

```typescript
RENDER_STATES: Record<string, number> = ...
```
The sequence of rendering states that describe the Application life-cycle.

### tabName

```typescript
tabName: string = "combat"
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

**Returns**  
`boolean`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).active`

### classList

```typescript
get classList(): DOMTokenList
```
The CSS class list of this Application instance

**Returns**  
`DOMTokenList`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).classList`

### combats

```typescript
get combats(): documents.Combat[]
```
The list combats applicable to the active Scene.

**Returns**  
`documents.Combat[]`

### element

```typescript
get element(): HTMLElement
```
The HTMLElement which renders this Application into the DOM.

**Returns**  
`HTMLElement`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).element`

### form

```typescript
get form(): null | HTMLFormElement
```
Does this Application have a top-level form element?

**Returns**  
`null | HTMLFormElement`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).form`

### hasFrame

```typescript
get hasFrame(): boolean
```
Does this Application instance render within an outer window frame?

**Returns**  
`boolean`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).hasFrame`

### id

```typescript
get id(): string
```
The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

**Returns**  
`string`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).id`

### isPopout

```typescript
get isPopout(): boolean
```
Whether this is the popped-out tab or the in-sidebar one.

**Returns**  
`boolean`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).isPopout`

### minimized

```typescript
get minimized(): boolean
```
Is this Application instance currently minimized?

**Returns**  
`boolean`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).minimized`

### popout

```typescript
get popout(): void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>
```
A reference to the popped-out version of this tab, if one exists.

**Returns**  
`void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).popout`

### rendered

```typescript
get rendered(): boolean
```
Is this Application instance currently rendered?

**Returns**  
`boolean`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).rendered`

### state

```typescript
get state(): number
```
The current render state of the Application.

**Returns**  
`number`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).state`

### tabName

```typescript
get tabName(): string
```
The base name of the sidebar tab.

**Returns**  
`string`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).tabName`

### title

```typescript
get title(): string
```
A convenience reference to the title of the Application window.

**Returns**  
`string`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).title`

### viewed

```typescript
get viewed(): null | documents.Combat
```
Record the currently tracked combat encounter.

**Returns**  
`null | documents.Combat`

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

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Overrides `HandlebarsApplicationMixin(AbstractSidebarTab)._attachFrameListeners`

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

**Parameters**

- **options**: `any`

Overrides `HandlebarsApplicationMixin(AbstractSidebarTab)._configureRenderOptions`

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): ApplicationConfiguration
```

**Parameters**

- **options**: `any`

**Returns**  
`ApplicationConfiguration`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._initializeApplicationOptions`

---

### _onClickAction

```typescript
_onClickAction(event: any, target: any): Promise<void>
```

**Parameters**

- **event**: `any`  
- **target**: `any`

Overrides `HandlebarsApplicationMixin(AbstractSidebarTab)._onClickAction`

---

### _onClose

```typescript
_onClose(options: any): void
```

**Parameters**

- **options**: `any`

Overrides `HandlebarsApplicationMixin(AbstractSidebarTab)._onClose`

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

Overrides `HandlebarsApplicationMixin(AbstractSidebarTab)._onFirstRender`

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._onRender`

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<ApplicationRenderContext>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<ApplicationRenderContext>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._prepareContext`

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

**Parameters**

- **partId**: `any`  
- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<any>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._preparePartContext`

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<HTMLElement>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._renderFrame`

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Context data for the render operation  
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options which configure application rendering behavior

**Returns**  
`Promise<any>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._renderHTML`

---

### activate

```typescript
activate(): void
```
Activate this tab in the sidebar.

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).activate`

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
- **options**: `{ once?: boolean }` = `{}` (Optional)  
  Options which configure the event listener  
  - **once?**: `boolean` — Should the event only be responded to once and then removed

**Returns**  
`void`

**See:** [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).addEventListener`

---

### bringToFront

```typescript
bringToFront(): void
```
Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from `_maxZ` to `ApplicationV2#maxZ`.  
We should also eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).bringToFront`

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
- **options?** (optional)  
  Additional options which affect tab navigation:  
  - **event?**: `Event`  
    An interaction event which caused the tab change, if any  
  - **force?**: `boolean`  
    Force changing the tab even if the new tab is already active  
  - **navElement?**: `HTMLElement`  
    An explicit navigation element being modified  
  - **updatePosition?**: `boolean`  
    Update application position after changing the tab?

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).changeTab`

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<CombatTracker>
```
Close the Application, removing it from the DOM.

**Parameters**

- **options?**: `Partial<ApplicationClosingOptions>` = `{}` (Optional)  
  Options which modify how the application is closed.

**Returns**  
`Promise<CombatTracker>`  
A Promise which resolves to the closed Application instance

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).close`

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

**See:** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).dispatchEvent`

---

### hoverCombatant

```typescript
hoverCombatant(combatant: Combatant, hover: boolean): void
```
Highlight a hovered combatant in the tracker.

**Parameters**

- **combatant**: `Combatant`  
  The Combatant  
- **hover**: `boolean`  
  Whether they are being hovered in or out.

**Returns**  
`void`

---

### maximize

```typescript
maximize(): Promise<void>
```
Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).maximize`

---

### minimize

```typescript
minimize(): Promise<void>
```
Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).minimize`

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

**See:** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).removeEventListener`

---

### render

```typescript
render(options: any, _options: any): Promise<CombatTracker>
```

**Parameters**

- **options**: `any`  
- **_options**: `any`

**Returns**  
`Promise<CombatTracker>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).render`

---

### renderPopout

```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```
Pop-out this sidebar tab as a new application.

**Returns**  
`Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).renderPopout`

---

### scrollToTurn

```typescript
scrollToTurn(): void
```
Scroll to the current combatant in the combat log.

**Returns**  
`void`

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```
Update the Application element position using provided data which is merged with the prior position.

**Parameters**

- **position?**: `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**  
`void | ApplicationPosition`  
The updated application position

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).setPosition`

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```
Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters**

- **submitOptions?**: `object` = `{}` (Optional)  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns**  
`Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).submit`

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

- **expanded?**: `boolean` (Optional)  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value  
- **options?**: `{ animate?: boolean }` = `{}` (Optional)  
  Options to configure the toggling behavior  
  - **animate?**: `boolean` — Animate the controls toggling.

**Returns**  
`Promise<void>`  
A Promise which resolves once the control expansion animation is complete

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab).toggleControls`

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```
Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Provided render options

**Returns**  
`false | void`

Return false to prevent rendering

**Throws**  
An Error to display a warning message

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._canRender`

---

### _createContextMenu

```typescript
_createContextMenu(
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
- **options?** (Optional)  
  Additional options which affect ContextMenu construction  
  - **container?**: `HTMLElement`  
    A parent HTMLElement which contains the selector target  
  - **hookName?**: `string`  
    The hook name  
  - **parentClassHooks?**: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**  
`null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._createContextMenu`

---

### _formatEffectsTooltip

```typescript
_formatEffectsTooltip(effects: { img: string; name: string }[]): string
```
Format a tooltip for displaying overflowing effects.

**Parameters**

- **effects**: `{ img: string; name: string }[]`  
  The effect names and icons.

**Returns**  
`string`

---

### _getCombatantThumbnail

```typescript
_getCombatantThumbnail(combatant: Combatant): Promise<string>
```
Retrieve a source image for a combatant. If it is a video, use the first frame.

**Parameters**

- **combatant**: `Combatant`  
  The Combatant.

**Returns**  
`Promise<string>`  
The image URL.

---

### _getCombatContextOptions

```typescript
_getCombatContextOptions(): ContextMenuEntry[]
```
Get context menu entries for Combat in the tracker.

**Returns**  
`ContextMenuEntry[]`

---

### _getEntryContextOptions

```typescript
_getEntryContextOptions(): ContextMenuEntry[]
```
Get context menu entries for Combatants in the tracker.

**Returns**  
`ContextMenuEntry[]`

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```
Configure the array of header control menu options.

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._getHeaderControls`

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```
Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns**  
`null | ApplicationTabsConfiguration`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._getTabsConfig`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```
Iterate over header control buttons, filtering for controls which are visible for the current client.

**Yields**  
`ApplicationHeaderControlsEntry`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._headerControlButtons`

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```
Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._insertElement`

---

### _isTokenVisible

```typescript
_isTokenVisible(token: Token): boolean
```
Is the token of the combatant visible?

**Parameters**

- **token**: `Token`  
  The token of the combatant

**Returns**  
`boolean`

---

### _onActivate

```typescript
_onActivate(): void
```
Actions performed when this tab is activated in the sidebar.

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._onActivate`

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```
Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound  
- **event**: `Event`  
  An input change event within the form

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._onChangeForm`

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

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._onClickTab`

---

### _onCombatantControl

```typescript
_onCombatantControl(event: PointerEvent, target: HTMLElement): any
```
Handle performing some action for an individual combatant.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.  
- **target**: `HTMLElement`  
  The action target element.

**Returns**  
`any`

---

### _onCombatantHoverIn

```typescript
_onCombatantHoverIn(event: PointerEvent): void
```
Handle hovering over a combatant in the tracker.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.

**Returns**  
`void`

---

### _onCombatantHoverOut

```typescript
_onCombatantHoverOut(event: PointerEvent): void
```
Handle hovering out a combatant in the tracker.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.

**Returns**  
`void`

---

### _onCombatantMouseDown

```typescript
_onCombatantMouseDown(event: PointerEvent, target: HTMLElement): void
```
Handle activating a combatant in the tracker.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.  
- **target**: `HTMLElement`  
  The action target element.

**Returns**  
`void`

---

### _onCombatCreate

```typescript
_onCombatCreate(event: PointerEvent, target: HTMLElement): Promise<void>
```
Create a new combat.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.  
- **target**: `HTMLElement`  
  The action target element.

**Returns**  
`Promise<void>`

---

### _onCombatCycle

```typescript
_onCombatCycle(event: PointerEvent, target: HTMLElement): any
```
Cycle to a different combat encounter in the tracker.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.  
- **target**: `HTMLElement`  
  The action target element.

**Returns**  
`any`

---

### _onDeactivate

```typescript
_onDeactivate(): void
```
Actions performed when this tab is deactivated in the sidebar.

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._onDeactivate`

---

### _onPanToCombatant

```typescript
_onPanToCombatant(combatant: Combatant): undefined | Promise<boolean>
```
Handle panning to a combatant's token.

**Parameters**

- **combatant**: `Combatant`

**Returns**  
`undefined | Promise<boolean>`

---

### _onPingCombatant

```typescript
_onPingCombatant(combatant: Combatant): undefined | Promise<boolean>
```
Handle pinging a combatant's token.

**Parameters**

- **combatant**: `Combatant`

**Returns**  
`undefined | Promise<boolean>`

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```
Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._onPosition`

---

### _onRollInitiative

```typescript
_onRollInitiative(combatant: Combatant): Promise<documents.Combat>
```
Handle rolling initiative for a single combatant.

**Parameters**

- **combatant**: `Combatant`

**Returns**  
`Promise<documents.Combat>`

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

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound  
- **event**: `Event | SubmitEvent`  
  The form submission event

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._onSubmitForm`

---

### _onToggleDefeatedStatus

```typescript
_onToggleDefeatedStatus(combatant: Combatant): Promise<void>
```
Handle toggling the defeated status effect on a combatant token.

**Parameters**

- **combatant**: `Combatant`

**Returns**  
`Promise<void>`

---

### _onToggleHidden

```typescript
_onToggleHidden(combatant: Combatant): any
```
Toggle a combatant's hidden state in the tracker.

**Parameters**

- **combatant**: `Combatant`

**Returns**  
`any`

---

### _onUpdateInitiative

```typescript
_onUpdateInitiative(event: Event): any
```
Handle updating a combatant's initiative in-sheet.

**Parameters**

- **event**: `Event`  
  The triggering change event.

**Returns**  
`any`

---

### _preClose

```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```
Actions performed before closing the Application. Pre-close steps are awaited by the close process.

**Parameters**

- **options**: `ApplicationRenderOptions`

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._preClose`

---

### _preFirstRender

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

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._preFirstRender`

---

### _prepareCombatContext

```typescript
_prepareCombatContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```
Prepare render context for the footer part.

**Parameters**

- **context**: `ApplicationRenderContext`  
- **options**: `HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```
Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**  
`Record<string, ApplicationTab>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._prepareTabs`

---

### _prepareTrackerContext

```typescript
_prepareTrackerContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```
Prepare render context for the tracker part.

**Parameters**

- **context**: `ApplicationRenderContext`  
- **options**: `HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

---

### _prepareTurnContext

```typescript
_prepareTurnContext(
    combat: documents.Combat,
    combatant: Combatant,
    index: number,
): Promise<object>
```
Prepare render context for a single entry in the combat tracker.

**Parameters**

- **combat**: `documents.Combat`  
  The active combat.  
- **combatant**: `Combatant`  
  The Combatant whose turn is being prepared.  
- **index**: `number`  
  The index of this entry in the turn order.

**Returns**  
`Promise<object>`

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```
Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._prePosition`

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```
Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters**

- **context**: `ApplicationRenderContext`  
- **options**: `ApplicationRenderOptions`

**Returns**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._preRender`

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```
Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._removeElement`

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

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._renderHeaderControl`

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

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend  
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted  
- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._replaceHTML`

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```
Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._tearDown`

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```
When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions`  
  Options provided at render-time

**Returns**  
`void`

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._updateFrame`

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```
Translate a requested application position updated into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns**  
`ApplicationPosition`  
Resolved Application positioning data

Inherited from `HandlebarsApplicationMixin(AbstractSidebarTab)._updatePosition`

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```
Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See:** [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

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

---

For the full API documentation, visit the [CombatTracker class documentation on Foundry VTT](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CombatTracker.html).