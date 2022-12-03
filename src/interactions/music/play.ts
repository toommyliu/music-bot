import { ApplicationCommandOptionType } from 'discord.js';

export default {
	name: 'play',
	description: 'Play music',
	options: [
		{
			name: 'query',
			description: 'The name of the song to play',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
	],
} as const;
