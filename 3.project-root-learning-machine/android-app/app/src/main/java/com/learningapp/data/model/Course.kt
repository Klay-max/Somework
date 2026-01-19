package com.learningapp.data.model

data class Course(
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

data class CourseDetail(
    val id: String,
    val name: String,
    val description: String,
    val coverImage: String,
    val category: String,
    val difficulty: String,
    val status: String,
    val units: List<LearningUnit>,
    val createdAt: Long,
    val updatedAt: Long
)

data class LearningUnit(
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

data class PageResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val size: Int,
    val number: Int
)
