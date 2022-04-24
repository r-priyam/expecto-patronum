import type { Interaction } from 'discord.js';
import { DiscordAPIError, Message } from 'discord.js';
import type { RESTJSONErrorCodes } from 'discord-api-types/v10';

export function centerAlign(value: string, width: number) {
	const padding = Math.floor((width - value.length) / 2);
	return `${' '.repeat(padding)}${value}${' '.repeat(padding)}`;
}

export function isMessage(messageOrInteraction: Message | Interaction): messageOrInteraction is Message {
	return messageOrInteraction instanceof Message;
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
