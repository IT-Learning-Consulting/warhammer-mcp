# BiquadFilterEffect | Foundry Virtual Tabletop - API Documentation - Version 13

A sound effect which applies a biquad filter.

## See

[https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode)

## Hierarchy

- *BiquadFilterNode*  
- **BiquadFilterEffect**

---

## Constructors

### constructor

```typescript
new BiquadFilterEffect(
    context: AudioContext,
    options?: { intensity?: number; type?: BiquadFilterType },
): BiquadFilterEffect
```

A `BiquadFilterEffect` is constructed by passing the following parameters.

**Parameters**

- **context**: *AudioContext*  
  The audio context required by the BiquadFilterNode.

- **options**?: *{ intensity?: number; type?: BiquadFilterType }* = {}  
  Additional options which modify the BiquadFilterEffect behavior.

  - **intensity**?: *number*  
    The initial intensity of the effect.

  - **type**?: *BiquadFilterType*  
    The filter type to apply.

**Returns**  
*BiquadFilterEffect*

Overrides `BiquadFilterNode.constructor`.

---

## Accessors

### intensity

```typescript
get intensity(): number
```

Adjust the intensity of the effect on a scale of 0 to 10.

**Returns**  
*number*

---

## Methods

### update

```typescript
update(options?: { intensity?: number; type?: BiquadFilterType }): void
```

Update the state of the effect node given the active flag and numeric intensity.

**Parameters**

- **options**?: *{ intensity?: number; type?: BiquadFilterType }* = {}  
  Options which are updated.

  - **intensity**?: *number*  
    A new effect intensity.

  - **type**?: *BiquadFilterType*  
    A new filter type.

**Returns**  
*void*