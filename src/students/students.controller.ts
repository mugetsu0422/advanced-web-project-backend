import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Query,
  Param,
  Post,
  Body,
} from '@nestjs/common'
import { StudentsService } from './students.service'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { GradeComposition } from 'src/entity/grade-compositions.entity'

@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('class/count')
  getClassCount(@Request() req) {
    return this.studentService.getClassCount(req.user)
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('class')
  getClasses(@Request() req, @Query() query: string) {
    return this.studentService.getClassesByOffset(
      req.user,
      +query['offset'],
      +query['limit']
    )
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('class/:id')
  getClassDetails(@Request() req, @Param() params: any) {
    return this.studentService.getClassDetails(params.id)
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('class/:id/people')
  getClassPeople(@Param() params: any) {
    return this.studentService.getClassPeople(params.id)
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/grade-compositions')
  async getGradeCompositionsByClass(
    @Param() params: any
  ): Promise<GradeComposition[]> {
    return await this.studentService.getGradeCompositionsByClassID(params.id)
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('join-class')
  async joinClassByCode(
    @Body() { code }: { code: string },
    @Request() { user }
  ): Promise<string> {
    return await this.studentService.joinClassByCode(code, user.UserID)
  }
}
