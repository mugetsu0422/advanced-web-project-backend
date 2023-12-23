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
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { AdminsService } from './admins.service'
import { User } from 'src/entity/users.entity'
import { Student } from 'src/entity/students.entity'
import { Class } from 'src/entity/classes.entity'

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminService: AdminsService) {}

  // Thêm trước mỗi api
  // @HasRoles(UserRole.Admin)
  // @UseGuards(JwtAuthGuard, RolesGuard)

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('teacher-accounts')
  async getTeacherAccounts(): Promise<any> {
    return this.adminService.getTeacherAccounts()
  }  

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('teacher-accounts')
  async updateTeacherAccounts(@Body() {accountList}: { accountList: User[] }): Promise<any> {
    return this.adminService.updateAccounts(accountList);
  }

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('student-accounts')
  async getStudentAccounts(): Promise<any> {
    return this.adminService.getStudentAccounts()
  }  

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('student-accounts')
  async updateStudentAccounts(@Body() {accountList}: { accountList: User[] }): Promise<any> {
    return this.adminService.updateAccounts(accountList);
  }

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('map-student')
  async getMapStudent(): Promise<any> {
    return this.adminService.getMapStudent();
  }

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('map-student')
  async updateMapStudent(@Body() {studentList}: { studentList: Student[] }): Promise<any> {
    return this.adminService.updateMapStudent(studentList);
  }

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('classes')
  async getClasses(): Promise<any> {
    return this.adminService.getClasses();
  }

  @HasRoles(UserRole.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('classes')
  async updateClasses(@Body() {classList}: { classList: Class[] }): Promise<any> {
    return this.adminService.updateClasses(classList);
  }
}
