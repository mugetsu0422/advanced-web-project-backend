-- drop DATABASE advanced_web_programming_website;
BEGIN;
CREATE DATABASE advanced_web_programming_website;

BEGIN;
USE advanced_web_programming_website;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
	UserID varchar(36) NOT NULL,
	UserName varchar(50) NOT NULL UNIQUE,
	FullName varchar(200) default "",
	Pass binary(60),
	GoogleID varchar(25) default "",
	FacebookID varchar(25) default "",
	Email varchar(200) NOT NULL UNIQUE,
	Phone varchar(15) default "",
	Address varchar(200) default "",
	Role enum('student', 'teacher', 'admin', '') NOT NULL,
	CreateTime datetime default CURRENT_TIMESTAMP(),
	IsActivated bool default(0),
	IsLocked bool default(0),
	IsDelete bool default(0),
	PRIMARY KEY(UserID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS classes;
CREATE TABLE classes (
	ClassID varchar(36) NOT NULL,
	ClassName varchar(100) NOT NULL,
	ClassDescription text,
	Creator varchar(36) NOT NULL,
	CreateTime datetime default CURRENT_TIMESTAMP(),
	Code varchar(10) default "",
	Link varchar(100) default "",
	IsClosed bool default(0),
	IsDelete bool default(0),
	FOREIGN KEY (Creator) REFERENCES users(UserID),
	PRIMARY KEY(ClassID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS class_student_list;
CREATE TABLE class_student_list (
	StudentID varchar(8) NOT NULL,
	ClassID varchar(36) NOT NULL,
	FullName varchar(200) default "",
	FOREIGN KEY (UserID) REFERENCES users(UserID),
    FOREIGN KEY (ClassID) REFERENCES classes(ClassID),
	PRIMARY KEY(StudentID, ClassID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS students;
CREATE TABLE students (
	UserID varchar(36) NOT NULL,
	StudentID varchar(8) NOT NULL UNIQUE,
	FOREIGN KEY (UserID) REFERENCES users(UserID),
	PRIMARY KEY(UserID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS class_participants;
CREATE TABLE class_participants (
	ClassID varchar(36) NOT NULL,
	UserID varchar(36) NOT NULL,
	FOREIGN KEY (UserID) REFERENCES users(UserID),
	FOREIGN KEY (ClassID) REFERENCES classes(ClassID),
	PRIMARY KEY(ClassID, UserID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS grade_compositions;
CREATE TABLE grade_compositions (
	GradeCompositionID varchar(36) NOT NULL,
	ClassID varchar(36) NOT NULL,
	GradeCompositionName varchar(100) NOT NULL,
	GradeScale int default(0),
	GradeCompositionOrder int default(0),
	CreateTime datetime default CURRENT_TIMESTAMP(),
	IsDelete bool default(0),
	IsFinalized bool default(0),
	FOREIGN KEY (ClassID) REFERENCES classes(ClassID),
	PRIMARY KEY(GradeCompositionID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS grades;
CREATE TABLE grades (
	GradeCompositionID varchar(36) NOT NULL,
	StudentID varchar(8) NOT NULL,
	Grade float default(0),
	CreateTime datetime default CURRENT_TIMESTAMP(),
	FOREIGN KEY (StudentID) REFERENCES class_student_list(StudentID),
	FOREIGN KEY (GradeCompositionID) REFERENCES grade_compositions(GradeCompositionID),
	PRIMARY KEY(GradeCompositionID, StudentID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS overall_grades;
CREATE TABLE overall_grades (
	ClassID varchar(36) NOT NULL,
	StudentID varchar(8) NOT NULL,
	Grade float default(0),
	FOREIGN KEY (StudentID) REFERENCES class_student_list(StudentID),
	FOREIGN KEY (ClassID) REFERENCES classes(ClassID),
	PRIMARY KEY(StudentID, ClassID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS grade_reviews;
CREATE TABLE grade_reviews (
	GradeCompositionID varchar(36) NOT NULL,
	UserID varchar(36) NOT NULL,
	CurrentGrade float default(0),
	ExpectationGrade float default(0),
	UpdatedGrade float default(0),
	Explanation text,
	IsFinal bool default(0),
	CreateTime datetime default CURRENT_TIMESTAMP(),
	FOREIGN KEY (UserID) REFERENCES users(UserID),
	FOREIGN KEY (GradeCompositionID) REFERENCES grade_compositions(GradeCompositionID),
	PRIMARY KEY(GradeCompositionID, UserID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS grade_review_comments;
CREATE TABLE grade_review_comments (
	CommentID varchar(36) NOT NULL,
	GradeCompositionID varchar(36) NOT NULL,
	UserID varchar(36) NOT NULL,
	AuthorID varchar(36) NOT NULL,
	CommentContent text,
	CreateTime datetime default CURRENT_TIMESTAMP(),
	FOREIGN KEY (AuthorID) REFERENCES users(UserID),
	FOREIGN KEY (GradeCompositionID, UserID) REFERENCES grade_reviews(GradeCompositionID, UserID),
	PRIMARY KEY(CommentID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS password_reset_tokens;
CREATE TABLE password_reset_tokens (
	UserID varchar(36) NOT NULL,
	Token varchar(128) NOT NULL,
	FOREIGN KEY (UserID) REFERENCES users(UserID),
	PRIMARY KEY (UserID, Token)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
	NotiID varchar(36) NOT NULL,
	SenderID varchar(36) NOT NULL,
	ReceiverID varchar(36) NOT NULL,
	Content text,
	FOREIGN KEY (SenderID) REFERENCES users(UserID),
	FOREIGN KEY (ReceiverID) REFERENCES users(UserID),
	PRIMARY KEY (NotiID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

DROP TABLE IF EXISTS email_activation_codes;
CREATE TABLE email_activation_codes (
	UserID varchar(36) NOT NULL,
	ActivationCode  varchar(128) NOT NULL,
	FOREIGN KEY (UserID) REFERENCES users(UserID),
	PRIMARY KEY (UserID, ActivationCode )
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;