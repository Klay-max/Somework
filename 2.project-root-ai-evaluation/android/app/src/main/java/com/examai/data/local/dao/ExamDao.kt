package com.examai.data.local.dao

import androidx.room.*
import com.examai.data.local.entity.ExamEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Exam entities
 * Provides database operations for exam data
 */
@Dao
interface ExamDao {
    
    /**
     * Get all exams for a user, ordered by creation date (newest first)
     */
    @Query("SELECT * FROM exams WHERE user_id = :userId ORDER BY created_at DESC")
    fun getExamsByUser(userId: String): Flow<List<ExamEntity>>
    
    /**
     * Get a specific exam by ID
     */
    @Query("SELECT * FROM exams WHERE exam_id = :examId")
    suspend fun getExamById(examId: String): ExamEntity?
    
    /**
     * Insert or update an exam
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExam(exam: ExamEntity)
    
    /**
     * Insert or update multiple exams
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExams(exams: List<ExamEntity>)
    
    /**
     * Delete an exam
     */
    @Delete
    suspend fun deleteExam(exam: ExamEntity)
    
    /**
     * Delete an exam by ID
     */
    @Query("DELETE FROM exams WHERE exam_id = :examId")
    suspend fun deleteExamById(examId: String)
    
    /**
     * Delete all exams for a user
     */
    @Query("DELETE FROM exams WHERE user_id = :userId")
    suspend fun deleteAllExamsForUser(userId: String)
    
    /**
     * Get exams by status
     */
    @Query("SELECT * FROM exams WHERE user_id = :userId AND status = :status ORDER BY created_at DESC")
    fun getExamsByStatus(userId: String, status: String): Flow<List<ExamEntity>>
    
    /**
     * Get exams by subject
     */
    @Query("SELECT * FROM exams WHERE user_id = :userId AND subject = :subject ORDER BY created_at DESC")
    fun getExamsBySubject(userId: String, subject: String): Flow<List<ExamEntity>>
}
