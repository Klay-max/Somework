package com.examai.presentation.report

import androidx.lifecycle.SavedStateHandle
import com.examai.domain.model.Exam
import com.examai.domain.model.ExamStatus
import com.examai.domain.repository.ExamRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.*

/**
 * Unit tests for ReportDetailViewModel
 * Tests report loading, error handling, and WebView state management
 */
@OptIn(ExperimentalCoroutinesApi::class)
class ReportDetailViewModelTest {
    
    private lateinit var viewModel: ReportDetailViewModel
    private lateinit var examRepository: ExamRepository
    private lateinit var savedStateHandle: SavedStateHandle
    private val testDispatcher = StandardTestDispatcher()
    
    private val testExamId = "exam123"
    private val testReportUrl = "https://example.com/report.html"
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        examRepository = mock()
        savedStateHandle = SavedStateHandle(mapOf("examId" to testExamId))
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `initial state is correct`() = runTest {
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        
        val state = viewModel.uiState.first()
        
        assertNull(state.reportUrl)
        assertFalse(state.isWebViewLoading)
        assertEquals(0, state.webViewProgress)
    }
    
    @Test
    fun `loadReport success updates state with report URL`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        // When
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(testReportUrl, state.reportUrl)
        assertFalse(state.isLoading)
        assertNull(state.errorMessage)
    }
    
    @Test
    fun `loadReport with null reportUrl shows error`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = null)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        // When
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertNull(state.reportUrl)
        assertFalse(state.isLoading)
        assertEquals("报告尚未生成", state.errorMessage)
    }
    
    @Test
    fun `loadReport failure updates state with error`() = runTest {
        // Given
        val errorMessage = "Network error"
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.failure(Exception(errorMessage)))
        
        // When
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertNull(state.reportUrl)
        assertFalse(state.isLoading)
        assertEquals(errorMessage, state.errorMessage)
    }
    
    @Test
    fun `loadReport sets isLoading to true during loading`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        // When
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        
        // Then - before advancing
        assertTrue(viewModel.uiState.value.isLoading)
        
        // Advance and check after
        advanceUntilIdle()
        assertFalse(viewModel.uiState.value.isLoading)
    }
    
    @Test
    fun `retry calls loadReport again`() = runTest {
        // Given - initial failure
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.failure(Exception("Error")))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // Given - retry success
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        // When
        viewModel.retry()
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(testReportUrl, state.reportUrl)
        assertNull(state.errorMessage)
        verify(examRepository, times(2)).getExamDetail(testExamId)
    }
    
    @Test
    fun `clearError sets errorMessage to null`() = runTest {
        // Given - error state
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.failure(Exception("Error")))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        assertNotNull(viewModel.uiState.value.errorMessage)
        
        // When
        viewModel.clearError()
        
        // Then
        assertNull(viewModel.uiState.value.errorMessage)
    }
    
    @Test
    fun `updateLoadingProgress updates webViewProgress`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // When
        viewModel.updateLoadingProgress(50)
        
        // Then
        assertEquals(50, viewModel.uiState.value.webViewProgress)
    }
    
    @Test
    fun `setWebViewLoading updates isWebViewLoading`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // When
        viewModel.setWebViewLoading(true)
        
        // Then
        assertTrue(viewModel.uiState.value.isWebViewLoading)
        
        // When
        viewModel.setWebViewLoading(false)
        
        // Then
        assertFalse(viewModel.uiState.value.isWebViewLoading)
    }
    
    @Test
    fun `onWebViewError updates errorMessage`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // When
        val webViewError = "WebView load failed"
        viewModel.onWebViewError(webViewError)
        
        // Then
        assertEquals(webViewError, viewModel.uiState.value.errorMessage)
    }
    
    @Test
    fun `webView progress updates from 0 to 100`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // When - simulate WebView loading progress
        viewModel.setWebViewLoading(true)
        viewModel.updateLoadingProgress(0)
        assertEquals(0, viewModel.uiState.value.webViewProgress)
        assertTrue(viewModel.uiState.value.isWebViewLoading)
        
        viewModel.updateLoadingProgress(25)
        assertEquals(25, viewModel.uiState.value.webViewProgress)
        
        viewModel.updateLoadingProgress(50)
        assertEquals(50, viewModel.uiState.value.webViewProgress)
        
        viewModel.updateLoadingProgress(75)
        assertEquals(75, viewModel.uiState.value.webViewProgress)
        
        viewModel.updateLoadingProgress(100)
        assertEquals(100, viewModel.uiState.value.webViewProgress)
        
        viewModel.setWebViewLoading(false)
        assertFalse(viewModel.uiState.value.isWebViewLoading)
    }
    
    @Test
    fun `multiple retry attempts work correctly`() = runTest {
        // Given - initial failure
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.failure(Exception("Error 1")))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        assertEquals("Error 1", viewModel.uiState.value.errorMessage)
        
        // When - retry 1 (still fails)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.failure(Exception("Error 2")))
        viewModel.retry()
        advanceUntilIdle()
        assertEquals("Error 2", viewModel.uiState.value.errorMessage)
        
        // When - retry 2 (success)
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        viewModel.retry()
        advanceUntilIdle()
        
        // Then
        assertEquals(testReportUrl, viewModel.uiState.value.reportUrl)
        assertNull(viewModel.uiState.value.errorMessage)
        verify(examRepository, times(3)).getExamDetail(testExamId)
    }
    
    @Test
    fun `clearError does not affect other state`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        viewModel.updateLoadingProgress(50)
        viewModel.setWebViewLoading(true)
        viewModel.onWebViewError("Some error")
        
        // When
        viewModel.clearError()
        
        // Then - error cleared but other state unchanged
        assertNull(viewModel.uiState.value.errorMessage)
        assertEquals(testReportUrl, viewModel.uiState.value.reportUrl)
        assertEquals(50, viewModel.uiState.value.webViewProgress)
        assertTrue(viewModel.uiState.value.isWebViewLoading)
    }
    
    // Helper function to create mock exam
    private fun createMockExam(reportUrl: String?): Exam {
        return Exam(
            examId = testExamId,
            userId = "user123",
            subject = "数学",
            grade = "九年级",
            totalScore = 100.0,
            score = 85.0,
            status = ExamStatus.COMPLETED,
            imageUrl = "https://example.com/image.jpg",
            reportUrl = reportUrl,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
    }
}

    
    @Test
    fun `showShareDialog sets showShareDialog to true`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // When
        viewModel.showShareDialog()
        
        // Then
        assertTrue(viewModel.uiState.value.showShareDialog)
    }
    
    @Test
    fun `hideShareDialog sets showShareDialog to false`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        viewModel.showShareDialog()
        assertTrue(viewModel.uiState.value.showShareDialog)
        
        // When
        viewModel.hideShareDialog()
        
        // Then
        assertFalse(viewModel.uiState.value.showShareDialog)
    }
    
    @Test
    fun `examData is populated when report loads successfully`() = runTest {
        // Given
        val mockExam = createMockExam(reportUrl = testReportUrl)
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.success(mockExam))
        
        // When
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        val examData = viewModel.uiState.value.examData
        assertNotNull(examData)
        assertEquals(testExamId, examData?.examId)
        assertEquals("数学", examData?.subject)
        assertEquals("九年级", examData?.grade)
        assertEquals(85.0, examData?.score)
        assertEquals(100.0, examData?.totalScore)
    }
    
    @Test
    fun `examData is null when report fails to load`() = runTest {
        // Given
        whenever(examRepository.getExamDetail(testExamId))
            .thenReturn(Result.failure(Exception("Error")))
        
        // When
        viewModel = ReportDetailViewModel(examRepository, savedStateHandle)
        advanceUntilIdle()
        
        // Then
        assertNull(viewModel.uiState.value.examData)
    }
}
