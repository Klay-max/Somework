package com.learningapp.api.dto

import jakarta.validation.constraints.NotBlank

data class CreateCourseRequest(
    @field:NotBlank(message = "课程名称不能为空")
    val name: String,
    
    @field:NotBlank(message = "课程描述不能为空")
    val description: String,
    
    @field:NotBlank(message = "封面图片不能为空")
    val coverImage: String,
    
    @field:NotBlank(message = "分类不能为空")
    val category: String,
    
    val difficulty: String = "BEGINNER"
)

data class UpdateCourseRequest(
    val name: String?,
    val description: String?,
    val coverImage: String?,
    val category: String?,
    val difficulty: String?
)

data class CourseResponse(
    val id: String,
    val name: String,
    val description: String,
    val coverImage: String,
    val category: String,
    val difficulty: String,
    val status: String,
    val createdBy: String,
    val createdAt: Long,
    val updatedAt: Long
)

data class CourseDetailResponse(
    val id: String,
    val name: String,
    val description: String,
    val coverImage: String,
    val category: String,
    val difficulty: String,
    val status: String,
    val units: List<LearningUnitResponse>,
    val createdAt: Long,
    val updatedAt: Long
)

data class LearningUnitResponse(
    val id: String,
    val courseId: String,
    val title: String,
    val order: Int,
    val contentType: String,
    val videoUrl: String?,
    val textContent: String?,
    val images: List<String>?,
    val duration: Int?,
    val knowledgePoints: List<String>?
)

data class CreateLearningUnitRequest(
    @field:NotBlank(message = "标题不能为空")
    val title: String,
    
    val order: Int,
    
    @field:NotBlank(message = "内容类型不能为空")
    val contentType: String,
    
    val videoUrl: String?,
    val textContent: String?,
    val images: List<String>?,
    val duration: Int?,
    val knowledgePoints: List<String>?
)
