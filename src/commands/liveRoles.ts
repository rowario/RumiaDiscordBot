import { Discord, Permission, Slash, SlashGroup, SlashOption } from "discordx";
import { AutocompleteInteraction, CommandInteraction, Role } from "discord.js";
import { getRepository } from "typeorm";
import { LiveRoleEntity } from "../entities/LiveRole";
import getDefaultPermissions from "../helpers/getDefaultPermissions";

@Discord()
@SlashGroup("live", "Live roles management.")
@Permission(false)
@Permission(getDefaultPermissions)
class LiveRoles {
	@Slash("list")
	async list(interaction: CommandInteraction<"cached">) {
		const liveRoles = await getRepository(LiveRoleEntity).find({});
		if (liveRoles.length) {
			const {
				guild: { roles },
			} = interaction;
			await interaction.reply(
				"Live roles list: \n" +
					liveRoles
						.map(
							(x) =>
								`${roles.cache.get(x.roleId)?.name ?? `${x.roleId}`} => ` +
								`${roles.cache.get(x.liveRoleId)?.name ?? `${x.liveRoleId}`}`
						)
						.join("\n")
			);
		} else await interaction.reply("You have not created any Live roles!");
	}

	@Slash("add")
	async add(
		@SlashOption("role", { description: "Role." }) role: Role,
		@SlashOption("live_role", { description: "Live role." }) liveRole: Role,
		interaction: CommandInteraction
	) {
		const liveRepository = getRepository(LiveRoleEntity);
		await liveRepository.save(
			liveRepository.create({
				roleId: role.id,
				liveRoleId: liveRole.id,
			})
		);
		await interaction.reply("New role has been created!");
	}

	@Slash("delete")
	async delete(
		@SlashOption("name", {
			autocomplete: async (interaction: AutocompleteInteraction): Promise<void> => {
				const roles = await getRepository(LiveRoleEntity).find({});

				await interaction.respond(
					roles.map((x) => ({
						name: `@${interaction.guild?.roles.cache.get(x.liveRoleId)?.name}` ?? x.liveRoleId,
						value: x.liveRoleId,
					}))
				);
			},
			type: "STRING",
		})
		liveRoleId: string,
		interaction: CommandInteraction
	) {
		const liveRepository = getRepository(LiveRoleEntity);
		const role = await liveRepository.findOne({ liveRoleId });
		if (!role) {
			return void (await interaction.reply("Live role not found!"));
		}
		await liveRepository.delete(role);
		await interaction.reply("Live role successfully deleted!");
	}
}
