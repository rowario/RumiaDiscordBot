import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("choose_history")
export class ChooseHistoryEntity {
	@ObjectIdColumn()
	_id!: ObjectID;

	@Column()
	id!: string;

	@Column()
	roleId!: string;

	@Column()
	date!: number;
}
