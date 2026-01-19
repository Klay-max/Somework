package com.examai.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Room entity for cached report data
 * Stores HTML content locally for offline viewing
 */
@Entity(tableName = "cached_reports")
data class CachedReportEntity(
    @PrimaryKey
    @ColumnInfo(name = "exam_id")
    val examId: String,
    
    @ColumnInfo(name = "html_content")
    val htmlContent: String,
    
    @ColumnInfo(name = "cached_at")
    val cachedAt: Long,
    
    @ColumnInfo(name = "expires_at")
    val expiresAt: Long = cachedAt + (7L * 24 * 60 * 60 * 1000L) // Default 7 days expiry
)
