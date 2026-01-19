package com.learningapp.di

import android.content.Context
import androidx.room.Room
import com.learningapp.data.local.AppDatabase
import com.learningapp.data.local.TokenManager
import com.learningapp.data.remote.ApiService
import com.learningapp.data.remote.NetworkModule
import com.learningapp.data.repository.AuthRepository
import com.learningapp.data.repository.CourseRepository
import com.learningapp.data.repository.LearningRecordRepository
import com.learningapp.ui.viewmodel.CourseViewModel
import com.learningapp.ui.viewmodel.LearningViewModel
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val appModule = module {
    // Database
    single {
        Room.databaseBuilder(
            androidContext(),
            AppDatabase::class.java,
            "learning_app_db"
        ).build()
    }
    
    // DAOs
    single { get<AppDatabase>().courseDao() }
    single { get<AppDatabase>().learningRecordDao() }
    single { get<AppDatabase>().exerciseDao() }
    single { get<AppDatabase>().wrongAnswerDao() }
    
    // TokenManager
    single { TokenManager(androidContext()) }
    
    // Network
    single { NetworkModule.provideOkHttpClient(get()) }
    single { NetworkModule.provideRetrofit(get()) }
    single { NetworkModule.provideApiService(get()) }
    
    // Repositories
    single { AuthRepository(get(), get()) }
    single { CourseRepository(get()) }
    single { LearningRecordRepository(get()) }
    
    // ViewModels
    viewModel { CourseViewModel(get()) }
    viewModel { LearningViewModel(get(), get()) }
}
