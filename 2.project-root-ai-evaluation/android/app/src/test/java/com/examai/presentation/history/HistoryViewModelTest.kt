package com.examai.presentation.history

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
 * Unit tests for HistoryViewModel
 * Tests exam history loading, pagination, refresh, and delete functionality
 */
@OptIn(ExperimentalCoroutinesApi::class)
class HistoryViewModelTest {
    
    private lateinit var viewModel: HistoryViewModel
    private lateinit var examRepository: ExamRepository
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        examRepository = mock()
        viewModel = HistoryViewModel(examRepository)
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `initial state is correct`() = runTest {
        val state = viewModel.uiState.first()
        
        assertEquals(emptyList<Exam>(), state.exams)
        assertEquals(1, state.currentPage)
        assertTrue(state.hasMore)
        assertNull(state.errorMessage)
    }
    
    @Test
    fun `loadHistory success updates state with exams`() = runTest {
        // Given
        val mockExams = listOf(
            createMockExam("1", "数学", "九年级"),
            createMockExam("2", "英语", "九年级")
        )
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(mockExams))
        
        // When
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(mockExams, state.exams)
        assertFalse(state.isLoading)
        assertNull(state.errorMessage)
    }
    
    @Test
    fun `loadHistory failure updates state with error`() = runTest {
        // Given
        val errorMessage = "Network error"
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.failure(Exception(errorMessage)))
        
        // When
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(emptyList<Exam>(), state.exams)
        assertFalse(state.isLoading)
        assertEquals(errorMessage, state.errorMessage)
    }
    
    @Test
    fun `loadHistory sets isLoading to true during loading`() = runTest {
        // Given
        whenever(examRepository.getExamHistory(any(), any()))
            .thenReturn(Result.success(emptyList()))
        
        // When
        viewModel.loadHistory()
        
        // Then - before advancing
        assertTrue(viewModel.uiState.value.isLoading)
        
        // Advance and check after
        advanceUntilIdle()
        assertFalse(viewModel.uiState.value.isLoading)
    }
    
    @Test
    fun `refresh clears existing exams and reloads from page 1`() = runTest {
        // Given - initial load
        val initialExams = listOf(createMockExam("1", "数学", "九年级"))
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(initialExams))
        
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Given - refresh with new data
        val refreshedExams = listOf(
            createMockExam("2", "英语", "九年级"),
            createMockExam("3", "物理", "九年级")
        )
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(refreshedExams))
        
        // When
        viewModel.refresh()
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(refreshedExams, state.exams)
        assertEquals(1, state.currentPage)
        assertFalse(state.isRefreshing)
    }
    
    @Test
    fun `loadMore increments page and appends exams`() = runTest {
        // Given - initial load
        val page1Exams = listOf(createMockExam("1", "数学", "九年级"))
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(page1Exams))
        
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Given - page 2
        val page2Exams = listOf(createMockExam("2", "英语", "九年级"))
        whenever(examRepository.getExamHistory(page = 2, pageSize = 20))
            .thenReturn(Result.success(page2Exams))
        
        // When
        viewModel.loadMore()
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(page1Exams + page2Exams, state.exams)
        assertEquals(2, state.currentPage)
    }
    
    @Test
    fun `loadMore does not load when hasMore is false`() = runTest {
        // Given - set hasMore to false
        val exams = List(15) { createMockExam("$it", "数学", "九年级") }
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(exams))
        
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // When
        viewModel.loadMore()
        advanceUntilIdle()
        
        // Then - should not call repository again
        verify(examRepository, times(1)).getExamHistory(any(), any())
    }
    
    @Test
    fun `loadMore does not load when already loading`() = runTest {
        // Given
        whenever(examRepository.getExamHistory(any(), any()))
            .thenReturn(Result.success(emptyList()))
        
        // When - call loadMore twice quickly
        viewModel.loadMore()
        viewModel.loadMore()
        advanceUntilIdle()
        
        // Then - should only call once
        verify(examRepository, times(1)).getExamHistory(any(), any())
    }
    
    @Test
    fun `hasMore is false when returned exams less than pageSize`() = runTest {
        // Given - return less than 20 exams
        val exams = List(15) { createMockExam("$it", "数学", "九年级") }
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(exams))
        
        // When
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Then
        assertFalse(viewModel.uiState.value.hasMore)
    }
    
    @Test
    fun `hasMore is true when returned exams equals pageSize`() = runTest {
        // Given - return exactly 20 exams
        val exams = List(20) { createMockExam("$it", "数学", "九年级") }
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(exams))
        
        // When
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Then
        assertTrue(viewModel.uiState.value.hasMore)
    }
    
    @Test
    fun `deleteExam success removes exam from list`() = runTest {
        // Given - initial exams
        val exams = listOf(
            createMockExam("1", "数学", "九年级"),
            createMockExam("2", "英语", "九年级"),
            createMockExam("3", "物理", "九年级")
        )
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(exams))
        
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Given - delete success
        whenever(examRepository.deleteExam("2"))
            .thenReturn(Result.success(Unit))
        
        // When
        viewModel.deleteExam("2")
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(2, state.exams.size)
        assertFalse(state.exams.any { it.examId == "2" })
    }
    
    @Test
    fun `deleteExam failure updates error message`() = runTest {
        // Given - initial exams
        val exams = listOf(createMockExam("1", "数学", "九年级"))
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(exams))
        
        viewModel.loadHistory()
        advanceUntilIdle()
        
        // Given - delete failure
        val errorMessage = "Delete failed"
        whenever(examRepository.deleteExam("1"))
            .thenReturn(Result.failure(Exception(errorMessage)))
        
        // When
        viewModel.deleteExam("1")
        advanceUntilIdle()
        
        // Then
        val state = viewModel.uiState.value
        assertEquals(errorMessage, state.errorMessage)
        assertEquals(1, state.exams.size) // Exam still in list
    }
    
    @Test
    fun `clearError sets errorMessage to null`() = runTest {
        // Given - error state
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.failure(Exception("Error")))
        
        viewModel.loadHistory()
        advanceUntilIdle()
        
        assertNotNull(viewModel.uiState.value.errorMessage)
        
        // When
        viewModel.clearError()
        
        // Then
        assertNull(viewModel.uiState.value.errorMessage)
    }
    
    @Test
    fun `pagination maintains correct page numbers`() = runTest {
        // Given
        val page1 = List(20) { createMockExam("1-$it", "数学", "九年级") }
        val page2 = List(20) { createMockExam("2-$it", "英语", "九年级") }
        val page3 = List(15) { createMockExam("3-$it", "物理", "九年级") }
        
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(page1))
        whenever(examRepository.getExamHistory(page = 2, pageSize = 20))
            .thenReturn(Result.success(page2))
        whenever(examRepository.getExamHistory(page = 3, pageSize = 20))
            .thenReturn(Result.success(page3))
        
        // When - load page 1
        viewModel.loadHistory()
        advanceUntilIdle()
        assertEquals(1, viewModel.uiState.value.currentPage)
        assertEquals(20, viewModel.uiState.value.exams.size)
        
        // When - load page 2
        viewModel.loadMore()
        advanceUntilIdle()
        assertEquals(2, viewModel.uiState.value.currentPage)
        assertEquals(40, viewModel.uiState.value.exams.size)
        
        // When - load page 3
        viewModel.loadMore()
        advanceUntilIdle()
        assertEquals(3, viewModel.uiState.value.currentPage)
        assertEquals(55, viewModel.uiState.value.exams.size)
        assertFalse(viewModel.uiState.value.hasMore)
    }
    
    @Test
    fun `refresh resets pagination state`() = runTest {
        // Given - load multiple pages
        val page1 = List(20) { createMockExam("1-$it", "数学", "九年级") }
        val page2 = List(20) { createMockExam("2-$it", "英语", "九年级") }
        
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(page1))
        whenever(examRepository.getExamHistory(page = 2, pageSize = 20))
            .thenReturn(Result.success(page2))
        
        viewModel.loadHistory()
        advanceUntilIdle()
        viewModel.loadMore()
        advanceUntilIdle()
        
        assertEquals(2, viewModel.uiState.value.currentPage)
        assertEquals(40, viewModel.uiState.value.exams.size)
        
        // Given - refresh data
        val refreshed = List(20) { createMockExam("new-$it", "物理", "九年级") }
        whenever(examRepository.getExamHistory(page = 1, pageSize = 20))
            .thenReturn(Result.success(refreshed))
        
        // When
        viewModel.refresh()
        advanceUntilIdle()
        
        // Then
        assertEquals(1, viewModel.uiState.value.currentPage)
        assertEquals(20, viewModel.uiState.value.exams.size)
        assertTrue(viewModel.uiState.value.exams.all { it.examId.startsWith("new-") })
    }
    
    // Helper function to create mock exam
    private fun createMockExam(
        id: String,
        subject: String,
        grade: String
    ): Exam {
        return Exam(
            examId = id,
            userId = "user123",
            subject = subject,
            grade = grade,
            totalScore = 100.0,
            score = 85.0,
            status = ExamStatus.COMPLETED,
            imageUrl = "https://example.com/image.jpg",
            reportUrl = "https://example.com/report.html",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
    }
}
