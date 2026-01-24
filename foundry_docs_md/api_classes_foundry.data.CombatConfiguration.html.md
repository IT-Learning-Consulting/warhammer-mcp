# CombatConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

A configuration class managing the Combat Turn Markers.

## Properties

### Static

#### CONFIG_SETTING

```typescript
CONFIG_SETTING: string = "combatTrackerConfig"
```

The configuration setting used to record Combat preferences.

## Accessors

### currentTurnMarkerAnimation

```typescript
get currentTurnMarkerAnimation(): TurnMarkerAnimationData
```

Get current turn marker animation.

**Returns:** `TurnMarkerAnimationData`

### resource

```typescript
get resource(): string
```

Get tracked resource setting.

**Returns:** `string`

### skipDefeated

```typescript
get skipDefeated(): boolean
```

Get skip defeated setting.

**Returns:** `boolean`

### turnMarker

```typescript
get turnMarker(): Object
```

Get turn marker settings.

**Returns:** `Object`

### turnMarkerAnimations

```typescript
get turnMarkerAnimations(): { label: string; value: string }[]
```

Get all animations and labels as an array of choices suitable for a select element.

**Returns:**  
Array of objects with properties:
- **label**: `string`
- **value**: `string`

## Methods

### Static

#### schema

```typescript
get schema(): SchemaField
```

The data model schema used to structure and validate the stored setting.

**Returns:** `SchemaField`

#### addTurnMarkerAnimation

```typescript
addTurnMarkerAnimation(id: string, config: TurnMarkerAnimationData): void
```

Add a new turn marker animation.

**Parameters:**

- **id**: `string`  
  The id of the turn marker animation.
- **config**: [TurnMarkerAnimationData](https://foundryvtt.com/api/interfaces/foundry.TurnMarkerAnimationData.html)  
  The configuration object for the turn marker animation.

**Returns:** `void`

#### getTurnMarkerAnimation

```typescript
getTurnMarkerAnimation(id: string): TurnMarkerAnimationData
```

Get a turn marker animation by id.

**Parameters:**

- **id**: `string`  
  The id of the turn marker configuration.

**Returns:**  
The turn marker configuration object.

#### useTurnMarkerAnimation

```typescript
useTurnMarkerAnimation(animationId: string): boolean
```

Use a turn marker animation.

**Parameters:**

- **animationId**: `string`  
  The id of the turn marker animation to use.

**Returns:** `boolean`  
True if the animation was successfully set, false otherwise.

#### initialize

```typescript
initialize(): void
```

Register the token ring config and initialize it.

**Returns:** `void`

#### registerSettings

```typescript
registerSettings(): void
```

Register game settings used by the Combat Tracker.

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)