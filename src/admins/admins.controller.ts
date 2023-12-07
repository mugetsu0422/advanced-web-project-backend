import { Controller, Get, UseGuards } from '@nestjs/common'
import { UserRole } from 'src/model/role.enum'
import { HasRoles } from 'src/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { AdminsService } from './admins.service'

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminService: AdminsService) {}

  // Thêm trước mỗi api
  // @HasRoles(UserRole.Admin)
  // @UseGuards(JwtAuthGuard, RolesGuard)
}
