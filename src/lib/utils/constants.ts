import { URL } from 'node:url';

export const rootFolder = new URL('../../../', import.meta.url);
export const sourceFolder = new URL('src/', rootFolder);

export enum Colors {
	Info = 3_447_003,
	Success = 5_763_719,
	Warning = 16_705_372,
	Error = 15_548_997
}

export enum MiscEmotes {
	Success = '<:success:959344194785271809>',
	Error = '<:error:959359264533643274>'
}
