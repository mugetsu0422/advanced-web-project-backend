import { Module } from '@nestjs/common'
import { TeachersController } from './teachers.controller'
import { TeachersService } from './teachers.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { ClassStudentList } from 'src/entity/class-student-list.entity'
import { Student } from 'src/entity/students.entity'
import { Grade } from 'src/entity/grades.entity'
import { User } from 'src/entity/users.entity'
import { OverallGrade } from 'src/entity/overall-grades.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([GradeComposition]),
    TypeOrmModule.forFeature([ClassStudentList]),
    TypeOrmModule.forFeature([Grade]),
    TypeOrmModule.forFeature([Student]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([OverallGrade]),
  ],
  controllers: [TeachersController],
  exports: [TeachersService],
  providers: [TeachersService],
})
export class TeachersModule {}
