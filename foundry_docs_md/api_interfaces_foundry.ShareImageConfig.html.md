# ShareImageConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ShareImageConfig {
    image: string;
    showTitle?: boolean;
    title: string;
    users?: string[];
    uuid?: string;
}
```

## Properties

- **image**: `string`  
  The image URL to share.

- **showTitle** *(optional)*: `boolean`  
  If this is provided, the permissions of the related Document will be ignored and the title will be shown based on this parameter.

- **title**: `string`  
  The image title.

- **users** *(optional)*: `string[]`  
  A list of user IDs to show the image to.

- **uuid** *(optional)*: `string`  
  The UUID of a [foundry.abstract.Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html) related to the image, used to determine permission to see the image title.