// eslint-disable-next-line import/no-extraneous-dependencies
import { LoadType } from '@lavaclient/types/rest/v3/';
import type { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { Node } from 'lavaclient';
import { injectable, inject } from 'tsyringe';
import { kManager } from '../../tokens.js';
import { create } from '#functions/create.js';
import { play } from '#functions/play.js';
import { inVoiceChannel } from '#preconditions/inVoiceChannel.js';
import type { Command } from '#struct/Command';

@injectable()
export default class implements Command<ApplicationCommandType.ChatInput> {
	public constructor(@inject(kManager) private readonly node: Node) {}

	public async handle(interaction: ChatInputCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const { channelId, guildId } = interaction;
		const { voice } = interaction.member;
		if (!inVoiceChannel(voice)) {
			await interaction.editReply({ content: 'Join a voice channel first.' });
			return;
		}

		const query = interaction.options.getString('query', true);

		const res = await this.node.rest.loadTracks(/^https?:\/\//.test(query) ? query : `ytsearch:${query}`);

		const queue = create(guildId, { textChannelId: channelId, voiceChannelId: voice.channelId! });
		const requestedBy = { requestedBy: interaction.user.id };

		switch (res.loadType) {
			case LoadType.LoadFailed:
			case LoadType.NoMatches: {
				await interaction.editReply({ content: 'Lookup failed, try again.' });
				return;
			}

			case LoadType.PlaylistLoaded:
				{
					let count = 0;
					for (const track of res.tracks) {
						queue.tracks.push(Object.assign(track, requestedBy));
						count += 1;
					}

					await interaction.editReply(`Loaded playlist ${res.playlistInfo.name} with ${count} tracks.`);
				}

				break;
			default: {
				const track = res.tracks[0]!;
				queue.tracks.push(Object.assign(track, requestedBy));
			}
		}

		await play(interaction.guildId, {
			textChannelId: interaction.channelId,
			voiceChannelId: voice.channelId,
		});
		await interaction.deleteReply();
	}
}
