package com.examai.data.repository

import com.examai.data.local.dao.ReportDao
import com.examai.data.local.entity.CachedReportEntity
import com.examai.data.remote.api.ExamApiService
import com.examai.domain.model.Exam
import com.examai.domain.model.ExamStatus
import com.examai.domain.model.ExamStatusInfo
import com.examai.domain.repository.ExamRepository
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import javax.inject.Inject

/**
 * Implementation of ExamRepository
 * Handles exam data operations with the backend API and local cache
 */
class ExamRepositoryImpl @Inject constructor(
    private val apiService: ExamApiService,
    private val reportDao: ReportDao,
    private val okHttpClient: OkHttpClient
) : ExamRepository {
    
    companion object {
        private const val CACHE_EXPIRY_DAYS = 7L
        private const val MILLIS_PER_DAY = 24 * 60 * 60 * 1000L
    }
    
    override suspend fun uploadExam(imageFile: File): Result<String> {
        return try {
            // Create multipart body for image upload
            val requestBody = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
            val multipartBody = MultipartBody.Part.createFormData(
                "image",
                imageFile.name,
                requestBody
            )
            
            // Upload to server
            val response = apiService.uploadExam(multipartBody)
            
            Result.success(response.examId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getExamStatus(examId: String): Result<ExamStatusInfo> {
        return try {
            val response = apiService.getExamStatus(examId)
            
            val statusInfo = ExamStatusInfo(
                status = ExamStatus.valueOf(response.status.uppercase()),
                progress = response.progress,
                estimatedTime = response.estimatedTime,
                errorMessage = response.errorMessage
            )
            
            Result.success(statusInfo)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getExamHistory(page: Int, pageSize: Int): Result<List<Exam>> {
        return try {
            val response = apiService.getHistory(page, pageSize)
            
            val exams = response.exams.map { dto ->
                Exam(
                    examId = dto.examId,
                    userId = "", // Not provided in history list
                    subject = dto.subject,
                    grade = dto.grade,
                    score = dto.score,
                    totalScore = dto.totalScore,
                    status = ExamStatus.valueOf(dto.status.uppercase()),
                    imageUrl = dto.imageUrl,
                    reportUrl = dto.reportUrl,
                    createdAt = parseTimestamp(dto.createdAt),
                    updatedAt = parseTimestamp(dto.updatedAt)
                )
            }
            
            Result.success(exams)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getExamDetail(examId: String): Result<Exam> {
        return try {
            val response = apiService.getExamDetail(examId)
            
            val exam = Exam(
                examId = response.examId,
                userId = response.userId,
                subject = response.subject,
                grade = response.grade,
                score = response.score,
                totalScore = response.totalScore,
                status = ExamStatus.valueOf(response.status.uppercase()),
                imageUrl = response.imageUrl,
                reportUrl = response.reportUrl,
                createdAt = parseTimestamp(response.createdAt),
                updatedAt = parseTimestamp(response.updatedAt)
            )
            
            Result.success(exam)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun deleteExam(examId: String): Result<Unit> {
        return try {
            apiService.deleteExam(examId)
            
            // Also delete cached report
            reportDao.deleteCachedReport(examId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Parses timestamp string to Long (milliseconds)
     */
    private fun parseTimestamp(timestamp: String): Long {
        return try {
            // Assuming ISO 8601 format from backend
            java.time.Instant.parse(timestamp).toEpochMilli()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
    }
    
    override suspend fun getReportContent(
        examId: String,
        forceRefresh: Boolean
    ): Result<String> {
        return try {
            // Check cache first if not forcing refresh
            if (!forceRefresh) {
                val cachedReport = reportDao.getCachedReport(examId)
                if (cachedReport != null && !isCacheExpired(cachedReport)) {
                    return Result.success(cachedReport.htmlContent)
                }
            }
            
            // Fetch from server
            val reportResponse = apiService.getReport(examId)
            val htmlContent = fetchHtmlContent(reportResponse.htmlUrl)
            
            // Cache the content
            cacheReport(examId, htmlContent)
            
            Result.success(htmlContent)
        } catch (e: Exception) {
            // Try cache as fallback
            val cachedReport = reportDao.getCachedReport(examId)
            if (cachedReport != null) {
                Result.success(cachedReport.htmlContent)
            } else {
                Result.failure(e)
            }
        }
    }
    
    override suspend fun cacheReport(examId: String, htmlContent: String): Result<Unit> {
        return try {
            val now = System.currentTimeMillis()
            val expiresAt = now + (CACHE_EXPIRY_DAYS * MILLIS_PER_DAY)
            
            val cachedReport = CachedReportEntity(
                examId = examId,
                htmlContent = htmlContent,
                cachedAt = now,
                expiresAt = expiresAt
            )
            
            reportDao.cacheReport(cachedReport)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isReportCached(examId: String): Boolean {
        return try {
            val cachedReport = reportDao.getCachedReport(examId)
            cachedReport != null && !isCacheExpired(cachedReport)
        } catch (e: Exception) {
            false
        }
    }
    
    override suspend fun clearExpiredCache(): Result<Unit> {
        return try {
            val now = System.currentTimeMillis()
            reportDao.deleteExpiredReports(now)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun clearAllCache(): Result<Unit> {
        return try {
            reportDao.deleteAllCachedReports()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Checks if cached report is expired
     */
    private fun isCacheExpired(cachedReport: CachedReportEntity): Boolean {
        return System.currentTimeMillis() > cachedReport.expiresAt
    }
    
    /**
     * Fetches HTML content from URL
     */
    private suspend fun fetchHtmlContent(url: String): String {
        val request = Request.Builder()
            .url(url)
            .build()
        
        val response = okHttpClient.newCall(request).execute()
        
        if (!response.isSuccessful) {
            throw Exception("Failed to fetch HTML: ${response.code}")
        }
        
        return response.body?.string() ?: throw Exception("Empty response body")
    }
}
