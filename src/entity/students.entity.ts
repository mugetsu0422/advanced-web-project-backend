import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity('students')
export class Student {
  @PrimaryColumn({ name: 'UserID', type: 'varchar', length: 36 })
  id: string

  @Column({ name: 'StudentID', type: 'varchar', length: 8, unique: true })
  studentID: string
}
