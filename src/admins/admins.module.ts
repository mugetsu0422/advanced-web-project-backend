import { Module } from '@nestjs/common'
import { AdminsController } from './admins.controller'
import { AdminsService } from './admins.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity/users.entity'
import { Student } from 'src/entity/students.entity'
import { Class } from 'src/entity/classes.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Student]),
    TypeOrmModule.forFeature([Class]),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
