# AudioBufferCacheEntry

Interface **AudioBufferCacheEntry**

```typescript
interface AudioBufferCacheEntry {
    buffer: AudioBuffer;
    locked?: boolean;
    next?: AudioBufferCacheEntry;
    previous?: AudioBufferCacheEntry;
    size: number;
    src: string;
}
```

## Properties

- **buffer**: `AudioBuffer`  
- **locked?**: `boolean` (optional)  
- **next?**: [`AudioBufferCacheEntry`](https://foundryvtt.com/api/interfaces/foundry.audio.AudioBufferCacheEntry.html) (optional)  
- **previous?**: [`AudioBufferCacheEntry`](https://foundryvtt.com/api/interfaces/foundry.audio.AudioBufferCacheEntry.html) (optional)  
- **size**: `number`  
- **src**: `string`  

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)