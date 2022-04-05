import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { blue, blueBright, red, yellow } from 'colorette';
import { DiscordAPIError, HTTPError } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: 'ClientError',
	event: Events.Error
})
export class ClientError extends Listener<typeof Events.Error> {
	public override run(error: Error) {
		const { logger } = this.container;
		if (error instanceof DiscordAPIError) {
			logger.warn(this.errorSummary(error, 'API ERROR'));
			logger.fatal(error.stack);
		} else if (error instanceof HTTPError) {
			logger.warn(this.errorSummary(error, 'HTTP ERROR'));
			logger.fatal(error.stack);
		} else {
			logger.error(error);
		}
	}

	private errorSummary(error: DiscordAPIError | HTTPError, prefix: string) {
		return `${red(`[${prefix}]`)} ${yellow(`[CODE: ${error.code}]`)} ${blueBright(error.message)}\n\t\t\t\t${blue(
			`[PATH: ${error.method} ${error.path}]`
		)}`;
	}
}
