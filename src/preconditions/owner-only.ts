import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';

import { Config } from '#root/config';

export class UserPrecondition extends AllFlowsPrecondition {
	public async chatInputRun(interaction: CommandInteraction) {
		return this.checkOwner(interaction.user.id);
	}

	public async messageRun(message: Message) {
		return this.checkOwner(message.author.id);
	}

	public async contextMenuRun(interaction: ContextMenuInteraction) {
		return this.checkOwner(interaction.user.id);
	}

	private async checkOwner(userId: string) {
		return Config.bot.owners.includes(userId) ? this.ok() : this.error({ message: "You aren't my master 🤨" });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}
