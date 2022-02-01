import { getRepository } from "typeorm";
import { UserEntity } from "../entities/User";
import { client } from "../libs/discord";

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
	const activeRoleId = process.env["ACTIVE_ROLE"] ?? "";
	const roleMembers = guild.roles.cache.get(activeRoleId)?.members.filter((x) => x.id !== user.id);
	roleMembers?.forEach((x) => {
		x.roles.remove(activeRoleId);
	});

	const activeMember = guild.members.cache.get(user.id);
	if (activeMember) {
		if (!activeMember.roles.cache.has(activeRoleId)) {
			await activeMember.roles.add(activeRoleId);
		}
	}
};
