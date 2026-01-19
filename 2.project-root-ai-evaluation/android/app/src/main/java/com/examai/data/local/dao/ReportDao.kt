package com.examai.data.local.dao

import androidx.room.*
import com.examai.data.local.entity.CachedReportEntity

/**
 * Data Access Object for cached report entities
 * Provides database operations for report caching
 */
@Dao
interface ReportDao {
    
    /**
     * Get cached report by exam ID
     */
    @Query("SELECT * FROM cached_reports WHERE exam_id = :examId")
    suspend fun getCachedReport(examId: String): CachedReportEntity?
    
    /**
     * Cache a report
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun cacheReport(report: CachedReportEntity)
    
    /**
     * Delete expired reports (older than specified time)
     */
    @Query("DELETE FROM cached_reports WHERE cached_at < :expiryTime")
    suspend fun deleteExpiredReports(expiryTime: Long)
    
    /**
     * Delete a specific cached report
     */
    @Query("DELETE FROM cached_reports WHERE exam_id = :examId")
    suspend fun deleteCachedReport(examId: String)
    
    /**
     * Delete all cached reports
     */
    @Query("DELETE FROM cached_reports")
    suspend fun deleteAllCachedReports()
}
