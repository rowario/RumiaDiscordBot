import { ApplicationCommandPermissions, Guild } from "discord.js";

export default async (guild: Guild): Promise<ApplicationCommandPermissions[]> => {
	const permissions: ApplicationCommandPermissions[] = [
		{
			id: guild.ownerId,
			type: "USER",
			permission: true,
		},
	];

	guild.roles.cache
		.filter((x) => x.permissions.has("ADMINISTRATOR"))
		.forEach((x) => {
			permissions.push({
				id: x.id,
				type: "ROLE",
				permission: true,
			});
		});

	return permissions;
};
