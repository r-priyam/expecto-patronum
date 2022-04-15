import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

import { config } from '#root/config';

@ApplyOptions<Listener.Options>({
	name: 'ClientDebug',
	event: Events.Debug,
	enabled: config.debug
})
export class ClientDebug extends Listener<typeof Events.Debug> {
	public override run(message: string) {
		this.logger.debug(message);
	}
}
