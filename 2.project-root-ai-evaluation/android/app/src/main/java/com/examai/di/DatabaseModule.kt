package com.examai.di

import android.content.Context
import androidx.room.Room
import com.examai.data.local.dao.ExamDao
import com.examai.data.local.dao.ReportDao
import com.examai.data.local.database.ExamDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt module for database dependencies
 * Provides Room database and DAO instances
 */
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    /**
     * Provides ExamDatabase instance
     */
    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): ExamDatabase {
        return Room.databaseBuilder(
            context,
            ExamDatabase::class.java,
            "exam_database"
        )
            .fallbackToDestructiveMigration()
            .build()
    }
    
    /**
     * Provides ExamDao
     */
    @Provides
    @Singleton
    fun provideExamDao(database: ExamDatabase): ExamDao {
        return database.examDao()
    }
    
    /**
     * Provides ReportDao
     */
    @Provides
    @Singleton
    fun provideReportDao(database: ExamDatabase): ReportDao {
        return database.reportDao()
    }
}
