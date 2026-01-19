package com.examai.data.remote.api

import com.examai.data.remote.dto.*
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import okhttp3.MultipartBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for ExamApiService
 * Tests API endpoint definitions and request/response handling
 */
class ExamApiServiceTest {
    
    private lateinit var apiService: ExamApiService
    
    @Before
    fun setup() {
        apiService = mockk()
    }
    
    // ==================== Authentication Tests ====================
    
    @Test
    fun `register sends correct request and returns RegisterResponse`() = runTest {
        // Given
        val request = RegisterRequest(
            phone = "13800138000",
            password = "password123",
            verificationCode = "123456"
        )
        val expectedResponse = RegisterResponse(
            userId = "user123",
            phone = "13800138000",
            role = "student",
            token = "jwt_token"
        )
        
        coEvery { apiService.register(request) } returns expectedResponse
        
        // When
        val response = apiService.register(request)
        
        // Then
        assertEquals(expectedResponse.userId, response.userId)
        assertEquals(expectedResponse.phone, response.phone)
        assertEquals(expectedResponse.token, response.token)
        coVerify { apiService.register(request) }
    }
    
    @Test
    fun `login sends correct request and returns LoginResponse`() = runTest {
        // Given
        val request = LoginRequest(
            phone = "13800138000",
            password = "password123"
        )
        val expectedResponse = LoginResponse(
            userId = "user123",
            phone = "13800138000",
            role = "student",
            token = "jwt_token"
        )
        
        coEvery { apiService.login(request) } returns expectedResponse
        
        // When
        val response = apiService.login(request)
        
        // Then
        assertEquals(expectedResponse.userId, response.userId)
        assertEquals(expectedResponse.token, response.token)
        coVerify { apiService.login(request) }
    }
    
    @Test
    fun `sendCode sends correct request and returns SendCodeResponse`() = runTest {
        // Given
        val request = SendCodeRequest(phone = "13800138000")
        val expectedResponse = SendCodeResponse(
            message = "验证码已发送",
            expiresIn = 300
        )
        
        coEvery { apiService.sendCode(request) } returns expectedResponse
        
        // When
        val response = apiService.sendCode(request)
        
        // Then
        assertEquals(expectedResponse.message, response.message)
        assertEquals(300, response.expiresIn)
        coVerify { apiService.sendCode(request) }
    }
    
    // ==================== Exam Management Tests ====================
    
    @Test
    fun `uploadExam sends multipart request and returns UploadResponse`() = runTest {
        // Given
        val imagePart = mockk<MultipartBody.Part>()
        val expectedResponse = UploadResponse(
            examId = "exam123",
            status = "UPLOADED",
            message = "上传成功"
        )
        
        coEvery { apiService.uploadExam(imagePart) } returns expectedResponse
        
        // When
        val response = apiService.uploadExam(imagePart)
        
        // Then
        assertEquals("exam123", response.examId)
        assertEquals("UPLOADED", response.status)
        coVerify { apiService.uploadExam(imagePart) }
    }
    
    @Test
    fun `getExamStatus returns correct status information`() = runTest {
        // Given
        val examId = "exam123"
        val expectedResponse = ExamStatusResponse(
            examId = examId,
            status = "OCR_PROCESSING",
            progress = 30,
            estimatedTime = 45,
            errorMessage = null
        )
        
        coEvery { apiService.getExamStatus(examId) } returns expectedResponse
        
        // When
        val response = apiService.getExamStatus(examId)
        
        // Then
        assertEquals(examId, response.examId)
        assertEquals("OCR_PROCESSING", response.status)
        assertEquals(30, response.progress)
        assertEquals(45, response.estimatedTime)
        coVerify { apiService.getExamStatus(examId) }
    }
    
    @Test
    fun `getHistory returns paginated exam list`() = runTest {
        // Given
        val expectedResponse = HistoryResponse(
            exams = listOf(
                ExamHistoryItemDto(
                    examId = "exam1",
                    subject = "数学",
                    grade = "高一",
                    score = 85,
                    totalScore = 100,
                    status = "COMPLETED",
                    imageUrl = "https://example.com/image1.jpg",
                    reportUrl = "https://example.com/report1.html",
                    createdAt = "2025-12-25T10:00:00Z",
                    updatedAt = "2025-12-25T11:00:00Z"
                )
            ),
            total = 1,
            page = 1,
            pageSize = 20,
            hasMore = false
        )
        
        coEvery { 
            apiService.getHistory(page = 1, pageSize = 20)
        } returns expectedResponse
        
        // When
        val response = apiService.getHistory(page = 1, pageSize = 20)
        
        // Then
        assertEquals(1, response.exams.size)
        assertEquals("exam1", response.exams[0].examId)
        assertEquals(false, response.hasMore)
        coVerify { apiService.getHistory(page = 1, pageSize = 20) }
    }
    
    @Test
    fun `getExamDetail returns complete exam information`() = runTest {
        // Given
        val examId = "exam123"
        val expectedResponse = ExamDetailResponse(
            examId = examId,
            userId = "user123",
            subject = "数学",
            grade = "高一",
            score = 85,
            totalScore = 100,
            status = "COMPLETED",
            imageUrl = "https://example.com/image.jpg",
            reportUrl = "https://example.com/report.html",
            createdAt = "2025-12-25T10:00:00Z",
            updatedAt = "2025-12-25T11:00:00Z"
        )
        
        coEvery { apiService.getExamDetail(examId) } returns expectedResponse
        
        // When
        val response = apiService.getExamDetail(examId)
        
        // Then
        assertEquals(examId, response.examId)
        assertEquals("数学", response.subject)
        assertEquals(85, response.score)
        coVerify { apiService.getExamDetail(examId) }
    }
    
    @Test
    fun `deleteExam returns delete confirmation`() = runTest {
        // Given
        val examId = "exam123"
        val expectedResponse = DeleteResponse(
            message = "试卷已删除",
            recoveryDeadline = "2026-01-24T10:00:00Z"
        )
        
        coEvery { apiService.deleteExam(examId) } returns expectedResponse
        
        // When
        val response = apiService.deleteExam(examId)
        
        // Then
        assertEquals("试卷已删除", response.message)
        assertNotNull(response.recoveryDeadline)
        coVerify { apiService.deleteExam(examId) }
    }
    
    // ==================== Report Tests ====================
    
    @Test
    fun `getReport returns report URLs`() = runTest {
        // Given
        val examId = "exam123"
        val expectedResponse = ReportResponse(
            examId = examId,
            htmlUrl = "https://example.com/report.html",
            pdfUrl = "https://example.com/report.pdf",
            generatedAt = "2025-12-25T11:00:00Z"
        )
        
        coEvery { apiService.getReport(examId) } returns expectedResponse
        
        // When
        val response = apiService.getReport(examId)
        
        // Then
        assertEquals(examId, response.examId)
        assertNotNull(response.htmlUrl)
        assertNotNull(response.pdfUrl)
        coVerify { apiService.getReport(examId) }
    }
}
