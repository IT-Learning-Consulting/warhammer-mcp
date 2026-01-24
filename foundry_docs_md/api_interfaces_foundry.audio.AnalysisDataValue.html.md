# AnalysisDataValue | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface AnalysisDataValue {
  active: boolean;
  bands: { all: number; bass: number; mid: number; treble: number };
  dataArray: null | Float32Array;
  db: { all: number; bass: number; mid: number; treble: number };
  keepAlive: boolean;
  lastUsed: number;
  node: null | AnalyserNode;
}
```

## Properties

- **active**: `boolean`  
  Whether the analyzer is currently active.

- **bands**: `{ all: number; bass: number; mid: number; treble: number }`  
  Normalized `[0,1]` values for the same bands.

  ### Type declaration for `bands`
  - **all**: `number`  
    Normalized amplitude for the entire audible range.
  - **bass**: `number`  
    Normalized amplitude for low frequencies.
  - **mid**: `number`  
    Normalized amplitude for midrange frequencies.
  - **treble**: `number`  
    Normalized amplitude for high frequencies.

- **dataArray**: `null | Float32Array`  
  The FFT frequency data buffer used by the `AnalyserNode`.

- **db**: `{ all: number; bass: number; mid: number; treble: number }`  
  Raw average decibel values for each frequency band.

  ### Type declaration for `db`
  - **all**: `number`  
    Average dB in approximately 20-20000 Hz.
  - **bass**: `number`  
    Average dB in approximately 20-200 Hz.
  - **mid**: `number`  
    Average dB in approximately 200-2000 Hz.
  - **treble**: `number`  
    Average dB in approximately 2000-8000 Hz.

- **keepAlive**: `boolean`  
  If true, the analyzer remains active and will not be disabled after inactivity.

- **lastUsed**: `number`  
  The timestamp when data was last requested.

- **node**: `null | AnalyserNode`  
  The `AnalyserNode` for this context, or `null` if inactive.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)