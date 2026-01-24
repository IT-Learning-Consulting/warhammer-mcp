# PerceptionManager | Foundry Virtual Tabletop - API Documentation - Version 13

A helper class which manages the refresh workflow for perception layers on the canvas. This controls the logic which batches multiple requested updates to minimize the amount of work required. A singleton instance is available as [foundry.canvas.Canvas#perception](https://foundryvtt.com/api/classes/foundry.canvas.Canvas.html#perception).

## Hierarchy

_RenderFlagObject<this>_

**PerceptionManager**

---

## Properties

### renderFlags

**Type:** [RenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.interaction.RenderFlags.html)

Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for "redraw" and "refresh".

Inherited from `RenderFlagsMixin().renderFlags`


### Static Properties

#### RENDER_FLAG_PRIORITY

```typescript
RENDER_FLAG_PRIORITY: string = "PERCEPTION"
```

Overrides `RenderFlagsMixin().RENDER_FLAG_PRIORITY`.

#### RENDER_FLAGS

```typescript
RENDER_FLAGS: {
    identifyInteriorWalls: {
        alias: boolean;
        deprecated: { message: string; since: number; until: number };
        propagate: string[];
    };
    initializeDarknessSources: {
        deprecated: { message: string; since: number; until: number };
        propagate: string[];
    };
    initializeLighting: { propagate: string[] };
    initializeLightSources: { propagate: string[] };
    initializeSounds: { propagate: string[] };
    initializeVision: { propagate: string[] };
    initializeVisionModes: { propagate: string[] };
    refreshEdges: {};
    refreshLighting: { propagate: string[] };
    refreshLightSources: {};
    refreshOcclusion: { propagate: string[] };
    refreshOcclusionMask: {};
    refreshOcclusionStates: {};
    refreshPrimary: {};
    refreshSounds: {};
    refreshTiles: {
        alias: boolean;
        deprecated: { message: string; since: number; until: number };
        propagate: string[];
    };
    refreshVision: { propagate: string[] };
    refreshVisionSources: {};
    soundFadeDuration: {};
} = ...
```

##### Type declaration for `identifyInteriorWalls`

```typescript
{
    alias: boolean;
    deprecated: {
        message: string;
        since: number;
        until: number;
    };
    propagate: string[];
}
```

###### Deprecated since v12

##### Type declaration for `initializeDarknessSources`

```typescript
{
    deprecated: {
        message: string;
        since: number;
        until: number;
    };
    propagate: string[];
}
```

###### Deprecated since v13

```typescript
initializeLighting: { propagate: string[] }
initializeLightSources: { propagate: string[] }
initializeSounds: { propagate: string[] }
initializeVision: { propagate: string[] }
initializeVisionModes: { propagate: string[] }
refreshEdges: {}
refreshLighting: { propagate: string[] }
refreshLightSources: {}
refreshOcclusion: { propagate: string[] }
refreshOcclusionMask: {}
refreshOcclusionStates: {}
refreshPrimary: {}
refreshSounds: {}
refreshTiles: {
    alias: boolean;
    deprecated: { message: string; since: number; until: number };
    propagate: string[];
}
```

###### Deprecated since v12

```typescript
refreshVision: { propagate: string[] }
refreshVisionSources: {}
soundFadeDuration: {}
```

Overrides `RenderFlagsMixin().RENDER_FLAGS`.

---

## Methods

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

Overrides `RenderFlagsMixin().applyRenderFlags`.

### initialize

```typescript
initialize(): void
```

A helper function to perform an immediate initialization plus incremental refresh.

### update

```typescript
update(flags: object): void
```

Update perception manager flags which configure which behaviors occur on the next frame render.

**Parameters:**

- **flags**: `object`  
  Flag values (`true`) to assign where the keys belong to `PerceptionManager.FLAGS`.

**Returns:** `void`