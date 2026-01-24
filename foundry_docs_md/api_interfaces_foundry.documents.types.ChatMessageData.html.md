# ChatMessageData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ChatMessageData {
  _id: null | string;
  _stats: DocumentStats;
  blind?: boolean;
  content: string;
  emote?: boolean;
  flags: DocumentFlags;
  flavor?: string;
  rolls?: string[];
  sound?: string;
  speaker: ChatSpeakerData;
  style?: ChatMessageStyle;
  system?: object;
  timestamp: number;
  title?: string;
  type: string;
  user: string;
  whisper: string[];
}
```

## Properties

### _id
- **Type:** `null | string`  
- **Description:** The _id which uniquely identifies this ChatMessage document

### _stats
- **Type:** [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
- **Description:** An object of creation and access information

### blind (optional)
- **Type:** `boolean`  
- **Description:** Is this message sent blindly where the creating User cannot see it?

### content
- **Type:** `string`  
- **Description:** The HTML content of this chat message

### emote (optional)
- **Type:** `boolean`  
- **Description:** Is this message styled as an emote?

### flags
- **Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- **Description:** An object of optional key/value flags

### flavor (optional)
- **Type:** `string`  
- **Description:** An optional flavor text message which summarizes this message

### rolls (optional)
- **Type:** `string[]`  
- **Description:** Serialized content of any Roll instances attached to the ChatMessage

### sound (optional)
- **Type:** `string`  
- **Description:** The URL of an audio file which plays when this message is received

### speaker
- **Type:** [ChatSpeakerData](https://foundryvtt.com/api/interfaces/foundry.documents.types.ChatSpeakerData.html)  
- **Description:** A ChatSpeakerData object which describes the origin of the ChatMessage

### style (optional)
- **Type:** [ChatMessageStyle](https://foundryvtt.com/api/types/CONST.ChatMessageStyle.html)  
- **Description:** The message style from [CONST.CHAT_MESSAGE_STYLES](https://foundryvtt.com/api/variables/CONST.CHAT_MESSAGE_STYLES.html)

### system (optional)
- **Type:** `object`  
- **Description:** Game system data which is defined by the system `template.json` model

### timestamp
- **Type:** `number`  
- **Description:** The timestamp at which point this message was generated

### title (optional)
- **Type:** `string`  
- **Description:** An optional title used if the message is popped-out

### type
- **Type:** `string`  
- **Description:** The type of this chat message, in `BaseChatMessage.metadata.types`

### user
- **Type:** `string`  
- **Description:** The _id of the User document who generated this message

### whisper
- **Type:** `string[]`  
- **Description:** An array of User _id values to whom this message is privately whispered