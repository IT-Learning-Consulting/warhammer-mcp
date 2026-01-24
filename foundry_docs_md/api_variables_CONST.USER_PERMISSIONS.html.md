# USER_PERMISSIONS | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
readonly USER_PERMISSIONS: {
    ACTOR_CREATE: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.ActorCreateHint";
        label: "PERMISSION.ActorCreate";
    };
    BROADCAST_AUDIO: {
        defaultRole: 2;
        disableGM: true;
        hint: "PERMISSION.BroadcastAudioHint";
        label: "PERMISSION.BroadcastAudio";
    };
    BROADCAST_VIDEO: {
        defaultRole: 2;
        disableGM: true;
        hint: "PERMISSION.BroadcastVideoHint";
        label: "PERMISSION.BroadcastVideo";
    };
    CARDS_CREATE: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.CardsCreateHint";
        label: "PERMISSION.CardsCreate";
    };
    DRAWING_CREATE: {
        defaultRole: 2;
        disableGM: false;
        hint: "PERMISSION.DrawingCreateHint";
        label: "PERMISSION.DrawingCreate";
    };
    FILES_BROWSE: {
        defaultRole: 2;
        disableGM: false;
        hint: "PERMISSION.FilesBrowseHint";
        label: "PERMISSION.FilesBrowse";
    };
    FILES_UPLOAD: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.FilesUploadHint";
        label: "PERMISSION.FilesUpload";
    };
    ITEM_CREATE: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.ItemCreateHint";
        label: "PERMISSION.ItemCreate";
    };
    JOURNAL_CREATE: {
        defaultRole: 2;
        disableGM: false;
        hint: "PERMISSION.JournalCreateHint";
        label: "PERMISSION.JournalCreate";
    };
    MACRO_SCRIPT: {
        defaultRole: 1;
        disableGM: false;
        hint: "PERMISSION.MacroScriptHint";
        label: "PERMISSION.MacroScript";
    };
    MANUAL_ROLLS: {
        defaultRole: 2;
        disableGM: true;
        hint: "PERMISSION.ManualRollsHint";
        label: "PERMISSION.ManualRolls";
    };
    MESSAGE_WHISPER: {
        defaultRole: 1;
        disableGM: false;
        hint: "PERMISSION.MessageWhisperHint";
        label: "PERMISSION.MessageWhisper";
    };
    NOTE_CREATE: {
        defaultRole: 2;
        disableGM: false;
        hint: "PERMISSION.NoteCreateHint";
        label: "PERMISSION.NoteCreate";
    };
    PING_CANVAS: {
        defaultRole: 1;
        disableGM: true;
        hint: "PERMISSION.PingCanvasHint";
        label: "PERMISSION.PingCanvas";
    };
    PLAYLIST_CREATE: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.PlaylistCreateHint";
        label: "PERMISSION.PlaylistCreate";
    };
    QUERY_USER: {
        defaultRole: 1;
        disableGM: false;
        hint: "PERMISSION.QueryUserHint";
        label: "PERMISSION.QueryUser";
    };
    SETTINGS_MODIFY: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.SettingsModifyHint";
        label: "PERMISSION.SettingsModify";
    };
    SHOW_CURSOR: {
        defaultRole: 1;
        disableGM: true;
        hint: "PERMISSION.ShowCursorHint";
        label: "PERMISSION.ShowCursor";
    };
    SHOW_RULER: {
        defaultRole: 1;
        disableGM: true;
        hint: "PERMISSION.ShowRulerHint";
        label: "PERMISSION.ShowRuler";
    };
    TEMPLATE_CREATE: {
        defaultRole: 1;
        disableGM: false;
        hint: "PERMISSION.TemplateCreateHint";
        label: "PERMISSION.TemplateCreate";
    };
    TOKEN_CONFIGURE: {
        defaultRole: 2;
        disableGM: false;
        hint: "PERMISSION.TokenConfigureHint";
        label: "PERMISSION.TokenConfigure";
    };
    TOKEN_CREATE: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.TokenCreateHint";
        label: "PERMISSION.TokenCreate";
    };
    TOKEN_DELETE: {
        defaultRole: 3;
        disableGM: false;
        hint: "PERMISSION.TokenDeleteHint";
        label: "PERMISSION.TokenDelete";
    };
    WALL_DOORS: {
        defaultRole: 1;
        disableGM: false;
        hint: "PERMISSION.WallDoorsHint";
        label: "PERMISSION.WallDoors";
    };
} = ...
```

Define the recognized User capabilities which individual Users or role levels may be  
permitted to perform.

---

For more details, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html) or see the related sections:  
- [Modules](https://foundryvtt.com/api/modules.html)  
- [CONST](https://foundryvtt.com/api/modules/CONST.html)  
- [USER_PERMISSIONS](https://foundryvtt.com/api/variables/CONST.USER_PERMISSIONS.html)