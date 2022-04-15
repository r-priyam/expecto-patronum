import { MessageEmbed } from 'discord.js';

import { Colors } from '#utils/constants';

class Embed {
	public info(description: string) {
		return new MessageEmbed({ title: 'Info', description, color: Colors.Info });
	}

	public success(description: string) {
		return new MessageEmbed({ title: 'Success', description, color: Colors.Success });
	}

	public warning(description: string) {
		return new MessageEmbed({ title: 'Warning', description, color: Colors.Warning });
	}

	public error(description: string) {
		return new MessageEmbed({ title: 'Error', description, color: Colors.Error });
	}
}

export const embedBuilder = new Embed();
