# GameTime

A singleton class that keeps the official Server and World time stamps. Uses a basic implementation of [Cristian's Algorithm](https://www.geeksforgeeks.org/cristians-algorithm/) for synchronization.

**See:** [foundry.Game#time](https://foundryvtt.com/api/classes/foundry.Game.html#time)

---

## Static Properties

### SYNC_INTERVAL_MS

```typescript
SYNC_INTERVAL_MS: number = ...
```

The amount of time to delay before re-syncing the official server time.

---

## Accessors

### averageLatency

```typescript
get averageLatency(): number
```

The average one-way latency between client and server in milliseconds.

**Returns**: `number`

---

### calendar

```typescript
get calendar(): CalendarData
```

The calendar instance for in-world timekeeping.

**Returns**: `CalendarData`

---

### components

```typescript
get components(): TimeComponents
```

The current World time expressed as components.

**Returns**: [`TimeComponents`](https://foundryvtt.com/api/interfaces/foundry.data.types.TimeComponents.html)

---

### earthCalendar

```typescript
get earthCalendar(): CalendarData
```

The "Earth" calendar instance for IRL timekeeping.

**Returns**: `CalendarData`

---

### serverTime

```typescript
get serverTime(): number
```

The current server time based on the last synchronization point and the approximated one-way latency.

**Returns**: `number`

---

### worldTime

```typescript
get worldTime(): number
```

The current World time expressed in seconds.

**Returns**: `number`

---

## Methods

### advance

```typescript
advance(delta: number | TimeComponents, options?: object): Promise<number>
```

Advance or rewind the world time according to a delta amount expressed either in seconds or as components.

**Parameters:**

- **delta**: `number` | [`TimeComponents`](https://foundryvtt.com/api/interfaces/foundry.data.types.TimeComponents.html)  
  The number of seconds to advance (or rewind if negative) by.
- **options** (optional): `object`  
  Additional options passed to `game.settings.set`.

**Returns**: `Promise<number>`  
The new game time.

---

### initializeCalendar

```typescript
initializeCalendar(): void
```

Initialize a calendar configuration. This is called once automatically upon construction, but can be called manually if `CONFIG.time` changes.

**Returns**: `void`

---

### onUpdateWorldTime

```typescript
onUpdateWorldTime(worldTime: number, options: object, userId: string): void
```

Handle follow-up actions when the official World time is changed.

**Parameters:**

- **worldTime**: `number`  
  The new canonical World time.
- **options**: `object`  
  Options passed from the requesting client where the change was made.
- **userId**: `string`  
  The ID of the User who advanced the time.

**Returns**: `void`

---

### set

```typescript
set(time: number | TimeComponents, options?: object): Promise<number>
```

Directly set the world time to a certain value expressed either in seconds or as components.

**Parameters:**

- **time**: `number` | [`TimeComponents`](https://foundryvtt.com/api/interfaces/foundry.data.types.TimeComponents.html)  
  The desired world time.
- **options** (optional): `object`  
  Additional options passed to `game.settings.set`.

**Returns**: `Promise<number>`  
The new game time.

---

### sync

```typescript
sync(): Promise<GameTime>
```

Synchronize the local client game time with the official time kept by the server.

**Returns**: `Promise<GameTime>`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)