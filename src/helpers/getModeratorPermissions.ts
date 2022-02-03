import { ApplicationCommandPermissions } from "discord.js";
import getSettings from "./getSettings";

export default async (): Promise<ApplicationCommandPermissions[]> => {
	const settings = await getSettings();

	return [
		{
			id: settings.moderatorRoleId,
			type: "ROLE",
			permission: true,
		},
	];
};
