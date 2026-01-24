# SceneEnvironmentData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface SceneEnvironmentData {
    base?: EnvironmentData;
    cycle?: boolean;
    dark?: EnvironmentData;
    darknessLevel?: number;
    darknessLevelLock?: boolean;
    globalLight?: GlobalLightData;
}
```

## Properties

- **base?**: [EnvironmentData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EnvironmentData.html)  
  The base (darkness level 0) ambience lighting data.

- **cycle?**: `boolean`  
  If cycling between Night and Day is activated.

- **dark?**: [EnvironmentData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EnvironmentData.html)  
  The dark (darkness level 1) ambience lighting data.

- **darknessLevel?**: `number`  
  The environment darkness level.

- **darknessLevelLock?**: `boolean`  
  The darkness level lock state.

- **globalLight?**: [GlobalLightData](https://foundryvtt.com/api/types/foundry.documents.types.GlobalLightData.html)  
  The global light data configuration.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)