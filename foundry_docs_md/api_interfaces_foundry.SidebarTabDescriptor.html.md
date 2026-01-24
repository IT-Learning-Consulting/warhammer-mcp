# SidebarTabDescriptor

Interface SidebarTabDescriptor describes the properties for a sidebar tab in Foundry Virtual Tabletop.

```typescript
interface SidebarTabDescriptor {
    documentName?: string;
    gmOnly?: boolean;
    icon?: string;
    tooltip?: string;
}
```

## Properties

- **documentName?**: `string`  
  A Document name to retrieve tooltip and icon information from automatically.

- **gmOnly?**: `boolean`  
  Whether the tab is only rendered for GM users.

- **icon?**: `string`  
  The tab's Font Awesome icon class.

- **tooltip?**: `string`  
  The tab's tooltip.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)