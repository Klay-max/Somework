package com.learningapp.data.local.dao

import androidx.room.*
import com.learningapp.data.local.entity.CourseEntity
import com.learningapp.data.local.entity.LearningUnitEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CourseDao {
    @Query("SELECT * FROM courses WHERE status = 'PUBLISHED' ORDER BY updatedAt DESC")
    fun getAllCourses(): Flow<List<CourseEntity>>
    
    @Query("SELECT * FROM courses WHERE id = :courseId")
    suspend fun getCourseById(courseId: String): CourseEntity?
    
    @Query("SELECT * FROM courses WHERE category = :category AND status = 'PUBLISHED'")
    fun getCoursesByCategory(category: String): Flow<List<CourseEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCourse(course: CourseEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCourses(courses: List<CourseEntity>)
    
    @Delete
    suspend fun deleteCourse(course: CourseEntity)
    
    @Query("DELETE FROM courses")
    suspend fun deleteAllCourses()
}

@Dao
interface LearningUnitDao {
    @Query("SELECT * FROM learning_units WHERE courseId = :courseId ORDER BY `order` ASC")
    fun getUnitsByCourse(courseId: String): Flow<List<LearningUnitEntity>>
    
    @Query("SELECT * FROM learning_units WHERE id = :unitId")
    suspend fun getUnitById(unitId: String): LearningUnitEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUnit(unit: LearningUnitEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUnits(units: List<LearningUnitEntity>)
    
    @Delete
    suspend fun deleteUnit(unit: LearningUnitEntity)
    
    @Query("DELETE FROM learning_units WHERE courseId = :courseId")
    suspend fun deleteUnitsByCourse(courseId: String)
}
