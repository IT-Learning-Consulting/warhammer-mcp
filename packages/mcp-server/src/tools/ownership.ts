import { z } from "zod";
import { FoundryClient } from "../foundry-client.js";
import { Logger } from "../logger.js";
import { BaseTool, BaseToolOptions } from "../base-tool.js";

// Assign ownership schema
const AssignOwnershipSchema = z.object({
    action: z.literal("assign"),
    actorName: z.string(),
    userId: z.string(),
    level: z.enum(["none", "limited", "observer", "owner"])
});

// Remove ownership schema
const RemoveOwnershipSchema = z.object({
    action: z.literal("remove"),
    actorName: z.string(),
    userId: z.string()
});

// List ownership schema
const ListOwnershipSchema = z.object({
    action: z.literal("list"),
    actorName: z.string()
});

const OwnershipSchema = z.discriminatedUnion("action", [
    AssignOwnershipSchema,
    RemoveOwnershipSchema,
    ListOwnershipSchema
]);

type OwnershipArgs = z.infer<typeof OwnershipSchema>;

// Foundry ownership levels
const OwnershipLevels: Record<string, number> = {
    none: 0,
    limited: 1,
    observer: 2,
    owner: 3
};

export interface OwnershipToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class OwnershipTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

    getToolDefinitions() {
        return [{
            name: "ownership",
            title: "Manage Ownership",
            annotations: {
              readOnlyHint: false,
              destructiveHint: false,
              idempotentHint: true,
              openWorldHint: true,
            },
            description: `Manage actor ownership and permissions in Foundry VTT. Control which players can view, edit, or control actors.

**Foundry VTT Ownership Levels:**
- **none**: No access to the actor (default for non-owners)
- **limited**: Can see actor name and limited info
- **observer**: Can view full sheet but cannot control or edit
- **owner**: Full control - can edit, control, and delete

**Common Use Cases:**
- Give players ownership of their characters
- Let party observe NPC stat blocks
- Share friendly NPCs with the party
- Restrict access to secret villains
- Grant GM assistants owner permissions

**Actions:**
- **assign**: Set a specific permission level for a user on an actor
- **remove**: Remove all permissions (set to none) for a user on an actor
- **list**: View current ownership/permissions for an actor

**Finding User IDs:**
- Use player names shown in Foundry VTT
- Or use the exact user ID from Foundry's Users list
- Case-insensitive matching supported for names

**Example Usage:**
- Assign ownership: {action: "assign", actorName: "Hans Schmidt", userId: "player1", level: "owner"}
- Give observer: {action: "assign", actorName: "Enemy Guard", userId: "player2", level: "observer"}
- Remove access: {action: "remove", actorName: "Secret Villain", userId: "player1"}
- List permissions: {action: "list", actorName: "Hans Schmidt"}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["assign", "remove", "list"],
                        description: "The ownership action to perform"
                    },
                    actorName: {
                        type: "string",
                        description: "Name or ID of the actor"
                    },
                    userId: {
                        type: "string",
                        description: "[assign/remove] Player name or user ID"
                    },
                    level: {
                        type: "string",
                        enum: ["none", "limited", "observer", "owner"],
                        description: "[assign] Permission level to grant"
                    }
                },
                required: ["action", "actorName"]
            }
        }];
    }

    async execute(args: OwnershipArgs) {
        this.logger.info("Executing ownership", { action: args.action });

        switch (args.action) {
            case "assign":
                return this.handleAssign(args);
            case "remove":
                return this.handleRemove(args);
            case "list":
                return this.handleList(args);
        }
    }

    private async handleAssign(args: {
        actorName: string;
        userId: string;
        level: string;
    }) {
        this.logger.info("Assigning ownership", {
            actorName: args.actorName,
            userId: args.userId,
            level: args.level,
        });

        const permissionLevel = OwnershipLevels[args.level];

        await this.query<any>(
            "setActorOwnership",
            {
                actorName: args.actorName,
                userId: args.userId,
                permission: permissionLevel,
            }
        );

        let levelIcon = "";
        let levelDesc = "";

        switch (args.level) {
            case "owner":
                levelIcon = "👑";
                levelDesc = "Full control - can view, edit, control, and delete";
                break;
            case "observer":
                levelIcon = "👁️";
                levelDesc = "Can view full sheet but cannot control or edit";
                break;
            case "limited":
                levelIcon = "🔒";
                levelDesc = "Can see basic info only";
                break;
            case "none":
                levelIcon = "🚫";
                levelDesc = "No access";
                break;
        }

        return {
            content: [
                {
                    type: "text",
                    text: `${levelIcon} **Ownership Assigned**\n\n**Actor:** ${args.actorName}\n**User:** ${args.userId}\n**Permission:** ${args.level.toUpperCase()}\n\n${levelDesc}\n\nThe permission change is now active in Foundry VTT.`,
                },
            ],
        };
    }

    private async handleRemove(args: {
        actorName: string;
        userId: string;
    }) {
        this.logger.info("Removing ownership", {
            actorName: args.actorName,
            userId: args.userId,
        });

        await this.query<any>(
            "setActorOwnership",
            {
                actorName: args.actorName,
                userId: args.userId,
                permission: 0, // NONE
            }
        );

        return {
            content: [
                {
                    type: "text",
                    text: `🚫 **Ownership Removed**\n\n**Actor:** ${args.actorName}\n**User:** ${args.userId}\n\n${args.userId} no longer has any permissions for this actor.`,
                },
            ],
        };
    }

    private async handleList(args: { actorName: string }) {
        this.logger.info("Listing ownership", { actorName: args.actorName });

        const response = await this.query<any>(
            "getActorOwnership",
            { actorName: args.actorName }
        );

        const ownership = response?.ownership ?? {};
        const defaultLevel = response?.defaultLevel ?? 0;

        let resultText = `📋 **Ownership for ${args.actorName}**\n\n`;
        resultText += `**Default Permission:** ${this.getLevelName(defaultLevel)}\n\n`;

        const userEntries = Object.entries(ownership).filter(
            ([userId]) => userId !== "default"
        );

        if (userEntries.length === 0) {
            resultText += `No specific user permissions set.\n`;
        } else {
            resultText += `**User Permissions:**\n\n`;
            for (const [userId, level] of userEntries) {
                const levelName = this.getLevelName(level as number);
                const icon = this.getLevelIcon(level as number);
                resultText += `${icon} **${userId}**: ${levelName}\n`;
            }
        }

        return {
            content: [{ type: "text", text: resultText }],
        };
    }

    private getLevelName(level: number): string {
        switch (level) {
            case 0:
                return "None";
            case 1:
                return "Limited";
            case 2:
                return "Observer";
            case 3:
                return "Owner";
            default:
                return "Unknown";
        }
    }

    private getLevelIcon(level: number): string {
        switch (level) {
            case 0:
                return "🚫";
            case 1:
                return "🔒";
            case 2:
                return "👁️";
            case 3:
                return "👑";
            default:
                return "❓";
        }
    }
}
