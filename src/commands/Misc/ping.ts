import { MessageEmbed } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Find out if Highlight is alive and processing messages',
	chatInputCommand: {
		register: true,
		idHints: ['958767465750474803']
	}
})
export class PingCommand extends Command {
	public override messageRun(message: Message) {
		return this._sharedRun(message, true);
	}

	public override chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		return this._sharedRun(interaction, false);
	}

	protected async _sharedRun(messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>, isMessage: boolean) {
		if (isMessage) {
			await messageOrInteraction.reply({ embeds: [this.pingEmbed()], allowedMentions: { parse: [] } });
		} else {
			await messageOrInteraction.reply({
				embeds: [this.pingEmbed()],
				ephemeral: true
			});
		}
	}

	private pingEmbed() {
		return new MessageEmbed() //
			.setColor(0x36a8fa)
			.setTitle('I am still alive! 🍺')
			.setDescription(`Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms`);
	}
}
