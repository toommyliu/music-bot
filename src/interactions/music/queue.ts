import { ApplicationCommandOptionType } from 'discord.js';

export default {
	name: 'queue',
	description: 'View the queue',
	options: [
		{
			name: 'page',
			description: 'View the queue at this page',
			type: ApplicationCommandOptionType.Integer,
			required: false,
		},
	],
} as const;
