import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { red } from 'colorette';
import type { CloseEvent } from 'discord.js';

import { formatShardHeader } from '#utils/classes/formatter';

@ApplyOptions<Listener.Options>({
	name: 'ShardDisconnect',
	event: Events.ShardDisconnect
})
export class ShardDisconnect extends Listener<typeof Events.ShardDisconnect> {
	public run(event: CloseEvent, id: number) {
		this.logger.error(`${formatShardHeader(id, red('Disconnected'))}:\n\tCode: ${event.code}\n\tReason: ${event.reason}`);
	}
}
