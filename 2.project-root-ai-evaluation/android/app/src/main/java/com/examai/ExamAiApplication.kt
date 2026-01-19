package com.examai

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

/**
 * Application class for ExamAI
 * Annotated with @HiltAndroidApp to enable Hilt dependency injection
 * Implements Configuration.Provider for WorkManager with Hilt
 */
@HiltAndroidApp
class ExamAiApplication : Application(), Configuration.Provider {
    
    @Inject
    lateinit var workerFactory: HiltWorkerFactory
    
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
    
    override fun onCreate() {
        super.onCreate()
        // Initialize any application-level components here
    }
}
