# TinyMCE | Foundry Virtual Tabletop - API Documentation - Version 13

## Variable TinyMCE Const

Default configuration options for TinyMCE editors.

```typescript
TinyMCE: {
    branding: boolean;
    content_css: string[];
    menubar: boolean;
    plugins: string;
    save_enablewhendirty: boolean;
    statusbar: boolean;
    style_formats: {
        items: {
            block: string;
            classes: string;
            title: string;
            wrapper: boolean;
        }[];
        title: string;
    }[];
    style_formats_merge: boolean;
    table_default_styles: {};
    toolbar: string;
} = ...
```

### Type declaration

- **branding**: `boolean`
- **content_css**: `string[]`
- **menubar**: `boolean`
- **plugins**: `string`
- **save_enablewhendirty**: `boolean`
- **statusbar**: `boolean`
- **style_formats**:  
  - **items**:  
    - **block**: `string`  
    - **classes**: `string`  
    - **title**: `string`  
    - **wrapper**: `boolean`  
  - **title**: `string`[]
- **style_formats_merge**: `boolean`
- **table_default_styles**: `{}`
- **toolbar**: `string`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)