import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { yellow } from 'colorette';

import { formatShardHeader } from '#utils/formatter';

@ApplyOptions<Listener.Options>({
	name: 'ShardReconnecting',
	event: Events.ShardReconnecting
})
export class ShardReconnecting extends Listener<typeof Events.ShardReconnecting> {
	public run(id: number) {
		this.logger.warn(`${formatShardHeader(id, yellow('Reconnecting'))}`);
	}
}
