import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity("already_chosen")
export class alreadyChosenEntity {
	@ObjectIdColumn()
	_id!: ObjectID;

	@Column()
	id!: string;

	@Column()
	date!: number;
}
