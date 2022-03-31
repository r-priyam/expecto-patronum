import '#root/config';
import 'reflect-metadata';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import * as colorette from 'colorette';
import { inspect } from 'util';
import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';

// set behavior to overwrite so that it can be overwritten by other changes
// rather than warning in console.
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.Overwrite);

inspect.defaultOptions.depth = 2;
colorette.createColors({ useColor: true });
