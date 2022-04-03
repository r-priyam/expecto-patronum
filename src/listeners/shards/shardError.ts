import { formatShardHeader } from '#root/lib/utils/functions/formatter';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { red } from 'colorette';

@ApplyOptions<Listener.Options>({
	name: 'ShardError',
	event: Events.ShardError
})
export class ShardError extends Listener<typeof Events.ShardError> {
	public run(error: Error, id: number) {
		this.container.logger.error(`${formatShardHeader(id, red('Error'))}: ${error.stack ?? error.message}`);
	}
}