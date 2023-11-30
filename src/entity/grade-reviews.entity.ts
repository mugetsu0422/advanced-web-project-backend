import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm'

@Entity({ name: 'grade_reviews' })
export class GradeReview {
  @PrimaryColumn({ name: 'GradeCompositionID', type: 'varchar', length: 36 })
  gradeCompositionID: string

  @PrimaryColumn({ name: 'UserID', type: 'varchar', length: 36 })
  userID: string

  @Column({ name: 'CurrentGrade', type: 'float', default: 0 })
  currentGrade: number

  @Column({ name: 'ExpectationGrade', type: 'float', default: 0 })
  expectationGrade: number

  @Column({ name: 'UpdatedGrade', type: 'float', default: 0 })
  updatedGrade: number

  @Column({ name: 'Explanation', type: 'text', nullable: true })
  explanation: string

  @Column({ name: 'IsFinal', type: 'bool', default: false })
  isFinal: boolean

  @CreateDateColumn({ name: 'CreateTime', type: 'datetime', nullable: true })
  createTime: Date
}
