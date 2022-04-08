import '#root/config';
import 'reflect-metadata';
import '@sapphire/plugin-logger/register';

import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { ApplicationCommandRegistries, container, RegisterBehavior } from '@sapphire/framework';
import * as colorette from 'colorette';
import { blueBright, cyan, greenBright, redBright, yellow } from 'colorette';
import type { Sql } from 'postgres';
import postgres from 'postgres';
import { inspect } from 'util';

// set behavior to overwrite so that it can be overwritten by other changes
// rather than warning in console.
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

inspect.defaultOptions.depth = 1;
colorette.createColors({ useColor: true });

const sqlHighlighter = new SqlHighlighter();
container.sql = postgres({
	debug: (connection, query, params, types) => {
		container.logger.debug(
			`${blueBright('Connections:')} ${yellow(connection)} » ${greenBright('Query:')} ${sqlHighlighter.highlight(query)} » ${redBright(
				'Params:'
			)} ${yellow(String(params || 'NULL'))} » ${cyan('Types:')} ${yellow(String(types || 'NULL'))}`
		);
	},
	transform: {
		column: { to: postgres.fromCamel, from: postgres.toCamel }
	},
	types: {
		date: {
			to: 1184,
			from: [1082, 1083, 1114, 1184],
			serialize: (date: Date) => date.toISOString(),
			parse: (isoString) => isoString
		}
	}
});

declare module '@sapphire/pieces' {
	interface Container {
		sql: Sql<any>;
	}
}
