package com.examai.domain.repository

import com.examai.domain.model.Exam
import com.examai.domain.model.ExamStatusInfo
import kotlinx.coroutines.flow.Flow
import java.io.File

/**
 * Repository interface for exam operations
 * Defines contract for exam data management
 */
interface ExamRepository {
    
    /**
     * Uploads an exam image to the server
     * @param imageFile The image file to upload
     * @return Flow emitting upload progress (0-100) and final exam ID
     */
    suspend fun uploadExam(imageFile: File): Result<String>
    
    /**
     * Gets the processing status of an exam
     * @param examId The exam ID
     * @return Exam status information
     */
    suspend fun getExamStatus(examId: String): Result<ExamStatusInfo>
    
    /**
     * Gets exam history for the current user
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     * @return List of exams
     */
    suspend fun getExamHistory(
        page: Int = 1,
        pageSize: Int = 20
    ): Result<List<Exam>>
    
    /**
     * Gets detailed information about a specific exam
     * @param examId The exam ID
     * @return Exam details
     */
    suspend fun getExamDetail(examId: String): Result<Exam>
    
    /**
     * Deletes an exam
     * @param examId The exam ID
     * @return Success or failure
     */
    suspend fun deleteExam(examId: String): Result<Unit>
    
    /**
     * Gets report HTML content
     * First checks local cache, then fetches from server if needed
     * @param examId The exam ID
     * @param forceRefresh Force fetch from server
     * @return Report HTML content
     */
    suspend fun getReportContent(
        examId: String,
        forceRefresh: Boolean = false
    ): Result<String>
    
    /**
     * Caches report content locally
     * @param examId The exam ID
     * @param htmlContent The HTML content to cache
     */
    suspend fun cacheReport(examId: String, htmlContent: String): Result<Unit>
    
    /**
     * Checks if report is cached locally
     * @param examId The exam ID
     * @return True if cached and not expired
     */
    suspend fun isReportCached(examId: String): Boolean
    
    /**
     * Clears expired cached reports
     * Reports older than 7 days are removed
     */
    suspend fun clearExpiredCache(): Result<Unit>
    
    /**
     * Clears all cached reports
     */
    suspend fun clearAllCache(): Result<Unit>
}
