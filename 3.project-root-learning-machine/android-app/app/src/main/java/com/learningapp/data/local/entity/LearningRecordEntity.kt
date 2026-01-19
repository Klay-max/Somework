package com.learningapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "learning_records")
data class LearningRecordEntity(
    @PrimaryKey
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
