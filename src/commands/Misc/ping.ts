import { ApplyOptions } from '@sapphire/decorators';
import type { Command } from '@sapphire/framework';
import { fetchLanguage, TFunction } from '@sapphire/plugin-i18next';
import { MessageEmbed, Message } from 'discord.js';

import { ExpectoPatronumCommand } from '#lib/structures/ExpectoPatronumCommands';
import { Config } from '#root/config';
import { Colors } from '#utils/constants';
import { isMessage } from '#utils/util';

@ApplyOptions<Command.Options>({
	description: 'Find out if bot is alive and processing messages',
	chatInputCommand: {
		register: true,
		idHints: ['958767465750474803'],
		guildIds: Config.bot.testingGuilds
	}
})
export class PingCommand extends ExpectoPatronumCommand {
	public override async messageRun(message: Message) {
		return this._sharedRun(message);
	}

	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		return this._sharedRun(interaction);
	}

	protected async _sharedRun(messageOrInteraction: Message | Command.ChatInputInteraction<'cached'>) {
		const t = this.i18n.getT(await fetchLanguage(messageOrInteraction));

		await (isMessage(messageOrInteraction)
			? messageOrInteraction.reply({ embeds: [this.pingEmbed(t)] })
			: messageOrInteraction.reply({
					embeds: [this.pingEmbed(t)],
					ephemeral: true
			  }));
	}

	private pingEmbed(t: TFunction) {
		return new MessageEmbed() //
			.setColor(Colors.Info)
			.setTitle(t('commands/misc:ping.title'))
			.setDescription(t('commands/misc:ping.message', { latency: Math.round(this.client.ws.ping) }));
	}
}
