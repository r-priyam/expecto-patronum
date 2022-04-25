import type { ScheduledTasksTaskOptions } from '@sapphire/plugin-scheduled-tasks';
import type { ScheduledTaskRedisStrategyJob, ScheduledTaskRedisStrategyOptions } from '@sapphire/plugin-scheduled-tasks/register-redis';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import type Bull from 'bull';
import type { Job, JobOptions } from 'bull';

export class ExpectoPatronumScheduler extends ScheduledTaskRedisStrategy {
	public constructor(options?: ScheduledTaskRedisStrategyOptions) {
		super(options);
	}

	public override create<T = unknown>(
		task: string,
		payload?: ScheduledTaskRedisStrategyJob | undefined,
		options?: ScheduledTasksTaskOptions
	): Promise<Job<T>> | undefined {
		if (!this.client) {
			return;
		}

		let bullOptions: JobOptions = {
			delay: options?.delay,
			jobId: options?.bullJobOptions.jobId,
			removeOnComplete: true
		};

		if (options?.type === 'repeated') {
			bullOptions = {
				repeat: options?.interval
					? {
							every: options.interval
					  }
					: {
							cron: options.cron!
					  },
				...options.bullJobOptions
			};
		}

		return this.client.add(task, payload ?? null, bullOptions) as Promise<Bull.Job<T>> | undefined;
	}
}
