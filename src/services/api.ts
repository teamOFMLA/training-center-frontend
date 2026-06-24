import { apiClient } from '../lib/axios';
import * as T from '../types/api';

/**
 * API Service layer mapped to Swagger endpoints.
 */
export const apiService = {
  // ==========================================
  // 01. Authentication
  // ==========================================
  auth: {
    login: async (data: T.LoginRequestDto): Promise<T.AuthResponseDto> => {
      const res = await apiClient.post<T.AuthResponseDto>('/api/auth/login', data);
      return res.data;
    },
    refresh: async (data: T.RefreshRequest): Promise<T.AuthResponseDto> => {
      const res = await apiClient.post<T.AuthResponseDto>('/api/auth/refresh', data);
      return res.data;
    },
    logout: async (data: T.LogoutRequest): Promise<void> => {
      await apiClient.post('/api/auth/logout', data);
    },
  },

  // ==========================================
  // 02. Instructors & Managers
  // ==========================================
  instructors: {
    getAll: async (): Promise<T.InstructorDto[]> => {
      const res = await apiClient.get<T.InstructorDto[]>('/api/instructors');
      return res.data;
    },
    create: async (data: T.CreateInstructorDto): Promise<T.InstructorDto> => {
      const res = await apiClient.post<T.InstructorDto>('/api/instructors', data);
      return res.data;
    },
    getById: async (id: number): Promise<T.InstructorDto> => {
      const res = await apiClient.get<T.InstructorDto>(`/api/instructors/${id}`);
      return res.data;
    },
    update: async (id: number, data: T.UpdateInstructorDto): Promise<T.InstructorDto> => {
      const res = await apiClient.put<T.InstructorDto>(`/api/instructors/${id}`, data);
      return res.data;
    },
    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/instructors/${id}`);
    },
    getCourses: async (id: number): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>(`/api/instructors/${id}/courses`);
      return res.data;
    },
    // Status filters
    getActive: async (): Promise<T.InstructorDto[]> => {
      const res = await apiClient.get<T.InstructorDto[]>('/api/instructors/active');
      return res.data;
    },
    getInactive: async (): Promise<T.InstructorDto[]> => {
      const res = await apiClient.get<T.InstructorDto[]>('/api/instructors/inactive');
      return res.data;
    },
    activate: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/instructors/${id}/activate`);
    },
    deactivate: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/instructors/${id}/deactivate`);
    },
    // Managers
    getManager: async (id: number): Promise<T.InstructorDto> => {
      const res = await apiClient.get<T.InstructorDto>(`/api/instructors/${id}/manager`);
      return res.data;
    },
    assignManager: async (id: number, data: T.AssignManagerDto): Promise<void> => {
      await apiClient.patch(`/api/instructors/${id}/manager`, data);
    },
    getSubordinates: async (id: number): Promise<T.InstructorDto[]> => {
      const res = await apiClient.get<T.InstructorDto[]>(`/api/instructors/${id}/subordinates`);
      return res.data;
    },
  },

  // ==========================================
  // 03. Students & Profiles
  // ==========================================
  students: {
    getAll: async (): Promise<T.StudentDto[]> => {
      const res = await apiClient.get<T.StudentDto[]>('/api/students');
      return res.data;
    },
    create: async (data: T.CreateStudentDto): Promise<T.StudentDto> => {
      const res = await apiClient.post<T.StudentDto>('/api/students', data);
      return res.data;
    },
    getById: async (id: number): Promise<T.StudentDto> => {
      const res = await apiClient.get<T.StudentDto>(`/api/students/${id}`);
      return res.data;
    },
    update: async (id: number, data: T.UpdateStudentDto): Promise<T.StudentDto> => {
      const res = await apiClient.put<T.StudentDto>(`/api/students/${id}`, data);
      return res.data;
    },
    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/students/${id}`);
    },
    getEnrollments: async (id: number): Promise<T.EnrollmentDto[]> => {
      const res = await apiClient.get<T.EnrollmentDto[]>(`/api/students/${id}/enrollments`);
      return res.data;
    },
    // Status filters
    getActive: async (): Promise<T.StudentDto[]> => {
      const res = await apiClient.get<T.StudentDto[]>('/api/students/active');
      return res.data;
    },
    getSuspended: async (): Promise<T.StudentDto[]> => {
      const res = await apiClient.get<T.StudentDto[]>('/api/students/suspended');
      return res.data;
    },
    getGraduated: async (): Promise<T.StudentDto[]> => {
      const res = await apiClient.get<T.StudentDto[]>('/api/students/graduated');
      return res.data;
    },
    activate: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/students/${id}/activate`);
    },
    suspend: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/students/${id}/suspend`);
    },
    graduate: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/students/${id}/graduate`);
    },
    // Profiles
    getProfile: async (id: number): Promise<T.StudentProfileDto> => {
      const res = await apiClient.get<T.StudentProfileDto>(`/api/students/${id}/profile`);
      return res.data;
    },
    createProfile: async (id: number, data: T.CreateStudentProfileDto): Promise<T.StudentProfileDto> => {
      const res = await apiClient.post<T.StudentProfileDto>(`/api/students/${id}/profile`, data);
      return res.data;
    },
    updateProfile: async (id: number, data: T.UpdateStudentProfileDto): Promise<T.StudentProfileDto> => {
      const res = await apiClient.put<T.StudentProfileDto>(`/api/students/${id}/profile`, data);
      return res.data;
    },
    deleteProfile: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/students/${id}/profile`);
    },
  },

  // ==========================================
  // 04. Courses
  // ==========================================
  courses: {
    getAll: async (): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>('/api/courses');
      return res.data;
    },
    create: async (data: T.CreateCourseDto): Promise<T.CourseDto> => {
      const res = await apiClient.post<T.CourseDto>('/api/courses', data);
      return res.data;
    },
    getById: async (id: number): Promise<T.CourseDto> => {
      const res = await apiClient.get<T.CourseDto>(`/api/courses/${id}`);
      return res.data;
    },
    update: async (id: number, data: T.UpdateCourseDto): Promise<T.CourseDto> => {
      const res = await apiClient.put<T.CourseDto>(`/api/courses/${id}`, data);
      return res.data;
    },
    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/courses/${id}`);
    },
    getByCode: async (code: string): Promise<T.CourseDto> => {
      const res = await apiClient.get<T.CourseDto>(`/api/courses/code/${code}`);
      return res.data;
    },
    getInstructor: async (id: number): Promise<T.CourseInstructorDto> => {
      const res = await apiClient.get<T.CourseInstructorDto>(`/api/courses/${id}/instructor`);
      return res.data;
    },
    changeInstructor: async (id: number, data: T.ChangeCourseInstructorDto): Promise<void> => {
      await apiClient.patch(`/api/courses/${id}/instructor`, data);
    },
    getEnrollments: async (id: number): Promise<T.EnrollmentDto[]> => {
      const res = await apiClient.get<T.EnrollmentDto[]>(`/api/courses/${id}/enrollments`);
      return res.data;
    },
    // Filtering states and workflows
    publish: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/courses/${id}/publish`);
    },
    archive: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/courses/${id}/archive`);
    },
    unpublish: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/courses/${id}/unpublish`);
    },
    getPublished: async (): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>('/api/courses/published');
      return res.data;
    },
    getDrafts: async (): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>('/api/courses/draft');
      return res.data;
    },
    getArchived: async (): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>('/api/courses/archived');
      return res.data;
    },
    getBeginner: async (): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>('/api/courses/beginner');
      return res.data;
    },
    getIntermediate: async (): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>('/api/courses/intermediate');
      return res.data;
    },
    getAdvanced: async (): Promise<T.CourseDto[]> => {
      const res = await apiClient.get<T.CourseDto[]>('/api/courses/advanced');
      return res.data;
    },
  },

  // ==========================================
  // 05. Enrollments
  // ==========================================
  enrollments: {
    getAll: async (): Promise<T.EnrollmentDto[]> => {
      const res = await apiClient.get<T.EnrollmentDto[]>('/api/enrollments');
      return res.data;
    },
    create: async (data: T.EnrollStudentDto): Promise<T.EnrollmentDto> => {
      const res = await apiClient.post<T.EnrollmentDto>('/api/enrollments', data);
      return res.data;
    },
    getById: async (id: number): Promise<T.EnrollmentDto> => {
      const res = await apiClient.get<T.EnrollmentDto>(`/api/enrollments/${id}`);
      return res.data;
    },
    complete: async (id: number, data: T.CompleteEnrollmentDto): Promise<void> => {
      await apiClient.patch(`/api/enrollments/${id}/complete`, data);
    },
    drop: async (id: number): Promise<void> => {
      await apiClient.patch(`/api/enrollments/${id}/drop`);
    },
    updateProgress: async (id: number, data: T.UpdateEnrollmentProgressDto): Promise<void> => {
      await apiClient.patch(`/api/enrollments/${id}/progress`, data);
    },
    getActive: async (): Promise<T.EnrollmentDto[]> => {
      const res = await apiClient.get<T.EnrollmentDto[]>('/api/enrollments/active');
      return res.data;
    },
    getCompleted: async (): Promise<T.EnrollmentDto[]> => {
      const res = await apiClient.get<T.EnrollmentDto[]>('/api/enrollments/completed');
      return res.data;
    },
    getDropped: async (): Promise<T.EnrollmentDto[]> => {
      const res = await apiClient.get<T.EnrollmentDto[]>('/api/enrollments/dropped');
      return res.data;
    },
    getStatistics: async (): Promise<T.EnrollmentStatisticsDto> => {
      const res = await apiClient.get<T.EnrollmentStatisticsDto>('/api/enrollments/statistics');
      return res.data;
    },
  },
};
