package com.examai.data.repository

import com.examai.data.local.TokenManager
import com.examai.data.remote.api.ExamApiService
import com.examai.data.remote.dto.LoginRequest
import com.examai.data.remote.dto.RegisterRequest
import com.examai.data.remote.dto.SendCodeRequest
import com.examai.domain.model.AuthResult
import com.examai.domain.model.User
import com.examai.domain.repository.AuthRepository
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of AuthRepository
 * Handles authentication operations with backend API
 */
@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val apiService: ExamApiService,
    private val tokenManager: TokenManager
) : AuthRepository {
    
    override suspend fun register(
        phone: String,
        password: String,
        verificationCode: String
    ): Result<AuthResult> {
        return try {
            val request = RegisterRequest(
                phone = phone,
                password = password,
                verificationCode = verificationCode
            )
            
            val response = apiService.register(request)
            
            // Calculate token expiry (7 days from now)
            val expiryTime = System.currentTimeMillis() + (7 * 24 * 60 * 60 * 1000)
            
            // Save token and user info
            tokenManager.saveToken(response.token, expiryTime)
            tokenManager.saveUserInfo(response.userId, response.phone)
            
            val authResult = AuthResult(
                user = User(
                    userId = response.userId,
                    phone = response.phone,
                    role = response.role
                ),
                token = response.token
            )
            
            Result.success(authResult)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun login(
        phone: String,
        password: String
    ): Result<AuthResult> {
        return try {
            val request = LoginRequest(
                phone = phone,
                password = password
            )
            
            val response = apiService.login(request)
            
            // Calculate token expiry (7 days from now)
            val expiryTime = System.currentTimeMillis() + (7 * 24 * 60 * 60 * 1000)
            
            // Save token and user info
            tokenManager.saveToken(response.token, expiryTime)
            tokenManager.saveUserInfo(response.userId, response.phone)
            
            val authResult = AuthResult(
                user = User(
                    userId = response.userId,
                    phone = response.phone,
                    role = response.role
                ),
                token = response.token
            )
            
            Result.success(authResult)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun sendVerificationCode(phone: String): Result<Int> {
        return try {
            val request = SendCodeRequest(phone = phone)
            val response = apiService.sendCode(request)
            Result.success(response.expiresIn)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun logout() {
        tokenManager.clearToken()
    }
}
