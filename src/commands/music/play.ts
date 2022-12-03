import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { Node } from 'lavaclient';
import { injectable, inject } from 'tsyringe';
import { kManager } from '../../tokens.js';
import { create } from '#functions/create.js';
import type { Command } from '#struct/Command';

@injectable()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(@inject(kManager) private readonly node: Node) {}

	public async handle(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const { channelId, guildId } = interaction;
		const { voice } = interaction.member;

		if (!voice.channelId) {
			await interaction.editReply({ content: 'Join a voice channel first.' });
			return;
		}

		const query = interaction.options.getString('query', true);

		const player = this.node.players.get(interaction.guildId) ?? this.node.createPlayer(interaction.guildId);
		const res = await this.node.rest.loadTracks(/^https?:\/\//.test(query) ? query : `ytsearch:${query}`);

		const queue = create(guildId, { textChannelId: channelId, voiceChannelId: voice.channelId! });
		const track = res.tracks[0]!;

		await player.connect(voice.channelId, { deafened: true }).play(track);
		queue.tracks.push(track.info);

		await interaction.editReply(`now playing: ${res.tracks[0]?.info.title}`);
	}
}
