package com.examai.presentation.camera

import android.graphics.Bitmap
import app.cash.turbine.test
import com.examai.domain.usecase.*
import io.mockk.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for CameraPreviewViewModel
 */
@OptIn(ExperimentalCoroutinesApi::class)
class CameraPreviewViewModelTest {
    
    private lateinit var viewModel: CameraPreviewViewModel
    private lateinit var analyzeImageQualityUseCase: AnalyzeImageQualityUseCase
    private lateinit var captureExamPhotoUseCase: CaptureExamPhotoUseCase
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        analyzeImageQualityUseCase = mockk()
        captureExamPhotoUseCase = mockk()
        viewModel = CameraPreviewViewModel(analyzeImageQualityUseCase, captureExamPhotoUseCase)
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
        clearAllMocks()
    }
    
    @Test
    fun `initial state should be default`() = runTest {
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.qualityResult)
            assertFalse(state.isCapturing)
            assertNull(state.capturedPhotoFile)
            assertFalse(state.isPhotoConfirmed)
            assertNull(state.errorMessage)
        }
    }
    
    @Test
    fun `updateQuality should analyze bitmap and update state`() = runTest {
        // Given
        val mockBitmap = mockk<Bitmap>()
        val mockResult = ImageQualityResult(
            brightness = BrightnessLevel.GOOD,
            sharpness = SharpnessLevel.SHARP,
            aspectRatio = AspectRatioLevel.GOOD,
            overallQuality = QualityLevel.EXCELLENT
        )
        every { analyzeImageQualityUseCase.analyzeQuality(mockBitmap) } returns mockResult
        
        // When
        viewModel.updateQuality(mockBitmap)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals(mockResult, state.qualityResult)
        }
        
        verify { analyzeImageQualityUseCase.analyzeQuality(mockBitmap) }
    }
    
    @Test
    fun `updateQuality should handle analysis exception gracefully`() = runTest {
        // Given
        val mockBitmap = mockk<Bitmap>()
        every { analyzeImageQualityUseCase.analyzeQuality(mockBitmap) } throws Exception("Test error")
        
        // When
        viewModel.updateQuality(mockBitmap)
        advanceUntilIdle()
        
        // Then - should not crash, state should remain unchanged
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.qualityResult)
            assertNull(state.errorMessage)
        }
    }
    
    @Test
    fun `clearError should remove error message`() = runTest {
        // Given - simulate error state
        val mockBitmap = mockk<Bitmap>()
        every { analyzeImageQualityUseCase.analyzeQuality(mockBitmap) } throws Exception("Test error")
        
        // When
        viewModel.clearError()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.errorMessage)
        }
    }
    
    @Test
    fun `resetConfirmation should set isPhotoConfirmed to false`() = runTest {
        // When
        viewModel.resetConfirmation()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isPhotoConfirmed)
        }
    }
    
    @Test
    fun `quality result should provide guidance message`() {
        // Given
        val result = ImageQualityResult(
            brightness = BrightnessLevel.LOW,
            sharpness = SharpnessLevel.BLURRY,
            aspectRatio = AspectRatioLevel.GOOD,
            overallQuality = QualityLevel.POOR
        )
        
        // When
        val message = result.getGuidanceMessage()
        
        // Then
        assertTrue(message.contains("光线不足"))
        assertTrue(message.contains("模糊"))
    }
    
    @Test
    fun `quality result should indicate if acceptable`() {
        // Given - fair quality
        val fairResult = ImageQualityResult(
            brightness = BrightnessLevel.GOOD,
            sharpness = SharpnessLevel.ACCEPTABLE,
            aspectRatio = AspectRatioLevel.GOOD,
            overallQuality = QualityLevel.FAIR
        )
        
        // When
        val acceptable = fairResult.isAcceptable()
        
        // Then
        assertTrue(acceptable)
    }
    
    @Test
    fun `quality result should indicate if not acceptable`() {
        // Given - poor quality
        val poorResult = ImageQualityResult(
            brightness = BrightnessLevel.LOW,
            sharpness = SharpnessLevel.BLURRY,
            aspectRatio = AspectRatioLevel.TOO_NARROW,
            overallQuality = QualityLevel.POOR
        )
        
        // When
        val acceptable = poorResult.isAcceptable()
        
        // Then
        assertFalse(acceptable)
    }
}
