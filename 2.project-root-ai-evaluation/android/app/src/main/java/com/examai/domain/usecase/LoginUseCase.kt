package com.examai.domain.usecase

import com.examai.domain.model.AuthResult
import com.examai.domain.repository.AuthRepository
import javax.inject.Inject

/**
 * Use case for user login
 * Validates input and delegates to repository
 */
class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Execute login
     * @param phone User's phone number (must be 11 digits starting with 1)
     * @param password User's password (minimum 6 characters)
     * @return Result with AuthResult or error
     */
    suspend operator fun invoke(
        phone: String,
        password: String
    ): Result<AuthResult> {
        // Validate phone number
        if (!isValidPhone(phone)) {
            return Result.failure(IllegalArgumentException("手机号格式不正确"))
        }
        
        // Validate password
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("密码至少需要6位"))
        }
        
        return authRepository.login(phone, password)
    }
    
    private fun isValidPhone(phone: String): Boolean {
        // Chinese phone number: 11 digits starting with 1
        return phone.matches(Regex("^1\\d{10}$"))
    }
}
