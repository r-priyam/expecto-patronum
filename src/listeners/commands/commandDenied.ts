import type { MessageCommandDeniedPayload, PieceContext } from '@sapphire/framework';
import { Listener, UserError, Events } from '@sapphire/framework';

export class UserEvent extends Listener<typeof Events.MessageCommandDenied> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.MessageCommandDenied });
	}

	public run({ context, message: content }: UserError, { message }: MessageCommandDeniedPayload) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), 'silent')) return;

		return message.channel.send({ content, allowedMentions: { users: [message.author.id], roles: [] } });
	}
}
