package com.examai.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.examai.data.local.dao.ExamDao
import com.examai.data.local.dao.ReportDao
import com.examai.data.local.entity.CachedReportEntity
import com.examai.data.local.entity.ExamEntity

/**
 * Room database for ExamAI application
 * Contains exam and cached report tables
 */
@Database(
    entities = [
        ExamEntity::class,
        CachedReportEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class ExamDatabase : RoomDatabase() {
    
    /**
     * Provides access to exam data operations
     */
    abstract fun examDao(): ExamDao
    
    /**
     * Provides access to report cache operations
     */
    abstract fun reportDao(): ReportDao
}
