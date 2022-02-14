import { getRepository } from "typeorm";
import { UserEntity } from "../entities/User";
import { client } from "../libs/discord";
import getSettings from "../helpers/getSettings";

export default async () => {
	try {
		const userRepository = getRepository(UserEntity);
		const guild = client.guilds.cache.get(process.env["GUILD_ID"] ?? "");
		if (!guild) return;

		const settings = await getSettings();

		if (settings.activeRoleId) {
			// update all inactive members
			const haveToBeActiveUsers = await userRepository.find({
				where: {
					activity: {
						$gt: 199,
					},
				},
			});
			for (const user of haveToBeActiveUsers) {
				try {
					const activeMember = guild.members.cache.get(user.id);
					if (activeMember) {
						if (!activeMember.roles.cache.has(settings.activeRoleId)) {
							await activeMember.roles.add(settings.activeRoleId);
						}
					}
				} catch (e) {
					console.log(`Got an error while adding role to active member :(`);
				}
			}
			// update all active members
			const haveToBeInactiveUsers = await userRepository.find({
				where: {
					activity: {
						$lt: 33,
					},
				},
			});
			for (const user of haveToBeInactiveUsers) {
				try {
					const inactiveMember = guild.members.cache.get(user.id);
					if (inactiveMember) {
						if (inactiveMember.roles.cache.has(settings.activeRoleId)) {
							await inactiveMember.roles.remove(settings.activeRoleId);
						}
					}
				} catch (e) {
					console.log(`Got an error while removing role from inactive member :(`);
				}
			}
		}

		// update most active
		if (settings.mostActiveMemberRoleId) {
			const mostActiveUser = await userRepository.findOne({
				order: {
					overallActivity: -1,
				},
			});
			if (!mostActiveUser) return;
			try {
				const roleMembers = guild.roles.cache
					.get(settings.mostActiveMemberRoleId)
					?.members.filter((x) => x.id !== mostActiveUser.id);
				roleMembers?.forEach((x) => {
					x.roles.remove(settings.mostActiveMemberRoleId);
				});

				const mostActiveMember = guild.members.cache.get(mostActiveUser.id);
				if (mostActiveMember) {
					if (!mostActiveMember.roles.cache.has(settings.mostActiveMemberRoleId)) {
						await mostActiveMember.roles.add(settings.mostActiveMemberRoleId);
					}
				}
			} catch (e) {
				console.log(`Got an error while adding role to most active member :(`);
			}
		}
	} catch (e) {
		console.log(`Got an error @ updateActivityRoles`);
	}
};
