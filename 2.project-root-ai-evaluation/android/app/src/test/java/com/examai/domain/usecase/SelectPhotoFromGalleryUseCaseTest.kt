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
 * Unit tests for SelectPhotoFromGalleryUseCase
 */
@RunWith(RobolectricTestRunner::class)
class SelectPhotoFromGalleryUseCaseTest {
    
    private lateinit var context: Context
    private lateinit var useCase: SelectPhotoFromGalleryUseCase
    private val testFiles = mutableListOf<File>()
    
    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        useCase = SelectPhotoFromGalleryUseCase(context)
    }
    
    @After
    fun cleanup() {
        // Clean up test files
        testFiles.forEach { it.delete() }
        testFiles.clear()
    }
    
    @Test
    fun `validateImageFile should return false for non-existent file`() {
        // Given
        val nonExistentFile = File(context.cacheDir, "non_existent.jpg")
        
        // When
        val result = useCase.validateImageFile(nonExistentFile)
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `validateImageFile should return false for empty file`() {
        // Given
        val emptyFile = File.createTempFile("empty_", ".jpg", context.cacheDir)
        testFiles.add(emptyFile)
        
        // When
        val result = useCase.validateImageFile(emptyFile)
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `validateImageFile should return true for valid file`() {
        // Given
        val validFile = File.createTempFile("valid_", ".jpg", context.cacheDir)
        validFile.writeText("fake image data with some content")
        testFiles.add(validFile)
        
        // When
        val result = useCase.validateImageFile(validFile)
        
        // Then
        assertTrue(result)
    }
    
    @Test
    fun `validateImageFile should return false for file larger than 10MB`() {
        // Given
        val largeFile = File.createTempFile("large_", ".jpg", context.cacheDir)
        // Create a file larger than 10MB
        val largeData = ByteArray(11 * 1024 * 1024) // 11MB
        largeFile.writeBytes(largeData)
        testFiles.add(largeFile)
        
        // When
        val result = useCase.validateImageFile(largeFile)
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `validateImageFile should return true for file exactly 10MB`() {
        // Given
        val maxSizeFile = File.createTempFile("max_", ".jpg", context.cacheDir)
        // Create a file exactly 10MB
        val maxData = ByteArray(10 * 1024 * 1024) // 10MB
        maxSizeFile.writeBytes(maxData)
        testFiles.add(maxSizeFile)
        
        // When
        val result = useCase.validateImageFile(maxSizeFile)
        
        // Then
        assertTrue(result)
    }
    
    @Test
    fun `validateImageFile should return true for small valid file`() {
        // Given
        val smallFile = File.createTempFile("small_", ".jpg", context.cacheDir)
        smallFile.writeText("small image")
        testFiles.add(smallFile)
        
        // When
        val result = useCase.validateImageFile(smallFile)
        
        // Then
        assertTrue(result)
    }
    
    @Test
    fun `copyPhotoToCache should create file in cache directory`() {
        // Given - create a source file
        val sourceFile = File.createTempFile("source_", ".jpg", context.cacheDir)
        sourceFile.writeText("test image content")
        testFiles.add(sourceFile)
        
        val sourceUri = Uri.fromFile(sourceFile)
        
        // When
        val result = useCase.copyPhotoToCache(sourceUri)
        
        // Then
        assertTrue(result.isSuccess)
        val copiedFile = result.getOrNull()
        assertNotNull(copiedFile)
        copiedFile?.let {
            testFiles.add(it)
            assertTrue(it.exists())
            assertEquals(context.cacheDir, it.parentFile)
            assertTrue(it.name.startsWith("GALLERY_"))
            assertTrue(it.name.endsWith(".jpg"))
        }
    }
    
    @Test
    fun `copyPhotoToCache should copy file content correctly`() {
        // Given
        val sourceFile = File.createTempFile("source_", ".jpg", context.cacheDir)
        val testContent = "test image content with some data"
        sourceFile.writeText(testContent)
        testFiles.add(sourceFile)
        
        val sourceUri = Uri.fromFile(sourceFile)
        
        // When
        val result = useCase.copyPhotoToCache(sourceUri)
        
        // Then
        assertTrue(result.isSuccess)
        val copiedFile = result.getOrNull()
        assertNotNull(copiedFile)
        copiedFile?.let {
            testFiles.add(it)
            assertEquals(testContent, it.readText())
        }
    }
    
    @Test
    fun `copyPhotoToCache should create unique file names`() {
        // Given
        val sourceFile = File.createTempFile("source_", ".jpg", context.cacheDir)
        sourceFile.writeText("test content")
        testFiles.add(sourceFile)
        
        val sourceUri = Uri.fromFile(sourceFile)
        
        // When - copy twice
        val result1 = useCase.copyPhotoToCache(sourceUri)
        Thread.sleep(10) // Ensure different timestamps
        val result2 = useCase.copyPhotoToCache(sourceUri)
        
        // Then
        assertTrue(result1.isSuccess)
        assertTrue(result2.isSuccess)
        
        val file1 = result1.getOrNull()
        val file2 = result2.getOrNull()
        
        assertNotNull(file1)
        assertNotNull(file2)
        
        file1?.let { testFiles.add(it) }
        file2?.let { testFiles.add(it) }
        
        assertNotEquals(file1?.name, file2?.name)
    }
}
