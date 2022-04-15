import '#lib/setup';

import { ExpectoPatronumClient } from '#lib/structures/ExpectoPatronumClient';
import { config } from '#root/config';

const client = new ExpectoPatronumClient();

try {
	await client.login(config.bot.token);
	client.logger.info('Successfully logged in.');
} catch (error: unknown) {
	client.logger.fatal(error);
	client.destroy();
	process.exitCode = 1;
}
