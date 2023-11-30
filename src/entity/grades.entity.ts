import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm'

@Entity({ name: 'grades' })
export class Grade {
  @PrimaryColumn({ name: 'GradeCompositionID', type: 'varchar', length: 36 })
  gradeCompositionID: string

  @PrimaryColumn({ name: 'UserID', type: 'varchar', length: 36 })
  userID: string

  @Column({ name: 'Grade', type: 'float', default: 0 })
  grade: number

  @CreateDateColumn({ name: 'CreateTime', type: 'datetime', nullable: true })
  createTime: Date
}
