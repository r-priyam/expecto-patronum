import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord-api-types/v9';

import { Config } from '#root/config';

export class ExpectoPatronumClient extends SapphireClient {
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
						name: 'After all this time? Always.',
						type: 'PLAYING'
					}
				]
			},
			loadMessageCommandListeners: true
		});
	}
}
