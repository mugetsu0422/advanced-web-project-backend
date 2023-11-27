import { SetMetadata } from '@nestjs/common'
import { UserRole } from 'src/model/role.enum'

export const HasRoles = (...roles: UserRole[]) => SetMetadata('roles', roles)
