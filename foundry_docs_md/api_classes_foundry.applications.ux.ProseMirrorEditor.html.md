# ProseMirrorEditor | Foundry Virtual Tabletop - API Documentation - Version 13

A class responsible for managing state and collaborative editing of a single ProseMirror instance.

## Constructors

### constructor

```typescript
new ProseMirrorEditor(
    uuid: string,
    view: EditorView,
    isDirtyPlugin: Plugin,
    collaborate: boolean,
    options?: { document?: any },
): ProseMirrorEditor
```

**Parameters**

- **uuid**: `string`  
  A string that uniquely identifies this ProseMirror instance.

- **view**: `EditorView`  
  The ProseMirror EditorView.

- **isDirtyPlugin**: `Plugin`  
  The plugin to track the dirty state of the editor.

- **collaborate**: `boolean`  
  Whether this is a collaborative editor.

- **options?**: `{ document?: any } = {}`  
  Additional options.

  - **document?**: `any`  
    A document associated with this editor.

**Returns**  
`ProseMirrorEditor`

## Methods

### destroy

```typescript
destroy(): void
```

Retire this editor instance and clean up.

**Returns**  
`void`

### isDirty

```typescript
isDirty(): boolean
```

Have the contents of the editor been edited by the user?

**Returns**  
`boolean`

### _disableSourceCodeEditing (Protected)

```typescript
_disableSourceCodeEditing(): void
```

Disable source code editing if the user was editing it when new steps arrived.

**Returns**  
`void`

### _handleAutosave (Protected)

```typescript
_handleAutosave(html: string): void
```

Handle an autosave update for an already-open editor.

**Parameters**

- **html**: `string`  
  The updated editor contents.

**Returns**  
`void`

### _onNewSteps (Protected)

```typescript
_onNewSteps(offset: string, history: ProseMirrorHistory[]): void
```

Handle new editing steps supplied by the server.

**Parameters**

- **offset**: `string`  
  The offset into the history, representing the point at which it was last truncated.

- **history**: `ProseMirrorHistory[]`  
  The entire edit history.

**Returns**  
`void`

### _resync (Protected)

```typescript
_resync(): void
```

The state of this ProseMirror editor has fallen too far behind the central authority's and must be re-synced.

**Returns**  
`void`

### _updateUserDisplay (Protected)

```typescript
_updateUserDisplay(users: string[]): void
```

Handle users joining or leaving collaborative editing.

**Parameters**

- **users**: `string[]`  
  The IDs of users currently editing (including ourselves).

**Returns**  
`void`

### create (Static)

```typescript
create(
    target: HTMLElement,
    content?: string,
    options?: {
        collaborate?: boolean;
        document?: any;
        fieldName?: string;
        plugins?: Record<string, Plugin>;
        props?: object;
        relativeLinks?: boolean;
        uuid?: string;
    },
): Promise<ProseMirrorEditor>
```

Create a ProseMirror editor instance.

**Parameters**

- **target**: `HTMLElement`  
  An HTML element to mount the editor to.

- **content?**: `string = ""`  
  Content to populate the editor with.

- **options?**:  
  Additional options to configure the ProseMirror instance.

  - **collaborate?**: `boolean`  
    Whether collaborative editing enabled.

  - **document?**: `any`  
    A Document whose content is being edited. Required for collaborative editing and relative UUID generation.

  - **fieldName?**: `string`  
    The field within the Document that is being edited. Required for collaborative editing.

  - **plugins?**: `Record<string, Plugin>`  
    Plugins to include with the editor.

  - **props?**: `object`  
    Additional ProseMirror editor properties.

  - **relativeLinks?**: `boolean`  
    Whether to generate relative UUID links to Documents that are dropped on the editor.

  - **uuid?**: `string`  
    A string to uniquely identify this ProseMirror instance. Ignored for a collaborative editor.

**Returns**  
`Promise<ProseMirrorEditor>`

### _createCollaborativeEditorView (Protected Static)

```typescript
_createCollaborativeEditorView(
    uuid: string,
    target: HTMLElement,
    state: EditorState,
    plugins: Plugin[],
    props: object,
): Promise<EditorView>
```

Create an EditorView with collaborative editing enabled.

**Parameters**

- **uuid**: `string`  
  The ProseMirror instance UUID.

- **target**: `HTMLElement`  
  An HTML element to mount the editor view to.

- **state**: `EditorState`  
  The ProseMirror editor state.

- **plugins**: `Plugin[]`  
  The ProseMirror editor plugins to load.

- **props**: `object`  
  Additional ProseMirror editor properties.

**Returns**  
`Promise<EditorView>`

### _createLocalEditorView (Protected Static)

```typescript
_createLocalEditorView(
    target: HTMLElement,
    state: EditorState,
    plugins: Plugin[],
    props: object,
): EditorView
```

Create a plain EditorView without collaborative editing.

**Parameters**

- **target**: `HTMLElement`  
  An HTML element to mount the editor view to.

- **state**: `EditorState`  
  The ProseMirror editor state.

- **plugins**: `Plugin[]`  
  The ProseMirror editor plugins to load.

- **props**: `object`  
  Additional ProseMirror editor properties.

**Returns**  
`EditorView`

### _onAutosave (Protected Static)

```typescript
_onAutosave(uuid: string, html: string): Promise<void>
```

Update client state when the editor contents are autosaved server-side.

**Parameters**

- **uuid**: `string`  
  The UUID that uniquely identifies the ProseMirror instance.

- **html**: `string`  
  The updated editor contents.

**Returns**  
`Promise<void>`

### _onNewSteps (Protected Static)

```typescript
_onNewSteps(uuid: string, offset: number, history: ProseMirrorHistory[]): void
```

Handle new editing steps supplied by the server.

**Parameters**

- **uuid**: `string`  
  The UUID that uniquely identifies the ProseMirror instance.

- **offset**: `number`  
  The offset into the history, representing the point at which it was last truncated.

- **history**: `ProseMirrorHistory[]`  
  The entire edit history.

**Returns**  
`void`

### _onResync (Protected Static)

```typescript
_onResync(uuid: string): void
```

Our client is too far behind the central authority's state and must be re-synced.

**Parameters**

- **uuid**: `string`  
  The UUID that uniquely identifies the ProseMirror instance.

**Returns**  
`void`

### _onUsersEditing (Protected Static)

```typescript
_onUsersEditing(uuid: string, users: string[]): void
```

Handle users joining or leaving collaborative editing.

**Parameters**

- **uuid**: `string`  
  The UUID that uniquely identifies the ProseMirror instance.

- **users**: `string[]`  
  The IDs of the users editing (including ourselves).

**Returns**  
`void`

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.applications.ux.ProseMirrorEditor.html).