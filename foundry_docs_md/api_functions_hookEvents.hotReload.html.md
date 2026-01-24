# hotReload | Foundry Virtual Tabletop - API Documentation - Version 13

### Function hotReload

```typescript
hotReload(data: HotReloadData): void
```

A hook event that fires when a package that is being watched by the hot reload system has a  
file changed. The hook provides the hot reload data related to the file change. Hooked  
functions may intercept the hot reload and prevent the core software from handling it by  
returning false.

**Parameters**

- **data**: _HotReloadData_  
  The hot reload data

**Returns** _void_

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)