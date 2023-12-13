import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { GradeComposition } from 'src/entity/grade-compositions.entity'
import { ClassStudentList } from 'src/entity/class-student-list.entity'
import { Student } from 'src/entity/students.entity'
import { Grade } from 'src/entity/grades.entity'
import { User } from 'src/entity/users.entity'
import { OverallGrade } from 'src/entity/overall-grades.entity'
import { Repository } from 'typeorm'

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(GradeComposition)
    private readonly gradeCompositionRepo: Repository<GradeComposition>,
    @InjectRepository(ClassStudentList)
    private readonly classStudentListRepo: Repository<ClassStudentList>,
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(OverallGrade)
    private readonly overallGradeRepo: Repository<OverallGrade>,
  ) {}

  async getGradeCompositionsByClassID(
    classID: string
  ): Promise<GradeComposition[]> {
    return await this.gradeCompositionRepo.findBy({ classID })
  }

  async uploadClassStudentList(
    classStudentList: ClassStudentList[]
  ): Promise<any> {
    try {
      await Promise.all(
        classStudentList.map((classStudent) =>
          this.classStudentListRepo.save(classStudent)
        )
      )
      return 'Upload completed'
    } catch (exception) {
      return 'Upload completed'
    }
  }

  async getClassStudentList(classID: string): Promise<ClassStudentList[]> {
    return await this.classStudentListRepo.findBy({ classID })
  }

  async getClassStudentAccountList(classID: string): Promise<User[]> {
    try {
      const classStudentList = await this.classStudentListRepo.findBy({
        classID,
      });
  
      const classStudentAccountListPromises = classStudentList.map(
        async (classStudent) => {
          const studentID = classStudent.id;
          const students = await this.studentRepo.findBy({ studentID });
  
          return students.map(student => ({
            ...student,
            studentID, 
          }));
        }
      );
  
      const classStudentAccountList = await Promise.all(
        classStudentAccountListPromises
      );
  
      const flattenedClassStudentAccountList = classStudentAccountList.flat();
  
      const accountListPromises = flattenedClassStudentAccountList.map(
        async (classStudent) => {
          const UserID = classStudent.id;
          const users = await this.userRepo.findBy({ UserID });
  
          return users.map(user => ({
            ...user,
            studentID: classStudent.studentID, 
          }));
        }
      );
  
      const accountList = await Promise.all(accountListPromises);
  
      const flattenedAccountList = accountList.flat();
  
      return flattenedAccountList;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  async updateGradeForSpecificAssignemnt(gradeList: Grade[]): Promise<any> {
    try {
      const promises = gradeList.map(async (grade) => {
        const existingGrade = await this.gradeRepo.findOne({
          where: {
            gradeCompositionID: grade.gradeCompositionID,
            studentID: grade.studentID,
          },
        });
  
        if (existingGrade) {
          await this.gradeRepo.update(
            { gradeCompositionID: existingGrade.gradeCompositionID, studentID: existingGrade.studentID },
            {
              grade: grade.grade,
            }
          );
        } else {
          await this.gradeRepo.save(grade);
        }
      });
  
      await Promise.all(promises);
      return 'Upload completed'
    } catch (exception) {
      return 'Upload completed'
    }
  }

  async getGradeByClassID(classID: string): Promise<Grade[]> {
    try {
      const gradeCompositionList = await this.gradeCompositionRepo.findBy({
        classID,
      })

      const gradePromises = gradeCompositionList.map(
        async (gradeComposition) => {
          const gradeCompositionID = gradeComposition.id
          const grades = await this.gradeRepo.findBy({ gradeCompositionID })
          return grades 
        }
      )

      const allGrades = await Promise.all(gradePromises)
      const flattenedGrades = allGrades.flat()

      return flattenedGrades
    } catch (error) {
      console.error('Error fetching grades:', error)
      throw error
    }
  }

  async updateOverallGrade(overallGradeList: OverallGrade[]): Promise<any> {
    try {
      const promises = overallGradeList.map(async (grade) => {
        const existingGrade = await this.overallGradeRepo.findOne({
          where: {
            classID: grade.classID,
            studentID: grade.studentID,
          },
        });
  
        if (existingGrade) {
          await this.overallGradeRepo.update(
            { classID: existingGrade.classID, studentID: existingGrade.studentID },
            {
              grade: grade.grade,
            }
          );
        } else {
          await this.overallGradeRepo.save(grade);
        }
      });
  
      await Promise.all(promises);
      return 'Upload completed'
    } catch (exception) {
      return 'Upload completed'
    }
  }

  async getOverallGradeByClassID(classID: string): Promise<OverallGrade[]> {
    return await this.overallGradeRepo.findBy({classID})
  }
}
