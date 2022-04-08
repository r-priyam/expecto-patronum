import { blueBright, bold } from 'colorette';

export function formatShardHeader(shardId: number, suffix: string) {
	return `${bold(blueBright(`[SHARD ${shardId}]`))} ${suffix}`;
}
