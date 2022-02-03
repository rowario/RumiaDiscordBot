import { ArgsOf, Discord, On } from "discordx";
import { getCustomRepository } from "typeorm";
import { CustomUserRepository } from "../entities/User";
import { client } from "../libs/discord";

@Discord()
class InteractionCreate {
	@On("interactionCreate")
	async interaction([interaction]: ArgsOf<"interactionCreate">) {
		const {
			user: { id },
		} = interaction;
		await getCustomRepository(CustomUserRepository).findOneOrCreate({ id }, { id });

		client.executeInteraction(interaction);
	}
}
