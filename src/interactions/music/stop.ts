import { ApplicationCommandOptionType } from 'discord.js';

export default {
	name: 'stop',
	description: 'Stop music playback',
	options: [
		{
			name: 'force',
			description: 'Stops music playback, regardless of status',
			optional: true,
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;
