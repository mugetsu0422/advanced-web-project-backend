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
  Put,
} from '@nestjs/common'
import { TeachersService } from './teachers.service'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Class } from 'src/entity/classes.entity'
import { TeacherClassAccess } from 'src/auth/guards/teacher-class-access.guard'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { ClassStudentList } from 'src/entity/class-student-list.entity'
import { Grade } from 'src/entity/grades.entity'
import { OverallGrade } from 'src/entity/overall-grades.entity'

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

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/grade-compositions')
  async getGradeCompositionsByClass(@Param() params: any): Promise<any> {
    return await this.teacherService.getGradeCompositionsByClassID(params.id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/grade-compositions')
  async updateGradeCompositionsByClass(@Param('id') id: string, @Body() compositions: GradeComposition[]): Promise<any> {
    return await this.teacherService.updateGradeCompositions(id, compositions);
  }  

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/student-list')
  async uploadClassStudentList(
    @Body()
    { classStudentList }: { classStudentList: ClassStudentList[] }
  ): Promise<any> {
    return await this.teacherService.uploadClassStudentList(classStudentList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/student-list')
  async GetClassStudentList(@Param('id') id: string): Promise<any> {
    return await this.teacherService.getClassStudentList(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/student-account-list')
  async GetClassStudentAccountList(@Param('id') id: string): Promise<any> {
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
  async GetGrade(@Param('id') id: string): Promise<any> {
    return await this.teacherService.getGradeByClassID(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/overall-grade')
  async UpdateOverallGrade(
    @Body()
    { overallGradeList }: { overallGradeList: OverallGrade[] }
  ): Promise<any> {
    return await this.teacherService.updateOverallGrade(overallGradeList)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/overall-grade')
  async GetOverallGrade(@Param('id') id: string): Promise<any> {
    return await this.teacherService.getOverallGradeByClassID(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/grade-reviews')
  async getGradeReviewsByClass(@Param('id') id: string): Promise<any> {
    return await this.teacherService.getGradeReviewsByClassID(id)
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/grade-review-detail')
  async getGradeReviewDetail(
    @Query('gradeCompositionID') gradeCompositionID: string,
    @Query('userID') userID: string,
  ): Promise<any> {
    return await this.teacherService.getGradeReviewDetail(gradeCompositionID, userID);
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('class/:id/grade-review-detail')
  async updateGradeReviewDetail(
    @Body() updateData: any,
  ): Promise<any> {
    try {
      return await this.teacherService.updateGradeReviewDetail(updateData);
    } catch (error) {
      throw error;
    }
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/grade-review-comments')
  async getGradeReviewComments(
    @Query('gradeCompositionID') gradeCompositionID: string,
    @Query('userID') userID: string,
  ): Promise<any> {
    return await this.teacherService.getGradeReviewComments(gradeCompositionID, userID);
  }

  @HasRoles(UserRole.Teacher)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/grade-review-comments')
  async addGradeReviewComments(
    @Body() { gradeCompositionID, userID, commentContent }: any,
    @Request() { user: { UserID } },
  ): Promise<any> {
    return await this.teacherService.addGradeReviewComment(
    gradeCompositionID,
    userID,
    UserID,
    commentContent
  );
  }
}