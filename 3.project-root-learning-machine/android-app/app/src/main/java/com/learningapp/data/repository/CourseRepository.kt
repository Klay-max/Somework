package com.learningapp.data.repository

import com.learningapp.data.model.Course
import com.learningapp.data.model.CourseDetail
import com.learningapp.data.model.LearningUnit
import com.learningapp.data.model.PageResponse
import com.learningapp.data.remote.ApiService

class CourseRepository(
    private val apiService: ApiService
) {
    
    suspend fun getCourseList(
        category: String? = null,
        status: String? = "PUBLISHED",
        page: Int = 0,
        size: Int = 20
    ): Result<PageResponse<Course>> {
        return try {
            val response = apiService.getCourseList(category, status, page, size)
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("获取课程列表失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCourseDetail(courseId: String): Result<CourseDetail> {
        return try {
            val response = apiService.getCourseDetail(courseId)
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("获取课程详情失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getLearningUnits(courseId: String): Result<List<LearningUnit>> {
        return try {
            val response = apiService.getLearningUnits(courseId)
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("获取学习单元失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
