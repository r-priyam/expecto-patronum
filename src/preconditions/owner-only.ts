import { ApplyOptions } from '@sapphire/decorators';
import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';

import { Config } from '#root/config';

@ApplyOptions<AllFlowsPrecondition.Options>({
	name: 'OwnerOnly'
})
export class UserPrecondition extends AllFlowsPrecondition {
	public async chatInputRun(interaction: CommandInteraction) {
		return this.checkOwner(interaction.user.id, this.i18n.format(interaction.locale, 'errors:preCondition.ownerOnly'));
	}

	public async messageRun(message: Message) {
		return this.checkOwner(message.author.id, this.i18n.format(message.guild?.preferredLocale ?? 'en-US', 'errors:preCondition.ownerOnly'));
	}

	public async contextMenuRun(interaction: ContextMenuInteraction) {
		return this.checkOwner(interaction.user.id, this.i18n.format(interaction.locale, 'errors:preCondition.ownerOnly'));
	}

	private async checkOwner(userId: string, message: string) {
		return Config.bot.owners!.includes(userId) ? this.ok() : this.error({ message });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never;
	}
}
