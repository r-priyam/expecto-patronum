// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { join } from 'path';
import { config } from 'dotenv-cra';
import { srcFolder } from '#utils/constants';
import { fileURLToPath } from 'url';

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
