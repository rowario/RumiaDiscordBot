import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("live_notification")
export class LiveNotification {
	@ObjectIdColumn()
	_id!: ObjectID;

	@Column()
	memberId!: string;

	@Column()
	channelId!: string;

	@Column()
	streamId!: string;

	@Column()
	date!: number;
}
