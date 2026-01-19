package com.examai.presentation.report

import androidx.lifecycle.SavedStateHandle
import app.cash.turbine.test
import com.examai.domain.model.Exam
import com.examai.domain.model.ExamStatus
import com.examai.domain.repository.ExamRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for ReportDetailViewModel caching functionality
 * Tests report loading with cache support
 */
@OptIn(ExperimentalCoroutinesApi::class)
class ReportDetailViewModelCacheTest {
    
    private lateinit var viewModel: ReportDetailViewModel
    private lateinit var repository: ExamRepository
    private lateinit var savedStateHandle: SavedStateHandle
    private val testDispatcher = StandardTestDispatcher()
    
    private val testExamId = "exam123"
    private val testExam = Exam(
        examId = testExamId,
        userId = "user123",
        subject = "数学",
        grade = "高一",
        score = 85.0,
        totalScore = 100.0,
        status = ExamStatus.COMPLETED,
        imageUrl = "https://example.com/image.jpg",
        reportUrl = "https://example.com/report.html",
        createdAt = System.currentTimeMillis(),
        updatedAt = System.currentTimeMillis()
    )
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        repository = mockk()
        savedStateHandle = SavedStateHandle(mapOf("examId" to testExamId))
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    // ==================== Load Report with Cache Tests ====================
    
    @Test
    fun `loadReport should load cached HTML content when available`() = runTest {
        // Given
        val htmlContent = "<html><body>Cached Report</body></html>"
        coEvery { repository.getExamDetail(testExamId) } returns Result.success(testExam)
        coEvery { repository.getReportContent(testExamId) } returns Result.success(htmlContent)
        coEvery { repository.isReportCached(testExamId) } returns true
        
        // When
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals(testExam.reportUrl, state.reportUrl)
            assertEquals(htmlContent, state.cachedHtmlContent)
            assertTrue(state.isCached)
            assertFalse(state.isLoading)
            assertNull(state.errorMessage)
        }
    }
    
    @Test
    fun `loadReport should indicate not cached when content is from server`() = runTest {
        // Given
        val htmlContent = "<html><body>Server Report</body></html>"
        coEvery { repository.getExamDetail(testExamId) } returns Result.success(testExam)
        coEvery { repository.getReportContent(testExamId) } returns Result.success(htmlContent)
        coEvery { repository.isReportCached(testExamId) } returns false
        
        // When
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals(testExam.reportUrl, state.reportUrl)
            assertEquals(htmlContent, state.cachedHtmlContent)
            assertFalse(state.isCached)
            assertFalse(state.isLoading)
        }
    }
    
    @Test
    fun `loadReport should fallback to URL when cache fails`() = runTest {
        // Given
        coEvery { repository.getExamDetail(testExamId) } returns Result.success(testExam)
        coEvery { repository.getReportContent(testExamId) } returns Result.failure(Exception("Cache error"))
        coEvery { repository.isReportCached(testExamId) } returns false
        
        // When
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals(testExam.reportUrl, state.reportUrl)
            assertNull(state.cachedHtmlContent)
            assertFalse(state.isCached)
            assertFalse(state.isLoading)
        }
    }
    
    @Test
    fun `loadReport should show error when report not generated`() = runTest {
        // Given
        val examWithoutReport = testExam.copy(reportUrl = null)
        coEvery { repository.getExamDetail(testExamId) } returns Result.success(examWithoutReport)
        
        // When
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.reportUrl)
            assertNull(state.cachedHtmlContent)
            assertFalse(state.isLoading)
            assertEquals("报告尚未生成", state.errorMessage)
        }
    }
    
    @Test
    fun `loadReport should show error when exam detail fails`() = runTest {
        // Given
        coEvery { repository.getExamDetail(testExamId) } returns Result.failure(Exception("Network error"))
        
        // When
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.reportUrl)
            assertFalse(state.isLoading)
            assertEquals("Network error", state.errorMessage)
        }
    }
    
    @Test
    fun `retry should reload report with cache`() = runTest {
        // Given
        val htmlContent = "<html><body>Cached Report</body></html>"
        coEvery { repository.getExamDetail(testExamId) } returns Result.success(testExam)
        coEvery { repository.getReportContent(testExamId) } returns Result.success(htmlContent)
        coEvery { repository.isReportCached(testExamId) } returns true
        
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        advanceUntilIdle()
        
        // When
        viewModel.retry()
        advanceUntilIdle()
        
        // Then
        coVerify(exactly = 2) { repository.getExamDetail(testExamId) }
        coVerify(exactly = 2) { repository.getReportContent(testExamId) }
    }
    
    // ==================== UI State Tests ====================
    
    @Test
    fun `initial state should be loading`() = runTest {
        // Given
        coEvery { repository.getExamDetail(testExamId) } coAnswers {
            kotlinx.coroutines.delay(1000)
            Result.success(testExam)
        }
        coEvery { repository.getReportContent(testExamId) } returns Result.success("<html></html>")
        coEvery { repository.isReportCached(testExamId) } returns false
        
        // When
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isLoading)
            assertNull(state.reportUrl)
            assertNull(state.cachedHtmlContent)
        }
    }
    
    @Test
    fun `examData should be populated from exam detail`() = runTest {
        // Given
        val htmlContent = "<html><body>Report</body></html>"
        coEvery { repository.getExamDetail(testExamId) } returns Result.success(testExam)
        coEvery { repository.getReportContent(testExamId) } returns Result.success(htmlContent)
        coEvery { repository.isReportCached(testExamId) } returns true
        
        // When
        viewModel = ReportDetailViewModel(repository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNotNull(state.examData)
            assertEquals(testExam.examId, state.examData?.examId)
            assertEquals(testExam.subject, state.examData?.subject)
            assertEquals(testExam.grade, state.examData?.grade)
            assertEquals(testExam.score, state.examData?.score)
            assertEquals(testExam.totalScore, state.examData?.totalScore)
        }
    }
}
