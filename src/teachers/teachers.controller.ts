import { Controller, Get, UseGuards, Post, Body, } from '@nestjs/common'
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
  @Post('grade-compositions-by-class')
  async getGradeCompositionsByClass(
    @Body()
    { classID }: { classID: string }
  ): Promise<any> {
    return await this.teacherService.getGradeCompositionsByClassID(classID)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload-class-student-list')
  async uploadClassStudentList(
    @Body()
    { classStudentList }: { classStudentList:  ClassStudentList[]}
  ): Promise<any> {
    return await this.teacherService.uploadClassStudentList(classStudentList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('get-class-student-list')
  async GetClassStudentList(
    @Body()
    { classID }: { classID: string }
  ): Promise<any> {
    return await this.teacherService.getClassStudentList(classID)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('get-class-student-account-list')
  async GetClassStudentAccountList(
    @Body()
    { classID }: { classID: string }
  ): Promise<any> {
    return await this.teacherService.getClassStudentAccountList(classID)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('update-grade-specific-assignment')
  async UpdateGradeForSpecificAssignemnt(
    @Body()
    { gradeList }: { gradeList: Grade[] }
  ): Promise<any> {
    return await this.teacherService.updateGradeForSpecificAssignemnt(gradeList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('get-grade')
  async GetGrade(
    @Body()
    { classID }: { classID: string }
  ): Promise<any> {
    return await this.teacherService.getGradeByClassID(classID)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('update-overall-grade')
  async UpdateOverallGrade(
    @Body()
    { overallGradeList }: {  overallGradeList: OverallGrade[] }
  ): Promise<any> {
    return await this.teacherService.updateOverallGrade(overallGradeList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('get-overall-grade')
  async GetOverallGrade(
    @Body()
    { classID }: { classID: string }
  ): Promise<any> {
    return await this.teacherService.getOverallGradeByClassID(classID)
  }
}
