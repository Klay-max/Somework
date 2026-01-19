package com.learningapp.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "wrong_answers")
data class WrongAnswerEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val exerciseId: String,
    val userAnswer: String,
    val correctAnswer: String,
    val knowledgePoints: String, // JSON string
    val isMastered: Boolean,
    val redoCount: Int,
    val lastRedoAt: Long?,
    val createdAt: Long
)
