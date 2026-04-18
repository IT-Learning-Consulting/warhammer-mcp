import { z } from 'zod';
import type { FoundryDataAccess } from '../data-access.js';
import {
  GetPartyCharactersInput,
  FindPlayersInput,
  FindActorInput,
} from '@foundry-mcp/shared';

function rethrowAsInvalidInput(error: unknown): void {
  if (error instanceof z.ZodError) {
    throw new Error(`Invalid input: ${error.message}`);
  }
}

export async function handleGetPartyCharacters(dataAccess: FoundryDataAccess, data?: unknown): Promise<any> {
  try {
    if (!game.user?.isGM) return { error: 'Access denied', success: false };
    dataAccess.validateFoundryState();
    GetPartyCharactersInput.strict().parse(data ?? {});
    return { success: true, data: await dataAccess.getPartyCharacters() };
  } catch (error) {
    rethrowAsInvalidInput(error);
    throw new Error(`Failed to get party characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleFindPlayers(data: unknown, dataAccess: FoundryDataAccess): Promise<any> {
  try {
    if (!game.user?.isGM) return { error: 'Access denied', success: false };
    dataAccess.validateFoundryState();
    const parsed = FindPlayersInput.strict().parse(data ?? {});
    return { success: true, data: await dataAccess.findPlayers(parsed) };
  } catch (error) {
    rethrowAsInvalidInput(error);
    throw new Error(`Failed to find players: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleFindActor(data: unknown, dataAccess: FoundryDataAccess): Promise<any> {
  try {
    if (!game.user?.isGM) return { error: 'Access denied', success: false };
    dataAccess.validateFoundryState();
    const parsed = FindActorInput.strict().parse(data ?? {});
    return { success: true, data: await dataAccess.findActor(parsed) };
  } catch (error) {
    rethrowAsInvalidInput(error);
    throw new Error(`Failed to find actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
