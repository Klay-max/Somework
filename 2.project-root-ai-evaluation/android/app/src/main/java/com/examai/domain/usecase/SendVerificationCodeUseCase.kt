package com.examai.domain.usecase

import com.examai.domain.repository.AuthRepository
import javax.inject.Inject

/**
 * Use case for sending SMS verification code
 * Validates phone number and delegates to repository
 */
class SendVerificationCodeUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    /**
     * Send verification code to phone number
     * @param phone User's phone number
     * @return Result with expiry time in seconds or error
     */
    suspend operator fun invoke(phone: String): Result<Int> {
        // Validate phone number
        if (!isValidPhone(phone)) {
            return Result.failure(IllegalArgumentException("手机号格式不正确"))
        }
        
        return authRepository.sendVerificationCode(phone)
    }
    
    private fun isValidPhone(phone: String): Boolean {
        // Chinese phone number: 11 digits starting with 1
        return phone.matches(Regex("^1\\d{10}$"))
    }
}
