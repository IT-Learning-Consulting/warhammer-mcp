# ParticleEffect | Foundry Virtual Tabletop - API Documentation - Version 13

An interface for defining particle-based weather effects.

## Mixes

- FullCanvasObjectMixin

## Hierarchy

- any
- **ParticleEffect**
- [*AutumnLeavesWeatherEffect*](https://foundryvtt.com/api/classes/foundry.canvas.containers.AutumnLeavesWeatherEffect.html)

---

## Constructors

### constructor

```typescript
new ParticleEffect(options?: object): ParticleEffect
```

**Parameters**

- **options**: `object` = `{}`  
  Options passed to the getParticleEmitters method which can be used to customize values of the emitter configuration.

**Returns**  
`ParticleEffect`

Overrides FullCanvasObjectMixin(PIXI.Container).constructor

---

## Properties

### emitters

- **emitters**: `Emitter[]`  
  The array of emitters which are active for this particle effect.

---

## Methods

### createEmitter

```typescript
createEmitter(config: EmitterConfigV3): Emitter
```

Create an emitter instance which automatically updates using the shared PIXI.Ticker.

**Parameters**

- **config**: `EmitterConfigV3`  
  The emitter configuration.

**Returns**  
`Emitter`  
The created Emitter instance.

---

### destroy

```typescript
destroy(...args: any[]): void
```

**Parameters**

- **...args**: `any[]`

**Returns**  
`void`

---

### getParticleEmitters

```typescript
getParticleEmitters(options?: object): Emitter[]
```

Get the particle emitters which should be active for this particle effect. This base class creates a single emitter using the explicitly provided configuration. Subclasses can override this method for more advanced configurations.

**Parameters**

- **options** (optional): `object` = `{}`  
  Options provided to the ParticleEffect constructor which can be used to customize configuration values for created emitters.

**Returns**  
`Emitter[]`

---

### play

```typescript
play(): void
```

Begin animation for the configured emitters.

**Returns**  
`void`

---

### stop

```typescript
stop(): void
```

Stop animation for the configured emitters.

**Returns**  
`void`

---

For more details, see the [ParticleEffect API Documentation](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html).  
Visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html) homepage.