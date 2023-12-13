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
  Param,
} from '@nestjs/common'
import { TeachersService } from './teachers.service'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Class } from 'src/entity/classes.entity'
import { TeacherClassAccess } from 'src/auth/guards/teacher-class-access.guard'

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
  getClassCount(@Request() req) {
    return this.teacherService.getClassCount(req.user)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('class')
  getClasses(@Request() req, @Query() query: string) {
    return this.teacherService.getClassesByOffset(
      req.user,
      +query['offset'],
      +query['limit']
    )
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard, TeacherClassAccess)
  @HttpCode(HttpStatus.OK)
  @Get('class/:id')
  getClassDetails(@Request() req, @Param() params: any) {
    return this.teacherService.getClassDetails(params.id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard, TeacherClassAccess)
  @HttpCode(HttpStatus.OK)
  @Get('class/:id/people')
  getClassPeople(@Param() params: any) {
    return this.teacherService.getClassPeople(params.id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard, TeacherClassAccess)
  @HttpCode(HttpStatus.CREATED)
  @Post('class/:id/people')
  addClassPeople(@Body() { email }: { email: string }, @Param() params: any) {
    return this.teacherService.addClassPeople(email, params.id)
  }
}
