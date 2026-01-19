package com.learningapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "exercises")
data class ExerciseEntity(
    @PrimaryKey
    val id: String,
    val unitId: String?,
    val courseId: String,
    val question: String,
    val options: String, // JSON string
    val correctAnswer: String,
    val explanation: String,
    val knowledgePoints: String, // JSON string
    val difficulty: String,
    val source: String,
    val createdAt: Long
)

@Entity(tableName = "exercise_history")
data class ExerciseHistoryEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val exerciseId: String,
    val userAnswer: String,
    val isCorrect: Boolean,
    val attemptCount: Int,
    val submittedAt: Long
)
