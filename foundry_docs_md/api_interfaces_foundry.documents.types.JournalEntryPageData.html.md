# JournalEntryPageData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface JournalEntryPageData {
  _id: null | string;
  _stats: DocumentStats;
  category?: string;
  flags: DocumentFlags;
  image: JournalEntryPageImageData;
  name: string;
  ownership?: object;
  sort: number;
  src?: string;
  system: object;
  text: JournalEntryPageTextData;
  title: JournalEntryPageTitleData;
  type: string;
  video: JournalEntryPageVideoData;
}
```

## Properties

### **_id**

Type: `null | string`  
The _id which uniquely identifies this JournalEntryPage embedded document.

### **_stats**

Type: [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
An object of creation and access information.

### **category** (Optional)

Type: `string`  
An optional category that this page belongs to.

### **flags**

Type: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
An object of optional key/value flags.

### **image**

Type: [JournalEntryPageImageData](https://foundryvtt.com/api/interfaces/foundry.documents.types.JournalEntryPageImageData.html)  
Data particular to image journal entry pages.

### **name**

Type: `string`  
The text name of this page.

### **ownership** (Optional)

Type: `object`  
An object which configures the ownership of this page.

### **sort**

Type: `number`  
The numeric sort value which orders this page relative to its siblings.

### **src** (Optional)

Type: `string`  
The URI of the image or other external media to be used for this page.

### **system**

Type: `object`  
System-specific data.

### **text**

Type: [JournalEntryPageTextData](https://foundryvtt.com/api/interfaces/foundry.documents.types.JournalEntryPageTextData.html)  
Data particular to text journal entry pages.

### **title**

Type: [JournalEntryPageTitleData](https://foundryvtt.com/api/interfaces/foundry.documents.types.JournalEntryPageTitleData.html)  
Data that control's the display of this page's title.

### **type**

Type: `string`  
The type of this page.

### **video**

Type: [JournalEntryPageVideoData](https://foundryvtt.com/api/interfaces/foundry.documents.types.JournalEntryPageVideoData.html)  
Data particular to video journal entry pages.