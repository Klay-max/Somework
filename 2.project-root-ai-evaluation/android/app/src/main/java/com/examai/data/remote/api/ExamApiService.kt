package com.examai.data.remote.api

import com.examai.data.remote.dto.*
import okhttp3.MultipartBody
import retrofit2.http.*

/**
 * Retrofit API service interface for ExamAI backend
 * Defines all API endpoints matching the backend implementation
 */
interface ExamApiService {
    
    // ==================== Authentication ====================
    
    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): RegisterResponse
    
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
    
    @POST("api/v1/auth/send-code")
    suspend fun sendCode(@Body request: SendCodeRequest): SendCodeResponse
    
    // ==================== Exam Management ====================
    
    @Multipart
    @POST("api/v1/exams/upload")
    suspend fun uploadExam(@Part image: MultipartBody.Part): UploadResponse
    
    @GET("api/v1/exams/{exam_id}/status")
    suspend fun getExamStatus(@Path("exam_id") examId: String): ExamStatusResponse
    
    @GET("api/v1/exams/history")
    suspend fun getHistory(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20,
        @Query("subject") subject: String? = null,
        @Query("status") status: String? = null,
        @Query("sort_by") sortBy: String = "created_at",
        @Query("order") order: String = "desc"
    ): HistoryResponse
    
    @GET("api/v1/exams/{exam_id}")
    suspend fun getExamDetail(@Path("exam_id") examId: String): ExamDetailResponse
    
    @DELETE("api/v1/exams/{exam_id}")
    suspend fun deleteExam(@Path("exam_id") examId: String): DeleteResponse
    
    // ==================== Report ====================
    
    @GET("api/v1/reports/{exam_id}")
    suspend fun getReport(@Path("exam_id") examId: String): ReportResponse
}
