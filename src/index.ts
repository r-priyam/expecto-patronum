import '#lib/setup';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { Config } from '#root/config';

const client = new SapphireClient({
	shards: 'auto',
	defaultPrefix: '!',
	caseInsensitiveCommands: true,
	logger: {
		depth: 2,
		level: Config.isDev ? LogLevel.Debug : LogLevel.Info
	},
	intents: Object.values(GatewayIntentBits).filter((intent) => typeof intent !== 'string') as number[],
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

const main = async () => {
	try {
		await client.login();
		client.logger.info('Successfully logged in.');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

void main();
