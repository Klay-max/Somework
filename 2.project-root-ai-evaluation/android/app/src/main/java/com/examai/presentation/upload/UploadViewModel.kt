package com.examai.presentation.upload

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.*
import com.examai.data.service.NotificationService
import com.examai.data.worker.UploadExamWorker
import com.examai.domain.model.ExamStatus
import com.examai.domain.model.ExamStatusInfo
import com.examai.domain.usecase.PollExamStatusUseCase
import com.examai.domain.usecase.ExamStatusResult
import com.examai.domain.usecase.UploadExamUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import java.util.UUID
import java.util.concurrent.TimeUnit
import javax.inject.Inject

/**
 * ViewModel for upload screen
 * Manages upload state, WorkManager integration, status polling, and notifications
 */
@HiltViewModel
class UploadViewModel @Inject constructor(
    private val uploadExamUseCase: UploadExamUseCase,
    private val pollExamStatusUseCase: PollExamStatusUseCase,
    private val notificationService: NotificationService,
    private val workManager: WorkManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UploadUiState())
    val uiState: StateFlow<UploadUiState> = _uiState.asStateFlow()
    
    private var pollingJob: Job? = null
    
    /**
     * Uploads an exam image immediately (online mode)
     */
    fun uploadExam(imageFile: File) {
        viewModelScope.launch {
            _uiState.update { it.copy(isUploading = true, uploadProgress = 0, errorMessage = null) }
            
            // Simulate progress updates
            _uiState.update { it.copy(uploadProgress = 30) }
            
            val result = uploadExamUseCase(imageFile)
            
            result.fold(
                onSuccess = { examId ->
                    _uiState.update {
                        it.copy(
                            isUploading = false,
                            uploadProgress = 100,
                            uploadedExamId = examId,
                            isUploadComplete = true,
                            errorMessage = null
                        )
                    }
                    
                    // Start polling exam status
                    startStatusPolling(examId)
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isUploading = false,
                            uploadProgress = 0,
                            errorMessage = error.message ?: "上传失败"
                        )
                    }
                }
            )
        }
    }
    
    /**
     * Starts polling exam processing status
     */
    private fun startStatusPolling(examId: String) {
        // Cancel any existing polling
        pollingJob?.cancel()
        
        pollingJob = viewModelScope.launch {
            pollExamStatusUseCase(examId).collect { result ->
                when (result) {
                    is ExamStatusResult.Success -> {
                        _uiState.update {
                            it.copy(
                                statusInfo = result.statusInfo,
                                isPolling = true,
                                pollingError = null
                            )
                        }
                        
                        // Handle terminal statuses
                        when (result.statusInfo.status) {
                            ExamStatus.COMPLETED, ExamStatus.REPORT_GENERATED -> {
                                // Show success notification
                                notificationService.showProcessingCompleteNotification(examId)
                                _uiState.update { it.copy(isPolling = false) }
                                pollingJob?.cancel()
                            }
                            ExamStatus.FAILED -> {
                                // Show failure notification
                                notificationService.showProcessingFailedNotification(
                                    examId,
                                    result.statusInfo.errorMessage
                                )
                                _uiState.update { it.copy(isPolling = false) }
                                pollingJob?.cancel()
                            }
                            else -> {
                                // Continue polling for non-terminal statuses
                            }
                        }
                    }
                    is ExamStatusResult.Error -> {
                        _uiState.update {
                            it.copy(
                                pollingError = result.message,
                                isPolling = true // Continue polling despite errors
                            )
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Manually starts status polling for an exam ID
     */
    fun pollExamStatus(examId: String) {
        startStatusPolling(examId)
    }
    
    /**
     * Stops status polling
     */
    fun stopStatusPolling() {
        pollingJob?.cancel()
        _uiState.update { it.copy(isPolling = false) }
    }
    
    /**
     * Queues an exam image for background upload (offline mode)
     */
    fun queueExamUpload(imageFile: File): UUID {
        // Create work request with constraints
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        
        val inputData = workDataOf(
            UploadExamWorker.KEY_IMAGE_PATH to imageFile.absolutePath
        )
        
        val uploadWorkRequest = OneTimeWorkRequestBuilder<UploadExamWorker>()
            .setConstraints(constraints)
            .setInputData(inputData)
            .setBackoffCriteria(
                BackoffPolicy.EXPONENTIAL,
                10000L, // 10 seconds minimum backoff
                TimeUnit.MILLISECONDS
            )
            .build()
        
        // Enqueue work
        workManager.enqueue(uploadWorkRequest)
        
        // Update UI state
        _uiState.update {
            it.copy(
                isQueuedForUpload = true,
                queuedWorkId = uploadWorkRequest.id
            )
        }
        
        return uploadWorkRequest.id
    }
    
    /**
     * Observes the progress of a queued upload
     */
    fun observeQueuedUpload(workId: UUID) {
        viewModelScope.launch {
            workManager.getWorkInfoByIdFlow(workId).collect { workInfo ->
                when (workInfo?.state) {
                    WorkInfo.State.ENQUEUED -> {
                        _uiState.update {
                            it.copy(
                                isQueuedForUpload = true,
                                queueStatus = "等待网络连接..."
                            )
                        }
                    }
                    WorkInfo.State.RUNNING -> {
                        val progress = workInfo.progress.getInt(UploadExamWorker.KEY_PROGRESS, 0)
                        _uiState.update {
                            it.copy(
                                isQueuedForUpload = true,
                                uploadProgress = progress,
                                queueStatus = "正在上传..."
                            )
                        }
                    }
                    WorkInfo.State.SUCCEEDED -> {
                        val examId = workInfo.outputData.getString(UploadExamWorker.KEY_EXAM_ID)
                        _uiState.update {
                            it.copy(
                                isQueuedForUpload = false,
                                isUploadComplete = true,
                                uploadedExamId = examId,
                                uploadProgress = 100,
                                queueStatus = "上传成功"
                            )
                        }
                        
                        // Start polling if exam ID is available
                        if (examId != null) {
                            startStatusPolling(examId)
                        }
                    }
                    WorkInfo.State.FAILED -> {
                        val errorMessage = workInfo.outputData.getString(UploadExamWorker.KEY_ERROR_MESSAGE)
                        _uiState.update {
                            it.copy(
                                isQueuedForUpload = false,
                                errorMessage = errorMessage ?: "上传失败",
                                queueStatus = null
                            )
                        }
                    }
                    WorkInfo.State.CANCELLED -> {
                        _uiState.update {
                            it.copy(
                                isQueuedForUpload = false,
                                queueStatus = null
                            )
                        }
                    }
                    else -> {
                        // BLOCKED state or null
                    }
                }
            }
        }
    }
    
    /**
     * Cancels a queued upload
     */
    fun cancelQueuedUpload(workId: UUID) {
        workManager.cancelWorkById(workId)
        _uiState.update {
            it.copy(
                isQueuedForUpload = false,
                queuedWorkId = null,
                queueStatus = null
            )
        }
    }
    
    /**
     * Retries a failed upload
     */
    fun retryUpload(imageFile: File) {
        uploadExam(imageFile)
    }
    
    /**
     * Clears error message
     */
    fun clearError() {
        _uiState.update { it.copy(errorMessage = null, pollingError = null) }
    }
    
    /**
     * Resets upload state
     */
    fun resetUploadState() {
        stopStatusPolling()
        _uiState.update { UploadUiState() }
    }
    
    override fun onCleared() {
        super.onCleared()
        stopStatusPolling()
    }
}

/**
 * UI state for upload screen
 */
data class UploadUiState(
    val isUploading: Boolean = false,
    val uploadProgress: Int = 0,
    val uploadedExamId: String? = null,
    val isUploadComplete: Boolean = false,
    val errorMessage: String? = null,
    val isQueuedForUpload: Boolean = false,
    val queuedWorkId: UUID? = null,
    val queueStatus: String? = null,
    // Status polling fields
    val isPolling: Boolean = false,
    val statusInfo: ExamStatusInfo? = null,
    val pollingError: String? = null
)
