import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { magenta, yellowBright } from 'colorette';

import { formatShardHeader } from '#utils/classes/formatter';

@ApplyOptions<Listener.Options>({
	name: 'ShardResume',
	event: Events.ShardResume
})
export class ShardResume extends Listener<typeof Events.ShardResume> {
	public run(id: number, replayedEvents: number) {
		this.logger.warn(`${formatShardHeader(id, yellowBright('Resumed'))}: Events replayed: ${magenta(replayedEvents)}`);
	}
}
