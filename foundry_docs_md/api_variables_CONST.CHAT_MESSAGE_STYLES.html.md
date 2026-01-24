# CHAT_MESSAGE_STYLES | Foundry Virtual Tabletop - API Documentation - Version 13

`CHAT_MESSAGE_STYLES: { EMOTE: 3; IC: 2; OOC: 1; OTHER: 0 }`

Valid Chat Message styles which affect how the message is presented in the chat log.

## Type declaration

### EMOTE

- **Readonly**
- Value: `3`

The message is an emote performed by the selected character.  
Entering `"/emote waves his hand."` while controlling a character named Simon will send the message,  
`"Simon waves his hand."`

### IC

- **Readonly**
- Value: `2`

The message is spoken by an associated character.

### OOC

- **Readonly**
- Value: `1`

The message is spoken out of character (OOC). OOC messages will be outlined by the player's color to make them more easily recognizable.

### OTHER

- **Readonly**
- Value: `0`

An uncategorized chat message.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)