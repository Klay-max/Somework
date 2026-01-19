package com.learningapp.data.remote

import com.learningapp.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // Auth APIs
    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    // Course APIs
    @GET("api/courses")
    suspend fun getCourseList(
        @Query("category") category: String? = null,
        @Query("status") status: String? = null,
        @Query("page") page: Int = 0,
        @Query("size") size: Int = 20
    ): Response<PageResponse<Course>>
    
    @GET("api/courses/{courseId}")
    suspend fun getCourseDetail(@Path("courseId") courseId: String): Response<CourseDetail>
    
    @GET("api/courses/{courseId}/units")
    suspend fun getLearningUnits(@Path("courseId") courseId: String): Response<List<LearningUnit>>
    
    // Learning Record APIs
    @POST("api/learning/progress")
    suspend fun saveLearningProgress(@Body request: LearningProgressRequest): Response<LearningRecord>
    
    @GET("api/learning/records")
    suspend fun getLearningRecords(@Query("courseId") courseId: String? = null): Response<List<LearningRecord>>
    
    @GET("api/learning/progress/overall")
    suspend fun getOverallProgress(): Response<Map<String, Double>>
    
    @POST("api/learning/units/{unitId}/complete")
    suspend fun markUnitComplete(@Path("unitId") unitId: String): Response<Map<String, Boolean>>
}
