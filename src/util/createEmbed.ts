import type { APIEmbed } from 'discord.js';

export function createEmbed(data: APIEmbed) {
	return {
		...data,
	};
}
