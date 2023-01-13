import { ApplicationCommandOptionType } from 'discord.js';

export default {
	name: 'volume',
	description: 'Control music volume levels',
	options: [
		{
			name: 'level',
			description: 'The music volume level',
			optional: true,
			type: ApplicationCommandOptionType.Integer,
		},
	],
} as const;
