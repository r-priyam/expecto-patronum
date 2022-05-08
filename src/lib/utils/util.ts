import { opendir } from 'node:fs/promises';
import { join } from 'node:path';
import type { RESTJSONErrorCodes } from 'discord-api-types/v10';
import type { Interaction } from 'discord.js';
import { DiscordAPIError, Message } from 'discord.js';

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

// https://github.com/sapphiredev/plugins/blob/main/packages/i18next/src/lib/InternationalizationHandler.ts
export async function walkLanguageDirectory(directory_: string, namespaces: string[] = [], current = '') {
	const directory = await opendir(directory_);

	const languages: string[] = [];
	for await (const entry of directory) {
		const function_ = entry.name;
		if (entry.isDirectory()) {
			const isLanguage = function_.includes('-');
			if (isLanguage) {
				languages.push(function_);
			}

			({ namespaces } = await walkLanguageDirectory(join(directory_, function_), namespaces, isLanguage ? '' : `${function_}/`));
		} else if (entry.name.endsWith('.json')) {
			namespaces.push(`${current}${function_.slice(0, Math.max(0, function_.length - 5))}`);
		}
	}

	return { namespaces: [...new Set(namespaces)], languages };
}
