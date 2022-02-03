import { Activity, Channel, Collection, GuildMember, MessageEmbed, Role } from "discord.js";
import { LiveRoleEntity } from "../entities/LiveRole";
import { UserEntity } from "../entities/User";
import { ChooseHistoryEntity } from "../entities/ChooseHistory";
import { SettingsEntity } from "../entities/Settings";
import { NotificationRoleEntity } from "../entities/NotificationRoleEntity";

export default {
	notificationRolesList: (
		liveRoles: NotificationRoleEntity[],
		roles: Collection<string, Role>,
		channels: Collection<string, Channel>
	) => {
		return new MessageEmbed()
			.setTitle("Notification roles")
			.addFields([
				{
					name: "> Role",
					value: liveRoles
						.map((x) => roles.get(x.roleId)?.toString() ?? `<@&${x.roleId}>`)
						.join("\n"),
					inline: true,
				},
				{
					name: "> Channel",
					value: liveRoles
						.map((x) => channels.get(x.channelId)?.toString() ?? `<#${x.channelId}>`)
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
	liveRolesList: (liveRoles: LiveRoleEntity[], roles: Collection<string, Role>) => {
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

		return new MessageEmbed()
			.setTitle("🥳 We got our random streamer!")
			.setColor("#2f3136")
			.setDescription(`${streamTitle} \n` + `**Category:** *${stream.state ?? "Unknown category"}*`)
			.setThumbnail(chosen.user.avatarURL() ?? "")
			.setImage(stream.assets?.largeImageURL() ?? "")
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
		history: ChooseHistoryEntity[],
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
				name: "> Moderator role",
				value: ` ${roles.get(settings.moderatorRoleId)?.toString() ?? "Not set yet."}`,
			},
			{
				name: "> Most active member role",
				value: ` ${roles.get(settings.mostActiveMemberRoleId)?.toString() ?? "Not set yet."}`,
			},
			{
				name: "Scam ignored roles",
				value: settings.scamIgnore.map((x) => `${roles.get(x)?.toString() ?? `<@&${x}>`}`).join(","),
			},
		]);
	},
};
