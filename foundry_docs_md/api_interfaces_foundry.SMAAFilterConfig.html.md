# SMAAFilterConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface SMAAFilterConfig {
    cornerRounding: number;
    disableCornerDetection: boolean;
    disableDiagDetection: boolean;
    localContrastAdaptionFactor: number;
    maxSearchSteps: number;
    maxSearchStepsDiag: number;
    threshold: number;
}
```

## Properties

### cornerRounding

- **Type:** `number`

Specifies how much sharp corners will be rounded. Range: [0, 100].

---

### disableCornerDetection

- **Type:** `boolean`

Is corner detection disabled?

---

### disableDiagDetection

- **Type:** `boolean`

Is diagonal detection disabled?

---

### localContrastAdaptionFactor

- **Type:** `number`

If there is a neighbor edge that has `SMAA_LOCAL_CONTRAST_FACTOR` times bigger contrast than current edge, current edge will be discarded. This allows to eliminate spurious crossing edges, and is based on the fact that, if there is too much contrast in a direction, that will hide perceptually contrast in the other neighbors.

---

### maxSearchSteps

- **Type:** `number`

Specifies the maximum steps performed in the horizontal/vertical pattern searches, at each side of the pixel. In number of pixels, it's actually the double. So the maximum line length perfectly handled by, for example 16, is 64 (by perfectly, we mean that longer lines won't look as good, but still antialiased). Range: [0, 112].

---

### maxSearchStepsDiag

- **Type:** `number`

Specifies the maximum steps performed in the diagonal pattern searches, at each side of the pixel. In this case we jump one pixel at a time, instead of two. Range: [0, 20].

---

### threshold

- **Type:** `number`

Specifies the threshold or sensitivity to edges. Lowering this value you will be able to detect more edges at the expense of performance. Range: [0, 0.5]. 0.1 is a reasonable value, and allows to catch most visible edges. 0.05 is a rather overkill value, that allows to catch them all.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)