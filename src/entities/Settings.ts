import { Column, Entity, EntityRepository, ObjectID, ObjectIdColumn, Repository } from "typeorm";

@Entity("settings")
export class SettingsEntity {
	@ObjectIdColumn()
	_id!: ObjectID;

	@Column()
	moderatorRoleId!: string;

	@Column()
	mostActiveMemberRoleId!: string;
}

@EntityRepository(SettingsEntity)
export class CustomSettingsRepository extends Repository<SettingsEntity> {
	async findOneOrCreate(): Promise<SettingsEntity> {
		const settings = await this.findOne({});
		if (settings) return settings;
		return this.save(this.create());
	}
}
