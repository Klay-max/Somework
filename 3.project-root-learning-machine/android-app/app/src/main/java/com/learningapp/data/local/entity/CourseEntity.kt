package com.learningapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "courses")
data class CourseEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String,
    val coverImage: String,
    val category: String,
    val difficulty: String,
    val status: String,
    val createdAt: Long,
    val updatedAt: Long
)

@Entity(tableName = "learning_units")
data class LearningUnitEntity(
    @PrimaryKey
    val id: String,
    val courseId: String,
    val title: String,
    val order: Int,
    val contentType: String,
    val videoUrl: String?,
    val textContent: String?,
    val images: String?, // JSON string
    val duration: Int?,
    val knowledgePoints: String? // JSON string
)
