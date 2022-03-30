import '#root/config';
import 'reflect-metadata';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import * as colorette from 'colorette';
import { inspect } from 'util';

inspect.defaultOptions.depth = 2;
colorette.createColors({ useColor: true });
