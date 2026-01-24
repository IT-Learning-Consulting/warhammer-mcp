# ImagePopoutConfiguration

> Interface `ImagePopoutConfiguration`

```typescript
interface ImagePopoutConfiguration {
    caption?: string;
    showTitle?: boolean;
    src: string;
    uuid?: null | string;
}
```

## Properties

- **caption?**: `string`  
  Caption text to display below the image.

- **showTitle?**: `boolean`  
  Force showing or hiding the title.

- **src**: `string`  
  The URL to the image or video file.

- **uuid?**: `null | string`  
  The UUID of some related [foundry.abstract.Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html).