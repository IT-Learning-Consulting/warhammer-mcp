# NewUserExperienceManager | Foundry Virtual Tabletop - API Documentation - Version 13

**Class NewUserExperienceManager**  
Responsible for managing the New User Experience workflows.

**See**  
[foundry.Game#nue](https://foundryvtt.com/api/classes/foundry.Game.html#nue)

## Methods

### createDefaultScene

```typescript
createDefaultScene(sceneData?: SceneData): Promise<documents.Scene>
```

Create a default scene for the new world.

**Parameters**

- **sceneData**: `SceneData` = {}  
  Additional data to merge with the default scene

**Returns**  
`Promise<documents.Scene>`  
The created default scene

### initialize

```typescript
initialize(): void
```

Initialize the new user experience. Currently, this generates some chat messages with hints  
for getting started if we detect this is a new world.

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)