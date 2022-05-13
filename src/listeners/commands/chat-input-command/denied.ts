import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandDeniedPayload, UserError } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';

import { embedBuilder } from '#classes/embeds';

@ApplyOptions<Listener.Options>({
	name: 'ChatInputCommandDenied',
	event: Events.ChatInputCommandDenied
})
export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
	public override async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		if (interaction.replied || interaction.deferred) {
			return interaction.editReply({ embeds: [embedBuilder.error(error.message)] });
		}

		return interaction.reply({ embeds: [embedBuilder.error(error.message)], ephemeral: true });
	}
}
