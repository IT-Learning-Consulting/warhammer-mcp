# chatMessage | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `chatMessage`

```typescript
chatMessage(
    chatLog: ChatLog,
    message: string,
    chatData: { speaker: ChatSpeakerData; user: string },
): void
```

A hook event that fires when a user sends a message through the ChatLog.

**Parameters**

- **chatLog**: *ChatLog*  
  The ChatLog instance  
  [ChatLog Documentation](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ChatLog.html)
  
- **message**: *string*  
  The trimmed message content

- **chatData**: `{ speaker: ChatSpeakerData; user: string }`  
  Some basic chat data
  
  - **speaker**: *ChatSpeakerData*  
    The identified speaker data, see [foundry.documents.ChatMessage.getSpeaker](https://foundryvtt.com/api/classes/foundry.documents.ChatMessage.html#getspeaker)
    
  - **user**: *string*  
    The id of the User sending the message

**Returns**  
*void*

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)