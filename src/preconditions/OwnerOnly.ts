import { OWNERS } from '#root/config';
import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async messageRun(message: Message) {
		return OWNERS.includes(message.author.id) ? this.ok() : this.error({ message: 'This command can only be used by the owner.' });
	}
}

// TODO: move to separate file later on
declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}
