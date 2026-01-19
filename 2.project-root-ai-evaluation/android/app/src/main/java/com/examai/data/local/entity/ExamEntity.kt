package com.examai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Room entity for storing exam information locally
 */
@Entity(tableName = "exams")
data class ExamEntity(
    @PrimaryKey
    @ColumnInfo(name = "exam_id")
    val examId: String,
    
    @ColumnInfo(name = "user_id")
    val userId: String,
    
    @ColumnInfo(name = "subject")
    val subject: String,
    
    @ColumnInfo(name = "grade")
    val grade: String,
    
    @ColumnInfo(name = "score")
    val score: Int? = null,
    
    @ColumnInfo(name = "total_score")
    val totalScore: Int? = null,
    
    @ColumnInfo(name = "status")
    val status: String,
    
    @ColumnInfo(name = "image_url")
    val imageUrl: String? = null,
    
    @ColumnInfo(name = "report_url")
    val reportUrl: String? = null,
    
    @ColumnInfo(name = "created_at")
    val createdAt: Long,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long
)
