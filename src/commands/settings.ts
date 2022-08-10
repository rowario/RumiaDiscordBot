import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, Role } from "discord.js";
import { getRepository } from "typeorm";
import { SettingsEntity } from "../entities/Settings";
import embeds from "../data/embeds";
import getSettings, { updateSettings } from "../helpers/getSettings";

@Discord()
@SlashGroup({ name: "settings", description: "Bot settings" })
@SlashGroup({ name: "set_role", description: "Roles management", root: "settings" })
@SlashGroup({ name: "scam_ignored", description: "Scam links ignored roles management", root: "settings" })
class Settings {
	@Slash("info", { description: "Current settings information" })
	@SlashGroup("settings")
	async settings(interaction: CommandInteraction<"cached">) {
		const settings = await getSettings();
		const {
			roles: { cache: rolesCache },
		} = interaction.guild;

		await interaction.reply({ ephemeral: true, embeds: [embeds.settings(settings, rolesCache)] });
	}

	@Slash("moderator", { description: "Sets moderator role" })
	@SlashGroup("settings")
	async setModeratorRole(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		await getRepository(SettingsEntity).update(
			{},
			{
				moderatorRoleId: role.id,
			}
		);
		await updateSettings();
		await interaction.reply(`${role.name} role successfully set as Moderator role!`);
	}

	@Slash("active", { description: "Sets Active member role" })
	@SlashGroup("settings")
	async setActiveRole(@SlashOption("role") role: Role, interaction: CommandInteraction) {
		await getRepository(SettingsEntity).update(
			{},
			{
				activeRoleId: role.id,
			}
		);
		await updateSettings();
		await interaction.reply(`${role.name} role successfully set as Active member role!`);
	}

	@Slash("most_active", { description: "Sets Most active member role" })
	@SlashGroup("settings")
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

	@Slash("add", { description: "Adds role to scam links remover ignored roles list" })
	@SlashGroup("settings")
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

	@Slash("remove", { description: "Removes role from scam links remover ignored roles list" })
	@SlashGroup("settings")
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
			type: ApplicationCommandOptionType.String,
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
