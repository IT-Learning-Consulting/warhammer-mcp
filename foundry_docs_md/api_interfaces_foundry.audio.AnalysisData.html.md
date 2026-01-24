# AnalysisData | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface AnalysisData

```typescript
interface AnalysisData {
  analysisLoopActive: boolean;
  environment: AnalysisDataValue;
  interface: AnalysisDataValue;
  music: AnalysisDataValue;
}
```

### Properties

- **analysisLoopActive**: `boolean`  
  Whether the internal RAQ loop is currently running.

- **environment**: [`AnalysisDataValue`](https://foundryvtt.com/api/interfaces/foundry.audio.AnalysisDataValue.html)  
  Analysis data for the ambient/environment context.

- **interface**: [`AnalysisDataValue`](https://foundryvtt.com/api/interfaces/foundry.audio.AnalysisDataValue.html)  
  Analysis data for the interface context.

- **music**: [`AnalysisDataValue`](https://foundryvtt.com/api/interfaces/foundry.audio.AnalysisDataValue.html)  
  Analysis data for the music context.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)