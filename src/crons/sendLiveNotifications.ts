import { getRepository } from "typeorm";
import { NotificationRole } from "../entities/NotificationRole";
import { client } from "../libs/discord";
import { LiveNotification } from "../entities/LiveNotification";
import dayjs from "dayjs";

export default async () => {
	const guild = client.guilds.cache.get(process.env["GUILD_ID"] ?? "");
	if (!guild) return;

	const notificationRoles = await getRepository(NotificationRole).find({});
	const liveNotificationRepository = getRepository(LiveNotification);

	for (const notificationRole of notificationRoles) {
		const channel = guild.channels.cache.get(notificationRole.channelId);
		if (!channel || !channel.isText()) continue;

		const members = guild.roles.cache.get(notificationRole.roleId)?.members;
		if (!members || !members.size) continue;

		const sentNotifications = (
			await liveNotificationRepository.find({
				where: {
					date: {
						$gt: dayjs().unix() - 43200,
					},
					channelId: notificationRole.channelId,
				},
			})
		).map((x) => x.memberId);

		const streamers = members
			.filter((x) => {
				if (!x.presence) return false;
				return x.presence.activities.filter((x) => x.type === "STREAMING").length > 0;
			})
			.filter((x) => sentNotifications.indexOf(x.id) === -1);

		for (const streamer of streamers.values()) {
			if (!streamer.presence) continue;
			const stream = streamer.presence.activities.filter((x) => x.type === "STREAMING")[0];
			if (!stream) continue;
			await liveNotificationRepository.save(
				liveNotificationRepository.create({
					memberId: streamer.id,
					channelId: channel.id,
					streamId: channel.id,
					date: dayjs().unix(),
				})
			);
			await channel.send(
				`**${streamer.user.username}** went live!\n` +
					`Streaming: **${stream.state ?? "Unknown Game"}** @ ${stream.url}`
			);
		}
	}
};
