import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity('class_student_list')
export class Student {
  @PrimaryColumn({ name: 'StudentID', type: 'varchar', length: 8 })
  id: string

  @PrimaryColumn({ name: 'ClassID', type: 'varchar', length: 36 })
  classID: string

  @Column({ name: 'FullName', type: 'varchar', length: 200, default: '' })
  fullname: string
}
