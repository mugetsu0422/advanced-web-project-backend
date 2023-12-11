import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity({ name: 'overall_grades' })
export class OverallGrade {
  @PrimaryColumn({ name: 'ClassID', type: 'varchar', length: 36 })
  classID: string

  @PrimaryColumn({ name: 'StudentID', type: 'varchar', length: 8 })
  studentID: string

  @Column({ name: 'Grade', type: 'float', default: 0 })
  grade: number
}
