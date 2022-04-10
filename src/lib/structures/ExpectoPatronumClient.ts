/* eslint-disable unicorn/filename-case */
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord-api-types/v9';

import { Config } from '#root/config';

export class ExpectoPatronumClient extends SapphireClient {
	public constructor() {
		super({
			shards: 'auto',
			defaultPrefix: ['!', '.', '?'],
			caseInsensitiveCommands: true,
			logger: { level: Config.development ? LogLevel.Debug : LogLevel.Info },
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildBans,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions
			],
			presence: {
				activities: [
					{
						name: Config.bot.activityMessage,
						type: 'PLAYING'
					}
				]
			},
			loadMessageCommandListeners: true,
			loadDefaultErrorListeners: false
		});
	}
}
