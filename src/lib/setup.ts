import '#root/config';
import 'reflect-metadata';
import '@sapphire/plugin-logger/register';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import * as colorette from 'colorette';
import { inspect } from 'util';

// set behavior to overwrite so that it can be overwritten by other changes
// rather than warning in console.
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

inspect.defaultOptions.depth = 1;
colorette.createColors({ useColor: true });
