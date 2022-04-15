import { LogLevel, SapphireClient } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { GatewayIntentBits } from 'discord-api-types/v9';

import { config } from '#root/config';

export class ExpectoPatronumClient extends SapphireClient {
	public constructor() {
		super({
			shards: 'auto',
			defaultPrefix: ['!', '.', '?'],
			caseInsensitiveCommands: true,
			logger: { level: config.development ? LogLevel.Debug : LogLevel.Info },
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
						name: config.bot.activityMessage,
						type: 'PLAYING'
					}
				]
			},
			loadMessageCommandListeners: true,
			loadDefaultErrorListeners: false,
			hmr: {
				enabled: config.development,
				usePolling: true,
				// Delay hmr by 3 seconds
				interval: Time.Second * 3
			}
		});
	}
}
