# createFontAwesomeIcon

```typescript
createFontAwesomeIcon(
    glyph: string,
    options?: {
        classes?: string[];
        fixedWidth?: boolean;
        style?: "solid" | "regular" | "duotone";
    },
): HTMLElement
```

Create an HTML element for a FontAwesome icon

## Parameters

- **glyph**: `string`  
  A FontAwesome glyph name, such as `"file"` or `"user"`

- **options**?:
  - **classes**?: `string[]`  
    Additional classes to append to the class list
  - **fixedWidth**?: `boolean`  
    Should icon be fixed-width?
  - **style**?: `"solid"` | `"regular"` | `"duotone"`  
    The style name for the icon

## Returns

`HTMLElement`  
The configured FontAwesome icon element

## See

[https://fontawesome.com/search](https://fontawesome.com/search)  
[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)