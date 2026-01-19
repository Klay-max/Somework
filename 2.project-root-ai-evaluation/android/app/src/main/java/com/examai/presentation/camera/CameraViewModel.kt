package com.examai.presentation.camera

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.examai.domain.usecase.CaptureExamPhotoUseCase
import com.examai.domain.usecase.SelectPhotoFromGalleryUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

/**
 * ViewModel for camera screen
 * Manages camera state and photo capture
 */
@HiltViewModel
class CameraViewModel @Inject constructor(
    private val captureExamPhotoUseCase: CaptureExamPhotoUseCase,
    private val selectPhotoFromGalleryUseCase: SelectPhotoFromGalleryUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(CameraUiState())
    val uiState: StateFlow<CameraUiState> = _uiState.asStateFlow()
    
    /**
     * Prepares for photo capture by creating a temporary file
     */
    fun preparePhotoCapture(): Pair<Uri, File>? {
        return try {
            val (uri, file) = captureExamPhotoUseCase.createPhotoUri()
            _uiState.update { it.copy(currentPhotoFile = file) }
            uri to file
        } catch (e: Exception) {
            _uiState.update { it.copy(errorMessage = "无法创建照片文件: ${e.message}") }
            null
        }
    }
    
    /**
     * Handles successful photo capture
     */
    fun onPhotoCaptured(file: File) {
        viewModelScope.launch {
            if (captureExamPhotoUseCase.validatePhotoFile(file)) {
                _uiState.update { 
                    it.copy(
                        capturedPhotoUri = Uri.fromFile(file),
                        showPreview = true,
                        errorMessage = null
                    )
                }
            } else {
                _uiState.update { it.copy(errorMessage = "照片文件无效") }
            }
        }
    }
    
    /**
     * Handles photo selection from gallery
     */
    fun onPhotoSelectedFromGallery(uri: Uri) {
        viewModelScope.launch {
            val result = selectPhotoFromGalleryUseCase.copyPhotoToCache(uri)
            
            result.onSuccess { file ->
                if (selectPhotoFromGalleryUseCase.validateImageFile(file)) {
                    _uiState.update { 
                        it.copy(
                            capturedPhotoUri = Uri.fromFile(file),
                            showPreview = true,
                            currentPhotoFile = file,
                            errorMessage = null
                        )
                    }
                } else {
                    _uiState.update { it.copy(errorMessage = "图片文件无效或过大（最大10MB）") }
                }
            }.onFailure { error ->
                _uiState.update { it.copy(errorMessage = "无法加载图片: ${error.message}") }
            }
        }
    }
    
    /**
     * Confirms the captured photo and proceeds to upload
     */
    fun confirmPhoto() {
        _uiState.update { it.copy(isPhotoConfirmed = true) }
    }
    
    /**
     * Retakes the photo
     */
    fun retakePhoto() {
        _uiState.update { 
            it.copy(
                capturedPhotoUri = null,
                showPreview = false,
                currentPhotoFile = null,
                errorMessage = null
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
 * UI state for camera screen
 */
data class CameraUiState(
    val capturedPhotoUri: Uri? = null,
    val showPreview: Boolean = false,
    val currentPhotoFile: File? = null,
    val isPhotoConfirmed: Boolean = false,
    val errorMessage: String? = null
)
