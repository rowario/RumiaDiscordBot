import { getRepository } from "typeorm";
import { LiveRoleEntity } from "../entities/LiveRole";
import { client } from "../libs/discord";

export default async (): Promise<void> => {
	const liveRoles = await getRepository(LiveRoleEntity).find({});
	const guild = client.guilds.cache.get(process.env["GUILD_ID"] ?? "");

	if (guild) {
		for (const liveRole of liveRoles) {
			const members = guild.roles.cache.get(liveRole.roleId)?.members;
			if (members && members.size > 0) {
				const streamers = members.filter((x) => {
					if (!x.presence || !x.presence.activities) return false;
					return x.presence.activities.filter((j) => j.type === "STREAMING").length > 0;
				});

				for (const streamer of streamers.values()) {
					if (!streamer.roles.cache.has(liveRole.liveRoleId)) {
						await streamer.roles.add(liveRole.liveRoleId);
					}
				}
			}
			const liveMembers = guild.roles.cache.get(liveRole.liveRoleId)?.members;
			if (liveMembers && liveMembers.size > 0) {
				const streamers = liveMembers.filter((x) => {
					if (!x.presence || !x.presence.activities) return true;
					return x.presence.activities.filter((j) => j.type === "STREAMING").length < 1;
				});

				for (const streamer of streamers.values()) {
					if (streamer.roles.cache.has(liveRole.liveRoleId)) {
						await streamer.roles.remove(liveRole.liveRoleId);
					}
				}
			}
		}
	}
};
