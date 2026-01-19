package com.examai.domain.usecase

import com.examai.data.local.TokenManager
import javax.inject.Inject

/**
 * Use case for handling token expiry
 * Clears expired tokens and triggers re-authentication
 */
class HandleTokenExpiryUseCase @Inject constructor(
    private val tokenManager: TokenManager
) {
    /**
     * Handle token expiry
     * Clears all authentication data
     */
    suspend operator fun invoke() {
        tokenManager.clearToken()
    }
    
    /**
     * Check if token is expired
     * @return true if token is expired or missing
     */
    fun isTokenExpired(): Boolean {
        return !tokenManager.isTokenValid()
    }
}
