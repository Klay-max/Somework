package com.examai.domain.usecase

import com.examai.domain.repository.ExamRepository
import java.io.File
import javax.inject.Inject

/**
 * Use case for uploading exam images
 * Handles the business logic for exam upload
 */
class UploadExamUseCase @Inject constructor(
    private val examRepository: ExamRepository
) {
    
    /**
     * Uploads an exam image to the server
     * @param imageFile The image file to upload
     * @return Result containing the exam ID or error
     */
    suspend operator fun invoke(imageFile: File): Result<String> {
        // Validate file exists and is readable
        if (!imageFile.exists()) {
            return Result.failure(Exception("文件不存在"))
        }
        
        if (!imageFile.canRead()) {
            return Result.failure(Exception("无法读取文件"))
        }
        
        // Validate file size (max 10MB)
        val maxSizeBytes = 10 * 1024 * 1024 // 10MB
        if (imageFile.length() > maxSizeBytes) {
            return Result.failure(Exception("文件过大，最大支持10MB"))
        }
        
        // Validate file is an image
        val validExtensions = listOf("jpg", "jpeg", "png", "heic")
        val extension = imageFile.extension.lowercase()
        if (extension !in validExtensions) {
            return Result.failure(Exception("不支持的文件格式，仅支持 JPG, PNG, HEIC"))
        }
        
        // Upload to server
        return examRepository.uploadExam(imageFile)
    }
}
