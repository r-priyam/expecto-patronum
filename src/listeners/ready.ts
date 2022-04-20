import { ApplyOptions } from '@sapphire/decorators';
import type { Store } from '@sapphire/framework';
import { Events, Listener } from '@sapphire/framework';
import { blue, gray, green, magenta, magentaBright, white, yellow } from 'colorette';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { readFile } from 'node:fs/promises';

import { Config } from '#root/config';

@ApplyOptions<Listener.Options>({
	name: 'ClientReady',
	event: Events.ClientReady,
	once: true
})
export class Ready extends Listener {
	private readonly style = Config.isDevelopment ? yellow : blue;

	public async run() {
		await this.printBanner();
		this.printStoreDebugInformation();
	}

	private async printBanner() {
		const success = green('+');

		const llc = Config.isDevelopment ? magentaBright : white;
		const blc = Config.isDevelopment ? magenta : blue;

		const line01 = llc('');
		const line02 = llc('');
		const line03 = llc('');

		// Offset Pad
		const pad = ' '.repeat(7);
		const { version } = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));

		console.log(
			String.raw`
${gradient.atlas.multiline(figlet.textSync('Expecto Patronum'))}
${line01} ${pad}${blc(version)}
${line02} ${pad}[${success}] Gateway
${line03}${Config.isDevelopment ? ` ${pad}${blc('<')}${llc('/')}${blc('>')} ${llc('DEVELOPMENT MODE')}` : ''}
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
