package com.examai.data.remote.dto

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for DTO serialization/deserialization
 * Tests JSON parsing and encoding for all DTOs
 */
class DtoSerializationTest {
    
    private lateinit var json: Json
    
    @Before
    fun setup() {
        json = Json {
            ignoreUnknownKeys = true
            isLenient = true
            coerceInputValues = true
        }
    }
    
    // ==================== Auth DTO Tests ====================
    
    @Test
    fun `RegisterRequest serializes correctly`() {
        // Given
        val request = RegisterRequest(
            phone = "13800138000",
            password = "password123",
            verificationCode = "123456"
        )
        
        // When
        val jsonString = json.encodeToString(request)
        
        // Then
        assert(jsonString.contains("13800138000"))
        assert(jsonString.contains("password123"))
        assert(jsonString.contains("verification_code"))
    }
    
    @Test
    fun `RegisterResponse deserializes correctly`() {
        // Given
        val jsonString = """
            {
                "user_id": "user123",
                "phone": "13800138000",
                "role": "student",
                "token": "jwt_token_here"
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<RegisterResponse>(jsonString)
        
        // Then
        assertEquals("user123", response.userId)
        assertEquals("13800138000", response.phone)
        assertEquals("student", response.role)
        assertEquals("jwt_token_here", response.token)
    }
    
    @Test
    fun `LoginRequest serializes correctly`() {
        // Given
        val request = LoginRequest(
            phone = "13800138000",
            password = "password123"
        )
        
        // When
        val jsonString = json.encodeToString(request)
        
        // Then
        assert(jsonString.contains("13800138000"))
        assert(jsonString.contains("password123"))
    }
    
    @Test
    fun `LoginResponse deserializes correctly`() {
        // Given
        val jsonString = """
            {
                "user_id": "user123",
                "phone": "13800138000",
                "role": "student",
                "token": "jwt_token_here"
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<LoginResponse>(jsonString)
        
        // Then
        assertEquals("user123", response.userId)
        assertEquals("jwt_token_here", response.token)
    }
    
    // ==================== Exam DTO Tests ====================
    
    @Test
    fun `UploadResponse deserializes correctly`() {
        // Given
        val jsonString = """
            {
                "exam_id": "exam123",
                "status": "UPLOADED",
                "message": "上传成功"
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<UploadResponse>(jsonString)
        
        // Then
        assertEquals("exam123", response.examId)
        assertEquals("UPLOADED", response.status)
        assertEquals("上传成功", response.message)
    }
    
    @Test
    fun `ExamStatusResponse deserializes correctly with all fields`() {
        // Given
        val jsonString = """
            {
                "exam_id": "exam123",
                "status": "OCR_PROCESSING",
                "progress": 30,
                "estimated_time": 45,
                "error_message": null
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<ExamStatusResponse>(jsonString)
        
        // Then
        assertEquals("exam123", response.examId)
        assertEquals("OCR_PROCESSING", response.status)
        assertEquals(30, response.progress)
        assertEquals(45, response.estimatedTime)
        assertEquals(null, response.errorMessage)
    }
    
    @Test
    fun `ExamStatusResponse deserializes correctly with optional fields missing`() {
        // Given
        val jsonString = """
            {
                "exam_id": "exam123",
                "status": "COMPLETED",
                "progress": 100
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<ExamStatusResponse>(jsonString)
        
        // Then
        assertEquals("exam123", response.examId)
        assertEquals("COMPLETED", response.status)
        assertEquals(100, response.progress)
        assertEquals(null, response.estimatedTime)
        assertEquals(null, response.errorMessage)
    }
    
    @Test
    fun `HistoryResponse deserializes correctly`() {
        // Given
        val jsonString = """
            {
                "exams": [
                    {
                        "exam_id": "exam1",
                        "subject": "数学",
                        "grade": "高一",
                        "score": 85,
                        "total_score": 100,
                        "status": "COMPLETED",
                        "image_url": "https://example.com/image.jpg",
                        "report_url": "https://example.com/report.html",
                        "created_at": "2025-12-25T10:00:00Z",
                        "updated_at": "2025-12-25T11:00:00Z"
                    }
                ],
                "total": 1,
                "page": 1,
                "page_size": 20,
                "has_more": false
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<HistoryResponse>(jsonString)
        
        // Then
        assertEquals(1, response.exams.size)
        assertEquals("exam1", response.exams[0].examId)
        assertEquals("数学", response.exams[0].subject)
        assertEquals(85, response.exams[0].score)
        assertEquals(false, response.hasMore)
    }
    
    @Test
    fun `ExamDetailResponse deserializes correctly`() {
        // Given
        val jsonString = """
            {
                "exam_id": "exam123",
                "user_id": "user123",
                "subject": "数学",
                "grade": "高一",
                "score": 85,
                "total_score": 100,
                "status": "COMPLETED",
                "image_url": "https://example.com/image.jpg",
                "report_url": "https://example.com/report.html",
                "created_at": "2025-12-25T10:00:00Z",
                "updated_at": "2025-12-25T11:00:00Z"
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<ExamDetailResponse>(jsonString)
        
        // Then
        assertEquals("exam123", response.examId)
        assertEquals("user123", response.userId)
        assertEquals("数学", response.subject)
        assertEquals(85, response.score)
    }
    
    // ==================== Report DTO Tests ====================
    
    @Test
    fun `ReportResponse deserializes correctly`() {
        // Given
        val jsonString = """
            {
                "exam_id": "exam123",
                "html_url": "https://example.com/report.html",
                "pdf_url": "https://example.com/report.pdf",
                "generated_at": "2025-12-25T11:00:00Z"
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<ReportResponse>(jsonString)
        
        // Then
        assertEquals("exam123", response.examId)
        assertEquals("https://example.com/report.html", response.htmlUrl)
        assertEquals("https://example.com/report.pdf", response.pdfUrl)
        assertNotNull(response.generatedAt)
    }
    
    @Test
    fun `ReportResponse deserializes correctly with null pdfUrl`() {
        // Given
        val jsonString = """
            {
                "exam_id": "exam123",
                "html_url": "https://example.com/report.html",
                "generated_at": "2025-12-25T11:00:00Z"
            }
        """.trimIndent()
        
        // When
        val response = json.decodeFromString<ReportResponse>(jsonString)
        
        // Then
        assertEquals("exam123", response.examId)
        assertEquals("https://example.com/report.html", response.htmlUrl)
        assertEquals(null, response.pdfUrl)
    }
}
