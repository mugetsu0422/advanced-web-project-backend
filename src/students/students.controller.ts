import { Controller, Get, UseGuards } from '@nestjs/common'
import { StudentsService } from './students.service'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'

@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}

  // Thêm trước mỗi api
  // @HasRoles(UserRole.Student)
  // @UseGuards(JwtAuthGuard, RolesGuard)
}
