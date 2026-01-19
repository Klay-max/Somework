package com.examai.presentation.upload

import androidx.work.WorkInfo
import androidx.work.WorkManager
import app.cash.turbine.test
import com.examai.data.service.NotificationService
import com.examai.domain.model.ExamStatus
import com.examai.domain.model.ExamStatusInfo
import com.examai.domain.usecase.ExamStatusResult
import com.examai.domain.usecase.PollExamStatusUseCase
import com.examai.domain.usecase.UploadExamUseCase
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.io.File
import java.util.UUID

/**
 * Unit tests for UploadViewModel
 */
@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
class UploadViewModelTest {
    
    private lateinit var uploadExamUseCase: UploadExamUseCase
    private lateinit var pollExamStatusUseCase: PollExamStatusUseCase
    private lateinit var notificationService: NotificationService
    private lateinit var workManager: WorkManager
    private lateinit var viewModel: UploadViewModel
    private lateinit var testFile: File
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        
        uploadExamUseCase = mockk()
        pollExamStatusUseCase = mockk()
        notificationService = mockk(relaxed = true)
        workManager = mockk(relaxed = true)
        viewModel = UploadViewModel(uploadExamUseCase, pollExamStatusUseCase, notificationService, workManager)
        
        // Create a temporary test file
        testFile = File.createTempFile("test_exam", ".jpg")
        testFile.writeText("test image content")
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
        testFile.delete()
    }
    
    @Test
    fun `uploadExam should update state to uploading`() = runTest {
        // Given
        coEvery { uploadExamUseCase(testFile) } coAnswers {
            kotlinx.coroutines.delay(100)
            Result.success("exam_123")
        }
        
        // When
        viewModel.uploadExam(testFile)
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isUploading)
            assertEquals(0, state.uploadProgress)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `uploadExam should update state to complete on success`() = runTest {
        // Given
        val examId = "exam_123"
        coEvery { uploadExamUseCase(testFile) } returns Result.success(examId)
        coEvery { pollExamStatusUseCase(examId, any()) } returns flowOf()
        
        // When
        viewModel.uploadExam(testFile)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isUploading)
            assertTrue(state.isUploadComplete)
            assertEquals(examId, state.uploadedExamId)
            assertEquals(100, state.uploadProgress)
            assertNull(state.errorMessage)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `uploadExam should update state with error on failure`() = runTest {
        // Given
        val errorMessage = "Network error"
        coEvery { uploadExamUseCase(testFile) } returns Result.failure(Exception(errorMessage))
        
        // When
        viewModel.uploadExam(testFile)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isUploading)
            assertFalse(state.isUploadComplete)
            assertEquals(errorMessage, state.errorMessage)
            assertEquals(0, state.uploadProgress)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `queueExamUpload should enqueue work and update state`() = runTest {
        // When
        val workId = viewModel.queueExamUpload(testFile)
        
        // Then
        assertNotNull(workId)
        verify { workManager.enqueue(any()) }
        
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isQueuedForUpload)
            assertEquals(workId, state.queuedWorkId)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `observeQueuedUpload should update state when work is enqueued`() = runTest {
        // Given
        val workId = UUID.randomUUID()
        val workInfo = mockk<WorkInfo> {
            every { state } returns WorkInfo.State.ENQUEUED
        }
        every { workManager.getWorkInfoByIdFlow(workId) } returns flowOf(workInfo)
        
        // When
        viewModel.observeQueuedUpload(workId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isQueuedForUpload)
            assertEquals("等待网络连接...", state.queueStatus)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `observeQueuedUpload should update state when work is running`() = runTest {
        // Given
        val workId = UUID.randomUUID()
        val progress = 50
        val workInfo = mockk<WorkInfo> {
            every { state } returns WorkInfo.State.RUNNING
            every { this@mockk.progress } returns androidx.work.workDataOf(
                "progress" to progress
            )
        }
        every { workManager.getWorkInfoByIdFlow(workId) } returns flowOf(workInfo)
        
        // When
        viewModel.observeQueuedUpload(workId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isQueuedForUpload)
            assertEquals(progress, state.uploadProgress)
            assertEquals("正在上传...", state.queueStatus)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `observeQueuedUpload should update state when work succeeds`() = runTest {
        // Given
        val workId = UUID.randomUUID()
        val examId = "exam_123"
        val workInfo = mockk<WorkInfo> {
            every { state } returns WorkInfo.State.SUCCEEDED
            every { outputData } returns androidx.work.workDataOf(
                "exam_id" to examId
            )
        }
        every { workManager.getWorkInfoByIdFlow(workId) } returns flowOf(workInfo)
        
        // When
        viewModel.observeQueuedUpload(workId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isQueuedForUpload)
            assertTrue(state.isUploadComplete)
            assertEquals(examId, state.uploadedExamId)
            assertEquals(100, state.uploadProgress)
            assertEquals("上传成功", state.queueStatus)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `observeQueuedUpload should update state when work fails`() = runTest {
        // Given
        val workId = UUID.randomUUID()
        val errorMessage = "Upload failed"
        val workInfo = mockk<WorkInfo> {
            every { state } returns WorkInfo.State.FAILED
            every { outputData } returns androidx.work.workDataOf(
                "error_message" to errorMessage
            )
        }
        every { workManager.getWorkInfoByIdFlow(workId) } returns flowOf(workInfo)
        
        // When
        viewModel.observeQueuedUpload(workId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isQueuedForUpload)
            assertEquals(errorMessage, state.errorMessage)
            assertNull(state.queueStatus)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `cancelQueuedUpload should cancel work and reset state`() = runTest {
        // Given
        val workId = UUID.randomUUID()
        
        // When
        viewModel.cancelQueuedUpload(workId)
        
        // Then
        verify { workManager.cancelWorkById(workId) }
        
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isQueuedForUpload)
            assertNull(state.queuedWorkId)
            assertNull(state.queueStatus)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `retryUpload should call uploadExam again`() = runTest {
        // Given
        coEvery { uploadExamUseCase(testFile) } returns Result.success("exam_123")
        
        // When
        viewModel.retryUpload(testFile)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isUploadComplete)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `clearError should clear error message`() = runTest {
        // Given
        coEvery { uploadExamUseCase(testFile) } returns Result.failure(Exception("Error"))
        viewModel.uploadExam(testFile)
        advanceUntilIdle()
        
        // When
        viewModel.clearError()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.errorMessage)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `resetUploadState should reset all state`() = runTest {
        // Given
        coEvery { uploadExamUseCase(testFile) } returns Result.success("exam_123")
        coEvery { pollExamStatusUseCase(any(), any()) } returns flowOf()
        viewModel.uploadExam(testFile)
        advanceUntilIdle()
        
        // When
        viewModel.resetUploadState()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isUploading)
            assertFalse(state.isUploadComplete)
            assertFalse(state.isQueuedForUpload)
            assertEquals(0, state.uploadProgress)
            assertNull(state.uploadedExamId)
            assertNull(state.errorMessage)
            assertNull(state.queuedWorkId)
            assertNull(state.queueStatus)
            assertFalse(state.isPolling)
            assertNull(state.statusInfo)
            assertNull(state.pollingError)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    // ========== Status Polling Tests ==========
    
    @Test
    fun `uploadExam should start status polling after successful upload`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.OCR_PROCESSING,
            progress = 30,
            estimatedTime = 60,
            errorMessage = null
        )
        coEvery { uploadExamUseCase(testFile) } returns Result.success(examId)
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.uploadExam(testFile)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isPolling)
            assertEquals(statusInfo, state.statusInfo)
            assertNull(state.pollingError)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `pollExamStatus should update state with status info`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.PARSING,
            progress = 50,
            estimatedTime = 30,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isPolling)
            assertEquals(statusInfo, state.statusInfo)
            assertNull(state.pollingError)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `pollExamStatus should stop polling when status is COMPLETED`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.COMPLETED,
            progress = 100,
            estimatedTime = 0,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isPolling)
            assertEquals(statusInfo, state.statusInfo)
            assertEquals(ExamStatus.COMPLETED, state.statusInfo?.status)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `pollExamStatus should stop polling when status is FAILED`() = runTest {
        // Given
        val examId = "exam_123"
        val errorMessage = "Processing failed"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.FAILED,
            progress = 0,
            estimatedTime = null,
            errorMessage = errorMessage
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isPolling)
            assertEquals(statusInfo, state.statusInfo)
            assertEquals(ExamStatus.FAILED, state.statusInfo?.status)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `pollExamStatus should stop polling when status is REPORT_GENERATED`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.REPORT_GENERATED,
            progress = 100,
            estimatedTime = 0,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isPolling)
            assertEquals(statusInfo, state.statusInfo)
            assertEquals(ExamStatus.REPORT_GENERATED, state.statusInfo?.status)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `pollExamStatus should handle polling errors`() = runTest {
        // Given
        val examId = "exam_123"
        val errorMessage = "Network error"
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Error(errorMessage))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isPolling) // Continue polling despite errors
            assertEquals(errorMessage, state.pollingError)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `pollExamStatus should emit multiple status updates`() = runTest {
        // Given
        val examId = "exam_123"
        val statuses = listOf(
            ExamStatusInfo(ExamStatus.UPLOADED, 10, 120, null),
            ExamStatusInfo(ExamStatus.OCR_PROCESSING, 30, 90, null),
            ExamStatusInfo(ExamStatus.PARSING, 50, 60, null),
            ExamStatusInfo(ExamStatus.COMPLETED, 100, 0, null)
        )
        
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            statuses.forEach { emit(ExamStatusResult.Success(it)) }
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            // Should have the last status (COMPLETED)
            assertEquals(ExamStatus.COMPLETED, state.statusInfo?.status)
            assertFalse(state.isPolling)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `stopStatusPolling should stop polling and update state`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.OCR_PROCESSING,
            progress = 30,
            estimatedTime = 60,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
            // Simulate long-running polling
            kotlinx.coroutines.delay(10000)
        }
        
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // When
        viewModel.stopStatusPolling()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isPolling)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `clearError should clear polling error`() = runTest {
        // Given
        val examId = "exam_123"
        val errorMessage = "Network error"
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Error(errorMessage))
        }
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // When
        viewModel.clearError()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.pollingError)
            assertNull(state.errorMessage)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    @Test
    fun `observeQueuedUpload should start polling when work succeeds`() = runTest {
        // Given
        val workId = UUID.randomUUID()
        val examId = "exam_123"
        val workInfo = mockk<WorkInfo> {
            every { state } returns WorkInfo.State.SUCCEEDED
            every { outputData } returns androidx.work.workDataOf(
                "exam_id" to examId
            )
        }
        every { workManager.getWorkInfoByIdFlow(workId) } returns flowOf(workInfo)
        
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.UPLOADED,
            progress = 10,
            estimatedTime = 120,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.observeQueuedUpload(workId)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isPolling)
            assertEquals(statusInfo, state.statusInfo)
            cancelAndIgnoreRemainingEvents()
        }
    }
    
    // ========== Notification Tests ==========
    
    @Test
    fun `pollExamStatus should show notification when status is COMPLETED`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.COMPLETED,
            progress = 100,
            estimatedTime = 0,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        verify { notificationService.showProcessingCompleteNotification(examId) }
    }
    
    @Test
    fun `pollExamStatus should show notification when status is REPORT_GENERATED`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.REPORT_GENERATED,
            progress = 100,
            estimatedTime = 0,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        verify { notificationService.showProcessingCompleteNotification(examId) }
    }
    
    @Test
    fun `pollExamStatus should show failure notification when status is FAILED`() = runTest {
        // Given
        val examId = "exam_123"
        val errorMessage = "Processing failed"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.FAILED,
            progress = 0,
            estimatedTime = null,
            errorMessage = errorMessage
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        verify { notificationService.showProcessingFailedNotification(examId, errorMessage) }
    }
    
    @Test
    fun `pollExamStatus should not show notification for non-terminal statuses`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.OCR_PROCESSING,
            progress = 30,
            estimatedTime = 60,
            errorMessage = null
        )
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
            // Simulate long-running polling
            kotlinx.coroutines.delay(10000)
        }
        
        // When
        viewModel.pollExamStatus(examId)
        advanceUntilIdle()
        
        // Then
        verify(exactly = 0) { notificationService.showProcessingCompleteNotification(any()) }
        verify(exactly = 0) { notificationService.showProcessingFailedNotification(any(), any()) }
    }
    
    @Test
    fun `uploadExam should trigger notification when processing completes`() = runTest {
        // Given
        val examId = "exam_123"
        val statusInfo = ExamStatusInfo(
            status = ExamStatus.COMPLETED,
            progress = 100,
            estimatedTime = 0,
            errorMessage = null
        )
        coEvery { uploadExamUseCase(testFile) } returns Result.success(examId)
        coEvery { pollExamStatusUseCase(examId, any()) } returns flow {
            emit(ExamStatusResult.Success(statusInfo))
        }
        
        // When
        viewModel.uploadExam(testFile)
        advanceUntilIdle()
        
        // Then
        verify { notificationService.showProcessingCompleteNotification(examId) }
    }
}

