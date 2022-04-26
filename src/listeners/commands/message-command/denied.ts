import { ApplyOptions } from '@sapphire/decorators';
import type { MessageCommandDeniedPayload, UserError } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';

import { embedBuilder } from '#utils/classes/embeds';

@ApplyOptions<Listener.Options>({
	name: 'MessageCommandDenied',
	event: Events.MessageCommandDenied
})
export class MessageCommandDenied extends Listener<typeof Events.MessageCommandDenied> {
	public override async run(error: UserError, { message }: MessageCommandDeniedPayload) {
		await message.channel.send({ embeds: [embedBuilder.error(error.message)] });
	}
}
