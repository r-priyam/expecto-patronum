import { ApplyOptions } from '@sapphire/decorators';
import { type ChatInputCommandErrorPayload, Events, Listener } from '@sapphire/framework';

import { errorHandler } from '#utils/error-handler';

@ApplyOptions<Listener.Options>({
	name: 'ChatInputCommandError',
	event: Events.ChatInputCommandError
})
export class UserListener extends Listener<typeof Events.ChatInputCommandError> {
	public async run(error: Error, { interaction }: ChatInputCommandErrorPayload) {
		await errorHandler(error, interaction);
	}
}
