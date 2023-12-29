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
import { Class } from 'src/entity/classes.entity'
import { Student } from 'src/entity/students.entity'
import { GradeReview } from 'src/entity/grade-reviews.entity'

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

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('join-class/:id')
  async checkInvitationLink(
    @Param() params: any,
    @Query('code') code: string
  ): Promise<Class> {
    return await this.studentService.checkInvitationLink(params.id, code)
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('studentid')
  async getStudentID(
    @Request() { user: { UserID } }
  ): Promise<any> {
    return await this.studentService.getStudentIDByUserID(UserID)
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('studentid')
  async mapStudentID(
    @Request() { user: { UserID } },
    @Body('studentid') studentId: string,
  ): Promise<any> {
    try {
      return await this.studentService.mapStudentID(UserID, studentId)
    } catch (error) {
      throw new Error(error.message || 'Error mapping student ID');
    }
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/all-grade')
  async getGradeByClass(
    @Param('id') id: string,
    @Request() { user: { UserID } }
  ): Promise<any> {
    return await this.studentService.getGradeByClassIDAndUserID(id, UserID)
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/grade-review-detail')
  async addGradeReview(
    @Body() gradeReviewDetail: any,
    @Request() { user: { UserID } }
  ): Promise<any> {
    return await this.studentService.addGradeReview(UserID, gradeReviewDetail);
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/grade-review-detail')
  async getGradeReviewDetail(
    @Query('gradeCompositionID') gradeCompositionID: string,
    @Query('userID') userID: string,
  ): Promise<any> {
    return await this.studentService.getGradeReviewDetail(gradeCompositionID, userID);
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('class/:id/grade-review-comments')
  async getGradeReviewComments(
    @Query('gradeCompositionID') gradeCompositionID: string,
    @Query('userID') userID: string,
  ): Promise<any> {
    return await this.studentService.getGradeReviewComments(gradeCompositionID, userID);
  }

  @HasRoles(UserRole.Student)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('class/:id/grade-review-comments')
  async addGradeReviewComments(
    @Body() { gradeCompositionID, userID, commentContent }: any,
    @Request() { user: { UserID } },
  ): Promise<any> {
    return await this.studentService.addGradeReviewComment(
    gradeCompositionID,
    userID,
    UserID,
    commentContent
  );
  }
}
