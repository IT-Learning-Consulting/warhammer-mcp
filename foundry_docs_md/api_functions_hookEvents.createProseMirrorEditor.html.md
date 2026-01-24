# createProseMirrorEditor | Foundry Virtual Tabletop - API Documentation - Version 13

### Function createProseMirrorEditor

```typescript
createProseMirrorEditor(
    uuid: string,
    plugins: Record<string, Plugin>,
    options: { state: EditorState },
): void
```

A hook event that fires whenever a ProseMirror editor is created. The hook provides the ProseMirror instance UUID, a list of plugins, and an object containing the provisional editor state, and a reference to the menu plugin. Hooked functions may append their own plugins or replace the state or menu plugin by replacing their references in the final argument.

**Parameters**

- **uuid**: `string`  
  A UUID that uniquely identifies this ProseMirror instance.

- **plugins**: `Record<string, Plugin>`  
  A list of plugins that will be loaded.

- **options**: `{ state: EditorState }`  
  The provisional EditorState and ProseMirrorMenuPlugin.

**Returns** `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)