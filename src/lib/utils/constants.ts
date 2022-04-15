import { URL } from 'node:url';

export const rootFolder = new URL('../../../', import.meta.url);
export const sourceFolder = new URL('src/', rootFolder);

export enum Colors {
	Info = 0x3498db,
	Success = 0x57f287,
	Warning = 0xfee75c,
	Error = 0xed4245
}
