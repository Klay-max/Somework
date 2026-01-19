package com.examai.domain.usecase

import android.content.Context
import android.net.Uri
import androidx.core.content.FileProvider
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

/**
 * Use case for capturing exam photos
 * Handles file creation and URI generation for camera
 */
class CaptureExamPhotoUseCase @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    /**
     * Creates a temporary file for photo capture
     * Returns URI for camera to save the photo
     */
    fun createPhotoUri(): Pair<Uri, File> {
        val photoFile = createImageFile()
        val photoUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            photoFile
        )
        return photoUri to photoFile
    }
    
    /**
     * Creates a unique image file in cache directory
     */
    private fun createImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val imageFileName = "EXAM_${timeStamp}_"
        val storageDir = context.cacheDir
        return File.createTempFile(imageFileName, ".jpg", storageDir)
    }
    
    /**
     * Validates if the captured photo file exists and has content
     */
    fun validatePhotoFile(file: File): Boolean {
        return file.exists() && file.length() > 0
    }
}
