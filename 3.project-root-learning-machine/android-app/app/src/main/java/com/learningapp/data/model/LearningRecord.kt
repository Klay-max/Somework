package com.learningapp.data.model

data class LearningRecord(
    val id: String,
    val userId: String,
    val courseId: String,
    val unitId: String,
    val progress: Int,
    val isCompleted: Boolean,
    val lastPosition: Int?,
    val startedAt: Long,
    val completedAt: Long?,
    val updatedAt: Long
)

data class LearningProgressRequest(
    val courseId: String,
    val unitId: String,
    val progress: Int,
    val lastPosition: Int? = null
)
