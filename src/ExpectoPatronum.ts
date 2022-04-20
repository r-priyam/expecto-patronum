import '#lib/setup';

import { ExpectoPatronumClient } from '#lib/structures/ExpectoPatronumClient';
import { Config } from '#root/config';

const client = new ExpectoPatronumClient();

try {
	await client.login(Config.bot.token);
	client.logger.info('Successfully logged in.');
} catch (error: unknown) {
	client.logger.fatal(error);
	client.destroy();
	process.exitCode = 1;
}
