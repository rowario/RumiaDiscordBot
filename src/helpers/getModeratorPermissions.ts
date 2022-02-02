import { getCustomRepository } from "typeorm";
import { CustomSettingsRepository } from "../entities/Settings";
import { ApplicationCommandPermissions } from "discord.js";

export default async (): Promise<ApplicationCommandPermissions[]> => {
	const settings = await getCustomRepository(CustomSettingsRepository).findOneOrCreate();

	return [
		{
			id: settings.moderatorRoleId,
			type: "ROLE",
			permission: true,
		},
	];
};
