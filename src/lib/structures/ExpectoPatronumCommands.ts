import type { Piece } from '@sapphire/framework';
import { Command, UserError } from '@sapphire/framework';

export abstract class ExpectoPatronumCommand extends Command {
	public constructor(context: Piece.Context, options: any) {
		super(context, { ...options });
	}

	protected userError({ identifier, message, embedMessage }: { identifier?: string; message?: string; embedMessage?: boolean }): never {
		throw new UserError({ identifier: identifier ?? 'user-error', message, context: { embedMessage } });
	}
}
