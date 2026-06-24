/**
 * API Types generated from Swagger/OpenAPI specification.
 */

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'Draft' | 'Published' | 'Archived';
export type EnrollmentStatus = 'Active' | 'Completed' | 'Dropped';
export type StudentStatus = 'Active' | 'Suspended' | 'Graduated';

export interface AssignManagerDto {
  managerId: number | null;
}

export interface AuthResponseDto {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  role: string | null;
  expiresAt: string; // date-time
}

export interface ChangeCourseInstructorDto {
  instructorId: number;
}

export interface CompleteEnrollmentDto {
  finalGrade: number;
}

export interface CourseDto {
  courseId: number;
  title: string | null;
  code: string | null;
  description: string | null;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  durationHours: number;
  createdAt: string; // date-time
  publishedAt: string | null; // date-time
  instructorId: number;
}

export interface CourseInstructorDto {
  instructorId: number;
  fullName: string | null;
  email: string | null;
}

export interface CreateCourseDto {
  title: string | null;
  code: string | null;
  description: string | null;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  durationHours: number;
  instructorId: number;
}

export interface CreateInstructorDto {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  password: string | null;
  hireDate: string; // date (YYYY-MM-DD)
  salary: number;
  managerId: number | null;
  isActive: boolean;
}

export interface CreateStudentDto {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  password: string | null;
  dateOfBirth: string; // date (YYYY-MM-DD)
  status: StudentStatus;
  phoneNumber: string | null;
}

export interface CreateStudentProfileDto {
  address: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  linkedInUrl: string | null;
}

export interface EnrollStudentDto {
  studentId: number;
  courseId: number;
}

export interface EnrollmentDto {
  enrollmentId: number;
  studentId: number;
  studentName: string | null;
  courseId: number;
  courseTitle: string | null;
  enrollmentDate: string; // date-time
  completionDate: string | null; // date-time
  progressPercent: number;
  finalGrade: number | null;
  status: EnrollmentStatus;
}

export interface EnrollmentStatisticsDto {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | null;
  timestamp: string; // date-time
}

export interface InstructorDto {
  instructorId: number;
  fullName: string | null;
  email: string | null;
  hireDate: string; // date
  salary: number;
  isActive: boolean;
  managerId: number | null;
}

export interface LoginRequestDto {
  email: string | null;
  password: string | null;
}

export interface LogoutRequest {
  email: string | null;
  refreshToken: string | null;
}

export interface RefreshRequest {
  refreshToken: string | null;
  email: string | null;
}

export interface StudentDto {
  studentId: number;
  fullName: string | null;
  email: string | null;
  dateOfBirth: string; // date
  status: StudentStatus;
  phoneNumber: string | null;
  registeredAt: string; // date-time
}

export interface StudentProfileDto {
  studentId: number;
  address: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  linkedInUrl: string | null;
}

export interface UpdateCourseDto {
  title: string | null;
  code: string | null;
  description: string | null;
  price: number;
  level: CourseLevel;
  durationHours: number;
  instructorId: number;
}

export interface UpdateEnrollmentProgressDto {
  progressPercent: number;
}

export interface UpdateInstructorDto {
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  salary: number;
  managerId: number | null;
  isActive: boolean;
}

export interface UpdateStudentDto {
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  status: StudentStatus;
  phoneNumber: string | null;
}

export interface UpdateStudentProfileDto {
  address: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  linkedInUrl: string | null;
}
