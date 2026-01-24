# editor | Foundry Virtual Tabletop - API Documentation - Version 13

### Function editor

```typescript
editor(
    content: string,
    options?: {
        button?: boolean;
        class?: string;
        collaborate?: boolean;
        editable?: boolean;
        engine?: string;
        target?: string;
    },
): SafeString
```

Construct an editor element for rich text editing with TinyMCE or ProseMirror.

#### Parameters

- **content**: *string*  
  The content to display and edit.

- **options** (optional):  
  - **button**?: *boolean*  
    Include a button used to activate the editor later?  
  - **class**?: *string*  
    A specific CSS class to add to the editor container  
  - **collaborate**?: *boolean*  
    Whether to turn on collaborative editing features for ProseMirror.  
  - **editable**?: *boolean*  
    Is the text editor area currently editable?  
  - **engine**?: *string*  
    The editor engine to use, see [foundry.applications.ux.TextEditor.create](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#create). Default: `"tinymce"`.  
  - **target**?: *string*  
    The named target data element  

#### Returns

*SafeString*

#### Example

```handlebars
{{editor world.description target="description" button=false engine="prosemirror" collaborate=false}}
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)