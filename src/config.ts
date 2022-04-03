import { config } from 'dotenv-cra';
import { join } from 'path';
import { fileURLToPath } from 'url';

import { srcFolder } from '#utils/constants';

// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

config({ path: join(fileURLToPath(srcFolder), '.env') });

class Env {
	public get isDev(): boolean {
		return process.env.NODE_ENV === 'development';
	}

	public get owner(): string {
		return process.env.OWNER!;
	}
}

export const Config = new Env();
