# JournalEntryPageVideoData

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

```typescript
interface JournalEntryPageVideoData {
    autoplay?: boolean;
    height?: number;
    loop?: boolean;
    timestamp?: number;
    volume?: number;
    width?: number;
}
```

## Properties

- **autoplay?**: `boolean`  
  Should the video play automatically?

- **height?**: `number`  
  The height of the video, otherwise it will use the aspect ratio of the source video, or 16:9 if that aspect ratio is not available.

- **loop?**: `boolean`  
  Automatically loop the video?

- **timestamp?**: `number`  
  The starting point of the video, in seconds.

- **volume?**: `number`  
  The volume level of any audio that the video file contains.

- **width?**: `number`  
  The width of the video, otherwise it will fill the available container width.