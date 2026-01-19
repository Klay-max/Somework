package com.examai.presentation.camera

import android.content.Context
import android.graphics.Bitmap
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.examai.domain.usecase.AnalyzeImageQualityUseCase
import com.examai.domain.usecase.CaptureExamPhotoUseCase
import com.examai.domain.usecase.ImageQualityResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

/**
 * ViewModel for camera preview with real-time guidance
 */
@HiltViewModel
class CameraPreviewViewModel @Inject constructor(
    private val analyzeImageQualityUseCase: AnalyzeImageQualityUseCase,
    private val captureExamPhotoUseCase: CaptureExamPhotoUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(CameraPreviewUiState())
    val uiState: StateFlow<CameraPreviewUiState> = _uiState.asStateFlow()
    
    /**
     * Updates quality analysis from real-time image analysis
     */
    fun updateQuality(bitmap: Bitmap) {
        viewModelScope.launch {
            try {
                val result = analyzeImageQualityUseCase.analyzeQuality(bitmap)
                _uiState.update { it.copy(qualityResult = result) }
            } catch (e: Exception) {
                // Ignore analysis errors, continue with next frame
            }
        }
    }
    
    /**
     * Captures photo using ImageCapture
     */
    fun capturePhoto(imageCapture: ImageCapture, context: Context) {
        viewModelScope.launch {
            _uiState.update { it.copy(isCapturing = true) }
            
            try {
                val (_, photoFile) = captureExamPhotoUseCase.createPhotoUri()
                
                val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()
                
                imageCapture.takePicture(
                    outputOptions,
                    ContextCompat.getMainExecutor(context),
                    object : ImageCapture.OnImageSavedCallback {
                        override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                            onPhotoSaved(photoFile)
                        }
                        
                        override fun onError(exception: ImageCaptureException) {
                            onCaptureError(exception.message ?: "拍照失败")
                        }
                    }
                )
            } catch (e: Exception) {
                onCaptureError(e.message ?: "拍照失败")
            }
        }
    }
    
    /**
     * Handles successful photo save
     */
    private fun onPhotoSaved(file: File) {
        _uiState.update {
            it.copy(
                isCapturing = false,
                capturedPhotoFile = file,
                isPhotoConfirmed = true
            )
        }
    }
    
    /**
     * Handles capture error
     */
    private fun onCaptureError(message: String) {
        _uiState.update {
            it.copy(
                isCapturing = false,
                errorMessage = message
            )
        }
    }
    
    /**
     * Clears error message
     */
    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
    
    /**
     * Resets confirmation state
     */
    fun resetConfirmation() {
        _uiState.update { it.copy(isPhotoConfirmed = false) }
    }
}

/**
 * UI state for camera preview
 */
data class CameraPreviewUiState(
    val qualityResult: ImageQualityResult? = null,
    val isCapturing: Boolean = false,
    val capturedPhotoFile: File? = null,
    val isPhotoConfirmed: Boolean = false,
    val errorMessage: String? = null
)
