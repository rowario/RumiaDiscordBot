import { CustomSettingsRepository, SettingsEntity } from "../entities/Settings";
import { getCustomRepository } from "typeorm";

let settings: SettingsEntity;

export default async (): Promise<SettingsEntity> => {
	if (!settings) {
		settings = await getCustomRepository(CustomSettingsRepository).findOneOrCreate();
	}
	return settings;
};

export const updateSettings = async (): Promise<void> => {
	settings = await getCustomRepository(CustomSettingsRepository).findOneOrCreate();
};
