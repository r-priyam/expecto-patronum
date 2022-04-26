import { blueBright, bold } from 'colorette';

export function formatShardHeader(shardId: number, suffix: string) {
	return `${bold(blueBright(`[SHARD ${shardId}]`))} ${suffix}`;
}

export function centerAlign(value: string, width: number) {
	const padding = Math.floor((width - value.length) / 2);
	return `${' '.repeat(padding)}${value}${' '.repeat(padding)}`;
}
