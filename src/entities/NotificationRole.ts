import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("notification_role")
export class NotificationRole {
	@ObjectIdColumn()
	_id!: ObjectID;

	@Column()
	roleId!: string;

	@Column()
	channelId!: string;

	@Column()
	createdAt!: number;
}
