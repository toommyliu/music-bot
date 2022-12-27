import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { hyperlink, inlineCode } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { kQueue } from '../../tokens.js';
import type { Command } from '#struct/Command';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { QueueMap } from '#struct/Queue.js';
import { createEmbed } from '#util/createEmbed.js';

const MAX = 10;

const normalizeTime = (time: string): string => (time.length === 1 ? time.padStart(2, '0') : time);
function timeString(millisec: number) {
	let seconds: string = (millisec / 1_000).toFixed(0);
	let minutes: string = Math.floor(Number.parseInt(seconds, 10) / 60).toString();
	let hours = '';

	if (Number.parseInt(minutes, 10) > 59) {
		hours = normalizeTime(Math.floor(Number.parseInt(minutes, 10) / 60).toString());
		minutes = normalizeTime((Number.parseInt(minutes, 10) - Number.parseInt(hours, 10) * 60).toString());
	}

	seconds = normalizeTime(Math.floor(Number.parseInt(seconds, 10) % 60).toString());

	if (hours !== '') {
		return `${hours}:${minutes}:${seconds}`;
	}

	return `${minutes}:${seconds}`;
}

@injectable()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(@inject(kQueue) private readonly queues: QueueMap) {}

	public async handle(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		let page = interaction.options.getInteger('page', false) ?? 0;
		const queue = this.queues.get(interaction.guildId);

		if (!queue?.tracks.length || !queue.player?.connected) {
			await interaction.editReply({ content: 'Play some music first.' });
			return;
		}

		const maxPage = Math.ceil(queue.tracks.length / MAX);
		if (page > maxPage || page < 1) {
			page = 1;
		}

		const tracks = queue.tracks.slice(1).slice((page - 1) * MAX, page * MAX);

		const embed = createEmbed({
			title: `${interaction.guild!.name} Queue`,
			description: `
			Now playing: ${hyperlink(queue.tracks[0]!.info.title, queue.tracks[0]!.info.uri)} (${timeString(
				queue.player.accuratePosition ?? queue.player.position ?? 0,
			)}/${timeString(queue.currentTrack?.info.length ?? 0)})

			Up next:
			${tracks
				.map(
					(track, index) =>
						`${inlineCode(Number((page - 1) * MAX + index + 1).toString())} ${hyperlink(
							track.info.title,
							track.info.uri,
						)} ${
							track.requestedBy ? inlineCode(interaction.client.users.cache.get(track.requestedBy)?.tag ?? '') : ''
						}`,
				)
				.join('\n')}`,
			footer: {
				text: `Page ${page}/${maxPage}`,
			},
		});

		await interaction.editReply({ embeds: [embed] });
	}
}
