package com.examai.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages JWT token storage and retrieval using DataStore with Android Keystore encryption
 * Handles token expiration and validation
 * 
 * Security: JWT tokens are encrypted using Android Keystore before storage
 */
@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore: DataStore<Preferences> = context.dataStore
    private val encryptionManager = EncryptionManager()
    
    companion object {
        private val ENCRYPTED_TOKEN_KEY = stringPreferencesKey("encrypted_jwt_token")
        private val TOKEN_EXPIRY_KEY = longPreferencesKey("token_expiry")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val PHONE_KEY = stringPreferencesKey("phone")
    }
    
    /**
     * Save JWT token with expiry time
     * Token is encrypted using Android Keystore before storage
     * @param token JWT token string
     * @param expiryTime Token expiry timestamp in milliseconds
     */
    suspend fun saveToken(token: String, expiryTime: Long) {
        val encryptedToken = encryptionManager.encrypt(token)
        dataStore.edit { preferences ->
            preferences[ENCRYPTED_TOKEN_KEY] = encryptedToken
            preferences[TOKEN_EXPIRY_KEY] = expiryTime
        }
    }
    
    /**
     * Save user information
     */
    suspend fun saveUserInfo(userId: String, phone: String) {
        dataStore.edit { preferences ->
            preferences[USER_ID_KEY] = userId
            preferences[PHONE_KEY] = phone
        }
    }
    
    /**
     * Get JWT token if valid, null if expired or not found
     * Token is decrypted using Android Keystore after retrieval
     */
    fun getToken(): String? = runBlocking {
        val preferences = dataStore.data.first()
        val encryptedToken = preferences[ENCRYPTED_TOKEN_KEY]
        val expiry = preferences[TOKEN_EXPIRY_KEY] ?: 0L
        
        // Check expiration first
        if (System.currentTimeMillis() > expiry) {
            clearToken()
            return@runBlocking null
        }
        
        // Decrypt token
        encryptedToken?.let { encrypted ->
            encryptionManager.decrypt(encrypted)
        }
    }
    
    /**
     * Get user ID
     */
    suspend fun getUserId(): String? {
        return dataStore.data.map { preferences ->
            preferences[USER_ID_KEY]
        }.first()
    }
    
    /**
     * Get phone number
     */
    suspend fun getPhone(): String? {
        return dataStore.data.map { preferences ->
            preferences[PHONE_KEY]
        }.first()
    }
    
    /**
     * Clear token and user info
     * Also deletes encryption key from Keystore
     */
    suspend fun clearToken() {
        dataStore.edit { preferences ->
            preferences.remove(ENCRYPTED_TOKEN_KEY)
            preferences.remove(TOKEN_EXPIRY_KEY)
            preferences.remove(USER_ID_KEY)
            preferences.remove(PHONE_KEY)
        }
        // Delete encryption key for security
        encryptionManager.deleteKey()
    }
    
    /**
     * Check if token is valid (not expired)
     */
    fun isTokenValid(): Boolean {
        val preferences = runBlocking { dataStore.data.first() }
        val expiry = preferences[TOKEN_EXPIRY_KEY] ?: 0L
        return System.currentTimeMillis() < expiry
    }
}

private val Context.dataStore by preferencesDataStore(name = "auth_prefs")
