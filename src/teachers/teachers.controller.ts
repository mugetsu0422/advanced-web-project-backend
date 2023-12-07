import { Controller, Get, UseGuards } from '@nestjs/common'
import { TeachersService } from './teachers.service'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teacherService: TeachersService) {}

  // Thêm trước mỗi api
  // @HasRoles(UserRole.Teacher)
  // @UseGuards(JwtAuthGuard, RolesGuard)
}
