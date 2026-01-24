# DiceConfig

The application responsible for configuring methods of DiceTerm resolution.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.settings.menus.DiceConfig)

`ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions, this>`

---

## Properties

### options  
*Type:* `Readonly<ApplicationConfiguration>`  
Application instance configuration options.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).options`.

---

### position  
*Type:* `ApplicationPosition = ...`  
The current position of the application with respect to the `window.document.body`.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).position`.

---

### tabGroups  
*Type:* `Record<string, null | string> = ...`  
If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).tabGroups`.

---

### DEFAULT_OPTIONS (static)  
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
    window: {
        contentClasses: string[];
        icon: string;
        title: string;
    };
} = ...
```

---

### PARTS (static)  
```typescript
{
    body: { root: boolean; template: string };
    footer: { template: string };
} = ...
```

---

## Accessors

### classList  
```typescript
get classList(): DOMTokenList
```
The CSS class list of this Application instance.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).classList`.

---

### element  
```typescript
get element(): HTMLElement
```
The HTMLElement which renders this Application into the DOM.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).element`.

---

### form  
```typescript
get form(): null | HTMLFormElement
```
Does this Application have a top-level form element?  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).form`.

---

### hasFrame  
```typescript
get hasFrame(): boolean
```
Does this Application instance render within an outer window frame?  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).hasFrame`.

---

### id  
```typescript
get id(): string
```
The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
`_initializeApplicationOptions`.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).id`.

---

### minimized  
```typescript
get minimized(): boolean
```
Is this Application instance currently minimized?  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).minimized`.

---

### rendered  
```typescript
get rendered(): boolean
```
Is this Application instance currently rendered?  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).rendered`.

---

### state  
```typescript
get state(): number
```
The current render state of the Application.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).state`.

---

### title  
```typescript
get title(): string
```
A convenience reference to the title of the Application window.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).title`.

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
Inherited from `HandlebarsApplicationMixin(ApplicationV2).window`.

---

### SETTING (static)  
```typescript
get SETTING(): "diceConfiguration"
```
Dice Configuration setting name.  
**Deprecated** since v13.

---

## Methods

### _prepareContext
```typescript
_prepareContext(
    _options: any,
): Promise<{
    buttons: { icon: string; label: string; type: string }[];
    dice: { denomination: string; icon: string; label: string; method: any }[];
    methods: Record<string, DiceFulfillmentMethod>;
}>
```
Overrides `HandlebarsApplicationMixin(ApplicationV2)._prepareContext`.

- **Parameters**  
  - **_options**: `any`  
- **Returns**: `Promise` resolving to an object containing:  
  - **buttons**: Array of objects with `icon`, `label`, and `type` as strings  
  - **dice**: Array of objects with `denomination`, `icon`, `label` as strings and `method` of any type  
  - **methods**: Record mapping strings to `DiceFulfillmentMethod`

---

### _renderHTML
```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```
Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._renderHTML`.

- **Parameters**  
  - **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
    Context data for the render operation  
  - **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
    Options which configure application rendering behavior  
- **Returns**: `Promise<any>`  
  The result of HTML rendering may be implementation specific. Whatever value is returned  
  here is passed to `_replaceHTML`.

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
Inherited from `HandlebarsApplicationMixin(ApplicationV2).addEventListener`.

- **Parameters**  
  - **type**: `string`  
    The type of event being registered for  
  - **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
    The listener function called when the event occurs  
  - **options** (optional): `{ once?: boolean } = {}`  
    Options which configure the event listener  
    - **once** (optional): `boolean`  
      Should the event only be responded to once and then removed  
- **Returns**: `void`  
- **See**: [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

---

### bringToFront
```typescript
bringToFront(): void
```
Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from `_maxZ` to `ApplicationV2#maxZ`.  
We should also eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).bringToFront`.

- **Returns**: `void`

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
Inherited from `HandlebarsApplicationMixin(ApplicationV2).changeTab`.

- **Parameters**  
  - **tab**: `string`  
    The name of the tab which should become active  
  - **group**: `string`  
    The name of the tab group which defines the set of tabs  
  - **options** (optional): `{ event?: Event; force?: boolean; navElement?: HTMLElement; updatePosition?: boolean } = {}`  
    Additional options which affect tab navigation  
    - **event** (optional): `Event`  
      An interaction event which caused the tab change, if any  
    - **force** (optional): `boolean`  
      Force changing the tab even if the new tab is already active  
    - **navElement** (optional): `HTMLElement`  
      An explicit navigation element being modified  
    - **updatePosition** (optional): `boolean`  
      Update application position after changing the tab?  
- **Returns**: `void`

---

### close
```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<DiceConfig>
```
Close the Application, removing it from the DOM.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).close`.

- **Parameters**  
  - **options** (optional): `Partial<ApplicationClosingOptions> = {}`  
    Options which modify how the application is closed.  
- **Returns**: `Promise<DiceConfig>`  
  A Promise which resolves to the closed Application instance

---

### dispatchEvent
```typescript
dispatchEvent(event: Event): boolean
```
Dispatch an event on this target.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).dispatchEvent`.

- **Parameters**  
  - **event**: `Event`  
    The Event to dispatch  
- **Returns**: `boolean`  
  Was default behavior for the event prevented?  
- **See**: [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

---

### maximize
```typescript
maximize(): Promise<void>
```
Restore the Application to its original dimensions.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).maximize`.

- **Returns**: `Promise<void>`

---

### minimize
```typescript
minimize(): Promise<void>
```
Minimize the Application, collapsing it to a minimal header.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).minimize`.

- **Returns**: `Promise<void>`

---

### removeEventListener
```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```
Remove an event listener for a certain type of event.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).removeEventListener`.

- **Parameters**  
  - **type**: `string`  
    The type of event being removed  
  - **listener**: `EmittedEventListener`  
    The listener function being removed  
- **Returns**: `void`  
- **See**: [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

---

### render
```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<DiceConfig>
```
Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).render`.

- **Parameters**  
  - **options** (optional): `boolean | ApplicationRenderOptions = {}`  
    Options which configure application rendering behavior. A boolean is interpreted as the  
    "force" option.  
  - **_options** (optional): `ApplicationRenderOptions = {}`  
    Legacy options for backwards-compatibility with the original ApplicationV1#render  
    signature.  
- **Returns**: `Promise<DiceConfig>`  
  A Promise which resolves to the rendered Application instance.

---

### setPosition
```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```
Update the Application element position using provided data which is merged with the prior  
position.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).setPosition`.

- **Parameters**  
  - **position** (optional): `Partial<ApplicationPosition>`  
    New Application positioning data  
- **Returns**: `void | ApplicationPosition`  
  The updated application position

---

### submit
```typescript
submit(submitOptions?: object): Promise<any>
```
Programmatically submit an ApplicationV2 instance which implements a single top-level form.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2).submit`.

- **Parameters**  
  - **submitOptions** (optional): `object = {}`  
    Arbitrary options which are supported by and provided to the configured form submission  
    handler.  
- **Returns**: `Promise<any>`  
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
Inherited from `HandlebarsApplicationMixin(ApplicationV2).toggleControls`.

- **Parameters**  
  - **expanded** (optional): `boolean`  
    Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
    current value  
  - **options** (optional): `{ animate?: boolean } = {}`  
    Options to configure the toggling behavior.  
    - **animate** (optional): `boolean`  
      Animate the controls toggling.  
- **Returns**: `Promise<void>`  
  A Promise which resolves once the control expansion animation is complete.

---

### _attachFrameListeners (protected)
```typescript
_attachFrameListeners(): void
```
Attach event listeners to the Application frame.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners`.

- **Returns**: `void`

---

### _canRender (protected)
```typescript
_canRender(options: ApplicationRenderOptions): false | void
```
Test whether this Application is allowed to be rendered.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._canRender`.

- **Parameters**  
  - **options**: `ApplicationRenderOptions`  
    Provided render options  
- **Returns**: `false | void`  
  Return false to prevent rendering  
- **Throws**:  
  An Error to display a warning message

---

### _configureRenderOptions (protected)
```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```
Modify the provided options passed to a render request.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions`.

- **Parameters**  
  - **options**: `ApplicationRenderOptions`  
    Options which configure application rendering behavior  
- **Returns**: `void`

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
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._createContextMenu`.

- **Parameters**  
  - **handler**: `() => ContextMenuEntry[]`  
    A handler function that provides initial context options  
  - **selector**: `string`  
    A CSS selector to which the ContextMenu will be bound  
  - **options** (optional): `{ container?: HTMLElement; hookName?: string; parentClassHooks?: boolean } = {}`  
    Additional options which affect ContextMenu construction  
    - **container** (optional): `HTMLElement`  
      A parent HTMLElement which contains the selector target  
    - **hookName** (optional): `string`  
      The hook name  
    - **parentClassHooks** (optional): `boolean`  
      Whether to call hooks for the parent classes in the inheritance chain.  
- **Returns**: `null | ContextMenu`  
  A created ContextMenu or null if no menu items were defined

---

### _getHeaderControls (protected)
```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```
Configure the array of header control menu options.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls`.

- **Returns**: `ApplicationHeaderControlsEntry[]`

---

### _getTabsConfig (protected)
```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```
Get the configuration for a tabs group.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig`.

- **Parameters**  
  - **group**: `string`  
    The ID of a tabs group  
- **Returns**: `null | ApplicationTabsConfiguration`

---

### _headerControlButtons (protected)
```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```
Iterate over header control buttons, filtering for controls which are visible for the current  
client.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons`.

- **Yields**: `ApplicationHeaderControlsEntry`

---

### _initializeApplicationOptions (protected)
```typescript
_initializeApplicationOptions(
    options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```
Initialize configuration options for the Application instance. The default behavior of this  
method is to intelligently merge options for each class with those of their parents.  
Array-based options are concatenated  
Inner objects are merged  
Otherwise, properties in the subclass replace those defined by a parent  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions`.

- **Parameters**  
  - **options**: `Partial<ApplicationConfiguration>`  
    Options provided directly to the constructor  
- **Returns**: `ApplicationConfiguration`  
  Configured options for the application instance

---

### _insertElement (protected)
```typescript
_insertElement(element: HTMLElement): void
```
Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._insertElement`.

- **Parameters**  
  - **element**: `HTMLElement`  
    The element to insert  
- **Returns**: `void`

---

### _onChangeForm (protected)
```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```
Handle changes to an input element within the form.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onChangeForm`.

- **Parameters**  
  - **formConfig**: `ApplicationFormConfiguration`  
    The form configuration for which this handler is bound  
  - **event**: `Event`  
    An input change event within the form  
- **Returns**: `void`

---

### _onClickAction (protected)
```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```
A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onClickAction`.

- **Parameters**  
  - **event**: `PointerEvent`  
    The originating click event  
  - **target**: `HTMLElement`  
    The capturing HTML element which defined a `[data-action]`  
- **Returns**: `void`

---

### _onClickTab (protected)
```typescript
_onClickTab(event: PointerEvent): void
```
Handle click events on a tab within the Application.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onClickTab`.

- **Parameters**  
  - **event**: `PointerEvent`  
- **Returns**: `void`

---

### _onClose (protected)
```typescript
_onClose(options: ApplicationRenderOptions): void
```
Actions performed after closing the Application. Post-close steps are not awaited by the  
close process.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onClose`.

- **Parameters**  
  - **options**: `ApplicationRenderOptions`  
    Provided render options  
- **Returns**: `void`

---

### _onFirstRender (protected)
```typescript
_onFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```
Actions performed after a first render of the Application.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onFirstRender`.

- **Parameters**  
  - **context**: `ApplicationRenderContext`  
    Prepared context data  
  - **options**: `ApplicationRenderOptions`  
    Provided render options  
- **Returns**: `Promise<void>`

---

### _onPosition (protected)
```typescript
_onPosition(position: ApplicationPosition): void
```
Actions performed after the Application is re-positioned.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onPosition`.

- **Parameters**  
  - **position**: `ApplicationPosition`  
    The requested application position  
- **Returns**: `void`

---

### _onRender (protected)
```typescript
_onRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```
Actions performed after any render of the Application.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onRender`.

- **Parameters**  
  - **context**: `ApplicationRenderContext`  
    Prepared context data  
  - **options**: `ApplicationRenderOptions`  
    Provided render options  
- **Returns**: `Promise<void>`

---

### _onSubmitForm (protected)
```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```
Handle submission for an Application which uses the form element.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm`.

- **Parameters**  
  - **formConfig**: `ApplicationFormConfiguration`  
    The form configuration for which this handler is bound  
  - **event**: `Event | SubmitEvent`  
    The form submission event  
- **Returns**: `Promise<void>`

---

### _preClose (protected)
```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```
Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._preClose`.

- **Parameters**  
  - **options**: `ApplicationRenderOptions`  
    Provided render options  
- **Returns**: `Promise<void>`

---

### _preFirstRender (protected)
```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```
Actions performed before a first render of the Application.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._preFirstRender`.

- **Parameters**  
  - **context**: `ApplicationRenderContext`  
    Prepared context data  
  - **options**: `ApplicationRenderOptions`  
    Provided render options  
- **Returns**: `Promise<void>`

---

### _prepareTabs (protected)
```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```
Prepare application tab data for a single tab group.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._prepareTabs`.

- **Parameters**  
  - **group**: `string`  
    The ID of the tab group to prepare  
- **Returns**: `Record<string, ApplicationTab>`

---

### _prePosition (protected)
```typescript
_prePosition(position: ApplicationPosition): void
```
Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because `setPosition` is synchronous.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._prePosition`.

- **Parameters**  
  - **position**: `ApplicationPosition`  
    The requested application position  
- **Returns**: `void`

---

### _preRender (protected)
```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```
Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._preRender`.

- **Parameters**  
  - **context**: `ApplicationRenderContext`  
    Prepared context data  
  - **options**: `ApplicationRenderOptions`  
    Provided render options  
- **Returns**: `Promise<void>`

---

### _removeElement (protected)
```typescript
_removeElement(element: HTMLElement): void
```
Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._removeElement`.

- **Parameters**  
  - **element**: `HTMLElement`  
    The element to be removed  
- **Returns**: `void`

---

### _renderFrame (protected)
```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```
Render the outer framing HTMLElement which wraps the inner HTML of the Application.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._renderFrame`.

- **Parameters**  
  - **options**: `ApplicationRenderOptions`  
    Options which configure application rendering behavior  
- **Returns**: `Promise<HTMLElement>`

---

### _renderHeaderControl (protected)
```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```
Render a header control button.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl`.

- **Parameters**  
  - **control**: `ApplicationHeaderControlsEntry`  
- **Returns**: `HTMLLIElement`

---

### _replaceHTML (protected)
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
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._replaceHTML`.

- **Parameters**  
  - **result**: `any`  
    The result returned by the application rendering backend  
  - **content**: `HTMLElement`  
    The content element into which the rendered result must be inserted  
  - **options**: `ApplicationRenderOptions`  
    Options which configure application rendering behavior  
- **Returns**: `void`

---

### _tearDown (protected)
```typescript
_tearDown(options: ApplicationClosingOptions): void
```
Remove elements from the DOM and trigger garbage collection as part of application  
closure.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._tearDown`.

- **Parameters**  
  - **options**: `ApplicationClosingOptions`  
- **Returns**: `void`

---

### _updateFrame (protected)
```typescript
_updateFrame(options: ApplicationRenderOptions): void
```
When the Application is rendered, optionally update aspects of the window frame.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._updateFrame`.

- **Parameters**  
  - **options**: `ApplicationRenderOptions`  
    Options provided at render-time  
- **Returns**: `void`

---

### _updatePosition (protected)
```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```
Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.  
Inherited from `HandlebarsApplicationMixin(ApplicationV2)._updatePosition`.

- **Parameters**  
  - **position**: `ApplicationPosition`  
    Requested Application positioning data  
- **Returns**: `ApplicationPosition`  
  Resolved Application positioning data

---

### registerSetting (static)
```typescript
registerSetting(): void
```
Register setting and menu.

- **Returns**: `void`

---

For more details, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.applications.settings.menus.DiceConfig.html).