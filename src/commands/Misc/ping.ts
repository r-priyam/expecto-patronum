import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';

import { Colors } from '#root/lib/utils/constants';

@ApplyOptions<Command.Options>({
	description: 'Find out if Specter is alive and processing messages',
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
		await (isMessage
			? messageOrInteraction.reply({ embeds: [this.pingEmbed()] })
			: messageOrInteraction.reply({
					embeds: [this.pingEmbed()],
					ephemeral: true
			  }));
	}

	private pingEmbed() {
		return new MessageEmbed() //
			.setColor(Colors.Info)
			.setTitle('I am still alive! 🍺')
			.setDescription(`Pong! Bot Latency ${Math.round(this.client.ws.ping)}ms`);
	}
}
