import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid', { name: 'StudentID' })
  id: string

  @Column({ name: 'FullName', type: 'varchar', length: 200, default: '' })
  fullname: string

  @Column({ name: 'UserName', type: 'varchar', length: 36 })
  userID: string
}
