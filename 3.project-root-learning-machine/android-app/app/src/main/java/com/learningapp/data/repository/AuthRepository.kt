package com.learningapp.data.repository

import com.learningapp.data.local.TokenManager
import com.learningapp.data.model.AuthResponse
import com.learningapp.data.model.LoginRequest
import com.learningapp.data.model.RegisterRequest
import com.learningapp.data.model.User
import com.learningapp.data.remote.ApiService

class AuthRepository(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) {
    
    suspend fun register(username: String, password: String, email: String): Result<User> {
        return try {
            val request = RegisterRequest(username, password, email)
            val response = apiService.register(request)
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                saveAuthData(authResponse)
                Result.success(authResponse.toUser())
            } else {
                Result.failure(Exception("注册失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun login(username: String, password: String): Result<User> {
        return try {
            val request = LoginRequest(username, password)
            val response = apiService.login(request)
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                saveAuthData(authResponse)
                Result.success(authResponse.toUser())
            } else {
                Result.failure(Exception("登录失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun logout() {
        tokenManager.clearToken()
        tokenManager.clearUser()
    }
    
    fun isLoggedIn(): Boolean {
        return tokenManager.isLoggedIn()
    }
    
    fun getCurrentUser(): User? {
        val userId = tokenManager.getUserId() ?: return null
        val username = tokenManager.getUsername() ?: return null
        val email = tokenManager.getEmail() ?: return null
        val role = tokenManager.getRole() ?: return null
        
        return User(userId, username, email, role)
    }
    
    private fun saveAuthData(authResponse: AuthResponse) {
        tokenManager.saveToken(authResponse.token)
        tokenManager.saveUser(
            authResponse.userId,
            authResponse.username,
            authResponse.email,
            authResponse.role
        )
    }
    
    private fun AuthResponse.toUser() = User(
        id = userId,
        username = username,
        email = email,
        role = role
    )
}
