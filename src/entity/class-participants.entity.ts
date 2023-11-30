import { Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'class_participants' })
export class ClassParticipants {
  @PrimaryColumn({ name: 'ClassID', type: 'varchar', length: 36 })
  classID: string

  @PrimaryColumn({ name: 'UserID', type: 'varchar', length: 36 })
  userID: string
}
