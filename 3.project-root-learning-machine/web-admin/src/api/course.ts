import apiClient from './client'

export interface Course {
  id: string
  name: string
  description: string
  coverImage: string
  category: string
  difficulty: string
  status: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface CreateCourseRequest {
  name: string
  description: string
  coverImage: string
  category: string
  difficulty: string
}

export const courseApi = {
  getCourseList: (params?: { category?: string; status?: string; page?: number; size?: number }) => {
    return apiClient.get<{ content: Course[]; totalElements: number }>('/courses', { params })
  },
  
  getCourseDetail: (courseId: string) => {
    return apiClient.get(`/courses/${courseId}`)
  },
  
  createCourse: (data: CreateCourseRequest) => {
    return apiClient.post<Course>('/admin/courses', data)
  },
  
  updateCourse: (courseId: string, data: Partial<CreateCourseRequest>) => {
    return apiClient.put<Course>(`/admin/courses/${courseId}`, data)
  },
  
  publishCourse: (courseId: string) => {
    return apiClient.post(`/admin/courses/${courseId}/publish`)
  },
  
  deleteCourse: (courseId: string) => {
    return apiClient.delete(`/admin/courses/${courseId}`)
  }
}
