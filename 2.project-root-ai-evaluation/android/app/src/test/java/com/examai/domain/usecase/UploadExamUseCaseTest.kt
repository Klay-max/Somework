package com.examai.domain.usecase

import com.examai.domain.repository.ExamRepository
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.io.File

/**
 * Unit tests for UploadExamUseCase
 */
@RunWith(RobolectricTestRunner::class)
class UploadExamUseCaseTest {
    
    private lateinit var examRepository: ExamRepository
    private lateinit var uploadExamUseCase: UploadExamUseCase
    private lateinit var testFile: File
    
    @Before
    fun setup() {
        examRepository = mockk()
        uploadExamUseCase = UploadExamUseCase(examRepository)
        
        // Create a temporary test file
        testFile = File.createTempFile("test_exam", ".jpg")
        testFile.writeText("test image content")
    }
    
    @Test
    fun `invoke should return success when file is valid and upload succeeds`() = runTest {
        // Given
        val examId = "exam_123"
        coEvery { examRepository.uploadExam(testFile) } returns Result.success(examId)
        
        // When
        val result = uploadExamUseCase(testFile)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(examId, result.getOrNull())
    }
    
    @Test
    fun `invoke should return failure when file does not exist`() = runTest {
        // Given
        val nonExistentFile = File("/path/to/nonexistent/file.jpg")
        
        // When
        val result = uploadExamUseCase(nonExistentFile)
        
        // Then
        assertTrue(result.isFailure)
        assertEquals("文件不存在", result.exceptionOrNull()?.message)
    }
    
    @Test
    fun `invoke should return failure when file is too large`() = runTest {
        // Given
        val largeFile = File.createTempFile("large_exam", ".jpg")
        // Create a file larger than 10MB
        largeFile.writeBytes(ByteArray(11 * 1024 * 1024))
        
        // When
        val result = uploadExamUseCase(largeFile)
        
        // Then
        assertTrue(result.isFailure)
        assertEquals("文件过大，最大支持10MB", result.exceptionOrNull()?.message)
        
        // Cleanup
        largeFile.delete()
    }
    
    @Test
    fun `invoke should return failure when file has invalid extension`() = runTest {
        // Given
        val invalidFile = File.createTempFile("test_exam", ".txt")
        invalidFile.writeText("test content")
        
        // When
        val result = uploadExamUseCase(invalidFile)
        
        // Then
        assertTrue(result.isFailure)
        assertEquals("不支持的文件格式，仅支持 JPG, PNG, HEIC", result.exceptionOrNull()?.message)
        
        // Cleanup
        invalidFile.delete()
    }
    
    @Test
    fun `invoke should accept jpg extension`() = runTest {
        // Given
        val jpgFile = File.createTempFile("test_exam", ".jpg")
        jpgFile.writeText("test content")
        coEvery { examRepository.uploadExam(jpgFile) } returns Result.success("exam_123")
        
        // When
        val result = uploadExamUseCase(jpgFile)
        
        // Then
        assertTrue(result.isSuccess)
        
        // Cleanup
        jpgFile.delete()
    }
    
    @Test
    fun `invoke should accept jpeg extension`() = runTest {
        // Given
        val jpegFile = File.createTempFile("test_exam", ".jpeg")
        jpegFile.writeText("test content")
        coEvery { examRepository.uploadExam(jpegFile) } returns Result.success("exam_123")
        
        // When
        val result = uploadExamUseCase(jpegFile)
        
        // Then
        assertTrue(result.isSuccess)
        
        // Cleanup
        jpegFile.delete()
    }
    
    @Test
    fun `invoke should accept png extension`() = runTest {
        // Given
        val pngFile = File.createTempFile("test_exam", ".png")
        pngFile.writeText("test content")
        coEvery { examRepository.uploadExam(pngFile) } returns Result.success("exam_123")
        
        // When
        val result = uploadExamUseCase(pngFile)
        
        // Then
        assertTrue(result.isSuccess)
        
        // Cleanup
        pngFile.delete()
    }
    
    @Test
    fun `invoke should accept heic extension`() = runTest {
        // Given
        val heicFile = File.createTempFile("test_exam", ".heic")
        heicFile.writeText("test content")
        coEvery { examRepository.uploadExam(heicFile) } returns Result.success("exam_123")
        
        // When
        val result = uploadExamUseCase(heicFile)
        
        // Then
        assertTrue(result.isSuccess)
        
        // Cleanup
        heicFile.delete()
    }
    
    @Test
    fun `invoke should return failure when repository upload fails`() = runTest {
        // Given
        val errorMessage = "Network error"
        coEvery { examRepository.uploadExam(testFile) } returns Result.failure(Exception(errorMessage))
        
        // When
        val result = uploadExamUseCase(testFile)
        
        // Then
        assertTrue(result.isFailure)
        assertEquals(errorMessage, result.exceptionOrNull()?.message)
    }
}
