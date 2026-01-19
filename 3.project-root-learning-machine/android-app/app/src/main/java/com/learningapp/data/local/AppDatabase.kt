package com.learningapp.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.learningapp.data.local.dao.*
import com.learningapp.data.local.entity.*

@Database(
    entities = [
        CourseEntity::class,
        LearningUnitEntity::class,
        LearningRecordEntity::class,
        ExerciseEntity::class,
        ExerciseHistoryEntity::class,
        WrongAnswerEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun courseDao(): CourseDao
    abstract fun learningUnitDao(): LearningUnitDao
    abstract fun learningRecordDao(): LearningRecordDao
    abstract fun exerciseDao(): ExerciseDao
    abstract fun exerciseHistoryDao(): ExerciseHistoryDao
    abstract fun wrongAnswerDao(): WrongAnswerDao
}
