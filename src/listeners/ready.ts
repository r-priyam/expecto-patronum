import { ApplyOptions } from '@sapphire/decorators';
import type { Store } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';

import { config } from '#root/config';

@ApplyOptions<Listener.Options>({
	name: 'ClientReady',
	event: Events.ClientReady,
	once: true
})
export class Ready extends Listener {
	private readonly style = config.development ? yellow : blue;

	public run() {
		this.printBanner();
		this.printStoreDebugInformation();
	}

	private printBanner() {
		const success = green('+');

		const llc = config.development ? magentaBright : white;
		const blc = config.development ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);

		console.log(
			String.raw`
${line01} ${pad}${blc('1.0.0')}
${line02} ${pad}[${success}] Gateway
${line03}${config.development ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
		`.trim()
		);
	}

	private printStoreDebugInformation() {
		const { client, logger } = this.container;
		const stores = [...client.stores.values()];
		const last = stores.pop()!;

		for (const store of stores) {
			logger.info(this.styleStore(store, false));
		}

		logger.info(this.styleStore(last, true));
	}

	private styleStore(store: Store<any>, last: boolean) {
		return gray(`${last ? '└─' : '├─'} Loaded ${this.style(store.size.toString().padEnd(3, ' '))} ${store.name}.`);
	}
}
