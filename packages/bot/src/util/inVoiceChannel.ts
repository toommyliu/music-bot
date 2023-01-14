import { GuildMember, type VoiceState } from 'discord.js';

export function inVoiceChannel(member: GuildMember | VoiceState) {
	if (member instanceof GuildMember) {
		return Boolean(member?.voice.channelId);
	}

	return Boolean(member?.channelId);
}
