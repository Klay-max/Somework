package com.examai.data.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.examai.domain.usecase.UploadExamUseCase
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.io.File

/**
 * WorkManager worker for uploading exam images in the background
 * Handles offline queue and automatic retry
 */
@HiltWorker
class UploadExamWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val uploadExamUseCase: UploadExamUseCase
) : CoroutineWorker(context, workerParams) {
    
    companion object {
        const val KEY_IMAGE_PATH = "image_path"
        const val KEY_EXAM_ID = "exam_id"
        const val KEY_ERROR_MESSAGE = "error_message"
        const val KEY_PROGRESS = "progress"
    }
    
    override suspend fun doWork(): Result {
        // Get image path from input data
        val imagePath = inputData.getString(KEY_IMAGE_PATH)
            ?: return Result.failure(
                workDataOf(KEY_ERROR_MESSAGE to "缺少图片路径")
            )
        
        val imageFile = File(imagePath)
        
        // Set initial progress
        setProgress(workDataOf(KEY_PROGRESS to 0))
        
        // Upload exam
        val uploadResult = uploadExamUseCase(imageFile)
        
        return uploadResult.fold(
            onSuccess = { examId ->
                // Upload successful
                setProgress(workDataOf(KEY_PROGRESS to 100))
                Result.success(
                    workDataOf(
                        KEY_EXAM_ID to examId,
                        KEY_PROGRESS to 100
                    )
                )
            },
            onFailure = { error ->
                // Upload failed - retry if possible
                val errorMessage = error.message ?: "上传失败"
                
                // Check if error is retryable
                if (isRetryableError(error)) {
                    Result.retry()
                } else {
                    Result.failure(
                        workDataOf(KEY_ERROR_MESSAGE to errorMessage)
                    )
                }
            }
        )
    }
    
    /**
     * Determines if an error is retryable
     */
    private fun isRetryableError(error: Throwable): Boolean {
        val message = error.message?.lowercase() ?: ""
        
        // Network errors are retryable
        if (message.contains("network") ||
            message.contains("timeout") ||
            message.contains("connection") ||
            message.contains("unable to resolve host")
        ) {
            return true
        }
        
        // Server errors (5xx) are retryable
        if (message.contains("server error") ||
            message.contains("503") ||
            message.contains("502")
        ) {
            return true
        }
        
        // Client errors (4xx) are not retryable
        return false
    }
}
