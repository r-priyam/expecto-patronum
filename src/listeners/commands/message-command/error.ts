import { ApplyOptions } from '@sapphire/decorators';
import { type MessageCommandErrorPayload, Events, Listener } from '@sapphire/framework';

import { errorHandler } from '#utils/error-handler';

@ApplyOptions<Listener.Options>({
	name: 'MessageCommandError',
	event: Events.MessageCommandError
})
export class UserListener extends Listener<typeof Events.MessageCommandError> {
	public async run(error: Error, { message }: MessageCommandErrorPayload) {
		await errorHandler(error, message);
	}
}
