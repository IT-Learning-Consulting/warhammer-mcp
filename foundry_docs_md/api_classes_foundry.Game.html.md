# Class Game

The core **Game** instance which encapsulates the data, settings, and states relevant for managing the game experience. The singleton instance of the Game class is available as the global variable `game`.

For more details, visit the [Foundry Virtual Tabletop - API Documentation](https://foundryvtt.com/api/classes/foundry.Game.html).

---

## Constructors

### constructor

```typescript
new Game(
    view: string,
    data: object,
    sessionId: string,
    socket: Socket<DefaultEventsMap, DefaultEventsMap>,
): Game
```

Initialize a singleton Game instance for a specific view using socket data retrieved from the server.

**Parameters**

- **view**: `string`  
  The named view which is active for this game instance.
- **data**: `object`  
  An object of all the World data vended by the server when the client first connects.
- **sessionId**: `string`  
  The ID of the currently active client session retrieved from the browser cookie.
- **socket**: `Socket<DefaultEventsMap, DefaultEventsMap>`  
  The open web-socket which should be used to transact game-state data.

**Returns**  
`Game`

---

## Properties

- **actors**: [Actors](https://foundryvtt.com/api/classes/foundry.documents.collections.Actors.html)  
  The collection of Actor documents which exists in the World.

- **audio**: [AudioHelper](https://foundryvtt.com/api/classes/foundry.audio.AudioHelper.html)  
  The singleton Audio Helper.  
  *Readonly*

- **canvas**: [canvas.Canvas](https://foundryvtt.com/api/modules/foundry.canvas.html)  
  The singleton game Canvas.

- **cards**: [CardStacks](https://foundryvtt.com/api/classes/foundry.documents.collections.CardStacks.html)  
  The collection of Cards documents which exists in the World.  
  *Readonly*

- **clipboard**: [ClipboardHelper](https://foundryvtt.com/api/classes/foundry.helpers.interaction.ClipboardHelper.html)  
  The singleton Clipboard Helper.  
  *Readonly*

- **collections**: [Collection<string, WorldCollection>](https://foundryvtt.com/api/classes/foundry.utils.Collection.html)  
  A mapping of WorldCollection instances, one per primary Document type.

- **combats**: [CombatEncounters](https://foundryvtt.com/api/classes/foundry.documents.collections.CombatEncounters.html)  
  The collection of Combat documents which exists in the World.  
  *Readonly*

- **compendiumArt**: [CompendiumArt](https://foundryvtt.com/api/classes/foundry.helpers.media.CompendiumArt.html)  
  The singleton compendium art manager.

- **compendiumUUIDRedirects**: [StringTree](https://foundryvtt.com/api/classes/foundry.utils.StringTree.html)  
  The UUID redirects tree.  
  *Readonly*

- **data**: `object`  
  The object of world data passed from the server.

- **debug**: `boolean = false`  
  Whether the Game is running in debug mode.

- **documentIndex**: [DocumentIndex](https://foundryvtt.com/api/classes/foundry.helpers.DocumentIndex.html)  
  The singleton DocumentIndex instance.  
  *Readonly*

- **folders**: [Folders](https://foundryvtt.com/api/classes/foundry.documents.collections.Folders.html)  
  The collection of Folder documents which exists in the World.  
  *Readonly*

- **gamepad**: [GamepadManager](https://foundryvtt.com/api/classes/foundry.helpers.interaction.GamepadManager.html)  
  The singleton Gamepad Manager.  
  *Readonly*

- **i18n**: [Localization](https://foundryvtt.com/api/classes/foundry.helpers.Localization.html)  
  Localization support.  
  *Readonly*

- **issues**: [ClientIssues](https://foundryvtt.com/api/classes/foundry.helpers.ClientIssues.html)  
  The singleton ClientIssues manager.

- **items**: [Items](https://foundryvtt.com/api/classes/foundry.documents.collections.Items.html)  
  The collection of Item documents which exists in the World.

- **journal**: [Journal](https://foundryvtt.com/api/classes/foundry.documents.collections.Journal.html)  
  The collection of JournalEntry documents which exists in the World.

- **keybindings**: [ClientKeybindings](https://foundryvtt.com/api/classes/foundry.helpers.interaction.ClientKeybindings.html)  
  Client keybindings which are used to configure application behavior.  
  *Readonly*

- **keyboard**: [KeyboardManager](https://foundryvtt.com/api/classes/foundry.helpers.interaction.KeyboardManager.html)  
  The singleton Keyboard Manager.  
  *Readonly*

- **loading**: `boolean = false`  
  A flag for whether texture assets for the game canvas are currently loading.

- **macros**: [Macros](https://foundryvtt.com/api/classes/foundry.documents.collections.Macros.html)  
  The collection of Macro documents which exists in the World.

- **messages**: [ChatMessages](https://foundryvtt.com/api/classes/foundry.documents.collections.ChatMessages.html)  
  The collection of ChatMessage documents which exists in the World.

- **modules**: [Collection<string, Module>](https://foundryvtt.com/api/classes/foundry.utils.Collection.html)  
  A Map of active Modules which are currently eligible to be enabled in this World. The subset of Modules which are designated as active are currently enabled.  
  *Readonly*

- **mouse**: [MouseManager](https://foundryvtt.com/api/classes/foundry.helpers.interaction.MouseManager.html)  
  The singleton Mouse Manager.  
  *Readonly*

- **nue**: [NewUserExperienceManager](https://foundryvtt.com/api/classes/foundry.nue.NewUserExperienceManager.html)  
  The singleton New User Experience manager.  
  *Readonly*

- **packs**: [CompendiumPacks](https://foundryvtt.com/api/classes/foundry.documents.collections.CompendiumPacks.html)  
  A mapping of CompendiumCollection instances, one per Compendium pack.  
  *Readonly*

- **permissions**: `Record<string, number[]>`  
  The user role permissions setting.

- **playlists**: [Playlists](https://foundryvtt.com/api/classes/foundry.documents.collections.Playlists.html)  
  The collection of Playlist documents which exists in the World.

- **ready**: `boolean = false`  
  A flag for whether the Game has successfully reached the [hookEvents.ready](https://foundryvtt.com/api/functions/hookEvents.ready.html) hook.

- **release**: [ReleaseData](https://foundryvtt.com/api/classes/foundry.config.ReleaseData.html)  
  The Release data for this version of Foundry.  
  *Readonly*

- **scenes**: [Scenes](https://foundryvtt.com/api/classes/foundry.documents.collections.Scenes.html)  
  The collection of Scene documents which exists in the World.

- **sessionId**: `string`  
  The client session id which is currently active.  
  *Readonly*

- **settings**: [ClientSettings](https://foundryvtt.com/api/classes/foundry.helpers.ClientSettings.html)  
  Client settings which are used to configure application behavior.  
  *Readonly*

- **socket**: `null | Socket<DefaultEventsMap, DefaultEventsMap>`  
  A reference to the open [Socket.io](http://socket.io/) connection.  
  *Readonly*

- **system**: [System](https://foundryvtt.com/api/classes/foundry.packages.System.html)  
  The System which is used to power this game World.

- **tables**: [RollTables](https://foundryvtt.com/api/classes/foundry.documents.collections.RollTables.html)  
  The collection of RollTable documents which exists in the World.

- **time**: [GameTime](https://foundryvtt.com/api/classes/foundry.helpers.GameTime.html)  
  A singleton GameTime instance which manages the progression of time within the game world.  
  *Readonly*

- **tooltip**: [TooltipManager](https://foundryvtt.com/api/classes/foundry.helpers.interaction.TooltipManager.html)  
  The singleton TooltipManager.  
  *Readonly*

- **tours**: [ToursCollection](https://foundryvtt.com/api/classes/foundry.nue.ToursCollection.html)  
  The singleton Tours collection.  
  *Readonly*

- **userId**: `null | string`  
  The id of the active World user, if any.  
  *Readonly*

- **users**: [Users](https://foundryvtt.com/api/classes/foundry.documents.collections.Users.html)  
  The collection of User documents which exists in the World.

- **video**: [VideoHelper](https://foundryvtt.com/api/classes/foundry.helpers.media.VideoHelper.html)  
  The singleton Video Helper.  
  *Readonly*

- **view**:  
  ```ts
  | "game"
  | "stream"
  | "auth"
  | "license"
  | "setup"
  | "players"
  | "join"
  | "update"
  ```
  The named view which is currently active.  
  *Readonly*

- **workers**: [WorkerManager](https://foundryvtt.com/api/classes/foundry.helpers.WorkerManager.html)  
  A singleton web Worker manager.

- **world**: [World](https://foundryvtt.com/api/classes/foundry.packages.World.html)  
  The game World which is currently active.

---

## Accessors

### activeTool

```typescript
get activeTool(): string
```

A convenient reference to the currently active canvas tool.

**Returns**  
`string`

### combat

```typescript
get combat(): null | documents.Combat
```

A convenience accessor for the currently viewed Combat encounter.

**Returns**  
`null | documents.Combat`

### compendiumConfiguration

```typescript
get compendiumConfiguration(): WorldCompendiumConfiguration
```

A shortcut to compendiumConfiguration data settings.

**Returns**  
`WorldCompendiumConfiguration`

### documentTypes

```typescript
get documentTypes(): Record<string, string[]>
```

A registry of document types supported by the active world.

**Returns**  
`Record<string, string[]>`

### isAdmin

```typescript
get isAdmin(): boolean
```

Is the current session user authenticated as an application administrator?

**Returns**  
`boolean`

### model

```typescript
get model(): Record<string, Record<string, object>>
```

A registry of document sub-types and their respective template.json defaults.

**Returns**  
`Record<string, Record<string, object>>`

### paused

```typescript
get paused(): boolean
```

A state variable which tracks whether the game session is currently paused.

**Returns**  
`boolean`

### user

```typescript
get user(): null | documents.User
```

The currently connected User document, or null if Users is not yet initialized.

**Returns**  
`null | documents.User`

### version

```typescript
get version(): string
```

Returns the current version of the Release, usable for comparisons using isNewerVersion.

**Returns**  
`string`

---

## Methods

### activateListeners

```typescript
activateListeners(): void
```

Activate Event Listeners which apply to every Game View.

**Returns**  
`void`

### activateSocketListeners

```typescript
activateSocketListeners(): void
```

Activate Socket event listeners which are used to transact game state data with the server.

**Returns**  
`void`

### configureCursors

```typescript
configureCursors(): void
```

Configure custom cursors.

**Returns**  
`void`

### configureUI

```typescript
configureUI(config?: GameUIConfiguration): void
```

Configure the user interface.

**Parameters**

- **config**: `GameUIConfiguration = {}`  
  Configuration options for UI.

**Returns**  
`void`

### getPackageScopes

```typescript
getPackageScopes(): string[]
```

Return the named scopes which can exist for packages. Scopes are returned in the prioritization order that their content is loaded.

**Returns**  
`string[]`  
An array of string package scopes

### initialize

```typescript
initialize(): Promise<void>
```

Initialize the Game for the current window location, triggering the [hookEvents.init event](https://foundryvtt.com/api/functions/hookEvents.init.html).

**Returns**  
`Promise<void>`

### initializeCanvas

```typescript
initializeCanvas(): Promise<void>
```

Initialize the game Canvas.

**Returns**  
`Promise<void>`

### initializeConfig

```typescript
initializeConfig(): void
```

Initialize configuration state.

**Returns**  
`void`

### initializeDocuments

```typescript
initializeDocuments(): void
```

Initialize game state data by creating [WorldCollection instances for every primary Document type](https://foundryvtt.com/api/classes/foundry.documents.abstract.WorldCollection.html).

**Returns**  
`void`

### initializeGamepads

```typescript
initializeGamepads(): void
```

Initialize Gamepad controls.

**Returns**  
`void`

### initializeKeyboard

```typescript
initializeKeyboard(): void
```

Initialize Keyboard controls.

**Returns**  
`void`

### initializeMouse

```typescript
initializeMouse(): void
```

Initialize Mouse controls.

**Returns**  
`void`

### initializePacks

```typescript
initializePacks(): CompendiumPacks
```

Initialize the Compendium packs which are present within this Game. Create a Collection which maps each Compendium pack using its collection ID.

**Returns**  
`CompendiumPacks`

### initializeRTC

```typescript
initializeRTC(): Promise<boolean>
```

Initialize the WebRTC implementation.

**Returns**  
`Promise<boolean>`

### initializeTrees

```typescript
initializeTrees(): void
```

Initialize collection trees.

**Returns**  
`void`

### initializeUI

```typescript
initializeUI(): void
```

Initialize core UI elements.

**Returns**  
`void`

### logOut

```typescript
logOut(): void
```

Log out of the game session by returning to the Join screen.

**Returns**  
`void`

### registerSettings

```typescript
registerSettings(): void
```

Register core game settings.

**Returns**  
`void`

### setupGame

```typescript
setupGame(): Promise<void>
```

Fully set up the game state, initializing Documents, UI applications, and the Canvas. Triggers the [hookEvents.setup](https://foundryvtt.com/api/functions/hookEvents.setup.html) and [hookEvents.ready](https://foundryvtt.com/api/functions/hookEvents.ready.html) events.

**Returns**  
`Promise<void>`

### setupPackages

```typescript
setupPackages(data: object): void
```

Configure package data that is currently enabled for this world.

**Parameters**

- **data**: `object`  
  Game data provided by the server socket.

**Returns**  
`void`

### shutDown

```typescript
shutDown(): Promise<void>
```

Shut down the currently active Game. Requires GameMaster user permission.

**Returns**  
`Promise<void>`

### toggleCharacterSheet

```typescript
toggleCharacterSheet(): null | ActorSheetV2 | ActorSheet
```

Open Character sheet for current token or controlled actor.

**Returns**  
`null | ActorSheetV2 | ActorSheet`  
The toggled [Actor sheet](https://foundryvtt.com/api/classes/foundry.documents.Actor.html), or null if the [User](https://foundryvtt.com/api/classes/foundry.documents.User.html) has no assigned character.

### togglePause

```typescript
togglePause(
    pause: boolean,
    options?: { broadcast?: boolean; userId?: string },
): boolean
```

Toggle the pause state of the game, triggering the [hookEvents.pauseGame](https://foundryvtt.com/api/functions/hookEvents.pauseGame.html) hook when the paused state changes.

**Parameters**

- **pause**: `boolean`  
  The desired pause state; true for paused, false for un-paused.

- **options?**:  
  - **broadcast?**: `boolean`  
    Broadcast the pause state change to other connected clients? Broadcasting to other clients can only be done by a GM user.
  - **userId?**: `string`  
    The ID of the user who triggered the pause operation. This is populated automatically by the game server.

**Returns**  
`boolean`  
The new paused state.

### _onClickHyperlink

```typescript
protected _onClickHyperlink(event: PointerEvent): void
```

On left mouse clicks, check if the element is contained in a valid hyperlink and open it in a new tab.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

---

## Static Methods

### connect

```typescript
static connect(sessionId: string): Promise<object>
```

Establish a live connection to the game server through the [socket.io](http://socket.io/) URL.

**Parameters**

- **sessionId**: `string`  
  The client session ID with which to establish the connection.

**Returns**  
`Promise<object>`  
A promise which resolves to the connected socket, if successful.

### create

```typescript
static create(view: string, sessionId: null | string): Promise<Game>
```

Fetch World data and return a Game instance.

**Parameters**

- **view**: `string`  
  The named view being created.

- **sessionId**: `null | string`  
  The current sessionId of the connecting client.

**Returns**  
`Promise<Game>`  
A Promise which resolves to the created Game instance.

### getCookies

```typescript
static getCookies(): object
```

Retrieve the cookies which are attached to the client session.

**Returns**  
`object`  
The session cookies.

### getData

```typescript
static getData(
    socket: Socket<DefaultEventsMap, DefaultEventsMap>,
    view: string,
): Promise<object>
```

Request World data from server and return it.

**Parameters**

- **socket**: `Socket<DefaultEventsMap, DefaultEventsMap>`  
  The active socket connection.

- **view**: `string`  
  The view for which data is being requested.

**Returns**  
`Promise<object>`

### getWorldStatus

```typescript
static getWorldStatus(
    socket: Socket<DefaultEventsMap, DefaultEventsMap>,
): Promise<boolean>
```

Get the current World status upon initial connection.

**Parameters**

- **socket**: `Socket<DefaultEventsMap, DefaultEventsMap>`  
  The active client socket connection.

**Returns**  
`Promise<boolean>`