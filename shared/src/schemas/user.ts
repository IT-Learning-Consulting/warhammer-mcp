// Phase 11 mcp_crud_expansion — User umbrella shared schemas.
//
// 9 actions in a single discriminated union: list, get, update, set-role,
// hotbar-list, hotbar-assign, hotbar-clear, flag-set, flag-clear.
//
// Live-Foundry probes (.agents/research/mcp_crud_expansion/phase11_probes.md):
//   - USER_ROLES = { NONE:0, PLAYER:1, TRUSTED:2, ASSISTANT:3, GAMEMASTER:4 }
//   - USER_PERMISSIONS has 24 keys and no DEFAULT_USER_PERMISSIONS constant
//   - User.schema.fields includes password + passwordSalt, but they remain out of scope
//   - User.hotbar is a sparse ObjectField keyed by slot strings with bare Macro._id values
//   - assignPermission writes explicit sparse overrides; clearing back to default requires deletion
//
// Anchors:
//   - DP-15: typed inputs and response interfaces.
//   - DP-20: numeric fields carry explicit integer semantics in the Zod schema.
//   - R11.2: update rejects role/password/passwordSalt at parse time by omitting them from the strict schema.

import { z } from 'zod';
import { UserId, ActorId, MacroId } from './branded-ids.js';

const HEX_COLOR = z.string().regex(/^#[0-9a-fA-F]{6}$/,
    'USER_INVALID_COLOR: color must be a 6-digit hex string such as #ff0000');

export const USER_ROLE_NAMES = [
    'NONE',
    'PLAYER',
    'TRUSTED',
    'ASSISTANT',
    'GAMEMASTER',
] as const;

export const USER_PERMISSION_KEYS = [
    'ACTOR_CREATE',
    'BROADCAST_AUDIO',
    'BROADCAST_VIDEO',
    'CARDS_CREATE',
    'DRAWING_CREATE',
    'ITEM_CREATE',
    'FILES_BROWSE',
    'FILES_UPLOAD',
    'JOURNAL_CREATE',
    'MACRO_SCRIPT',
    'MANUAL_ROLLS',
    'MESSAGE_WHISPER',
    'NOTE_CREATE',
    'PING_CANVAS',
    'PLAYLIST_CREATE',
    'SETTINGS_MODIFY',
    'SHOW_CURSOR',
    'SHOW_RULER',
    'TEMPLATE_CREATE',
    'TOKEN_CREATE',
    'TOKEN_DELETE',
    'TOKEN_CONFIGURE',
    'WALL_DOORS',
    'QUERY_USER',
] as const;

export const UserRoleName = z.enum(USER_ROLE_NAMES);
export const UserPermissionKey = z.enum(USER_PERMISSION_KEYS);

export type UserRoleNameType = z.infer<typeof UserRoleName>;
export type UserPermissionKeyType = z.infer<typeof UserPermissionKey>;

const JsonValue: z.ZodType<JsonValueType> = z.lazy(() =>
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(JsonValue),
        z.record(JsonValue),
    ]),
);

const UserPermissionsDelta = z.record(z.boolean()).superRefine((value, ctx) => {
    for (const key of Object.keys(value)) {
        if (!(USER_PERMISSION_KEYS as readonly string[]).includes(key)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `USER_UNKNOWN_PERMISSION_KEY: ${key}`,
                path: [key],
            });
        }
    }
});

const FlagScope = z.string().min(1).regex(/^(?!core$)[A-Za-z0-9][A-Za-z0-9-_]*$/,
    'USER_FLAG_SCOPE_FORBIDDEN: scope must be a non-core namespace such as world or a module id');

const UpdateUserPayload = z.object({
    name: z.string().min(1).optional(),
    color: HEX_COLOR.optional(),
    avatar: z.string().min(1).nullable().optional(),
    pronouns: z.string().min(1).optional(),
    character: ActorId.nullable().optional(),
    permissions: UserPermissionsDelta.optional(),
}).strict();

export const ListUsersInput = z.object({
    action: z.literal('list'),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
    nameFilter: z.string().min(1).optional(),
    roleFilter: UserRoleName.optional(),
});

export const GetUserInput = z.object({
    action: z.literal('get'),
    userId: UserId,
    includeHotbar: z.boolean().default(false),
});

export const UpdateUserInput = z.object({
    action: z.literal('update'),
    userId: UserId,
}).merge(UpdateUserPayload);

export const SetUserRoleInput = z.object({
    action: z.literal('set-role'),
    userId: UserId,
    role: UserRoleName,
});

export const UserHotbarListInput = z.object({
    action: z.literal('hotbar-list'),
    userId: UserId,
});

export const UserHotbarAssignInput = z.object({
    action: z.literal('hotbar-assign'),
    userId: UserId,
    slot: z.number().int().min(1).max(50),
    macroId: MacroId,
});

export const UserHotbarClearInput = z.object({
    action: z.literal('hotbar-clear'),
    userId: UserId,
    slot: z.number().int().min(1).max(50),
});

// PARITY-COVERAGE-EXEMPT:value — `value` is wired into user.ts inputSchema via
// a JSON_VALUE_INPUT_SCHEMA variable reference (line 229); the check-tool-
// contract-parity heuristic only detects inline {...} blocks. Phase 10 fixed
// the script's latent `toolFile is not defined` crash bug which surfaced this
// pre-existing parity gap. Re-inline JSON_VALUE_INPUT_SCHEMA at user.ts:229
// in a future hygiene pass to remove this exemption.
export const UserFlagSetInput = z.object({
    action: z.literal('flag-set'),
    userId: UserId,
    scope: FlagScope,
    key: z.string().min(1),
    value: JsonValue,
});

export const UserFlagClearInput = z.object({
    action: z.literal('flag-clear'),
    userId: UserId,
    scope: FlagScope,
    key: z.string().min(1),
});

export const UserToolInput = z.discriminatedUnion('action', [
    ListUsersInput,
    GetUserInput,
    UpdateUserInput,
    SetUserRoleInput,
    UserHotbarListInput,
    UserHotbarAssignInput,
    UserHotbarClearInput,
    UserFlagSetInput,
    UserFlagClearInput,
]);

export type ListUsersInputType = z.infer<typeof ListUsersInput>;
export type GetUserInputType = z.infer<typeof GetUserInput>;
export type UpdateUserInputType = z.infer<typeof UpdateUserInput>;
export type SetUserRoleInputType = z.infer<typeof SetUserRoleInput>;
export type UserHotbarListInputType = z.infer<typeof UserHotbarListInput>;
export type UserHotbarAssignInputType = z.infer<typeof UserHotbarAssignInput>;
export type UserHotbarClearInputType = z.infer<typeof UserHotbarClearInput>;
export type UserFlagSetInputType = z.infer<typeof UserFlagSetInput>;
export type UserFlagClearInputType = z.infer<typeof UserFlagClearInput>;
export type UserToolInputType = z.infer<typeof UserToolInput>;

export type JsonValueType =
    | string
    | number
    | boolean
    | null
    | JsonValueType[]
    | { [key: string]: JsonValueType };

export interface UserListItem {
    id: string;
    name: string;
    role: UserRoleNameType;
    active: boolean;
    color: string;
    characterId: string | null;
    hotbarSlotsUsed: number;
    viewedSceneId: string | null;
    isGM: boolean;
    isBanned: boolean;
}

export interface UserHotbarSlotView {
    slot: number;
    macroId: string;
    macroName: string | null;
    isOrphan: boolean;
}

export interface UserViewModel {
    id: string;
    name: string;
    role: UserRoleNameType;
    active: boolean;
    viewedSceneId: string | null;
    color: string;
    avatar: string | null;
    pronouns: string;
    characterId: string | null;
    hotbarSlotsUsed: number;
    permissions: Partial<Record<UserPermissionKeyType, boolean>>;
    flags: Record<string, unknown>;
    isGM: boolean;
    isBanned: boolean;
}

export interface UserListResponse {
    total: number;
    limit: number;
    offset: number;
    items: UserListItem[];
}

export interface UserGetResponse {
    user: UserViewModel;
    hotbar: Record<string, string> | null;
}

export interface UserUpdateResponse {
    userId: string;
    user: UserViewModel;
    changedFields: string[];
    requestedChanges: Record<string, unknown>;
}

export interface UserSetRoleResponse {
    userId: string;
    previousRole: UserRoleNameType;
    role: UserRoleNameType;
    reloadRequired: true;
    user: UserViewModel;
}

export interface UserHotbarListResponse {
    userId: string;
    occupiedSlotCount: number;
    slots: UserHotbarSlotView[];
    orphanSlots: number[];
}

export interface UserHotbarAssignResponse {
    userId: string;
    slot: number;
    macroId: string;
    macroName: string | null;
    assigned: true;
    overwrote: boolean;
    previousMacroId: string | null;
}

export interface UserHotbarClearResponse {
    userId: string;
    slot: number;
    cleared: boolean;
    alreadyEmpty: boolean;
    previousMacroId: string | null;
}

export interface UserFlagSetResponse {
    userId: string;
    scope: string;
    key: string;
    value: JsonValueType;
    set: true;
}

export interface UserFlagClearResponse {
    userId: string;
    scope: string;
    key: string;
    cleared: boolean;
}