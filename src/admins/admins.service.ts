import { User } from 'src/entity/users.entity'
import { InjectRepository } from '@nestjs/typeorm'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DataSource, EntityNotFoundError, Repository } from 'typeorm'
import { UserRole } from 'src/model/role.enum'
import { Student } from 'src/entity/students.entity'
import { Class } from 'src/entity/classes.entity'

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>
  ) {}

  async getTeacherAccounts(): Promise<User[]> {
    return await this.userRepo.find({
      where: { role: UserRole.Teacher },
    })
  }

  async getStudentAccounts(): Promise<User[]> {
    return await this.userRepo.find({
      where: { role: UserRole.Student },
    })
  }

  async updateAccounts(accountList: User[]): Promise<string> {
    try {
      const promises = accountList.map(async (account) => {
        await this.userRepo.update(
          { UserID: account.UserID },
          {
            username: account.username,
            fullname: account.fullname,
            email: account.email,
            phone: account.phone,
            address: account.address,
            isActivated: account.isActivated,
            isLocked: account.isLocked,
          }
        )
      })

      await Promise.all(promises)
      return 'Upload completed'
    } catch (exception) {
      console.log(exception)
      return 'Upload fail'
    }
  }

  async getMapStudent(): Promise<Student[]> {
    return await this.studentRepo.find()
  }

  async updateMapStudent(studetList: Student[]): Promise<string> {
    try {
      const promises = studetList.map(async (student) => {
        const existingStudent = await this.studentRepo.findOne({
          where: {
            id: student.id,
          },
        })

        if (student.studentID === '') {
          if (existingStudent) {
            await this.studentRepo.remove(existingStudent)
          }
        } else {
          if (existingStudent) {
            await this.studentRepo.update(
              {
                id: student.id,
              },
              {
                studentID: student.studentID,
              }
            )
          } else {
            await this.studentRepo.save(student)
          }
        }
      })

      await Promise.all(promises)
      return 'Upload completed'
    } catch (exception) {
      return 'Upload fail'
    }
  }

  async getClasses(): Promise<Class[]> {
    const classes = await this.classRepo.find()

    for (const classObj of classes) {
      const user = await this.userRepo.findBy({ UserID: classObj.creator })
      if (user) {
        classObj.creator = user[0].username
      }
    }

    return classes
  }

  async updateClasses(classList: Class[]): Promise<string> {
    try {
      const promises = classList.map(async (classes) => {
        await this.classRepo.update(
          { id: classes.id },
          {
            name: classes.name,
            description: classes.description,
            isClosed: classes.isClosed,
          }
        )
      })

      await Promise.all(promises)
      return 'Upload completed'
    } catch (exception) {
      console.log(exception)
      return 'Upload fail'
    }
  }
}
