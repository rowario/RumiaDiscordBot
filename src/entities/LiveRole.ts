import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("live_roles")
export class LiveRoleEntity {
	@ObjectIdColumn()
	_id!: ObjectID;

	@Column()
	roleId!: string;

	@Column()
	liveRoleId!: string;
}
