import { Module } from '@nestjs/common'
import { TeachersController } from './teachers.controller'
import { TeachersService } from './teachers.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class } from 'src/entity/classes.entity'
import { ClassParticipants } from 'src/entity/class-participants.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Class]),
    TypeOrmModule.forFeature([ClassParticipants]),
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
