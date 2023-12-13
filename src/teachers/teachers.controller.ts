import { Controller, Get, UseGuards, Post, Body, Param } from '@nestjs/common'
import { TeachersService } from './teachers.service'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { ClassStudentList } from 'src/entity/class-student-list.entity'
import { Grade } from 'src/entity/grades.entity'
import { OverallGrade } from 'src/entity/overall-grades.entity'

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}

  // Thêm trước mỗi api
  // @HasRoles(UserRole.Teacher)
  // @UseGuards(JwtAuthGuard, RolesGuard)

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/grade-compositions')
  async getGradeCompositionsByClass(
    @Param('id') id: string
  ): Promise<any> {
    return await this.teacherService.getGradeCompositionsByClassID(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/student-list')
  async uploadClassStudentList(
    @Body()
    { classStudentList }: { classStudentList:  ClassStudentList[]}
  ): Promise<any> {
    return await this.teacherService.uploadClassStudentList(classStudentList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/student-list')
  async GetClassStudentList(
    @Param('id') id: string
  ): Promise<any> {
    return await this.teacherService.getClassStudentList(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/student-account-list')
  async GetClassStudentAccountList(
    @Param('id') id: string
  ): Promise<any> {
    return await this.teacherService.getClassStudentAccountList(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/specific-grade')
  async UpdateGradeForSpecificAssignemnt(
    @Body()
    { gradeList }: { gradeList: Grade[] }
  ): Promise<any> {
    return await this.teacherService.updateGradeForSpecificAssignemnt(gradeList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/all-grade')
  async GetGrade(
    @Param('id') id: string
  ): Promise<any> {
    return await this.teacherService.getGradeByClassID(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/overall-grade')
  async UpdateOverallGrade(
    @Body()
    { overallGradeList }: {  overallGradeList: OverallGrade[] }
  ): Promise<any> {
    return await this.teacherService.updateOverallGrade(overallGradeList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/overall-grade')
  async GetOverallGrade(
    @Param('id') id: string
  ): Promise<any> {
    return await this.teacherService.getOverallGradeByClassID(id)
  }
}
