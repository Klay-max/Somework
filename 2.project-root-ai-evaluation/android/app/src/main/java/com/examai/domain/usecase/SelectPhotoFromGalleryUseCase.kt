package com.examai.domain.usecase

import android.content.Context
import android.net.Uri
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject

/**
 * Use case for selecting photos from gallery
 * Handles photo selection and copying to app storage
 */
class SelectPhotoFromGalleryUseCase @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    /**
     * Copies selected photo from gallery to app cache
     * Returns the copied file
     */
    fun copyPhotoToCache(uri: Uri): Result<File> {
        return try {
            val inputStream = context.contentResolver.openInputStream(uri)
                ?: return Result.failure(Exception("无法打开图片"))
            
            val photoFile = createCacheFile()
            val outputStream = FileOutputStream(photoFile)
            
            inputStream.use { input ->
                outputStream.use { output ->
                    input.copyTo(output)
                }
            }
            
            Result.success(photoFile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Creates a unique cache file for the photo
     */
    private fun createCacheFile(): File {
        val timeStamp = System.currentTimeMillis()
        val fileName = "GALLERY_${timeStamp}.jpg"
        return File(context.cacheDir, fileName)
    }
    
    /**
     * Validates if the file is a valid image
     */
    fun validateImageFile(file: File): Boolean {
        if (!file.exists() || file.length() == 0L) {
            return false
        }
        
        // Check file size (max 10MB)
        val maxSize = 10 * 1024 * 1024 // 10MB
        if (file.length() > maxSize) {
            return false
        }
        
        return true
    }
}
