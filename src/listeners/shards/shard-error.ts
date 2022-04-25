import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { red } from 'colorette';

import { formatShardHeader } from '#root/lib/utils/formatter';

@ApplyOptions<Listener.Options>({
	name: 'ShardError',
	event: Events.ShardError
})
export class ShardError extends Listener<typeof Events.ShardError> {
	public run(error: Error, id: number) {
		this.logger.error(`${formatShardHeader(id, red('Error'))}: ${error.stack ?? error.message}`);
	}
}
