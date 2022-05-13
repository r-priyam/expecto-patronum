import { UserError } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';

import { embedBuilder } from '#lib/classes/embeds';
import { isMessage } from '#utils/util';

export async function errorHandler(error: Error | UserError, messageOrInteraction: Message | CommandInteraction) {
	if (error instanceof UserError) {
		const isEmbed = Reflect.get(new Object(error.context), 'embedMessage');

		if (isMessage(messageOrInteraction)) {
			return messageOrInteraction.channel.send(messageOrEmbed(error.message, isEmbed));
		}

		if (messageOrInteraction.replied || messageOrInteraction.deferred) {
			return messageOrInteraction.editReply(messageOrEmbed(error.message, isEmbed));
		}

		return messageOrInteraction.reply(messageOrEmbed(error.message, isEmbed));
	}
}

function messageOrEmbed(content: string, isEmbed = false) {
	if (isEmbed) {
		return { embeds: [embedBuilder.error(content)], allowedMentions: { parse: [] } };
	}

	return { content, allowedMentions: { parse: [] } };
}
