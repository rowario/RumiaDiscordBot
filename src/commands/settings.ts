import { Discord, Permission, Slash, SlashGroup, SlashOption } from "discordx";
import { CommandInteraction, Role } from "discord.js";
import getDefaultPermissions from "../helpers/getDefaultPermissions";
import { getCustomRepository } from "typeorm";
import { CustomSettingsRepository } from "../entities/Settings";
import { client } from "../libs/discord";
import embeds from "../data/embeds";

@Discord()
@SlashGroup("settings", "RumiaBot settings.", {
	set_role: "Updating roles",
})
@Permission(false)
@Permission(getDefaultPermissions)
class Settings {
	@Slash("info")
	async settings(interaction: CommandInteraction<"cached">) {
		await interaction.deferReply();

		const settings = await getCustomRepository(CustomSettingsRepository).findOneOrCreate();
		const {
			roles: { cache: rolesCache },
		} = interaction.guild;

		await interaction.editReply({ embeds: [embeds.settings(settings, rolesCache)] });
	}

	@Slash("moderator")
	@SlashGroup("set_role")
	async setModeratorRole(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		await getCustomRepository(CustomSettingsRepository).update(
			{},
			{
				moderatorRoleId: role.id,
			}
		);
		await client.initApplicationPermissions();
		await interaction.reply(`${role.name} role successfully set as Moderator role!`);
	}

	@Slash("most_active")
	@SlashGroup("set_role")
	async setMostActiveRole(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		await getCustomRepository(CustomSettingsRepository).update(
			{},
			{
				mostActiveMemberRoleId: role.id,
			}
		);
		await interaction.reply(`${role.name} role successfully set as Most active member role!`);
	}
}
