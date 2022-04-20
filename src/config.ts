import { readFile } from 'node:fs/promises';
import YAML from 'yaml';

interface EnvironmentVariables {
	development: boolean;
	debug: boolean;
	bot: { token: string; activityMessage: string; owners: string[]; testingGuilds: string[] };
	database: { postgres: { host: string; port: number; user: string; password: string; database: string } };
}

const fileContents = await readFile(new URL('../config.yaml', import.meta.url), 'utf8');
export const config = YAML.parse(fileContents) as EnvironmentVariables;
