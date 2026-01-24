# ConvolverEffect | Foundry Virtual Tabletop - API Documentation - Version 13

A sound effect which applies a convolver filter. The convolver effect splits the input sound into two separate paths:

1. A "dry" node which is the original sound  
2. A "wet" node which contains the result of the convolution

This effect mixes between the dry and wet channels based on the intensity of the reverb effect.

**See**  
[https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode)

**Hierarchy**  
*ConvolverNode*  
**ConvolverEffect**

---

## Constructors

### constructor

```typescript
new ConvolverEffect(
    context: AudioContext,
    options?: {
        impulseResponsePath?: string;
        intensity?: number;
    },
): ConvolverEffect
```

A ConvolverEffect is constructed by passing the following parameters.

**Parameters**

- **context**: `AudioContext`  
  The audio context required by the ConvolverNode.

- **options** (optional): `{ impulseResponsePath?: string; intensity?: number } = {}`  
  Additional options which modify the ConvolverEffect behavior.

  - **impulseResponsePath** (optional): `string`  
    The file path to the impulse response buffer to use.

  - **intensity** (optional): `number`  
    The initial intensity of the effect.

**Returns**  
`ConvolverEffect`

Overrides ConvolverNode.constructor

---

## Accessors

### intensity

```typescript
get intensity(): number
```

Adjust the intensity of the effect on a scale of 0 to 10.

**Returns**  
`number`

---

## Methods

### connect

```typescript
connect(destinationNode: any, ...args: any[]): any
```

**Parameters**

- **destinationNode**: `any`  
- **...args**: `any[]`

**Returns**  
`any`

Overrides ConvolverNode.connect

---

### disconnect

```typescript
disconnect(...args: any[]): void
```

**Parameters**

- **...args**: `any[]`

**Returns**  
`void`

Overrides ConvolverNode.disconnect

---

### onConnectFrom

```typescript
onConnectFrom(sourceNode: AudioNode): void
```

Additional side effects performed when some other AudioNode connects to this one. This behavior is not supported by the base WebAudioAPI but is needed here for more complex effects.

**Parameters**

- **sourceNode**: `AudioNode`  
  An upstream source node that is connecting to this one.

**Returns**  
`void`

---

### update

```typescript
update(options?: { intensity?: number }): void
```

Update the state of the effect node given the active flag and numeric intensity.

**Parameters**

- **options** (optional): `{ intensity?: number } = {}`  
  Options which are updated.

  - **intensity** (optional): `number`  
    A new effect intensity.

**Returns**  
`void`