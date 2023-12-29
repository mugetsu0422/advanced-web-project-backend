import { Module } from '@nestjs/common'
import { StudentsController } from './students.controller'
import { StudentsService } from './students.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from 'src/entity/students.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
