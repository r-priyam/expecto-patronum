import { EmbedBuilder } from '#root/lib/utils/embeds';
import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandDeniedPayload, MessageCommandDeniedPayload } from '@sapphire/framework';
import { Listener, UserError, Events } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: 'MessageCommandDenied',
	event: Events.MessageCommandDenied
})
export class MessageCommandDenied extends Listener<typeof Events.MessageCommandDenied> {
	public override async run(error: UserError, { message }: MessageCommandDeniedPayload) {
		await message.channel.send({ embeds: [EmbedBuilder.error(error.message)] });
	}
}

@ApplyOptions<Listener.Options>({
	name: 'ChatInputCommandDenied',
	event: Events.ChatInputCommandDenied
})
export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
	public override async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		if (interaction.replied || interaction.deferred) {
			return interaction.editReply({ embeds: [EmbedBuilder.error(error.message)] });
		}

		return interaction.reply({ embeds: [EmbedBuilder.error(error.message)], ephemeral: true });
	}
}
