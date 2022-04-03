import '#lib/setup';

import { SpectreClient } from '#structures/SpectreClient';

const client = new SpectreClient();

try {
	await client.login();
	client.logger.info('Successfully logged in.');
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
