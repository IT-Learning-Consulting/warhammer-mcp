import { z } from 'zod';
import {
    UserToolInput,
    type UserFlagClearResponse,
    type UserFlagSetResponse,
    type UserGetResponse,
    type UserHotbarAssignResponse,
    type UserHotbarClearResponse,
    type UserHotbarListResponse,
    type UserListItem,
    type UserListResponse,
    type UserSetRoleResponse,
    type UserToolInputType,
    type UserUpdateResponse,
    type UserViewModel,
} from '@foundry-mcp/shared';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

type UserArgs = z.infer<typeof UserToolInput>;
type ArgsFor<A extends UserArgs['action']> = Extract<UserArgs, { action: A }>;

const JSON_VALUE_INPUT_SCHEMA = {
    anyOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
        { type: 'object', additionalProperties: true },
        {
            type: 'array',
            items: {
                anyOf: [
                    { type: 'string' },
                    { type: 'number' },
                    { type: 'boolean' },
                    { type: 'object', additionalProperties: true },
                    { type: 'array', items: { type: 'string' } },
                    { type: 'null' },
                ],
            },
        },
        { type: 'null' },
    ],
    description: '[flag-set] JSON-serializable value to store.',
};

function formatUserListItem(user: UserListItem): string {
    return (
        `- \`${user.id}\` ${user.name}` +
        ` · role=${user.role}` +
        ` · active=${user.active ? 'yes' : 'no'}` +
        ` · color=${user.color}` +
        ` · character=${user.characterId ?? '_(none)_'}` +
        ` · hotbar=${user.hotbarSlotsUsed}` +
        ` · viewedScene=${user.viewedSceneId ?? '_(none)_'}`
    );
}

function formatHotbarMap(hotbar: Record<string, string> | null): string {
    if (!hotbar) return '_Hotbar not requested._';
    const entries = Object.entries(hotbar)
        .sort((left, right) => Number(left[0]) - Number(right[0]))
        .map(([slot, macroId]) => `- slot ${slot}: \`${macroId}\``);
    return entries.join('\n') || '_No assigned slots._';
}

function formatUserView(user: UserViewModel, hotbar: Record<string, string> | null): string {
    return [
        `## User \`${user.id}\` — ${user.name}`,
        ``,
        `### Identity`,
        `- role: ${user.role} · isGM: ${user.isGM ? 'yes' : 'no'} · banned: ${user.isBanned ? 'yes' : 'no'}`,
        `- active: ${user.active ? 'yes' : 'no'} · viewedScene: ${user.viewedSceneId ?? '_(none)_'}`,
        `- color: ${user.color} · avatar: ${user.avatar ?? '_(none)_'} · pronouns: ${user.pronouns || '_(none)_'} `,
        `- character: ${user.characterId ?? '_(none)_'} · hotbar slots used: ${user.hotbarSlotsUsed}`,
        ``,
        `### Flags / Permissions`,
        `- explicit permission overrides: ${Object.keys(user.permissions).length}`,
        `- flag scopes: ${Object.keys(user.flags).length}`,
        ``,
        `### Hotbar`,
        formatHotbarMap(hotbar),
    ].join('\n');
}

function formatHotbarList(data: UserHotbarListResponse): string {
    if (data.slots.length === 0) {
        return `User Hotbar\n\n- **User ID:** \`${data.userId}\`\n- **Occupied slots:** 0\n\n_No assigned hotbar slots._`;
    }

    const lines = data.slots.map((slot) =>
        `- slot ${slot.slot}: \`${slot.macroId}\`${slot.macroName ? ` (${slot.macroName})` : ''}${slot.isOrphan ? ' [ORPHAN]' : ''}`,
    );
    const orphanLine = data.orphanSlots.length > 0
        ? `\n**Orphan slots:** ${data.orphanSlots.join(', ')}`
        : '';

    return `User Hotbar\n\n- **User ID:** \`${data.userId}\`\n- **Occupied slots:** ${data.occupiedSlotCount}${orphanLine}\n\n${lines.join('\n')}`;
}

export interface UserToolOptions extends BaseToolOptions { }

export class UserTool extends BaseTool {
    constructor(options: UserToolOptions) {
        super(options);
    }

    // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
    getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
      return [
          { name: 'user', handler: (args: any) => this.execute(args) },
      ];
    }

    getToolDefinitions() {
        return [
            {
                name: 'user',
                title: 'Manage Foundry users, roles, hotbars, and flags',
                annotations: {
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                description:
                    `Manage Foundry User documents through one umbrella tool. 9 actions cover list/get/update, role changes, hotbar maintenance, and flag housekeeping.

Actions: list, get, update, set-role, hotbar-list, hotbar-assign, hotbar-clear, flag-set, flag-clear.

Key rules:
- update accepts only name, color, avatar, pronouns, character, permissions.
- set-role is separate and surfaces reloadRequired.
- hotbar slots are 1-50 and store bare Macro ids.
- flag scopes may be world or module ids; core is rejected.
- self-writes are allowed only where the Foundry-side handler permits them; cross-user admin writes require GM.

Examples:
- {action:"list", limit:10, offset:0, roleFilter:"PLAYER"}
- {action:"get", userId:"abc", includeHotbar:true}
- {action:"update", userId:"abc", color:"#ff0000"}
- {action:"set-role", userId:"abc", role:"TRUSTED"}
- {action:"hotbar-assign", userId:"abc", slot:49, macroId:"xyz"}
- {action:"flag-set", userId:"abc", scope:"warhammer-mcp", key:"tutorialSeen", value:true}`,
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['list', 'get', 'update', 'set-role', 'hotbar-list', 'hotbar-assign', 'hotbar-clear', 'flag-set', 'flag-clear'],
                            description: 'The user action to perform.',
                        },
                        userId: {
                            type: 'string',
                            description: '[get/update/set-role/hotbar-*/flag-*] User document ID.',
                        },
                        limit: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 100,
                            description: '[list] Maximum number of users to return. Default 50.',
                        },
                        offset: {
                            type: 'integer',
                            minimum: 0,
                            description: '[list] Zero-based offset into the filtered user list. Default 0.',
                        },
                        nameFilter: {
                            type: 'string',
                            description: '[list] Case-insensitive substring match on user name.',
                        },
                        roleFilter: {
                            type: 'string',
                            enum: ['NONE', 'PLAYER', 'TRUSTED', 'ASSISTANT', 'GAMEMASTER'],
                            description: '[list] Restrict list results to one role.',
                        },
                        includeHotbar: {
                            type: 'boolean',
                            description: '[get] Include the raw slot->macroId hotbar map in the response.',
                        },
                        name: {
                            type: 'string',
                            minLength: 1,
                            description: '[update] New user name.',
                        },
                        color: {
                            type: 'string',
                            description: '[update] 6-digit hex color string such as #ff0000.',
                        },
                        avatar: {
                            type: ['string', 'null'],
                            description: '[update] Avatar path or null to clear it.',
                        },
                        pronouns: {
                            type: 'string',
                            description: '[update] Pronouns text.',
                        },
                        character: {
                            type: ['string', 'null'],
                            description: '[update] Actor document ID or null to clear the linked character.',
                        },
                        permissions: {
                            type: 'object',
                            additionalProperties: { type: 'boolean' },
                            description: '[update] Sparse per-user permission overrides keyed by Foundry USER_PERMISSIONS names.',
                        },
                        role: {
                            type: 'string',
                            enum: ['NONE', 'PLAYER', 'TRUSTED', 'ASSISTANT', 'GAMEMASTER'],
                            description: '[set-role] Target role name.',
                        },
                        slot: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 50,
                            description: '[hotbar-assign/hotbar-clear] Hotbar slot number.',
                        },
                        macroId: {
                            type: 'string',
                            description: '[hotbar-assign] Macro document ID to assign into the slot.',
                        },
                        scope: {
                            type: 'string',
                            description: '[flag-set/flag-clear] Non-core namespace, such as world or a module id.',
                        },
                        key: {
                            type: 'string',
                            description: '[flag-set/flag-clear] Flag key within the selected scope.',
                        },
                        value: JSON_VALUE_INPUT_SCHEMA,
                    },
                    required: ['action'],
                },
            },
        ];
    }

    async execute(args: UserArgs) {
        this.logger.info('Executing user action', { action: args.action });
        switch (args.action) {
            case 'list':
                return this.handleList(args);
            case 'get':
                return this.handleGet(args);
            case 'update':
                return this.handleUpdate(args);
            case 'set-role':
                return this.handleSetRole(args);
            case 'hotbar-list':
                return this.handleHotbarList(args);
            case 'hotbar-assign':
                return this.handleHotbarAssign(args);
            case 'hotbar-clear':
                return this.handleHotbarClear(args);
            case 'flag-set':
                return this.handleFlagSet(args);
            case 'flag-clear':
                return this.handleFlagClear(args);
        }
    }

    private async handleList(args: ArgsFor<'list'>) {
        try {
            const data = await this.query<UserListResponse>('user', args);
            if (data.items.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No Users found.' }], structuredContent: data as unknown as Record<string, unknown> };
            }
            const lines = data.items.map(formatUserListItem);
            const text = `Users (${data.items.length} of ${data.total})\n\n- **Offset:** ${data.offset}\n- **Limit:** ${data.limit}\n\n${lines.join('\n')}`;
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('list', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleGet(args: ArgsFor<'get'>) {
        try {
            const data = await this.query<UserGetResponse>('user', args);
            return { content: [{ type: 'text' as const, text: formatUserView(data.user, data.hotbar) }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('get', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleUpdate(args: ArgsFor<'update'>) {
        const provided = ['name', 'color', 'avatar', 'pronouns', 'character', 'permissions']
            .filter((key) => Object.prototype.hasOwnProperty.call(args, key));
        if (provided.length === 0) {
            return this.errorResponse('update', 'USER_EMPTY_PAYLOAD: update requires at least one writable field');
        }

        try {
            const data = await this.query<UserUpdateResponse>('user', args);
            const text = `User Updated\n\n**Changed fields:** ${data.changedFields.join(', ')}\n\n${formatUserView(data.user, null)}`;
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('update', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleSetRole(args: ArgsFor<'set-role'>) {
        try {
            const data = await this.query<UserSetRoleResponse>('user', args);
            const text = [
                'User Role Updated',
                '',
                `- **User ID:** \`${data.userId}\``,
                `- **Previous role:** ${data.previousRole}`,
                `- **New role:** ${data.role}`,
                `- **Reload required:** ${data.reloadRequired ? 'yes' : 'no'}`,
                '',
                formatUserView(data.user, null),
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('set-role', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleHotbarList(args: ArgsFor<'hotbar-list'>) {
        try {
            const data = await this.query<UserHotbarListResponse>('user', args);
            return { content: [{ type: 'text' as const, text: formatHotbarList(data) }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('hotbar-list', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleHotbarAssign(args: ArgsFor<'hotbar-assign'>) {
        try {
            const data = await this.query<UserHotbarAssignResponse>('user', args);
            const text = [
                'User Hotbar Updated',
                '',
                `- **User ID:** \`${data.userId}\``,
                `- **Slot:** ${data.slot}`,
                `- **Macro ID:** \`${data.macroId}\`${data.macroName ? ` (${data.macroName})` : ''}`,
                `- **Assigned:** ${data.assigned ? 'yes' : 'no'}`,
                `- **Overwrote previous slot value:** ${data.overwrote ? 'yes' : 'no'}`,
                `- **Previous macro ID:** ${data.previousMacroId ?? '_(none)_'}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('hotbar-assign', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleHotbarClear(args: ArgsFor<'hotbar-clear'>) {
        try {
            const data = await this.query<UserHotbarClearResponse>('user', args);
            const text = [
                'User Hotbar Slot Cleared',
                '',
                `- **User ID:** \`${data.userId}\``,
                `- **Slot:** ${data.slot}`,
                `- **Cleared:** ${data.cleared ? 'yes' : 'no'}`,
                `- **Already empty:** ${data.alreadyEmpty ? 'yes' : 'no'}`,
                `- **Previous macro ID:** ${data.previousMacroId ?? '_(none)_'}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('hotbar-clear', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleFlagSet(args: ArgsFor<'flag-set'>) {
        try {
            const data = await this.query<UserFlagSetResponse>('user', args);
            const preview = typeof data.value === 'string' ? `"${data.value}"` : `\`${JSON.stringify(data.value)}\``;
            const text = [
                'User Flag Set',
                '',
                `- **User ID:** \`${data.userId}\``,
                `- **Flag:** ${data.scope}.${data.key}`,
                `- **Value:** ${preview}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('flag-set', e instanceof Error ? e.message : String(e));
        }
    }

    private async handleFlagClear(args: ArgsFor<'flag-clear'>) {
        try {
            const data = await this.query<UserFlagClearResponse>('user', args);
            const text = [
                'User Flag Cleared',
                '',
                `- **User ID:** \`${data.userId}\``,
                `- **Flag:** ${data.scope}.${data.key}`,
                `- **Cleared:** ${data.cleared ? 'yes' : 'no'}`,
            ].join('\n');
            return { content: [{ type: 'text' as const, text }], structuredContent: data as unknown as Record<string, unknown> };
        } catch (e) {
            return this.errorResponse('flag-clear', e instanceof Error ? e.message : String(e));
        }
    }
}
