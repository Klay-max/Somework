package com.examai.domain.usecase

import app.cash.turbine.test
import com.examai.domain.model.ExamStatus
import com.examai.domain.model.ExamStatusInfo
import com.examai.domain.repository.ExamRepository
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for PollExamStatusUseCase
 */
@OptIn(ExperimentalCoroutinesApi::class)
class PollExamStatusUseCaseTest {
    
    private lateinit var examRepository: ExamRepository
    private lateinit var useCase: PollExamStatusUseCase
    
    @Before
    fun setup() {
        examRepository = mockk()
        useCase = PollExamStatusUseCase(examRepository)
    }
    
    @Test
    fun `invoke should emit success result when repository returns success`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.OCR_PROCESSING,
            progress = 30,
            estimatedTime = 60,
            errorMessage = null
        )
        coEvery { examRepository.getExamStatus(examId) } returns Result.success(statusInfo)
        
        // When
        useCase(examId, intervalMs = 100).test {
            // Then
            val result = awaitItem()
            assertTrue(result is ExamStatusResult.Success)
            assertEquals(statusInfo, (result as ExamStatusResult.Success).statusInfo)
            
            // Should continue polling for non-terminal status
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `invoke should emit error result when repository returns failure`() = runTest {
        // Given
        val examId = "exam_123"
        val errorMessage = "Network error"
        coEvery { examRepository.getExamStatus(examId) } returns Result.failure(Exception(errorMessage))
        
        // When
        useCase(examId, intervalMs = 100).test {
            // Then
            val result = awaitItem()
            assertTrue(result is ExamStatusResult.Error)
            assertEquals(errorMessage, (result as ExamStatusResult.Error).message)
            
            // Should continue polling even on error
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `invoke should stop polling when status is COMPLETED`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.COMPLETED,
            progress = 100,
            estimatedTime = 0,
            errorMessage = null
        )
        coEvery { examRepository.getExamStatus(examId) } returns Result.success(statusInfo)
        
        // When
        useCase(examId, intervalMs = 100).test {
            // Then
            val result = awaitItem()
            assertTrue(result is ExamStatusResult.Success)
            assertEquals(ExamStatus.COMPLETED, (result as ExamStatusResult.Success).statusInfo.status)
            
            // Should complete (no more emissions)
            awaitComplete()
        }
    }
    
    @Test
    fun `invoke should stop polling when status is FAILED`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.FAILED,
            progress = 0,
            estimatedTime = null,
            errorMessage = "Processing failed"
        )
        coEvery { examRepository.getExamStatus(examId) } returns Result.success(statusInfo)
        
        // When
        useCase(examId, intervalMs = 100).test {
            // Then
            val result = awaitItem()
            assertTrue(result is ExamStatusResult.Success)
            assertEquals(ExamStatus.FAILED, (result as ExamStatusResult.Success).statusInfo.status)
            
            // Should complete (no more emissions)
            awaitComplete()
        }
    }
    
    @Test
    fun `invoke should stop polling when status is REPORT_GENERATED`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.REPORT_GENERATED,
            progress = 100,
            estimatedTime = 0,
            errorMessage = null
        )
        coEvery { examRepository.getExamStatus(examId) } returns Result.success(statusInfo)
        
        // When
        useCase(examId, intervalMs = 100).test {
            // Then
            val result = awaitItem()
            assertTrue(result is ExamStatusResult.Success)
            assertEquals(ExamStatus.REPORT_GENERATED, (result as ExamStatusResult.Success).statusInfo.status)
            
            // Should complete (no more emissions)
            awaitComplete()
        }
    }
    
    @Test
    fun `invoke should continue polling for non-terminal statuses`() = runTest {
        // Given
        val examId = "exam_123"
        val statuses = listOf(
            ExamStatusInfo(ExamStatus.UPLOADED, 10, 120, null),
            ExamStatusInfo(ExamStatus.OCR_PROCESSING, 30, 90, null),
            ExamStatusInfo(ExamStatus.PARSING, 50, 60, null),
            ExamStatusInfo(ExamStatus.COMPLETED, 100, 0, null)
        )
        
        var callCount = 0
        coEvery { examRepository.getExamStatus(examId) } answers {
            Result.success(statuses[callCount++])
        }
        
        // When
        useCase(examId, intervalMs = 50).test {
            // Then - should emit all statuses until COMPLETED
            val result1 = awaitItem()
            assertTrue(result1 is ExamStatusResult.Success)
            assertEquals(ExamStatus.UPLOADED, (result1 as ExamStatusResult.Success).statusInfo.status)
            
            val result2 = awaitItem()
            assertTrue(result2 is ExamStatusResult.Success)
            assertEquals(ExamStatus.OCR_PROCESSING, (result2 as ExamStatusResult.Success).statusInfo.status)
            
            val result3 = awaitItem()
            assertTrue(result3 is ExamStatusResult.Success)
            assertEquals(ExamStatus.PARSING, (result3 as ExamStatusResult.Success).statusInfo.status)
            
            val result4 = awaitItem()
            assertTrue(result4 is ExamStatusResult.Success)
            assertEquals(ExamStatus.COMPLETED, (result4 as ExamStatusResult.Success).statusInfo.status)
            
            // Should complete after COMPLETED status
            awaitComplete()
        }
    }
    
    @Test
    fun `invoke should handle exceptions and continue polling`() = runTest {
        // Given
        val examId = "exam_123"
        var callCount = 0
        coEvery { examRepository.getExamStatus(examId) } answers {
            if (callCount++ == 0) {
                throw Exception("Network timeout")
            } else {
                Result.success(ExamStatusInfo(ExamStatus.COMPLETED, 100, 0, null))
            }
        }
        
        // When
        useCase(examId, intervalMs = 50).test {
            // Then - should emit error first
            val result1 = awaitItem()
            assertTrue(result1 is ExamStatusResult.Error)
            assertEquals("Network timeout", (result1 as ExamStatusResult.Error).message)
            
            // Then should recover and emit success
            val result2 = awaitItem()
            assertTrue(result2 is ExamStatusResult.Success)
            assertEquals(ExamStatus.COMPLETED, (result2 as ExamStatusResult.Success).statusInfo.status)
            
            awaitComplete()
        }
    }
    
    @Test
    fun `invoke should use custom polling interval`() = runTest {
        // Given
        val examId = "exam_123"
        val customInterval = 200L
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.OCR_PROCESSING,
            progress = 30,
            estimatedTime = 60,
            errorMessage = null
        )
        coEvery { examRepository.getExamStatus(examId) } returns Result.success(statusInfo)
        
        // When
        val startTime = System.currentTimeMillis()
        useCase(examId, intervalMs = customInterval).test {
            // Then
            awaitItem() // First emission
            awaitItem() // Second emission after interval
            
            val elapsedTime = System.currentTimeMillis() - startTime
            // Should be at least the custom interval
            assertTrue(elapsedTime >= customInterval)
            
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `invoke should emit progress updates correctly`() = runTest {
        // Given
        val examId = "exam_123"
        val progressUpdates = listOf(10, 30, 50, 70, 100)
        var callCount = 0
        
        coEvery { examRepository.getExamStatus(examId) } answers {
            val progress = progressUpdates[callCount++]
            val status = if (progress == 100) ExamStatus.COMPLETED else ExamStatus.OCR_PROCESSING
            Result.success(ExamStatusInfo(status, progress, 60, null))
        }
        
        // When
        useCase(examId, intervalMs = 50).test {
            // Then - verify progress increases
            progressUpdates.forEach { expectedProgress ->
                val result = awaitItem()
                assertTrue(result is ExamStatusResult.Success)
                assertEquals(expectedProgress, (result as ExamStatusResult.Success).statusInfo.progress)
            }
            
            awaitComplete()
        }
    }
    
    @Test
    fun `invoke should handle error message in status info`() = runTest {
        // Given
        val examId = "exam_123"
        val errorMessage = "OCR failed: Invalid image format"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.FAILED,
            progress = 0,
            estimatedTime = null,
            errorMessage = errorMessage
        )
        coEvery { examRepository.getExamStatus(examId) } returns Result.success(statusInfo)
        
        // When
        useCase(examId, intervalMs = 100).test {
            // Then
            val result = awaitItem()
            assertTrue(result is ExamStatusResult.Success)
            val success = result as ExamStatusResult.Success
            assertEquals(ExamStatus.FAILED, success.statusInfo.status)
            assertEquals(errorMessage, success.statusInfo.errorMessage)
            
            awaitComplete()
        }
    }
}
