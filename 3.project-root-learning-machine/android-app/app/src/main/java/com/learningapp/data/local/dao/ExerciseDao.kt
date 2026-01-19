package com.learningapp.data.local.dao

import androidx.room.*
import com.learningapp.data.local.entity.ExerciseEntity
import com.learningapp.data.local.entity.ExerciseHistoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ExerciseDao {
    @Query("SELECT * FROM exercises WHERE unitId = :unitId")
    fun getExercisesByUnit(unitId: String): Flow<List<ExerciseEntity>>
    
    @Query("SELECT * FROM exercises WHERE courseId = :courseId")
    fun getExercisesByCourse(courseId: String): Flow<List<ExerciseEntity>>
    
    @Query("SELECT * FROM exercises WHERE id = :exerciseId")
    suspend fun getExerciseById(exerciseId: String): ExerciseEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExercise(exercise: ExerciseEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExercises(exercises: List<ExerciseEntity>)
    
    @Delete
    suspend fun deleteExercise(exercise: ExerciseEntity)
}

@Dao
interface ExerciseHistoryDao {
    @Query("SELECT * FROM exercise_history WHERE userId = :userId ORDER BY submittedAt DESC")
    fun getHistoryByUser(userId: String): Flow<List<ExerciseHistoryEntity>>
    
    @Query("SELECT * FROM exercise_history WHERE userId = :userId AND exerciseId = :exerciseId ORDER BY submittedAt DESC LIMIT 1")
    suspend fun getLatestHistory(userId: String, exerciseId: String): ExerciseHistoryEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHistory(history: ExerciseHistoryEntity)
    
    @Query("DELETE FROM exercise_history WHERE userId = :userId")
    suspend fun deleteAllHistory(userId: String)
}
