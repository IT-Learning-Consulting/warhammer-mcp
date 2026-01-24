# configureCanvasEnvironment | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `configureCanvasEnvironment`

```typescript
configureCanvasEnvironment(config: CanvasEnvironmentConfig): void
```

A hook event that fires at the beginning of [foundry.canvas.groups.EnvironmentCanvasGroup#initialize](https://foundryvtt.com/api/classes/foundry.canvas.groups.EnvironmentCanvasGroup.html#initialize) which allows the environment configuration to be altered by hook functions. The provided `config` param should be mutated to make any desired changes. A method subscribing to this hook may return `false` to prevent further configuration.

#### Parameters

- **config**: _CanvasEnvironmentConfig_
  - The configuration object representing the canvas environment settings that can be modified.

#### Returns

- _void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)