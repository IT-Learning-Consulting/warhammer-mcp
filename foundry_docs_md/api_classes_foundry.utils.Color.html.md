# Color | Foundry Virtual Tabletop - API Documentation - Version 13

A representation of a color in hexadecimal format. This class provides methods for transformations and manipulations of colors.

## Hierarchy
- *Number*
- **Color**

---

## Accessors

### b

```typescript
get b(): number
```

The numeric value of the blue channel between [0, 1].

**Returns:** `number`

---

### css

```typescript
get css(): string
```

A CSS-compatible color string. If this color is not valid, the empty string is returned. An alias for `Color#toString`.

**Returns:** `string`

---

### g

```typescript
get g(): number
```

The numeric value of the green channel between [0, 1].

**Returns:** `number`

---

### hsl

```typescript
get hsl(): [number, number, number]
```

The color represented as an HSL array. Assumes r, g, and b are contained in the set [0, 1] and returns h, s, and l in the set [0, 1].

**Returns:** `[number, number, number]`

---

### hsv

```typescript
get hsv(): [number, number, number]
```

The color represented as an HSV array. Conversion formula adapted from [HSV color space](http://en.wikipedia.org/wiki/HSV_color_space). Assumes r, g, and b are contained in the set [0, 1] and returns h, s, and v in the set [0, 1].

**Returns:** `[number, number, number]`

---

### linear

```typescript
get linear(): Color
```

The color represented as a linear RGB array. Assumes r, g, and b are contained in the set [0, 1] and returns linear r, g, and b in the set [0, 1].

**Returns:** [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)

**See:**  
[https://en.wikipedia.org/wiki/SRGB#Transformation](https://en.wikipedia.org/wiki/SRGB#Transformation)

---

### littleEndian

```typescript
get littleEndian(): number
```

Get the value of this color in little endian format.

**Returns:** `number`

---

### maximum

```typescript
get maximum(): number
```

The maximum value of all channels.

**Returns:** `number`

---

### minimum

```typescript
get minimum(): number
```

The minimum value of all channels.

**Returns:** `number`

---

### r

```typescript
get r(): number
```

The numeric value of the red channel between [0, 1].

**Returns:** `number`

---

### rgb

```typescript
get rgb(): [number, number, number]
```

The color represented as an RGB array.

**Returns:** `[number, number, number]`

---

### valid

```typescript
get valid(): boolean
```

Is this a valid color?

**Returns:** `boolean`

---

## Methods

### [iterator]

```typescript
"[iterator]"(): Generator<number, any, any>
```

Iterating over a Color is equivalent to iterating over its `[r, g, b]` color channels.

**Returns:** `Generator<number, any, any>`

---

### add

```typescript
add(other: number | Color): Color
```

Add this Color by another Color or a static scalar.

**Parameters:**

- **other**: `number | Color`  
  Some other Color or a static scalar.

**Returns:** `Color`  
The resulting Color.

---

### applyRGB

```typescript
applyRGB(vec3: number[]): void
```

Set an RGB array with the RGB values contained in this Color class.

**Parameters:**

- **vec3**: `number[]`  
  Receive the result. Must be an array with at least a length of 3.

**Returns:** `void`

---

### equals

```typescript
equals(other: number | Color): boolean
```

Test whether this color equals some other color.

**Parameters:**

- **other**: `number | Color`  
  Some other color or hex number.

**Returns:** `boolean`  
Are the colors equal?

---

### maximize

```typescript
maximize(other: number | Color): Color
```

Max this color by another Color or a static scalar.

**Parameters:**

- **other**: `number | Color`  
  Some other Color or a static scalar.

**Returns:** `Color`  
The resulting Color.

---

### minimize

```typescript
minimize(other: number | Color): Color
```

Min this color by another Color or a static scalar.

**Parameters:**

- **other**: `number | Color`  
  Some other Color or a static scalar.

**Returns:** `Color`  
The resulting Color.

---

### mix

```typescript
mix(other: Color, weight: number): Color
```

Mix this Color with some other Color using a provided interpolation weight.

**Parameters:**

- **other**: `Color`  
  Some other Color to mix with.
- **weight**: `number`  
  The mixing weight placed on this color where weight is placed on the other color.

**Returns:** `Color`  
The resulting mixed Color.

---

### multiply

```typescript
multiply(other: number | Color): Color
```

Multiply this Color by another Color or a static scalar.

**Parameters:**

- **other**: `number | Color`  
  Some other Color or a static scalar.

**Returns:** `Color`  
The resulting Color.

---

### subtract

```typescript
subtract(other: number | Color): Color
```

Subtract this Color by another Color or a static scalar.

**Parameters:**

- **other**: `number | Color`  
  Some other Color or a static scalar.

**Returns:** `Color`  
The resulting Color.

---

### toHTML

```typescript
toHTML(): string
```

Returns the color as a CSS string.

**Returns:** `string`  
The color as a CSS string.

---

### toJSON

```typescript
toJSON(): string
```

Serialize the Color.

**Returns:** `string`  
The color as a CSS string.

---

### toRGBA

```typescript
toRGBA(alpha: number): string
```

Get a CSS-compatible RGBA color string.

**Parameters:**

- **alpha**: `number`  
  The desired alpha in the range [0, 1]

**Returns:** `string`  
A CSS-compatible RGBA string.

---

### toString

```typescript
toString(radix: any): string
```

Overrides `Number.toString`.

**Parameters:**

- **radix**: `any`

**Returns:** `string`

---

## Static Methods

### add

```typescript
static add(color1: number, color2: number): number
```

Add two colors.

**Parameters:**

- **color1**: `number`  
  The first color.
- **color2**: `number`  
  The second color.

**Returns:** `number`  
The resulting color as a number.

---

### addScalar

```typescript
static addScalar(color: number, scalar: number): number
```

Add a static scalar to a color.

**Parameters:**

- **color**: `number`  
  The color.
- **scalar**: `number`  
  Scalar to add with (normalized).

**Returns:** `number`  
The resulting color as a number.

---

### applyRGB

```typescript
static applyRGB(color: number, vec3: number[]): void
```

Convert a color to RGB and assign values to a passed array.

**Parameters:**

- **color**: `number`  
  The color to convert to RGB values.
- **vec3**: `number[]`  
  Receive the result. Must be an array with at least a length of 3.

**Returns:** `void`

---

### from

```typescript
static from(color: ColorSource): Color
```

Create a Color instance from an RGB array.

**Parameters:**

- **color**: `ColorSource`  
  A color input.

**Returns:** `Color`  
The hex color instance or NaN.

---

### fromHSL

```typescript
static fromHSL(hsl: [number, number, number]): Color
```

Create a Color instance from an HSL array. Assumes h, s, and l are contained in the set [0, 1].

**Parameters:**

- **hsl**: `[number, number, number]`  
  An HSL tuple.

**Returns:** `Color`  
The hex color instance.

---

### fromHSV

```typescript
static fromHSV(hsv: [number, number, number]): Color
```

Create a Color instance from an HSV array. Conversion formula adapted from [HSV color space](http://en.wikipedia.org/wiki/HSV_color_space). Assumes h, s, and v are contained in the set [0, 1].

**Parameters:**

- **hsv**: `[number, number, number]`  
  An HSV tuple.

**Returns:** `Color`  
The hex color instance.

---

### fromLinearRGB

```typescript
static fromLinearRGB(linear: [number, number, number]): Color
```

Create a Color instance (sRGB) from a linear RGB array. Assumes r, g, and b are contained in the set [0, 1].

**Parameters:**

- **linear**: `[number, number, number]`  
  The linear RGB array.

**Returns:** `Color`  
The hex color instance.

**See:**  
[https://en.wikipedia.org/wiki/SRGB#Transformation](https://en.wikipedia.org/wiki/SRGB#Transformation)

---

### fromRGB

```typescript
static fromRGB(rgb: [number, number, number]): Color
```

Create a Color instance from an RGB array.

**Parameters:**

- **rgb**: `[number, number, number]`  
  An RGB tuple.

**Returns:** `Color`  
The hex color instance.

---

### fromRGBvalues

```typescript
static fromRGBvalues(r: number, g: number, b: number): Color
```

Create a Color instance from RGB normalized values.

**Parameters:**

- **r**: `number`  
  The red value.
- **g**: `number`  
  The green value.
- **b**: `number`  
  The blue value.

**Returns:** `Color`  
The hex color instance.

---

### fromString

```typescript
static fromString(color: string): Color
```

Create a Color instance from a color string which either includes or does not include a leading `#`.

**Parameters:**

- **color**: `string`  
  A color string.

**Returns:** `Color`  
The hex color instance.

Overrides `Number.fromString`.

---

### maximize

```typescript
static maximize(color1: number, color2: number): number
```

Maximize two colors.

**Parameters:**

- **color1**: `number`  
  The first color.
- **color2**: `number`  
  The second color.

**Returns:** `number`  
The result.

---

### maximizeScalar

```typescript
static maximizeScalar(color: number, scalar: number): number
```

Maximize a color by a static scalar.

**Parameters:**

- **color**: `number`  
  The color to maximize.
- **scalar**: `number`  
  Scalar to maximize with (normalized).

**Returns:** `number`  
The resulting color as a number.

---

### minimize

```typescript
static minimize(color1: number, color2: number): number
```

Minimize two colors.

**Parameters:**

- **color1**: `number`  
  The first color.
- **color2**: `number`  
  The second color.

**Returns:** `number`

---

### minimizeScalar

```typescript
static minimizeScalar(color: number, scalar: number): number
```

Minimize a color by a static scalar.

**Parameters:**

- **color**: `number`  
  The color.
- **scalar**: `number`  
  Scalar to minimize with (normalized).

**Returns:** `number`  
The resulting color as a number.

---

### mix

```typescript
static mix(color1: number, color2: number, weight: number): number
```

Apply a linear interpolation between two colors, according to the weight.

**Parameters:**

- **color1**: `number`  
  The first color to mix.
- **color2**: `number`  
  The second color to mix.
- **weight**: `number`  
  Weight of the linear interpolation.

**Returns:** `number`  
The resulting mixed color.

---

### multiply

```typescript
static multiply(color1: number, color2: number): number
```

Multiply two colors.

**Parameters:**

- **color1**: `number`  
  The first color to multiply.
- **color2**: `number`  
  The second color to multiply.

**Returns:** `number`  
The result.

---

### multiplyScalar

```typescript
static multiplyScalar(color: number, scalar: number): number
```

Multiply a color by a scalar.

**Parameters:**

- **color**: `number`  
  The color to multiply.
- **scalar**: `number`  
  A static scalar to multiply with.

**Returns:** `number`  
The resulting color as a number.

---

### subtract

```typescript
static subtract(color1: number, color2: number): number
```

Subtract two colors.

**Parameters:**

- **color1**: `number`  
  The first color.
- **color2**: `number`  
  The second color.

**Returns:** `number`

---

### subtractScalar

```typescript
static subtractScalar(color: number, scalar: number): number
```

Subtract a color by a static scalar.

**Parameters:**

- **color**: `number`  
  The color.
- **scalar**: `number`  
  Scalar to subtract with (normalized).

**Returns:** `number`  
The resulting color as a number.