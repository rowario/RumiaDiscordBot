import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("notification_role")
export class NotificationRoleEntity {
	@ObjectIdColumn()
	_id!: ObjectID;

	@Column()
	roleId!: string;

	@Column()
	channelId!: string;

	@Column()
	createdAt!: number;
}
