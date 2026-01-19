package com.examai.data.remote.interceptor

import com.examai.data.local.TokenManager
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for AuthInterceptor
 * Tests JWT token injection into HTTP requests
 */
class AuthInterceptorTest {
    
    private lateinit var tokenManager: TokenManager
    private lateinit var authInterceptor: AuthInterceptor
    private lateinit var chain: Interceptor.Chain
    
    @Before
    fun setup() {
        tokenManager = mockk()
        authInterceptor = AuthInterceptor(tokenManager)
        chain = mockk(relaxed = true)
    }
    
    @Test
    fun `intercept adds Authorization header when token exists`() {
        // Given
        val testToken = "test_jwt_token_12345"
        val request = Request.Builder()
            .url("https://api.examai.com/api/v1/exams/history")
            .build()
        
        every { tokenManager.getToken() } returns testToken
        every { chain.request() } returns request
        every { chain.proceed(any()) } returns mockk<Response>(relaxed = true)
        
        // When
        authInterceptor.intercept(chain)
        
        // Then
        verify {
            chain.proceed(match { authenticatedRequest ->
                authenticatedRequest.header("Authorization") == "Bearer $testToken"
            })
        }
    }
    
    @Test
    fun `intercept does not add Authorization header when token is null`() {
        // Given
        val request = Request.Builder()
            .url("https://api.examai.com/api/v1/auth/login")
            .build()
        
        every { tokenManager.getToken() } returns null
        every { chain.request() } returns request
        every { chain.proceed(any()) } returns mockk<Response>(relaxed = true)
        
        // When
        authInterceptor.intercept(chain)
        
        // Then
        verify {
            chain.proceed(match { unauthenticatedRequest ->
                unauthenticatedRequest.header("Authorization") == null
            })
        }
    }
    
    @Test
    fun `intercept preserves original request URL`() {
        // Given
        val testUrl = "https://api.examai.com/api/v1/exams/123"
        val request = Request.Builder()
            .url(testUrl)
            .build()
        
        every { tokenManager.getToken() } returns "token"
        every { chain.request() } returns request
        every { chain.proceed(any()) } returns mockk<Response>(relaxed = true)
        
        // When
        authInterceptor.intercept(chain)
        
        // Then
        verify {
            chain.proceed(match { authenticatedRequest ->
                authenticatedRequest.url.toString() == testUrl
            })
        }
    }
    
    @Test
    fun `intercept preserves original request method`() {
        // Given
        val request = Request.Builder()
            .url("https://api.examai.com/api/v1/exams/upload")
            .post(mockk(relaxed = true))
            .build()
        
        every { tokenManager.getToken() } returns "token"
        every { chain.request() } returns request
        every { chain.proceed(any()) } returns mockk<Response>(relaxed = true)
        
        // When
        authInterceptor.intercept(chain)
        
        // Then
        verify {
            chain.proceed(match { authenticatedRequest ->
                authenticatedRequest.method == "POST"
            })
        }
    }
}
