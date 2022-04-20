import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';

import { Config } from '#root/config';

@ApplyOptions<Listener.Options>({
	name: 'ClientDebug',
	event: Events.Debug,
	enabled: Config.isDebug
})
export class ClientDebug extends Listener<typeof Events.Debug> {
	public override run(message: string) {
		this.logger.debug(message);
	}
}
