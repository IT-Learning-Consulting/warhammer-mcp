# activateNote | Foundry Virtual Tabletop - API Documentation - Version 13

### Function activateNote

```typescript
activateNote(note: canvas.placeables.Note, options: object): void
```

A hook event that fires whenever a map note is double-clicked. The hook provides the note placeable and the arguments passed to the associated [foundry.applications.sheets.journal.JournalEntrySheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntrySheet.html) render call. Hooked functions may modify the render arguments or cancel the render by returning `false`.

**Parameters**

- **note**: `canvas.placeables.Note`  
  The note that was activated.

- **options**: `object`  
  Options for rendering the associated [foundry.applications.sheets.journal.JournalEntrySheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntrySheet.html).

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)