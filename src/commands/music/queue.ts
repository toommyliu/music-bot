import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { hyperlink, userMention } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { kQueue } from '../../tokens.js';
import type { Command } from '#struct/Command';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { QueueMap } from '#struct/Queue.js';
import { createEmbed } from '#util/createEmbed.js';

@injectable()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(@inject(kQueue) private readonly queues: QueueMap) {}

	public async handle(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const queue = this.queues.get(interaction.guildId);

		if (!queue?.tracks.length || !queue.player?.connected) {
			await interaction.editReply({ content: 'Play some music first.' });
			return;
		}

		const embed = createEmbed({
			title: `${interaction.guild!.name} Queue`,
			description: `Now playing: ${hyperlink(
				queue.tracks[0]?.info.title ?? 'Unknown track',
				queue.tracks[0]?.info.uri ?? '',
			)}\n\n`,
		});

		for (let idx = 1; idx < queue.tracks.length; idx++) {
			const track = queue.tracks[idx];

			embed!.description += `${(idx + 1).toString().padStart(queue.tracks.length, '0')}. ${hyperlink(
				track?.info.title ?? 'Unknown track',
				track?.info.uri ?? '',
			)} ${userMention(track!.requestedBy)}\n`;
		}

		await interaction.editReply({ embeds: [embed] });
	}
}
