import '#lib/setup';

import { ExpectoPatronumClient } from '#root/structures/ExpectoPatronumClient';

const client = new ExpectoPatronumClient();

try {
	await client.login();
	client.logger.info('Successfully logged in.');
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
