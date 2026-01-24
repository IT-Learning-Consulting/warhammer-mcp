# ProseMirrorMenuItem

```typescript
interface ProseMirrorMenuItem {
    action: string;
    active?: boolean;
    attrs?: object;
    class?: string;
    cmd?: ProseMirrorCommand;
    group?: number;
    icon?: string;
    mark?: MarkType;
    node?: NodeType;
    priority?: number;
    style?: string;
    title: string;
}
```

## Properties

- **action**: `string`  
  A string identifier for this menu item.

- **active**? : `boolean`  
  *Optional*  
  Whether the current item is active under the given selection or cursor.

- **attrs**? : `object`  
  *Optional*  
  An object of attributes for the node or mark.

- **class**? : `string`  
  *Optional*  
  An optional class to apply to the menu item.

- **cmd**? : [ProseMirrorCommand](https://foundryvtt.com/api/types/foundry.prosemirror.types.ProseMirrorCommand.html)  
  *Optional*  
  The command to run when the menu item is clicked.

- **group**? : `number`  
  *Optional*  
  Entries with the same group number will be grouped together in the drop-down. Lower-numbered groups appear higher in the list.

- **icon**? : `string`  
  *Optional*  
  The menu item's icon HTML.

- **mark**? : `MarkType`  
  *Optional*  
  The mark to apply to the selected text.

- **node**? : `NodeType`  
  *Optional*  
  The node to wrap the selected text in.

- **priority**? : `number`  
  *Optional*  
  A numeric priority which determines whether this item is displayed as the dropdown title. Lower priority takes precedence.

- **style**? : `string`  
  *Optional*  
  An optional style to apply to the title text.

- **title**: `string`  
  The description of the menu item.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)