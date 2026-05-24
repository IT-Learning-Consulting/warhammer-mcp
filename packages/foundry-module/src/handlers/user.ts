import { z } from 'zod';
import {
    UserRoleName,
    USER_ROLE_NAMES,
    UserToolInput,
    type GetUserInputType,
    type ListUsersInputType,
    type SetUserRoleInputType,
    type UpdateUserInputType,
    type UserFlagClearInputType,
    type UserFlagSetInputType,
    type UserHotbarAssignInputType,
    type UserHotbarClearInputType,
    type UserHotbarListInputType,
    type UserGetResponse,
    type UserHotbarAssignResponse,
    type UserHotbarClearResponse,
    type UserHotbarListResponse,
    type UserHotbarSlotView,
    type UserListItem,
    type UserListResponse,
    type UserRoleNameType,
    type UserSetRoleResponse,
    type UserToolInputType,
    type UserUpdateResponse,
    type UserViewModel,
    type UserFlagSetResponse,
    type UserFlagClearResponse,
} from '@foundry-mcp/shared';
import { wrappedWrite } from '../transaction-manager.js';
import { notify } from '../notify.js';
import {
    createFlatWorldDocCRUDHandlers,
    type Envelope,
} from '../utils/flatWorldCRUDFactory.js';

const USER_DENY = (message: string) => `FORBIDDEN: ${message}`;

const SELF_WRITABLE_UPDATE_FIELDS = new Set(['avatar', 'character', 'color', 'pronouns']);

const ROLE_VALUE_BY_NAME: Record<UserRoleNameType, number> = {
    NONE: 0,
    PLAYER: 1,
    TRUSTED: 2,
    ASSISTANT: 3,
    GAMEMASTER: 4,
};

// UserToolInputInternal mirrors the public UserToolInput from shared/src/schemas/user.ts but
// strips create/delete actions so the factory's internal contract matches what dispatchUser
// actually allows. Any new field added to the shared schema must be mirrored here manually.
const UserCreateInputInternal = z.object({
    action: z.literal('create'),
}).strict();

const UserDeleteInputInternal = z.object({
    action: z.literal('delete'),
    userId: z.string().min(1),
    confirm: z.literal(true),
}).strict();

const UserGetInputInternal = z.object({
    action: z.literal('get'),
    userId: z.string().min(1),
}).strict();

const UserListInputInternal = z.object({
    action: z.literal('list'),
    nameFilter: z.string().min(1).optional(),
    roleFilter: UserRoleName.optional(),
}).strict();

const UserUpdateInputInternal = z.object({
    action: z.literal('update'),
    userId: z.string().min(1),
    changes: z.record(z.unknown()),
}).strict();

const UserToolInputInternal = z.discriminatedUnion('action', [
    UserCreateInputInternal,
    UserDeleteInputInternal,
    UserGetInputInternal,
    UserListInputInternal,
    UserUpdateInputInternal,
]);

function cloneValue<T>(value: T): T {
    return foundry.utils.deepClone(value);
}

function roleNameFor(user: any): UserRoleNameType {
    const roleValue = Number(user?._source?.role ?? user?.role ?? 0);
    return USER_ROLE_NAMES[roleValue] ?? 'NONE';
}

function rawHotbar(user: any): Record<string, string> {
    return cloneValue(
        (user?._source?.hotbar as Record<string, string> | undefined)
        ?? (user?.hotbar as Record<string, string> | undefined)
        ?? {},
    );
}

function rawPermissions(user: any): Record<string, boolean> {
    return cloneValue(
        (user?._source?.permissions as Record<string, boolean> | undefined)
        ?? (user?.permissions as Record<string, boolean> | undefined)
        ?? {},
    );
}

function rawFlags(user: any): Record<string, unknown> {
    return cloneValue(
        (user?._source?.flags as Record<string, unknown> | undefined)
        ?? (user?.flags as Record<string, unknown> | undefined)
        ?? {},
    );
}

function serializeUserViewModel(user: any): UserViewModel {
    const hotbar = rawHotbar(user);
    return {
        id: user.id as string,
        name: (user._source?.name as string) ?? (user.name as string) ?? '',
        role: roleNameFor(user),
        active: Boolean(user.active),
        viewedSceneId: (user.viewedScene as string | null | undefined) ?? null,
        color: (user._source?.color as string) ?? (user.color as string) ?? '#000000',
        avatar: (user._source?.avatar as string | null | undefined) ?? null,
        pronouns: (user._source?.pronouns as string | undefined) ?? '',
        characterId: (user._source?.character as string | null | undefined) ?? null,
        hotbarSlotsUsed: Object.keys(hotbar).length,
        permissions: rawPermissions(user),
        flags: rawFlags(user),
        isGM: Boolean(user.isGM),
        isBanned: roleNameFor(user) === 'NONE',
    };
}

function serializeUserListItem(user: any): UserListItem {
    const hotbar = rawHotbar(user);
    return {
        id: user.id as string,
        name: (user._source?.name as string) ?? (user.name as string) ?? '',
        role: roleNameFor(user),
        active: Boolean(user.active),
        color: (user._source?.color as string) ?? (user.color as string) ?? '#000000',
        characterId: (user._source?.character as string | null | undefined) ?? null,
        hotbarSlotsUsed: Object.keys(hotbar).length,
        viewedSceneId: (user.viewedScene as string | null | undefined) ?? null,
        isGM: Boolean(user.isGM),
        isBanned: roleNameFor(user) === 'NONE',
    };
}

function applyUserListFilters(input: { nameFilter?: string; roleFilter?: UserRoleNameType }, items: any[]): any[] {
    let filtered = items;
    if (input.nameFilter) {
        const needle = input.nameFilter.toLowerCase();
        filtered = filtered.filter((user) => {
            const name = ((user._source?.name as string) ?? (user.name as string) ?? '').toLowerCase();
            return name.includes(needle);
        });
    }
    if (input.roleFilter) {
        filtered = filtered.filter((user) => roleNameFor(user) === input.roleFilter);
    }
    return filtered;
}

function resolveTargetUser(userId: string): any {
    const user = game.users?.get(userId);
    if (!user) {
        throw new Error(`USER_NOT_FOUND: no user with id "${userId}"`);
    }
    return user;
}

function ensureGM(operation: string): string | null {
    return game.user?.isGM ? null : USER_DENY(`${operation} requires GM`);
}

function ensureGMOrSelf(targetUserId: string, operation: string): string | null {
    if (game.user?.isGM || game.user?.id === targetUserId) {
        return null;
    }
    return USER_DENY(`${operation} requires GM or the target user's own session`);
}

function buildUpdateChanges(input: UpdateUserInputType): Record<string, unknown> {
    const changes: Record<string, unknown> = {};

    if (input.name !== undefined) changes.name = input.name;
    if (input.color !== undefined) changes.color = input.color;
    if (input.avatar !== undefined) changes.avatar = input.avatar;
    if (input.pronouns !== undefined) changes.pronouns = input.pronouns;
    if (input.character !== undefined) changes.character = input.character;
    if (input.permissions && Object.keys(input.permissions).length > 0) {
        changes.permissions = cloneValue(input.permissions);
    }

    return changes;
}

function validateSelfUpdateChanges(targetUserId: string, changes: Record<string, unknown>): string | null {
    if (game.user?.isGM) return null;
    if (game.user?.id !== targetUserId) {
        return USER_DENY('updating another user requires GM');
    }

    const denied = Object.keys(changes).filter((field) => !SELF_WRITABLE_UPDATE_FIELDS.has(field));
    if (denied.length > 0) {
        return USER_DENY(
            `self-update may only change avatar, character, color, or pronouns; denied fields: ${denied.join(', ')}`,
        );
    }
    return null;
}

function validateCharacterTarget(actorId: string | null | undefined): string | null {
    if (actorId === undefined || actorId === null) return null;
    return game.actors?.get(actorId)
        ? null
        : `ACTOR_NOT_FOUND: no actor with id "${actorId}"`;
}

function verifyScalarFieldsPersisted(userId: string, changes: Record<string, unknown>): any {
    const persisted = resolveTargetUser(userId);
    for (const [field, requestedValue] of Object.entries(changes)) {
        const persistedValue = (persisted._source as Record<string, unknown> | undefined)?.[field];
        if (JSON.stringify(persistedValue) !== JSON.stringify(requestedValue)) {
            throw new Error(
                `USER_WRITE_NOT_PERSISTED: field "${field}" expected ${JSON.stringify(requestedValue)} but found ${JSON.stringify(persistedValue)}`,
            );
        }
    }
    return persisted;
}

function flagExists(user: any, scope: string, key: string): boolean {
    const scopeFlags = (user?._source?.flags as Record<string, Record<string, unknown>> | undefined)?.[scope];
    return Object.prototype.hasOwnProperty.call(scopeFlags ?? {}, key);
}

function getFlagValue(user: any, scope: string, key: string): unknown {
    const scopeFlags = (user?._source?.flags as Record<string, Record<string, unknown>> | undefined)?.[scope] ?? {};
    return cloneValue(scopeFlags[key]);
}

function buildHotbarList(user: any): { occupiedSlotCount: number; orphanSlots: number[]; slots: UserHotbarSlotView[] } {
    const hotbar = rawHotbar(user);
    const slots = Object.entries(hotbar)
        .map(([slotKey, macroId]) => {
            const slot = Number(slotKey);
            const macro = game.macros?.get(macroId) ?? null;
            return {
                slot,
                macroId,
                macroName: (macro?.name as string | undefined) ?? null,
                isOrphan: macro === null,
            } satisfies UserHotbarSlotView;
        })
        .sort((left, right) => left.slot - right.slot);

    return {
        occupiedSlotCount: slots.length,
        orphanSlots: slots.filter((slot) => slot.isOrphan).map((slot) => slot.slot),
        slots,
    };
}

const userFactoryHandlers = createFlatWorldDocCRUDHandlers<
    { action: 'create' },
    { action: 'update'; userId: string; changes: Record<string, unknown> },
    UserViewModel,
    UserListItem
>({
    documentName: 'User',
    documentLabel: 'user',
    collectionKey: 'users',
    idField: 'userId',
    gmGateReads: false,
    schemas: {
        create: UserCreateInputInternal,
        update: UserUpdateInputInternal,
        delete: UserDeleteInputInternal,
        get: UserGetInputInternal,
        list: UserListInputInternal,
        toolInput: UserToolInputInternal,
    },
    dp16SkipFields: ['permissions'],
    formatter: serializeUserViewModel,
    listItemFormatter: serializeUserListItem,
    applyListFilters: applyUserListFilters,
    isFilterApplied: (input) => Boolean(input.nameFilter || input.roleFilter),
    responseKeys: {
        viewModel: 'user',
        listArray: 'users',
        remainingCount: 'remainingCount',
    },
    notifyKind: 'user',
    formatNotifyTitle: (user) => `User "${user?._source?.name ?? user?.name ?? '(unnamed)'}"`,
    formatNotifySummary: (input) => {
        if (input.action === 'update') {
            return Object.keys((input.changes as Record<string, unknown> | undefined) ?? {}).join(', ') || 'user';
        }
        return 'user';
    },
});

export async function listUsers(input: ListUsersInputType): Promise<Envelope<UserListResponse>> {
    const denied = ensureGM('listing users');
    if (denied) return { success: false, error: denied };

    const result = await userFactoryHandlers.list({
        action: 'list',
        nameFilter: input.nameFilter,
        roleFilter: input.roleFilter,
    });
    if (!result.success) return result;

    const items = (((result.data as { users?: UserListItem[] }).users) ?? []) as UserListItem[];
    return {
        success: true,
        data: {
            total: items.length,
            limit: input.limit,
            offset: input.offset,
            items: items.slice(input.offset, input.offset + input.limit),
        },
    };
}

export async function getUser(input: GetUserInputType): Promise<Envelope<UserGetResponse>> {
    const denied = ensureGMOrSelf(input.userId, 'reading a user');
    if (denied) return { success: false, error: denied };

    const targetUser = resolveTargetUser(input.userId);
    const result = await userFactoryHandlers.get({ action: 'get', userId: input.userId });
    if (!result.success) return result;

    return {
        success: true,
        data: {
            user: (result.data as { user: UserViewModel }).user,
            hotbar: input.includeHotbar ? rawHotbar(targetUser) : null,
        },
    };
}

export async function updateUser(input: UpdateUserInputType): Promise<Envelope<UserUpdateResponse>> {
    const changes = buildUpdateChanges(input);
    if (Object.keys(changes).length === 0) {
        return { success: false, error: 'USER_EMPTY_PAYLOAD: update requires at least one writable field' };
    }

    const characterError = validateCharacterTarget(changes.character as string | null | undefined);
    if (characterError) return { success: false, error: characterError };

    const targetUser = resolveTargetUser(input.userId);
    const denied = validateSelfUpdateChanges(input.userId, changes);
    if (denied) return { success: false, error: denied };

    if (game.user?.isGM) {
        const result = await userFactoryHandlers.update({
            action: 'update',
            userId: input.userId,
            changes,
        });
        if (!result.success) return result;

        // PARITY-010: compensating verify for permissions (skipped by factory dp16SkipFields).
        // Sparse-delta: compare only requested keys via _source (F08-safe; derived getter
        // applies role defaults that would false-positive on a full-object compare).
        if (changes.permissions && typeof changes.permissions === 'object') {
            const freshUser = resolveTargetUser(input.userId);
            const freshPerms = (freshUser._source as any)?.permissions ?? {};
            for (const [key, expected] of Object.entries(changes.permissions as Record<string, unknown>)) {
                const actual = freshPerms[key] ?? false;
                if (actual !== expected) {
                    throw new Error(
                        `USER_WRITE_NOT_PERSISTED: permissions[${JSON.stringify(key)}] expected ${JSON.stringify(expected)} but found ${JSON.stringify(actual)}`,
                    );
                }
            }
        }

        const payload = result.data as {
            user: UserViewModel;
            changedFields: string[];
            requestedChanges: Record<string, unknown>;
        };
        return {
            success: true,
            data: {
                userId: input.userId,
                user: payload.user,
                changedFields: payload.changedFields,
                requestedChanges: payload.requestedChanges,
            },
        };
    }

    return wrappedWrite('user.updateUserSelf', async () => {
        await targetUser.update(changes);
        const persisted = verifyScalarFieldsPersisted(input.userId, changes);
        const changedFields = Object.keys(changes);

        notify.updated('user', `User "${persisted.name ?? input.userId}"`, {
            summary: changedFields.join(', '),
        });

        return {
            success: true as const,
            data: {
                userId: input.userId,
                user: serializeUserViewModel(persisted),
                changedFields,
                requestedChanges: cloneValue(changes),
            },
        };
    });
}

export async function setUserRole(input: SetUserRoleInputType): Promise<Envelope<UserSetRoleResponse>> {
    const denied = ensureGM('setting a user role');
    if (denied) return { success: false, error: denied };

    const targetUser = resolveTargetUser(input.userId);
    const previousRole = roleNameFor(targetUser);
    const nextRoleValue = ROLE_VALUE_BY_NAME[input.role];
    const previousRoleValue = ROLE_VALUE_BY_NAME[previousRole];

    if (game.user?.id === input.userId && nextRoleValue < previousRoleValue) {
        return {
            success: false,
            error: `SELF_DEMOTION_FORBIDDEN: refusing to demote the current session from ${previousRole} to ${input.role}`,
        };
    }

    return wrappedWrite('user.setUserRole', async () => {
        await targetUser.update({ role: nextRoleValue });
        const persisted = resolveTargetUser(input.userId);
        const persistedRoleValue = Number((persisted._source as Record<string, unknown> | undefined)?.role ?? persisted.role ?? -1);
        if (persistedRoleValue !== nextRoleValue) {
            throw new Error(
                `USER_WRITE_NOT_PERSISTED: role expected ${nextRoleValue} but found ${persistedRoleValue}`,
            );
        }

        notify.updated('user', `User "${persisted.name ?? input.userId}"`, {
            summary: `role ${previousRole} -> ${input.role}; reload required`,
        });

        return {
            success: true as const,
            data: {
                userId: input.userId,
                previousRole,
                role: input.role,
                reloadRequired: true,
                user: serializeUserViewModel(persisted),
            },
        };
    });
}

export async function hotbarList(input: UserHotbarListInputType): Promise<Envelope<UserHotbarListResponse>> {
    const denied = ensureGMOrSelf(input.userId, 'listing a user hotbar');
    if (denied) return { success: false, error: denied };

    const targetUser = resolveTargetUser(input.userId);
    const hotbar = buildHotbarList(targetUser);
    return {
        success: true,
        data: {
            userId: input.userId,
            occupiedSlotCount: hotbar.occupiedSlotCount,
            slots: hotbar.slots,
            orphanSlots: hotbar.orphanSlots,
        },
    };
}

export async function hotbarAssign(input: UserHotbarAssignInputType): Promise<Envelope<UserHotbarAssignResponse>> {
    const denied = ensureGMOrSelf(input.userId, 'assigning a hotbar slot');
    if (denied) return { success: false, error: denied };

    const targetUser = resolveTargetUser(input.userId);
    const macro = game.macros?.get(input.macroId) ?? null;
    if (!macro) {
        return { success: false, error: `MACRO_NOT_FOUND: no macro with id "${input.macroId}"` };
    }

    const currentHotbar = rawHotbar(targetUser);
    const previousMacroId = currentHotbar[String(input.slot)] ?? null;

    return wrappedWrite('user.hotbarAssign', async () => {
        await targetUser.assignHotbarMacro(macro, input.slot);
        const persisted = resolveTargetUser(input.userId);
        const persistedHotbar = rawHotbar(persisted);
        if (persistedHotbar[String(input.slot)] !== input.macroId) {
            throw new Error(
                `USER_WRITE_NOT_PERSISTED: hotbar slot ${input.slot} expected ${input.macroId} but found ${JSON.stringify(persistedHotbar[String(input.slot)] ?? null)}`,
            );
        }

        notify.updated('user', `User "${persisted.name ?? input.userId}"`, {
            summary: `hotbar slot ${input.slot} -> ${macro.name ?? input.macroId}`,
        });

        return {
            success: true as const,
            data: {
                userId: input.userId,
                slot: input.slot,
                macroId: input.macroId,
                macroName: (macro.name as string | undefined) ?? null,
                assigned: true,
                overwrote: previousMacroId !== null && previousMacroId !== input.macroId,
                previousMacroId,
            },
        };
    });
}

export async function hotbarClear(input: UserHotbarClearInputType): Promise<Envelope<UserHotbarClearResponse>> {
    const denied = ensureGMOrSelf(input.userId, 'clearing a hotbar slot');
    if (denied) return { success: false, error: denied };

    const targetUser = resolveTargetUser(input.userId);
    const currentHotbar = rawHotbar(targetUser);
    const previousMacroId = currentHotbar[String(input.slot)] ?? null;

    if (previousMacroId === null) {
        return {
            success: true,
            data: {
                userId: input.userId,
                slot: input.slot,
                cleared: false,
                alreadyEmpty: true,
                previousMacroId: null,
            },
        };
    }

    return wrappedWrite('user.hotbarClear', async () => {
        await targetUser.assignHotbarMacro(null, input.slot);
        const persisted = resolveTargetUser(input.userId);
        const persistedHotbar = rawHotbar(persisted);
        if (Object.prototype.hasOwnProperty.call(persistedHotbar, String(input.slot))) {
            throw new Error(`USER_WRITE_NOT_PERSISTED: hotbar slot ${input.slot} still present after clear`);
        }

        notify.updated('user', `User "${persisted.name ?? input.userId}"`, {
            summary: `cleared hotbar slot ${input.slot}`,
        });

        return {
            success: true as const,
            data: {
                userId: input.userId,
                slot: input.slot,
                cleared: true,
                alreadyEmpty: false,
                previousMacroId,
            },
        };
    });
}

export async function flagSet(input: UserFlagSetInputType): Promise<Envelope<UserFlagSetResponse>> {
    const denied = ensureGMOrSelf(input.userId, 'setting a user flag');
    if (denied) return { success: false, error: denied };

    const targetUser = resolveTargetUser(input.userId);
    return wrappedWrite('user.flagSet', async () => {
        await targetUser.setFlag(input.scope, input.key, input.value);
        const persisted = resolveTargetUser(input.userId);
        const persistedValue = getFlagValue(persisted, input.scope, input.key);
        if (JSON.stringify(persistedValue) !== JSON.stringify(input.value)) {
            throw new Error(
                `USER_WRITE_NOT_PERSISTED: flag ${input.scope}.${input.key} expected ${JSON.stringify(input.value)} but found ${JSON.stringify(persistedValue)}`,
            );
        }

        notify.updated('user', `User "${persisted.name ?? input.userId}"`, {
            summary: `flag ${input.scope}.${input.key} set`,
        });

        return {
            success: true as const,
            data: {
                userId: input.userId,
                scope: input.scope,
                key: input.key,
                value: cloneValue(input.value),
                set: true,
            },
        };
    });
}

export async function flagClear(input: UserFlagClearInputType): Promise<Envelope<UserFlagClearResponse>> {
    const denied = ensureGMOrSelf(input.userId, 'clearing a user flag');
    if (denied) return { success: false, error: denied };

    const targetUser = resolveTargetUser(input.userId);
    const existed = flagExists(targetUser, input.scope, input.key);

    if (!existed) {
        return {
            success: true,
            data: {
                userId: input.userId,
                scope: input.scope,
                key: input.key,
                cleared: false,
            },
        };
    }

    return wrappedWrite('user.flagClear', async () => {
        await targetUser.unsetFlag(input.scope, input.key);
        const persisted = resolveTargetUser(input.userId);
        if (flagExists(persisted, input.scope, input.key)) {
            throw new Error(`USER_WRITE_NOT_PERSISTED: flag ${input.scope}.${input.key} still present after clear`);
        }

        notify.updated('user', `User "${persisted.name ?? input.userId}"`, {
            summary: `flag ${input.scope}.${input.key} cleared`,
        });

        return {
            success: true as const,
            data: {
                userId: input.userId,
                scope: input.scope,
                key: input.key,
                cleared: true,
            },
        };
    });
}

export async function dispatchUser(data: unknown): Promise<any> {
    let input: UserToolInputType;
    try {
        input = UserToolInput.parse(data ?? {}) as UserToolInputType;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid input';
        throw new Error(`Invalid input: ${message}`);
    }

    switch (input.action) {
        case 'list':
            return listUsers(input);
        case 'get':
            return getUser(input);
        case 'update':
            return updateUser(input);
        case 'set-role':
            return setUserRole(input);
        case 'hotbar-list':
            return hotbarList(input);
        case 'hotbar-assign':
            return hotbarAssign(input);
        case 'hotbar-clear':
            return hotbarClear(input);
        case 'flag-set':
            return flagSet(input);
        case 'flag-clear':
            return flagClear(input);
        default:
            throw new Error(`Unknown user action: ${(input as UserToolInputType).action}`);
    }
}