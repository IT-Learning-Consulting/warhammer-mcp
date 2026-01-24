# ApplicationWindowConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ApplicationWindowConfiguration {
    contentClasses?: string[];
    contentTag?: string;
    controls?: ApplicationHeaderControlsEntry[];
    frame?: boolean;
    icon?: string | false;
    minimizable?: boolean;
    positioned?: boolean;
    resizable?: boolean;
    title?: string;
}
```

## Properties

- **contentClasses?**: `string[]`  
  Additional CSS classes to apply to the `.window-content` element

- **contentTag?**: `string`  
  A specific tag name to use for the `.window-content` element

- **controls?**: [`ApplicationHeaderControlsEntry`](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)[]  
  An array of window control entries

- **frame?**: `boolean`  
  Is this Application rendered inside a window frame?

- **icon?**: `string` \| `false`  
  An optional Font Awesome icon class displayed left of the window title

- **minimizable?**: `boolean`  
  Can the window app be minimized by double-clicking on the title

- **positioned?**: `boolean`  
  Can this Application be positioned via JavaScript or only by CSS

- **resizable?**: `boolean`  
  Is this window resizable?

- **title?**: `string`  
  The window title. Displayed only if the application is framed

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).