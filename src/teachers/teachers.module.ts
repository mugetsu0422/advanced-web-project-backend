import { Module } from '@nestjs/common'
import { TeachersController } from './teachers.controller'
import { TeachersService } from './teachers.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class } from 'src/entity/classes.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Class])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
