package com.examai.domain.usecase

import com.examai.domain.model.ExamStatus
import com.examai.domain.model.ExamStatusInfo
import com.examai.domain.repository.ExamRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

/**
 * Use case for polling exam processing status
 * Polls the backend API at regular intervals until processing is complete
 * 
 * Requirements: 16.4 (Status Notification and Polling)
 */
class PollExamStatusUseCase @Inject constructor(
    private val examRepository: ExamRepository
) {
    /**
     * Poll exam status at regular intervals
     * 
     * @param examId The exam ID to poll
     * @param intervalMs Polling interval in milliseconds (default: 5000ms = 5 seconds)
     * @return Flow of ExamStatusResult
     */
    operator fun invoke(
        examId: String,
        intervalMs: Long = DEFAULT_POLL_INTERVAL_MS
    ): Flow<ExamStatusResult> = flow {
        var shouldContinue = true
        
        while (shouldContinue) {
            try {
                val result = examRepository.getExamStatus(examId)
                
                result.fold(
                    onSuccess = { statusInfo ->
                        val statusResult = ExamStatusResult.Success(statusInfo)
                        emit(statusResult)
                        
                        // Stop polling if status is terminal (completed or failed)
                        if (isTerminalStatus(statusInfo.status)) {
                            shouldContinue = false
                        } else {
                            // Wait before next poll
                            delay(intervalMs)
                        }
                    },
                    onFailure = { error ->
                        emit(ExamStatusResult.Error(error.message ?: "Unknown error"))
                        // Continue polling even on error (network might recover)
                        delay(intervalMs)
                    }
                )
            } catch (e: Exception) {
                emit(ExamStatusResult.Error(e.message ?: "Unknown error"))
                // Continue polling even on error (network might recover)
                delay(intervalMs)
            }
        }
    }
    
    /**
     * Check if status is terminal (no more polling needed)
     */
    private fun isTerminalStatus(status: ExamStatus): Boolean {
        return status == ExamStatus.COMPLETED || 
               status == ExamStatus.FAILED ||
               status == ExamStatus.REPORT_GENERATED
    }
    
    companion object {
        const val DEFAULT_POLL_INTERVAL_MS = 5000L // 5 seconds
        const val BACKGROUND_POLL_INTERVAL_MS = 30000L // 30 seconds
    }
}

/**
 * Result of exam status polling
 */
sealed class ExamStatusResult {
    data class Success(
        val statusInfo: ExamStatusInfo
    ) : ExamStatusResult()
    
    data class Error(
        val message: String
    ) : ExamStatusResult()
}
