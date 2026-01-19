package com.learningapp.data.local.dao

import androidx.room.*
import com.learningapp.data.local.entity.LearningRecordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LearningRecordDao {
    @Query("SELECT * FROM learning_records WHERE userId = :userId AND courseId = :courseId")
    fun getRecordsByCourse(userId: String, courseId: String): Flow<List<LearningRecordEntity>>
    
    @Query("SELECT * FROM learning_records WHERE userId = :userId AND unitId = :unitId")
    suspend fun getRecordByUnit(userId: String, unitId: String): LearningRecordEntity?
    
    @Query("SELECT * FROM learning_records WHERE userId = :userId")
    fun getAllRecords(userId: String): Flow<List<LearningRecordEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: LearningRecordEntity)
    
    @Update
    suspend fun updateRecord(record: LearningRecordEntity)
    
    @Delete
    suspend fun deleteRecord(record: LearningRecordEntity)
    
    @Query("DELETE FROM learning_records WHERE userId = :userId")
    suspend fun deleteAllRecords(userId: String)
}
