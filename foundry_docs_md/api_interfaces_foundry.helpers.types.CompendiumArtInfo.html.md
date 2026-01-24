# CompendiumArtInfo | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface CompendiumArtInfo

```typescript
interface CompendiumArtInfo {
    actor?: string;
    credit?: string;
    token?: string | object;
}
```

### Properties

- **actor?**: `string`  
  The path to the Actor's portrait image.

- **credit?**: `string`  
  An optional credit string for use by the game system to apply in an appropriate place.

- **token?**: `string | object`  
  The path to the token image, or an object to merge into the Actor's prototype token.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)