# UserData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface UserData {
  _id: null | string;
  _stats: DocumentStats;
  avatar?: null | string;
  character?: ActorData;
  color: string;
  flags: DocumentFlags;
  hotbar: object;
  name: string;
  password?: string;
  passwordSalt?: string;
  permissions: object;
  role: number;
}
```

## Properties

### _id

_type_: `null | string`  
The _id which uniquely identifies this User document.

### _stats

_type_: [`DocumentStats`](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
An object of creation and access information.

### avatar (optional)

_type_: `null | string`  
The user's avatar image.

### character (optional)

_type_: [`ActorData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.ActorData.html)  
A linked Actor document that is this user's impersonated character.

### color

_type_: `string`  
A color to represent this user.

### flags

_type_: [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
An object of optional key/value flags.

### hotbar

_type_: `object`  
A mapping of hotbar slot number to Macro id for the user.

### name

_type_: `string`  
The user's name.

### password (optional)

_type_: `string`  
The user's password. Available only on the Server side for security.

### passwordSalt (optional)

_type_: `string`  
The user's password salt. Available only on the Server side for security.

### permissions

_type_: `object`  
The user's individual permission configuration, see CONST.USER_PERMISSIONS.

### role

_type_: `number`  
The user's role, see CONST.USER_ROLES.