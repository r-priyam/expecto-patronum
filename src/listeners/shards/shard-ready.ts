import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { green } from 'colorette';

import { formatShardHeader } from '#utils/formatter';

@ApplyOptions<Listener.Options>({
	name: 'ShardReady',
	event: Events.ShardReady
})
export class ShardReady extends Listener<typeof Events.ShardReady> {
	public override run(id: number, unavailableGuilds: Set<string> | undefined) {
		this.logger.info(
			`${formatShardHeader(id, green('Ready'))}: ${
				unavailableGuilds?.size ? `${unavailableGuilds?.size} unavailable guilds` : 'So far so good 😎'
			}`
		);
	}
}
