import {
  UpdateActorInput,
  UpdateActorOutput,
  type UpdateActorOutputType,
  UPDATE_ACTOR_OUTPUT_JSON_SCHEMA,
} from '@foundry-mcp/shared';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { BaseTool, BaseToolOptions } from '../base-tool.js';

export interface UpdateActorToolOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class UpdateActorTool extends BaseTool {
  constructor(options: BaseToolOptions) {
    super(options);
  }

  // Phase 8 (R8.2): declarative registration (R8.1 — name lives with the tool).
  getRegistration(): Array<{ name: string; handler: (args: any) => Promise<any> }> {
    return [
        { name: 'update-actor', handler: (args: any) => this.handle(args) },
    ];
  }

  getToolDefinitions() {
    return [
      {
        name: 'update-actor',
        title: 'Update Actor',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        description:
          'Apply an arbitrary system.* update to an actor. Thin pass-through to the Foundry-module updateActor query — does not enforce WFRP rules. Skills (e.g. /wfrp-advance, /wfrp-resources, /wfrp-status) own the rules and call this primitive to write the result. Use Foundry update syntax for nested paths (e.g. {"system.characteristics.ws.advances": 3, "system.details.experience.spent": 75}). Pass verifyPersistence:false to opt out of post-write drift check for auto-derived fields.',
        inputSchema: {
          type: 'object',
          properties: {
            actorId: {
              type: 'string',
              description: 'Target actor ID.',
            },
            updateData: {
              type: 'object',
              additionalProperties: true,
              description:
                'Foundry update payload. Keys can be dot-paths (e.g. "system.status.fate.value"); values are the new values. NEVER write *.max for fate / fortune / resilience / resolve (per PRD R4.2).',
            },
            verifyPersistence: {
              type: 'boolean',
              description:
                'When false, skips post-write field drift check. Use only for system-derived fields that Foundry auto-rewrites via prepareDerivedData (e.g. character status.{tier,standing} per CharacterModel.computeCareer).',
            },
          },
          required: ['actorId', 'updateData'],
        },
        outputSchema: UPDATE_ACTOR_OUTPUT_JSON_SCHEMA,
      },
    ];
  }

  async handle(args: any): Promise<any> {
    const parsed = UpdateActorInput.parse(args);
    this.logger.info('update-actor', { actorId: parsed.actorId, paths: Object.keys(parsed.updateData) });
    // Phase 11 (R11.1): envelope wrap; content[0].text === JSON.stringify(data)
    // preserves the prior auto-wrapped wire text (additive structuredContent).
    const data = await this.query<UpdateActorOutputType>('updateActor', parsed);
    UpdateActorOutput.parse(data);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data };
  }
}
