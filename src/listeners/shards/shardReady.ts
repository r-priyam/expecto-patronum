import { formatShardHeader } from '#root/lib/utils/functions/formatter';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { green } from 'colorette';

@ApplyOptions<Listener.Options>({
	name: 'ShardReady',
	event: Events.ShardReady
})
export class ShardReady extends Listener<typeof Events.ShardReady> {
	public override run(id: number, unavailableGuilds: Set<string> | undefined) {
		this.container.logger.info(
			`${formatShardHeader(id, green('Ready'))}: ${
				unavailableGuilds?.size ? `${`${unavailableGuilds?.size} unavailable guilds`}` : 'So far so good 😎'
			}`
		);
	}
}
