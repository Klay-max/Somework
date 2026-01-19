package com.examai.data.local

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages token expiry events across the application
 * Provides a centralized way to notify UI components when token expires
 */
@Singleton
class TokenExpiryManager @Inject constructor() {
    
    private val _tokenExpiredEvents = MutableSharedFlow<Unit>(replay = 0)
    val tokenExpiredEvents: SharedFlow<Unit> = _tokenExpiredEvents.asSharedFlow()
    
    /**
     * Emit token expired event
     * Should be called when 401 response is received or token validation fails
     */
    suspend fun notifyTokenExpired() {
        _tokenExpiredEvents.emit(Unit)
    }
}
