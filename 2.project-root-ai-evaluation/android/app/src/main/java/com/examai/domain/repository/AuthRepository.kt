package com.examai.domain.repository

import com.examai.domain.model.AuthResult

/**
 * Repository interface for authentication operations
 * Defines contract for auth data operations
 */
interface AuthRepository {
    
    /**
     * Register a new user
     * @param phone User's phone number
     * @param password User's password
     * @param verificationCode SMS verification code
     * @return AuthResult containing user info and token
     */
    suspend fun register(
        phone: String,
        password: String,
        verificationCode: String
    ): Result<AuthResult>
    
    /**
     * Login with phone and password
     * @param phone User's phone number
     * @param password User's password
     * @return AuthResult containing user info and token
     */
    suspend fun login(
        phone: String,
        password: String
    ): Result<AuthResult>
    
    /**
     * Send SMS verification code
     * @param phone User's phone number
     * @return Success with expiry time in seconds
     */
    suspend fun sendVerificationCode(phone: String): Result<Int>
    
    /**
     * Logout current user
     * Clears stored token and user info
     */
    suspend fun logout()
}
