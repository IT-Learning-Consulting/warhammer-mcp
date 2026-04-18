import type { FoundryDataAccess } from '../data-access.js';

export async function handleGetPartyCharacters(dataAccess: FoundryDataAccess): Promise<any> {
  try {
    if (!game.user?.isGM) {
      return { error: 'Access denied', success: false };
    }

    dataAccess.validateFoundryState();

    return await dataAccess.getPartyCharacters();
  } catch (error) {
    throw new Error(`Failed to get party characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleFindPlayers(data: any, dataAccess: FoundryDataAccess): Promise<any> {
  try {
    if (!game.user?.isGM) {
      return { error: 'Access denied', success: false };
    }

    dataAccess.validateFoundryState();

    if (!data.identifier) {
      throw new Error('identifier is required');
    }

    return await dataAccess.findPlayers(data);
  } catch (error) {
    throw new Error(`Failed to find players: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleFindActor(data: any, dataAccess: FoundryDataAccess): Promise<any> {
  try {
    if (!game.user?.isGM) {
      return { error: 'Access denied', success: false };
    }

    dataAccess.validateFoundryState();

    if (!data.identifier) {
      throw new Error('identifier is required');
    }

    return await dataAccess.findActor(data);
  } catch (error) {
    throw new Error(`Failed to find actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
