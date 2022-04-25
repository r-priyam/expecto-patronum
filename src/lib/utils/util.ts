import type { Interaction } from 'discord.js';
import { DiscordAPIError, Message } from 'discord.js';
import type { RESTJSONErrorCodes } from 'discord-api-types/v10';

export function isMessage(messageOrInteraction: Message | Interaction): messageOrInteraction is Message {
	return messageOrInteraction instanceof Message;
}

export function plural(count: number, singular: string, plural: string) {
	return count === 1 ? singular : plural;
}

// https://github.com/skyra-project/skyra/blob/main/src/lib/util/common/promises.ts#L6
export async function resolveOnErrorCodes<T>(promise: Promise<T>, ...codes: readonly RESTJSONErrorCodes[]) {
	try {
		return await promise;
	} catch (error: unknown) {
		if (error instanceof DiscordAPIError && codes.includes(error.code)) {
			return null;
		}

		throw error;
	}
}
