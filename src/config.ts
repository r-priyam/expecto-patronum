// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { join } from 'path';
import { config } from 'dotenv-cra';
import { srcFolder } from '#utils/constants';
import { fileURLToPath } from 'url';

config({ path: join(fileURLToPath(srcFolder), '.env') });

export const OWNERS = ['419365927138754571'];
