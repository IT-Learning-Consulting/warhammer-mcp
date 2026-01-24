# PrimaryParticleEffect

A configurable particle effect meant to be used in the PrimaryCanvasGroup. You must provide a full configuration object.

## Hierarchy

*any*  
**PrimaryParticleEffect**

## Accessors

### elevation

```typescript
get elevation(): number
```

The elevation of this container.

**Returns:** `number`

### shouldRenderDepth

```typescript
get shouldRenderDepth(): boolean
```

Always false for a Primary Particle Effect.

**Returns:** `boolean`

### sort

```typescript
get sort(): number
```

A key which resolves ties amongst objects at the same elevation within the same layer.

**Returns:** `number`

## Methods

### destroy

```typescript
destroy(...args: any[]): void
```

**Parameters:**

- `...args: any[]`

**Returns:** `void`

### initialize

```typescript
initialize(config?: object, play?: boolean): void
```

Initialize the emitter with optional configuration.

**Parameters:**

- `config?`: `object` — Optional config object.
- `play?`: `boolean` = `false` — Should we play immediately? False by default.

**Returns:** `void`

### play

```typescript
play(): void
```

Begin animation for the configured emitter.

**Returns:** `void`

### stop

```typescript
stop(): void
```

Stop animation for the configured emitter.

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)