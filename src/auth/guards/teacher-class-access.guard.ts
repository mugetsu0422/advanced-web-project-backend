import { TeachersService } from '../../teachers/teachers.service'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class TeacherClassAccess implements CanActivate {
  constructor(private readonly teacherService: TeachersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      user: { UserID: userID },
      params: { id: classID },
    } = context.switchToHttp().getRequest()
    const hasAccess = await this.teacherService.getClassAccess(userID, classID)
    if (!hasAccess) {
      throw new NotFoundException()
    }
    return hasAccess
  }
}
