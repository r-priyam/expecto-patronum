import { setTimeout as sleep } from 'node:timers/promises';
import { inspect } from 'node:util';
import { codeBlock } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Command } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import { Time } from '@sapphire/time-utilities';
import { Type } from '@sapphire/type';
import type { Message } from 'discord.js';

import { embedBuilder } from '#utils/classes/embeds';
import { MiscEmotes } from '#utils/emotes';

@ApplyOptions<Command.Options>({
	aliases: ['e'],
	description: 'Evaluates a code',
	chatInputCommand: {
		register: false
	},
	flags: ['async'],
	options: ['timeout'],
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const code = await args.rest('string');
		const async = args.getFlags('async');
		const timeout = args.getOption('timeout');

		const { result, success, type, executionTime } = await this.timedEval(message, this.cleanCode(code), {
			async,
			timeout: timeout ? Number(timeout) : 60
		});

		const output = success ? codeBlock('ts', result) : codeBlock('bash', result);
		const typeFooter = `**Type**: ${codeBlock('ts', type)}`;

		if (output.length > 4000) {
			return message.channel.send({
				content: `Result was too long... sent the result as a file.\n\n${typeFooter}`,
				files: [{ attachment: Buffer.from(output), name: 'result.txt' }]
			});
		}

		const embed = success ? embedBuilder.success(output) : embedBuilder.error(output);
		embed
			.setTitle(success ? `Eval Result ${MiscEmotes.Success}` : `Eval Error ${MiscEmotes.Error}`)
			.addField('Result Type', codeBlock('ts', type), true)
			.addField('Elapsed ⏱', codeBlock('', executionTime), true);

		return message.channel.send({ embeds: [embed] });
	}

	private async timedEval(message: Message, code: string, { async, timeout }: { async: boolean; timeout: number }) {
		return Promise.race([
			sleep(Time.Second * timeout).then(() => ({
				result: `Timed out! Took longer that ${timeout} to execute`,
				success: false,
				type: 'EvalTimeoutError',
				executionTime: '⏱ ...'
			})),
			this._eval(message, code, async)
		]);
	}

	private async _eval(message: Message, code: string, async: boolean) {
		let result: any;
		let success = true;
		let executionTime = '';
		const stopwatch = new Stopwatch();

		try {
			if (async) {
				code = `(async () => {\n${code}\n})();`;
			}

			// @ts-expect-error use as a variable if needed in eval
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const msg = message;
			// eslint-disable-next-line no-eval
			result = eval(code);
			executionTime = stopwatch.toString();
		} catch (error: unknown) {
			if (!executionTime) {
				executionTime = stopwatch.toString();
			}

			success = false;
			result = error;
		}

		stopwatch.stop();

		const type = new Type(result).toString();
		if (typeof result.then === 'function' && typeof result.catch === 'function') {
			await result;
		}

		if (typeof result !== 'string') {
			result = inspect(result, { depth: 0 });
		}

		return { result, success, type, executionTime };
	}

	private cleanCode(code: string) {
		if (code.startsWith('```')) {
			return code.split('\n').slice(1, -1).join('\n');
		}

		return code;
	}
}
