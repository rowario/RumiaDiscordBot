import { Discord, Permission, Slash, SlashGroup, SlashOption } from "discordx";
import { AutocompleteInteraction, CommandInteraction, Role } from "discord.js";
import getDefaultPermissions from "../helpers/getDefaultPermissions";
import { getRepository } from "typeorm";
import { SettingsEntity } from "../entities/Settings";
import { client } from "../libs/discord";
import embeds from "../data/embeds";
import getSettings, { updateSettings } from "../helpers/getSettings";

@Discord()
@SlashGroup("settings", "RumiaBot settings.", {
	set_role: "Updating roles",
	scam_ignored: "Scam ignored roles manage",
})
@Permission(false)
@Permission(getDefaultPermissions)
class Settings {
	@Slash("info")
	async settings(interaction: CommandInteraction<"cached">) {
		await interaction.deferReply();

		const settings = await getSettings();
		const {
			roles: { cache: rolesCache },
		} = interaction.guild;

		await interaction.editReply({ embeds: [embeds.settings(settings, rolesCache)] });
	}

	@Slash("moderator")
	@SlashGroup("set_role")
	async setModeratorRole(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		await getRepository(SettingsEntity).update(
			{},
			{
				moderatorRoleId: role.id,
			}
		);
		await updateSettings();
		await client.initApplicationPermissions();
		await interaction.reply(`${role.name} role successfully set as Moderator role!`);
	}

	@Slash("most_active")
	@SlashGroup("set_role")
	async setMostActiveRole(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		await getRepository(SettingsEntity).update(
			{},
			{
				mostActiveMemberRoleId: role.id,
			}
		);
		await updateSettings();
		await interaction.reply(`${role.name} role successfully set as Most active member role!`);
	}

	@Slash("add")
	@SlashGroup("scam_ignored")
	async add(@SlashOption("role") role: Role, interaction: CommandInteraction<"cached">) {
		await interaction.deferReply({
			ephemeral: true,
		});

		const settings = await getSettings();
		if (settings.scamIgnore.indexOf(role.id) !== -1) {
			await interaction.editReply("This role is already in ignored list!");
			return;
		}

		settings.scamIgnore.push(role.id);
		await getRepository(SettingsEntity).save(settings);
		await updateSettings();

		await interaction.editReply("Role successfully added to scam ignore list!");
	}

	@Slash("remove")
	@SlashGroup("scam_ignored")
	async remove(
		@SlashOption("name", {
			autocomplete: async (interaction: AutocompleteInteraction): Promise<void> => {
				const settings = await getSettings();

				await interaction.respond(
					settings.scamIgnore.map((x) => ({
						name: `@${interaction.guild?.roles.cache.get(x)?.name}` ?? x,
						value: x,
					}))
				);
			},
			type: "STRING",
		})
		removeRoleId: string,
		interaction: CommandInteraction<"cached">
	) {
		await interaction.deferReply({
			ephemeral: true,
		});

		const settings = await getSettings();
		const arrIndex = settings.scamIgnore.indexOf(removeRoleId);

		if (arrIndex === -1) {
			await interaction.editReply("This role is not in ignored list!");
			return;
		}

		settings.scamIgnore.splice(arrIndex, 1);
		await getRepository(SettingsEntity).save(settings);
		await updateSettings();

		await interaction.editReply("Role successfully removed from scam ignore list!");
	}
}
