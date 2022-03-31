import { ApplyOptions } from '@sapphire/decorators';
import type { ChatInputCommandDeniedPayload, MessageCommandDeniedPayload } from '@sapphire/framework';
import { Listener, UserError, Events } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: 'MessageCommandDenied',
	event: Events.MessageCommandDenied
})
export class MessageCommandDenied extends Listener<typeof Events.MessageCommandDenied> {
	public override async run(error: UserError, { message }: MessageCommandDeniedPayload) {
		await message.channel.send(error.message);
	}
}

@ApplyOptions<Listener.Options>({
	name: 'ChatInputCommandDenied',
	event: Events.ChatInputCommandDenied
})
export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
	public override async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		if (interaction.replied || interaction.deferred) {
			await interaction.editReply({ content: error.message });
			return;
		}

		return interaction.reply({ content: error.message, ephemeral: true });
	}
}
