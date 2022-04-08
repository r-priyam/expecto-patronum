import { ApplyOptions } from '@sapphire/decorators';
import type { Logger } from '@sapphire/framework';
import { container, Events, Listener, LogLevel } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
	name: 'ClientDebug',
	event: Events.Debug,
	enabled: (container.client.logger as Logger).level <= LogLevel.Debug
})
export class ClientDebug extends Listener<typeof Events.Debug> {
	public override run(message: string) {
		this.logger.debug(message);
	}
}
