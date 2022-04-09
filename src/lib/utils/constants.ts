import { Constants } from 'discord.js';
import { URL } from 'node:url';

export const rootFolder = new URL('../../../', import.meta.url);
export const sourceFolder = new URL('src/', rootFolder);

export enum Colors {
	Info = Constants.Colors.BLUE,
	Success = Constants.Colors.GREEN,
	Warning = Constants.Colors.YELLOW,
	Error = Constants.Colors.RED
}
