# TokenDetectionMode | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface `TokenDetectionMode<Source>`

```typescript
interface TokenDetectionMode<Source extends boolean = false> {
    enabled: boolean;
    id: string;
    range: Source extends true ? null | number : number;
}
```

### Type Parameters

- **Source** extends `boolean` = `false`

### Properties

- **enabled**: `boolean`  
  Whether or not this detection mode is presently enabled.

- **id**: `string`  
  The ID of the detection mode, a key from [CONFIG.Canvas.detectionModes](https://foundryvtt.com/api/modules/foundry.html).

- **range**: `Source` extends `true` ? `null` | `number` : `number`  
  The maximum range in distance units at which this mode can detect targets.  
  If `null`, which is only possible for modes in the document source, the detection range is unlimited.  
  On document preparation, `null` is converted to `Infinity`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)