package com.examai.domain.usecase

import android.content.Context
import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.io.File

/**
 * Unit tests for CaptureExamPhotoUseCase
 */
@RunWith(RobolectricTestRunner::class)
class CaptureExamPhotoUseCaseTest {
    
    private lateinit var context: Context
    private lateinit var useCase: CaptureExamPhotoUseCase
    private val testFiles = mutableListOf<File>()
    
    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        useCase = CaptureExamPhotoUseCase(context)
    }
    
    @After
    fun cleanup() {
        // Clean up test files
        testFiles.forEach { it.delete() }
        testFiles.clear()
    }
    
    @Test
    fun `createPhotoUri should return valid URI and file`() {
        // When
        val (uri, file) = useCase.createPhotoUri()
        testFiles.add(file)
        
        // Then
        assertNotNull(uri)
        assertNotNull(file)
        assertTrue(file.exists())
        assertTrue(file.name.startsWith("EXAM_"))
        assertTrue(file.name.endsWith(".jpg"))
    }
    
    @Test
    fun `createPhotoUri should create unique files`() {
        // When
        val (uri1, file1) = useCase.createPhotoUri()
        val (uri2, file2) = useCase.createPhotoUri()
        testFiles.addAll(listOf(file1, file2))
        
        // Then
        assertNotEquals(file1.name, file2.name)
        assertNotEquals(uri1, uri2)
    }
    
    @Test
    fun `validatePhotoFile should return false for non-existent file`() {
        // Given
        val nonExistentFile = File(context.cacheDir, "non_existent.jpg")
        
        // When
        val result = useCase.validatePhotoFile(nonExistentFile)
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `validatePhotoFile should return false for empty file`() {
        // Given
        val emptyFile = File.createTempFile("empty_", ".jpg", context.cacheDir)
        testFiles.add(emptyFile)
        
        // When
        val result = useCase.validatePhotoFile(emptyFile)
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `validatePhotoFile should return true for valid file`() {
        // Given
        val validFile = File.createTempFile("valid_", ".jpg", context.cacheDir)
        validFile.writeText("fake image data")
        testFiles.add(validFile)
        
        // When
        val result = useCase.validatePhotoFile(validFile)
        
        // Then
        assertTrue(result)
    }
    
    @Test
    fun `createPhotoUri should create file in cache directory`() {
        // When
        val (_, file) = useCase.createPhotoUri()
        testFiles.add(file)
        
        // Then
        assertEquals(context.cacheDir, file.parentFile)
    }
    
    @Test
    fun `createPhotoUri should create file with timestamp in name`() {
        // When
        val (_, file) = useCase.createPhotoUri()
        testFiles.add(file)
        
        // Then
        val fileName = file.name
        assertTrue(fileName.matches(Regex("EXAM_\\d{8}_\\d{6}_.*\\.jpg")))
    }
}
