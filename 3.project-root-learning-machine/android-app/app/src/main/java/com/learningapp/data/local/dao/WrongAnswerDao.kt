package com.learningapp.data.local.dao

import androidx.room.*
import com.learningapp.data.local.entity.WrongAnswerEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WrongAnswerDao {
    @Query("SELECT * FROM wrong_answers WHERE userId = :userId ORDER BY createdAt DESC")
    fun getWrongAnswersByUser(userId: String): Flow<List<WrongAnswerEntity>>
    
    @Query("SELECT * FROM wrong_answers WHERE userId = :userId AND isMastered = 0")
    fun getUnmasteredWrongAnswers(userId: String): Flow<List<WrongAnswerEntity>>
    
    @Query("SELECT * FROM wrong_answers WHERE userId = :userId AND exerciseId = :exerciseId")
    suspend fun getWrongAnswer(userId: String, exerciseId: String): WrongAnswerEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWrongAnswer(wrongAnswer: WrongAnswerEntity)
    
    @Update
    suspend fun updateWrongAnswer(wrongAnswer: WrongAnswerEntity)
    
    @Delete
    suspend fun deleteWrongAnswer(wrongAnswer: WrongAnswerEntity)
    
    @Query("DELETE FROM wrong_answers WHERE userId = :userId")
    suspend fun deleteAllWrongAnswers(userId: String)
}
