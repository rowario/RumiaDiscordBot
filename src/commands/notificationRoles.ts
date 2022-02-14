import { Discord, Permission, Slash, SlashGroup, SlashOption } from "discordx";
import { AutocompleteInteraction, Channel, CommandInteraction, Role } from "discord.js";
import { getRepository } from "typeorm";
import getDefaultPermissions from "../helpers/getDefaultPermissions";
import dayjs from "dayjs";
import embeds from "../data/embeds";
import { NotificationRole } from "../entities/NotificationRole";

@Discord()
@Permission(false)
@Permission(getDefaultPermissions)
@SlashGroup({ name: "notifications", description: "Notification roles management." })
class LiveRoles {
	@Slash("list", { description: "Shows all notification roles" })
	@SlashGroup({ name: "notifications" })
	async list(interaction: CommandInteraction<"cached">) {
		const notificationRoles = await getRepository(NotificationRole).find({});
		if (notificationRoles.length) {
			const {
				guild: {
					roles: { cache: rolesCache },
					channels: { cache: channelsCache },
				},
			} = interaction;

			await interaction.reply({
				embeds: [embeds.notificationRolesList(notificationRoles, rolesCache, channelsCache)],
			});
		} else await interaction.reply("You have not created any Notification roles!");
	}

	@Slash("add", { description: "Adds new notification role" })
	@SlashGroup({ name: "notifications" })
	async add(
		@SlashOption("role", { description: "Role." }) role: Role,
		@SlashOption("channel", { description: "Live role." }) channel: Channel,
		interaction: CommandInteraction
	) {
		const notificationRoleRepository = getRepository(NotificationRole);
		await notificationRoleRepository.save(
			notificationRoleRepository.create({
				roleId: role.id,
				channelId: channel.id,
				createdAt: dayjs().unix(),
			})
		);
		await interaction.reply({
			ephemeral: true,
			content: "New notification role has been added!",
		});
	}

	@Slash("delete", { description: "Deletes notification role" })
	@SlashGroup({ name: "notifications" })
	async delete(
		@SlashOption("name", {
			autocomplete: async (interaction: AutocompleteInteraction): Promise<void> => {
				const roles = await getRepository(NotificationRole).find({});

				await interaction.respond(
					roles.map((x) => ({
						name: `@${interaction.guild?.roles.cache.get(x.roleId)?.name}` ?? x.roleId,
						value: x.roleId,
					}))
				);
			},
			type: "STRING",
		})
		roleId: string,
		interaction: CommandInteraction
	) {
		const notificationRoleRepository = getRepository(NotificationRole);
		const role = await notificationRoleRepository.findOne({ roleId });
		if (!role) {
			await interaction.reply({
				ephemeral: true,
				content: "Notification role not found!",
			});
			return;
		}
		await notificationRoleRepository.delete(role);
		await interaction.reply({
			ephemeral: true,
			content: "Notification role successfully deleted!",
		});
	}
}
