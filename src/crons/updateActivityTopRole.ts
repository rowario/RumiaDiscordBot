import { getRepository } from "typeorm";
import { UserEntity } from "../entities/User";
import { client } from "../libs/discord";
import getSettings from "../helpers/getSettings";

export default async () => {
	const userRepository = getRepository(UserEntity);
	const guild = client.guilds.cache.get(process.env["GUILD_ID"] ?? "");
	if (!guild) return;
	const user = await userRepository.findOne({
		order: {
			activity: -1,
		},
	});
	if (!user) return;
	const settings = await getSettings();
	const roleMembers = guild.roles.cache
		.get(settings.mostActiveMemberRoleId)
		?.members.filter((x) => x.id !== user.id);
	roleMembers?.forEach((x) => {
		x.roles.remove(settings.mostActiveMemberRoleId);
	});

	const activeMember = guild.members.cache.get(user.id);
	if (activeMember) {
		if (!activeMember.roles.cache.has(settings.mostActiveMemberRoleId)) {
			await activeMember.roles.add(settings.mostActiveMemberRoleId);
		}
	}
};
