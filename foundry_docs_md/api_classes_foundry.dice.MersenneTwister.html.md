# MersenneTwister | Foundry Virtual Tabletop - API Documentation - Version 13

A standalone, pure JavaScript implementation of the Mersenne Twister pseudo random number generator.

---

## Constructors

### constructor

```typescript
new MersenneTwister(seed?: number): MersenneTwister
```

Instantiates a new Mersenne Twister.

**Parameters**

- **seed**: *number* (Optional)  
  The initial seed value, if not provided the current timestamp will be used.

**Returns**  
*MersenneTwister*

---

## Methods

### int

```typescript
int(): number
```

Generates a random unsigned 32-bit integer.

**Returns**  
*number*

**Since**  
0.1.0

---

### int31

```typescript
int31(): number
```

Generates a random unsigned 31-bit integer.

**Returns**  
*number*

**Since**  
0.1.0

---

### normal

```typescript
normal(mu: number, sigma: number): number
```

A pseudo-normal distribution using the Box-Muller transform.

**Parameters**

- **mu**: *number*  
  The normal distribution mean
- **sigma**: *number*  
  The normal distribution standard deviation

**Returns**  
*number*

---

### random

```typescript
random(): number
```

Generates a random real in the interval [0;1[ with 32-bit resolution.  
Same as `.rnd()` method - for consistency with `Math.random()` interface.

**Returns**  
*number*

**Since**  
0.2.0

---

### real

```typescript
real(): number
```

Generates a random real in the interval [0;1] with 32-bit resolution.

**Returns**  
*number*

**Since**  
0.1.0

---

### realx

```typescript
realx(): number
```

Generates a random real in the interval ]0;1[ with 32-bit resolution.

**Returns**  
*number*

**Since**  
0.1.0

---

### rnd

```typescript
rnd(): number
```

Generates a random real in the interval [0;1[ with 32-bit resolution.

**Returns**  
*number*

**Since**  
0.1.0

---

### rndHiRes

```typescript
rndHiRes(): number
```

Generates a random real in the interval [0;1[ with 53-bit resolution.

**Returns**  
*number*

**Since**  
0.1.0

---

### seed

```typescript
seed(seed: number): number
```

Initializes the state vector by using one unsigned 32-bit integer "seed", which may be zero.

**Parameters**

- **seed**: *number*  
  The seed value.

**Returns**  
*number*

**Since**  
0.1.0

---

### seedArray

```typescript
seedArray(vector: array): void
```

Initializes the state vector by using an array `key[]` of unsigned 32-bit integers of the specified length.  
If length is smaller than 624, then each array of 32-bit integers gives distinct initial state vector.  
This is useful if you want a larger seed space than 32-bit word.

**Parameters**

- **vector**: *array*  
  The seed vector.

**Returns**  
*void*

**Since**  
0.1.0

---

## Static Methods

### normal

```typescript
normal(...args: any[]): number
```

A factory method for generating random normal rolls.

**Parameters**

- **...args**: *any[]*

**Returns**  
*number*

---

### random

```typescript
random(): number
```

A factory method for generating random uniform rolls.

**Returns**  
*number*

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)