package com.learningapp.data.repository

import com.learningapp.data.model.LearningProgressRequest
import com.learningapp.data.model.LearningRecord
import com.learningapp.data.remote.ApiService

class LearningRecordRepository(
    private val apiService: ApiService
) {
    
    suspend fun saveLearningProgress(
        courseId: String,
        unitId: String,
        progress: Int,
        lastPosition: Int? = null
    ): Result<LearningRecord> {
        return try {
            val request = LearningProgressRequest(courseId, unitId, progress, lastPosition)
            val response = apiService.saveLearningProgress(request)
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("保存学习进度失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getLearningRecords(courseId: String? = null): Result<List<LearningRecord>> {
        return try {
            val response = apiService.getLearningRecords(courseId)
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("获取学习记录失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun markUnitComplete(unitId: String): Result<Boolean> {
        return try {
            val response = apiService.markUnitComplete(unitId)
            
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!["success"] ?: false)
            } else {
                Result.failure(Exception("标记完成失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
