# WeatherAmbienceConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface WeatherAmbienceConfiguration {
    effects: WeatherEffectConfiguration[];
    filter?: { 
        blendMode?: BLEND_MODES; 
        enabled: boolean; 
    };
    id: string;
    label: string;
}
```

## Properties

- **effects**: `WeatherEffectConfiguration[]`  
  An array of available Weather Effects implementations.

- **filter** _(optional)_:  
  An optional filter configuration object with the following properties:  
  - **blendMode?**: `BLEND_MODES` (optional)  
  - **enabled**: `boolean`  

- **id**: `string`  
  The identifier for the weather ambience configuration.

- **label**: `string`  
  The human-readable label for the weather ambience configuration.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).