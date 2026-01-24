# AutumnLeavesWeatherEffect

A full-screen weather effect which renders gently falling autumn leaves.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [containers](https://foundryvtt.com/api/modules/foundry.canvas.containers.html) / [AutumnLeavesWeatherEffect](https://foundryvtt.com/api/classes/foundry.canvas.containers.AutumnLeavesWeatherEffect.html)

## Hierarchy  
See [Hierarchy Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.containers.AutumnLeavesWeatherEffect)

- *ParticleEffect*  
- **AutumnLeavesWeatherEffect**

---

## Constructors

### constructor

```typescript
new AutumnLeavesWeatherEffect(options?: object): AutumnLeavesWeatherEffect
```

**Parameters**

- **options**: `object` (Optional)  
  Options passed to the `getParticleEmitters` method which can be used to customize values of the emitter configuration.

**Returns**  
`AutumnLeavesWeatherEffect`

Inherited from [ParticleEffect.constructor](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html#constructor)

---

## Properties

### emitters

**Type:** `Emitter[]`  

The array of emitters which are active for this particle effect.

Inherited from [ParticleEffect.emitters](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html#emitters)

### label

**Type:** `string`  
**Value:** `"WEATHER.AutumnLeaves"`

(Static property)

### LEAF_CONFIG

**Type:** `EmitterConfigV3`  

Configuration for the particle emitter for falling leaves.

(Static property)

---

## Methods

### createEmitter

```typescript
createEmitter(config: EmitterConfigV3): Emitter
```

Create an emitter instance which automatically updates using the shared `PIXI.Ticker`.

**Parameters**

- **config**: `EmitterConfigV3`  
  The emitter configuration.

**Returns**  
`Emitter`

Inherited from [ParticleEffect.createEmitter](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html#createemitter)

---

### destroy

```typescript
destroy(...args: any[]): void
```

**Parameters**

- **...args**: `any[]`

**Returns**  
`void`

Inherited from [ParticleEffect.destroy](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html#destroy)

---

### getParticleEmitters

```typescript
getParticleEmitters(): Emitter[]
```

Get the particle emitters which should be active for this particle effect. This base class creates a single emitter using the explicitly provided configuration. Subclasses can override this method for more advanced configurations.

**Returns**  
`Emitter[]`

Overrides [ParticleEffect.getParticleEmitters](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html#getparticleemitters)

---

### play

```typescript
play(): void
```

Begin animation for the configured emitters.

**Returns**  
`void`

Inherited from [ParticleEffect.play](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html#play)

---

### stop

```typescript
stop(): void
```

Stop animation for the configured emitters.

**Returns**  
`void`

Inherited from [ParticleEffect.stop](https://foundryvtt.com/api/classes/foundry.canvas.containers.ParticleEffect.html#stop)