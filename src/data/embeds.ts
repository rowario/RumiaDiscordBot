import { Activity, Collection, GuildMember, MessageEmbed, Role } from "discord.js";
import { LiveRoleEntity } from "../entities/LiveRole";
import { UserEntity } from "../entities/User";
import { chooseHistoryEntity } from "../entities/chooseHistory";
import { SettingsEntity } from "../entities/Settings";

export default {
	liveRolesTop: (liveRoles: LiveRoleEntity[], roles: Collection<string, Role>) => {
		return new MessageEmbed()
			.setTitle("Live roles")
			.addFields([
				{
					name: "> Role",
					value: liveRoles
						.map((x) => roles.get(x.roleId)?.toString() ?? `<@&${x.roleId}>`)
						.join("\n"),
					inline: true,
				},
				{
					name: "> Live role",
					value: liveRoles
						.map((x) => roles.get(x.liveRoleId)?.toString() ?? `<@&${x.liveRoleId}>`)
						.join("\n"),
					inline: true,
				},
				{
					name: "> Created at",
					value: liveRoles.map((x) => `<t:${x.createdAt}:R>`).join("\n"),
					inline: true,
				},
			])
			.setColor("#2f3136");
	},
	activityTop: (users: UserEntity[], members: Collection<string, GuildMember>) => {
		const medals = ["🥇", "🥈", "🥉"];

		return new MessageEmbed()
			.setTitle("Activity top")
			.addFields([
				{
					name: "> Member",
					value: users
						.map(
							(x, i) =>
								`${medals[i] ?? `**#${i + 1}**`}` +
								`${members.get(x.id)?.user.toString() ?? `<@${x.id}>`}`
						)
						.join("\n"),
					inline: true,
				},
				{
					name: "> Activity value",
					value: users.map((x) => x.activity).join("\n"),
					inline: true,
				},
				{
					name: "> Last update",
					value: users.map((x) => `<t:${x.lastTick}:R>`).join("\n"),
					inline: true,
				},
			])
			.setColor("#2f3136");
	},
	randomSteamer: (stream: Activity, chosen: GuildMember) => {
		const streamTitle = `**[${stream.details ?? `${chosen.user.tag} Stream`}](${stream.url ?? ""})**`;
		const twitchUsername = stream.assets?.largeImage?.split(":")[1];

		return new MessageEmbed()
			.setTitle("🥳 We got our random streamer!")
			.setColor("#2f3136")
			.setDescription(`${streamTitle} \n` + `**Category:** *${stream.state ?? "Unknown category"}*`)
			.setThumbnail(chosen.user.avatarURL() ?? "")
			.setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchUsername}-1280x720.jpg`)
			.addFields([
				{
					name: "> Member",
					value: chosen.toString(),
					inline: true,
				},
				{
					name: "> Channel",
					value: stream.url ?? "",
					inline: true,
				},
			]);
	},
	randomStreamersHistory: (
		history: chooseHistoryEntity[],
		members: Collection<string, GuildMember>,
		roles: Collection<string, Role>
	) => {
		return new MessageEmbed()
			.setTitle("Random streamers history.")
			.setColor("#2f3136")
			.addFields([
				{
					name: "> Member",
					value: history
						.map((x, i) => `**#${i + 1}** ${members.get(x.id)?.user.toString() ?? `<@${x.id}>`}`)
						.join("\n"),
					inline: true,
				},
				{
					name: "> Role",
					value: history
						.map((x) => `${roles.get(x.roleId)?.toString() ?? `<@&${x.roleId}>`}`)
						.join("\n"),
					inline: true,
				},
				{ name: "> Date", value: history.map((x) => `<t:${x.date}:R>`).join("\n"), inline: true },
			]);
	},
	settings: (settings: SettingsEntity, roles: Collection<string, Role>) => {
		return new MessageEmbed().setTitle("RumiaBot settings.").addFields([
			{
				name: "Moderator role: ",
				value: `> ${roles.get(settings.moderatorRoleId)?.toString() ?? "Not set yet."}`,
			},
			{
				name: "Most active member role: ",
				value: `> ${roles.get(settings.mostActiveMemberRoleId)?.toString() ?? "Not set yet."}`,
			},
		]);
	},
};
