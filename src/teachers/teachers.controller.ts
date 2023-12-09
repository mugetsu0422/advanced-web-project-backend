import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  Post,
  HttpStatus,
  Body,
  Request,
  Query,
} from '@nestjs/common'
import { TeachersService } from './teachers.service'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Class } from 'src/entity/classes.entity'
import { User } from 'src/entity/users.entity'

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('class')
  createClass(@Body() _class: Class) {
    return this.teacherService.createClass(_class)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('class/count')
  getClassCount(@Request() user: User) {
    return this.teacherService.getClassCount(user)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('class')
  getClasses(@Request() user: User, @Query() query: string) {
    return this.teacherService.getClassesByOffset(
      user,
      +query['offset'],
      +query['limit']
    )
  }
}
