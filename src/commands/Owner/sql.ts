import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Command } from '@sapphire/framework';
import { Stopwatch } from '@sapphire/stopwatch';
import { codeBlock } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { inspect } from 'node:util';

import { TabularData } from '#utils/classes/table';

@ApplyOptions<Command.Options>({
	description: 'Executes SQL code',
	chatInputCommand: {
		register: false
	},
	preconditions: ['OwnerOnly']
})
export class UserCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const query = await args.rest('string');
		const { success, result, executionTime } = await this.runSql(query);

		if (!success) {
			return message.channel.send(`${codeBlock('bash', result)}\nExecuted in: \`${executionTime}\``);
		}

		const table = new TabularData();
		table.setColumns(Object.keys(result[0]));

		// @ts-expect-error result will be in array only
		table.addRows(result.map((r) => Object.values(r)));
		const render = table.renderTable().split('\n');

		while (render.length > 0) {
			const toSend = render.splice(0, 12).join('\n');

			await message.channel.send(
				render.length === 0
					? `${codeBlock('ts', toSend)}\nReturned \`${result.length}\` rows. Executed in: \`${executionTime}\``
					: `${codeBlock('ts', toSend)}`
			);
		}
	}

	private async runSql(query: string) {
		let result;
		let success = true;
		let executionTime = '';
		const stopwatch = new Stopwatch();

		try {
			result = await this.sql.unsafe(query);
			executionTime = stopwatch.toString();
		} catch (error: unknown) {
			if (!executionTime) {
				executionTime = stopwatch.toString();
			}

			success = false;
			result = error instanceof Error ? error.message : inspect(error, { depth: 0 });
		}

		stopwatch.stop();
		return { success, result, executionTime };
	}
}
