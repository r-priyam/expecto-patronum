import { config } from 'dotenv-cra';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { sourceFolder } from '#utils/constants';

// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

config({ path: join(fileURLToPath(sourceFolder), '.env') });

class Environment {
	public get isDev(): boolean {
		return process.env.NODE_ENV === 'development';
	}

	public get owner(): string {
		return process.env.OWNER!;
	}
}

export const Config = new Environment();
