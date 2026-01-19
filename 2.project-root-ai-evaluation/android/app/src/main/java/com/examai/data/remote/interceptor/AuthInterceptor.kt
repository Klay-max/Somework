package com.examai.data.remote.interceptor

import com.examai.data.local.TokenExpiryManager
import com.examai.data.local.TokenManager
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

/**
 * OkHttp interceptor that adds JWT token to request headers
 * Automatically attaches "Authorization: Bearer <token>" header
 * Handles 401 Unauthorized responses by clearing expired tokens
 */
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager,
    private val tokenExpiryManager: TokenExpiryManager
) : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = tokenManager.getToken()
        
        // Add Authorization header if token exists
        val authenticatedRequest = if (token != null) {
            request.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            request
        }
        
        val response = chain.proceed(authenticatedRequest)
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.code == 401) {
            // Clear expired token and notify listeners
            runBlocking {
                tokenManager.clearToken()
                tokenExpiryManager.notifyTokenExpired()
            }
        }
        
        return response
    }
}
