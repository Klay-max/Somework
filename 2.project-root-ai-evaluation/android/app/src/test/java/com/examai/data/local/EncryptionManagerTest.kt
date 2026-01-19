package com.examai.data.local

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Unit tests for EncryptionManager
 * Tests encryption and decryption using Android Keystore
 * 
 * Note: Requires Robolectric for Android Keystore simulation
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28]) // Android 9.0 (API 28) for Keystore support
class EncryptionManagerTest {
    
    private lateinit var encryptionManager: EncryptionManager
    
    @Before
    fun setup() {
        encryptionManager = EncryptionManager()
    }
    
    @Test
    fun `encrypt returns non-empty string`() {
        // Given
        val plaintext = "test_jwt_token_12345"
        
        // When
        val encrypted = encryptionManager.encrypt(plaintext)
        
        // Then
        assertNotNull(encrypted)
        assertTrue(encrypted.isNotEmpty())
        assertNotEquals(plaintext, encrypted)
    }
    
    @Test
    fun `decrypt returns original plaintext`() {
        // Given
        val plaintext = "test_jwt_token_12345"
        val encrypted = encryptionManager.encrypt(plaintext)
        
        // When
        val decrypted = encryptionManager.decrypt(encrypted)
        
        // Then
        assertEquals(plaintext, decrypted)
    }
    
    @Test
    fun `encrypt produces different ciphertext each time`() {
        // Given
        val plaintext = "test_jwt_token_12345"
        
        // When
        val encrypted1 = encryptionManager.encrypt(plaintext)
        val encrypted2 = encryptionManager.encrypt(plaintext)
        
        // Then - Different IV means different ciphertext
        assertNotEquals(encrypted1, encrypted2)
        
        // But both decrypt to same plaintext
        assertEquals(plaintext, encryptionManager.decrypt(encrypted1))
        assertEquals(plaintext, encryptionManager.decrypt(encrypted2))
    }
    
    @Test
    fun `decrypt returns null for invalid ciphertext`() {
        // Given
        val invalidCiphertext = "invalid_base64_string"
        
        // When
        val decrypted = encryptionManager.decrypt(invalidCiphertext)
        
        // Then
        assertNull(decrypted)
    }
    
    @Test
    fun `decrypt returns null for empty string`() {
        // Given
        val emptyCiphertext = ""
        
        // When
        val decrypted = encryptionManager.decrypt(emptyCiphertext)
        
        // Then
        assertNull(decrypted)
    }
    
    @Test
    fun `encrypt and decrypt handles special characters`() {
        // Given
        val plaintext = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
        
        // When
        val encrypted = encryptionManager.encrypt(plaintext)
        val decrypted = encryptionManager.decrypt(encrypted)
        
        // Then
        assertEquals(plaintext, decrypted)
    }
    
    @Test
    fun `encrypt and decrypt handles long strings`() {
        // Given
        val plaintext = "a".repeat(1000)
        
        // When
        val encrypted = encryptionManager.encrypt(plaintext)
        val decrypted = encryptionManager.decrypt(encrypted)
        
        // Then
        assertEquals(plaintext, decrypted)
    }
    
    @Test
    fun `encrypt and decrypt handles unicode characters`() {
        // Given
        val plaintext = "测试中文字符 🔐 encryption"
        
        // When
        val encrypted = encryptionManager.encrypt(plaintext)
        val decrypted = encryptionManager.decrypt(encrypted)
        
        // Then
        assertEquals(plaintext, decrypted)
    }
    
    @Test
    fun `deleteKey allows new key generation`() {
        // Given
        val plaintext1 = "first_token"
        val encrypted1 = encryptionManager.encrypt(plaintext1)
        
        // When
        encryptionManager.deleteKey()
        
        // Then - Old encrypted data cannot be decrypted with new key
        val decrypted1 = encryptionManager.decrypt(encrypted1)
        assertNull(decrypted1) // Should fail because key was deleted
        
        // But new encryption works
        val plaintext2 = "second_token"
        val encrypted2 = encryptionManager.encrypt(plaintext2)
        val decrypted2 = encryptionManager.decrypt(encrypted2)
        assertEquals(plaintext2, decrypted2)
    }
}
