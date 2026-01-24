# SmoothNoise

A smooth noise generator for one-dimensional values.

## Constructor

```typescript
constructor(options: {
  amplitude: number;
  scale: number;
  maxReferences: number;
})
```

**Parameters:**

- **options**: Configuration options for the noise process.
  - **options.amplitude**: The generated noise will be on the range [0, amplitude].
  - **options.scale**: An adjustment factor for the input x values which place them on an appropriate range.
  - **options.maxReferences**: The number of pre-generated random numbers to generate.

## Accessors

### amplitude

```typescript
get amplitude(): number
```

Amplitude of the generated noise output. The noise output is multiplied by this value.

**Returns:**  
`number`

### scale

```typescript
get scale(): number[]
```

Scale factor of the random indices.

**Returns:**  
`number[]`

## Methods

### generate

```typescript
generate(x: number): number
```

Generate the noise value corresponding to a provided numeric x value.

**Parameters:**

- **x**: `number` — Any finite number

**Returns:**  
`number` — The corresponding smoothed noise value

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)