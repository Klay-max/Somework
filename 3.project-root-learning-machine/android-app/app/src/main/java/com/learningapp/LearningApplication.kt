package com.learningapp

import android.app.Application
import com.learningapp.di.appModule
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class LearningApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Koin for dependency injection
        startKoin {
            androidContext(this@LearningApplication)
            modules(appModule)
        }
    }
}
