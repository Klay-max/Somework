package com.examai.presentation.camera

import android.net.Uri
import app.cash.turbine.test
import com.examai.domain.usecase.CaptureExamPhotoUseCase
import com.examai.domain.usecase.SelectPhotoFromGalleryUseCase
import io.mockk.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.File

/**
 * Unit tests for CameraViewModel
 */
@OptIn(ExperimentalCoroutinesApi::class)
class CameraViewModelTest {
    
    private lateinit var viewModel: CameraViewModel
    private lateinit var captureExamPhotoUseCase: CaptureExamPhotoUseCase
    private lateinit var selectPhotoFromGalleryUseCase: SelectPhotoFromGalleryUseCase
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        captureExamPhotoUseCase = mockk()
        selectPhotoFromGalleryUseCase = mockk()
        viewModel = CameraViewModel(captureExamPhotoUseCase, selectPhotoFromGalleryUseCase)
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
            assertNull(state.capturedPhotoUri)
            assertFalse(state.showPreview)
            assertNull(state.currentPhotoFile)
            assertFalse(state.isPhotoConfirmed)
            assertNull(state.errorMessage)
        }
    }
    
    @Test
    fun `preparePhotoCapture should create URI and file`() = runTest {
        // Given
        val mockUri = mockk<Uri>()
        val mockFile = mockk<File>()
        every { captureExamPhotoUseCase.createPhotoUri() } returns (mockUri to mockFile)
        
        // When
        val result = viewModel.preparePhotoCapture()
        
        // Then
        assertNotNull(result)
        assertEquals(mockUri, result?.first)
        assertEquals(mockFile, result?.second)
        
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals(mockFile, state.currentPhotoFile)
        }
    }
    
    @Test
    fun `preparePhotoCapture should handle exception`() = runTest {
        // Given
        every { captureExamPhotoUseCase.createPhotoUri() } throws Exception("Test error")
        
        // When
        val result = viewModel.preparePhotoCapture()
        
        // Then
        assertNull(result)
        
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.errorMessage?.contains("无法创建照片文件") == true)
        }
    }
    
    @Test
    fun `onPhotoCaptured should update state for valid file`() = runTest {
        // Given
        val mockFile = mockk<File>()
        every { captureExamPhotoUseCase.validatePhotoFile(mockFile) } returns true
        every { mockFile.toURI() } returns java.net.URI("file:///test.jpg")
        
        // When
        viewModel.onPhotoCaptured(mockFile)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNotNull(state.capturedPhotoUri)
            assertTrue(state.showPreview)
            assertNull(state.errorMessage)
        }
    }
    
    @Test
    fun `onPhotoCaptured should show error for invalid file`() = runTest {
        // Given
        val mockFile = mockk<File>()
        every { captureExamPhotoUseCase.validatePhotoFile(mockFile) } returns false
        
        // When
        viewModel.onPhotoCaptured(mockFile)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals("照片文件无效", state.errorMessage)
        }
    }
    
    @Test
    fun `confirmPhoto should set isPhotoConfirmed to true`() = runTest {
        // When
        viewModel.confirmPhoto()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.isPhotoConfirmed)
        }
    }
    
    @Test
    fun `retakePhoto should reset state`() = runTest {
        // Given - simulate captured photo
        val mockFile = mockk<File>()
        every { captureExamPhotoUseCase.validatePhotoFile(mockFile) } returns true
        every { mockFile.toURI() } returns java.net.URI("file:///test.jpg")
        viewModel.onPhotoCaptured(mockFile)
        advanceUntilIdle()
        
        // When
        viewModel.retakePhoto()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNull(state.capturedPhotoUri)
            assertFalse(state.showPreview)
            assertNull(state.currentPhotoFile)
            assertNull(state.errorMessage)
        }
    }
    
    @Test
    fun `clearError should remove error message`() = runTest {
        // Given - simulate error
        every { captureExamPhotoUseCase.createPhotoUri() } throws Exception("Test error")
        viewModel.preparePhotoCapture()
        
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
        // Given
        viewModel.confirmPhoto()
        
        // When
        viewModel.resetConfirmation()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertFalse(state.isPhotoConfirmed)
        }
    }
    
    @Test
    fun `onPhotoSelectedFromGallery should copy and validate photo`() = runTest {
        // Given
        val mockUri = mockk<Uri>()
        val mockFile = mockk<File>()
        every { selectPhotoFromGalleryUseCase.copyPhotoToCache(mockUri) } returns Result.success(mockFile)
        every { selectPhotoFromGalleryUseCase.validateImageFile(mockFile) } returns true
        every { mockFile.toURI() } returns java.net.URI("file:///test.jpg")
        
        // When
        viewModel.onPhotoSelectedFromGallery(mockUri)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertNotNull(state.capturedPhotoUri)
            assertTrue(state.showPreview)
            assertEquals(mockFile, state.currentPhotoFile)
            assertNull(state.errorMessage)
        }
        
        verify { selectPhotoFromGalleryUseCase.copyPhotoToCache(mockUri) }
        verify { selectPhotoFromGalleryUseCase.validateImageFile(mockFile) }
    }
    
    @Test
    fun `onPhotoSelectedFromGallery should show error for invalid file`() = runTest {
        // Given
        val mockUri = mockk<Uri>()
        val mockFile = mockk<File>()
        every { selectPhotoFromGalleryUseCase.copyPhotoToCache(mockUri) } returns Result.success(mockFile)
        every { selectPhotoFromGalleryUseCase.validateImageFile(mockFile) } returns false
        
        // When
        viewModel.onPhotoSelectedFromGallery(mockUri)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.errorMessage?.contains("无效") == true || state.errorMessage?.contains("过大") == true)
        }
    }
    
    @Test
    fun `onPhotoSelectedFromGallery should handle copy failure`() = runTest {
        // Given
        val mockUri = mockk<Uri>()
        every { selectPhotoFromGalleryUseCase.copyPhotoToCache(mockUri) } returns Result.failure(Exception("Copy failed"))
        
        // When
        viewModel.onPhotoSelectedFromGallery(mockUri)
        advanceUntilIdle()
        
        // Then
        viewModel.uiState.test {
            val state = awaitItem()
            assertTrue(state.errorMessage?.contains("无法加载图片") == true)
        }
    }
}
