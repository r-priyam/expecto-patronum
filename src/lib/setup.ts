import 'dotenv/config';
import 'reflect-metadata';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-logger/register';

import { fileURLToPath, URL } from 'node:url';
import { inspect } from 'node:util';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import type { Logger } from '@sapphire/framework';
import { ApplicationCommandRegistries, container, Piece, RegisterBehavior } from '@sapphire/framework';
import type { ScheduledTaskHandler } from '@sapphire/plugin-scheduled-tasks';
import { Backend } from '@skyra/i18next-backend';
import { blueBright, createColors, cyan, greenBright, redBright, yellow } from 'colorette';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import postgres from 'postgres';

import type { ExpectoPatronumClient } from './structures/ExpectoPatronumClient';
import { Config } from '#root/config';
import { walkLanguageDirectory } from '#utils/util';

// Set behavior to overwrite so that it can be overwritten by other changes
// rather than warning in console.
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

inspect.defaultOptions.depth = 1;
createColors({ useColor: true });

const sqlHighlighter = new SqlHighlighter();
const { postgres: pg } = Config.database;

container.sql = postgres({
	host: pg.host,
	port: pg.port,
	user: pg.user,
	password: pg.password,
	database: pg.database,
	debug(connection, query, parameters, types) {
		container.logger.debug(
			`${blueBright('Connections:')} ${yellow(connection)} » ${greenBright('Query:')} ${sqlHighlighter.highlight(query)} » ${redBright(
				'Params:'
			)} ${yellow(String(parameters || 'NULL'))} » ${cyan('Types:')} ${yellow(String(types || 'NULL'))}`
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

const { namespaces, languages } = await walkLanguageDirectory(fileURLToPath(new URL('../locales', import.meta.url)));

await i18next.use(Backend).init({
	backend: {
		paths: [new URL('../locales/{{lng}}/{{ns}}.json', import.meta.url)]
	},
	fallbackLng: 'en-US',
	initImmediate: false,
	interpolation: {
		escapeValue: false
	},
	defaultNS: 'commands',
	ns: namespaces,
	preload: languages
});

// Inject quickly used container properties into pieces
// this does - this.container.client -> this.client directly
Object.defineProperties(Piece.prototype, {
	client: { get: () => container.client },
	sql: { get: () => container.sql },
	logger: { get: () => container.logger },
	tasks: { get: () => container.tasks }
});

declare module '@sapphire/pieces' {
	interface Container {
		sql: Sql<any>;
	}

	interface Piece {
		client: ExpectoPatronumClient;
		sql: Sql<any>;
		logger: Logger;
		tasks: ScheduledTaskHandler;
	}
}
