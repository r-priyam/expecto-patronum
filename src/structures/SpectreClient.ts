import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord-api-types/v9';

import { Config } from '#root/config';

export class SpectreClient extends SapphireClient {
	public constructor() {
		super({
			shards: 'auto',
			defaultPrefix: ['!', '.', '?'],
			caseInsensitiveCommands: true,
			logger: {
				depth: 2,
				level: Config.isDev ? LogLevel.Debug : LogLevel.Info
			},
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
						name: " I won't be long!",
						type: 'PLAYING'
					}
				]
			},
			loadMessageCommandListeners: true
		});
	}
}
