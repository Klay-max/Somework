package com.examai.data.repository

import com.examai.data.local.dao.ReportDao
import com.examai.data.local.entity.CachedReportEntity
import com.examai.data.remote.api.ExamApiService
import com.examai.data.remote.dto.ReportResponse
import io.mockk.*
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for ExamRepository caching functionality
 * Tests report caching, retrieval, and expiry logic
 */
class ExamRepositoryCacheTest {
    
    private lateinit var repository: ExamRepositoryImpl
    private lateinit var apiService: ExamApiService
    private lateinit var reportDao: ReportDao
    private lateinit var okHttpClient: OkHttpClient
    
    @Before
    fun setup() {
        apiService = mockk()
        reportDao = mockk()
        okHttpClient = mockk()
        
        repository = ExamRepositoryImpl(apiService, reportDao, okHttpClient)
    }
    
    @After
    fun tearDown() {
        unmockkAll()
    }
    
    // ==================== Cache Report Tests ====================
    
    @Test
    fun `cacheReport should save report to database`() = runTest {
        // Given
        val examId = "exam123"
        val htmlContent = "<html><body>Test Report</body></html>"
        coEvery { reportDao.cacheReport(any()) } just Runs
        
        // When
        val result = repository.cacheReport(examId, htmlContent)
        
        // Then
        assertTrue(result.isSuccess)
        coVerify {
            reportDao.cacheReport(
                match { entity ->
                    entity.examId == examId &&
                    entity.htmlContent == htmlContent &&
                    entity.cachedAt > 0 &&
                    entity.expiresAt > entity.cachedAt
                }
            )
        }
    }
    
    @Test
    fun `cacheReport should set expiry to 7 days from now`() = runTest {
        // Given
        val examId = "exam123"
        val htmlContent = "<html><body>Test Report</body></html>"
        val capturedEntity = slot<CachedReportEntity>()
        coEvery { reportDao.cacheReport(capture(capturedEntity)) } just Runs
        
        // When
        repository.cacheReport(examId, htmlContent)
        
        // Then
        val entity = capturedEntity.captured
        val expectedExpiry = entity.cachedAt + (7 * 24 * 60 * 60 * 1000L)
        assertEquals(expectedExpiry, entity.expiresAt)
    }
    
    @Test
    fun `cacheReport should return failure on database error`() = runTest {
        // Given
        val examId = "exam123"
        val htmlContent = "<html><body>Test Report</body></html>"
        coEvery { reportDao.cacheReport(any()) } throws Exception("Database error")
        
        // When
        val result = repository.cacheReport(examId, htmlContent)
        
        // Then
        assertTrue(result.isFailure)
        assertEquals("Database error", result.exceptionOrNull()?.message)
    }
    
    // ==================== Is Report Cached Tests ====================
    
    @Test
    fun `isReportCached should return true when report is cached and not expired`() = runTest {
        // Given
        val examId = "exam123"
        val now = System.currentTimeMillis()
        val cachedReport = CachedReportEntity(
            examId = examId,
            htmlContent = "<html>Test</html>",
            cachedAt = now - 1000,
            expiresAt = now + 1000
        )
        coEvery { reportDao.getCachedReport(examId) } returns cachedReport
        
        // When
        val result = repository.isReportCached(examId)
        
        // Then
        assertTrue(result)
    }
    
    @Test
    fun `isReportCached should return false when report is expired`() = runTest {
        // Given
        val examId = "exam123"
        val now = System.currentTimeMillis()
        val cachedReport = CachedReportEntity(
            examId = examId,
            htmlContent = "<html>Test</html>",
            cachedAt = now - 10000,
            expiresAt = now - 1000 // Expired
        )
        coEvery { reportDao.getCachedReport(examId) } returns cachedReport
        
        // When
        val result = repository.isReportCached(examId)
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `isReportCached should return false when report is not cached`() = runTest {
        // Given
        val examId = "exam123"
        coEvery { reportDao.getCachedReport(examId) } returns null
        
        // When
        val result = repository.isReportCached(examId)
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `isReportCached should return false on database error`() = runTest {
        // Given
        val examId = "exam123"
        coEvery { reportDao.getCachedReport(examId) } throws Exception("Database error")
        
        // When
        val result = repository.isReportCached(examId)
        
        // Then
        assertFalse(result)
    }
    
    // ==================== Get Report Content Tests ====================
    
    @Test
    fun `getReportContent should return cached content when available and not expired`() = runTest {
        // Given
        val examId = "exam123"
        val htmlContent = "<html><body>Cached Report</body></html>"
        val now = System.currentTimeMillis()
        val cachedReport = CachedReportEntity(
            examId = examId,
            htmlContent = htmlContent,
            cachedAt = now - 1000,
            expiresAt = now + 1000
        )
        coEvery { reportDao.getCachedReport(examId) } returns cachedReport
        
        // When
        val result = repository.getReportContent(examId, forceRefresh = false)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(htmlContent, result.getOrNull())
        coVerify(exactly = 0) { apiService.getReport(any()) }
    }
    
    @Test
    fun `getReportContent should fetch from server when cache is expired`() = runTest {
        // Given
        val examId = "exam123"
        val now = System.currentTimeMillis()
        val expiredReport = CachedReportEntity(
            examId = examId,
            htmlContent = "<html>Old</html>",
            cachedAt = now - 10000,
            expiresAt = now - 1000 // Expired
        )
        val reportResponse = ReportResponse(
            examId = examId,
            htmlUrl = "https://example.com/report.html",
            pdfUrl = null,
            generatedAt = "2024-12-25T10:00:00Z"
        )
        val newHtmlContent = "<html><body>New Report</body></html>"
        
        coEvery { reportDao.getCachedReport(examId) } returns expiredReport
        coEvery { apiService.getReport(examId) } returns reportResponse
        coEvery { reportDao.cacheReport(any()) } just Runs
        
        // Mock OkHttpClient to return HTML content
        val mockResponse = Response.Builder()
            .request(Request.Builder().url(reportResponse.htmlUrl).build())
            .protocol(Protocol.HTTP_1_1)
            .code(200)
            .message("OK")
            .body(newHtmlContent.toResponseBody())
            .build()
        
        val mockCall = mockk<okhttp3.Call>()
        every { okHttpClient.newCall(any()) } returns mockCall
        every { mockCall.execute() } returns mockResponse
        
        // When
        val result = repository.getReportContent(examId, forceRefresh = false)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(newHtmlContent, result.getOrNull())
        coVerify { apiService.getReport(examId) }
        coVerify { reportDao.cacheReport(any()) }
    }
    
    @Test
    fun `getReportContent should fetch from server when forceRefresh is true`() = runTest {
        // Given
        val examId = "exam123"
        val now = System.currentTimeMillis()
        val cachedReport = CachedReportEntity(
            examId = examId,
            htmlContent = "<html>Old</html>",
            cachedAt = now - 1000,
            expiresAt = now + 1000 // Not expired
        )
        val reportResponse = ReportResponse(
            examId = examId,
            htmlUrl = "https://example.com/report.html",
            pdfUrl = null,
            generatedAt = "2024-12-25T10:00:00Z"
        )
        val newHtmlContent = "<html><body>New Report</body></html>"
        
        coEvery { reportDao.getCachedReport(examId) } returns cachedReport
        coEvery { apiService.getReport(examId) } returns reportResponse
        coEvery { reportDao.cacheReport(any()) } just Runs
        
        // Mock OkHttpClient
        val mockResponse = Response.Builder()
            .request(Request.Builder().url(reportResponse.htmlUrl).build())
            .protocol(Protocol.HTTP_1_1)
            .code(200)
            .message("OK")
            .body(newHtmlContent.toResponseBody())
            .build()
        
        val mockCall = mockk<okhttp3.Call>()
        every { okHttpClient.newCall(any()) } returns mockCall
        every { mockCall.execute() } returns mockResponse
        
        // When
        val result = repository.getReportContent(examId, forceRefresh = true)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(newHtmlContent, result.getOrNull())
        coVerify { apiService.getReport(examId) }
    }
    
    @Test
    fun `getReportContent should return cached content as fallback on network error`() = runTest {
        // Given
        val examId = "exam123"
        val htmlContent = "<html><body>Cached Report</body></html>"
        val now = System.currentTimeMillis()
        val cachedReport = CachedReportEntity(
            examId = examId,
            htmlContent = htmlContent,
            cachedAt = now - 1000,
            expiresAt = now + 1000
        )
        
        coEvery { reportDao.getCachedReport(examId) } returns cachedReport
        coEvery { apiService.getReport(examId) } throws Exception("Network error")
        
        // When
        val result = repository.getReportContent(examId, forceRefresh = true)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(htmlContent, result.getOrNull())
    }
    
    @Test
    fun `getReportContent should return failure when no cache and network fails`() = runTest {
        // Given
        val examId = "exam123"
        coEvery { reportDao.getCachedReport(examId) } returns null
        coEvery { apiService.getReport(examId) } throws Exception("Network error")
        
        // When
        val result = repository.getReportContent(examId, forceRefresh = false)
        
        // Then
        assertTrue(result.isFailure)
        assertEquals("Network error", result.exceptionOrNull()?.message)
    }
    
    // ==================== Clear Cache Tests ====================
    
    @Test
    fun `clearExpiredCache should delete reports older than current time`() = runTest {
        // Given
        coEvery { reportDao.deleteExpiredReports(any()) } just Runs
        
        // When
        val result = repository.clearExpiredCache()
        
        // Then
        assertTrue(result.isSuccess)
        coVerify {
            reportDao.deleteExpiredReports(
                match { timestamp -> timestamp <= System.currentTimeMillis() }
            )
        }
    }
    
    @Test
    fun `clearExpiredCache should return failure on database error`() = runTest {
        // Given
        coEvery { reportDao.deleteExpiredReports(any()) } throws Exception("Database error")
        
        // When
        val result = repository.clearExpiredCache()
        
        // Then
        assertTrue(result.isFailure)
        assertEquals("Database error", result.exceptionOrNull()?.message)
    }
    
    @Test
    fun `clearAllCache should delete all cached reports`() = runTest {
        // Given
        coEvery { reportDao.deleteAllCachedReports() } just Runs
        
        // When
        val result = repository.clearAllCache()
        
        // Then
        assertTrue(result.isSuccess)
        coVerify { reportDao.deleteAllCachedReports() }
    }
    
    @Test
    fun `clearAllCache should return failure on database error`() = runTest {
        // Given
        coEvery { reportDao.deleteAllCachedReports() } throws Exception("Database error")
        
        // When
        val result = repository.clearAllCache()
        
        // Then
        assertTrue(result.isFailure)
        assertEquals("Database error", result.exceptionOrNull()?.message)
    }
    
    // ==================== Delete Exam Tests ====================
    
    @Test
    fun `deleteExam should also delete cached report`() = runTest {
        // Given
        val examId = "exam123"
        val deleteResponse = mockk<com.examai.data.remote.dto.DeleteResponse>()
        every { deleteResponse.success } returns true
        coEvery { apiService.deleteExam(examId) } returns deleteResponse
        coEvery { reportDao.deleteCachedReport(examId) } just Runs
        
        // When
        val result = repository.deleteExam(examId)
        
        // Then
        assertTrue(result.isSuccess)
        coVerify { reportDao.deleteCachedReport(examId) }
    }
}
