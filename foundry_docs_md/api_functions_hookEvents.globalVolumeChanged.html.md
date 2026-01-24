# globalVolumeChanged

## Function globalVolumeChanged

```typescript
globalVolumeChanged(volume: number): void
```

A hook event that fires when the user modifies a global volume slider. The hook name needs to be customized to include the type of global volume being changed, one of:

- `globalPlaylistVolumeChanged`
- `globalAmbientVolumeChanged`
- `globalInterfaceVolumeChanged`

### Parameters

- **volume**: `number`  
  The new volume level

### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)