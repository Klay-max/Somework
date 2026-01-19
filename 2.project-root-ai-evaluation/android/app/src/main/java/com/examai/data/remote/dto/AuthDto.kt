package com.examai.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Data Transfer Objects for Authentication API
 */

@Serializable
data class RegisterRequest(
    val phone: String,
    val password: String,
    @SerialName("verification_code") val verificationCode: String
)

@Serializable
data class RegisterResponse(
    @SerialName("user_id") val userId: String,
    val phone: String,
    val role: String,
    val token: String
)

@Serializable
data class LoginRequest(
    val phone: String,
    val password: String
)

@Serializable
data class LoginResponse(
    @SerialName("user_id") val userId: String,
    val phone: String,
    val role: String,
    val token: String
)

@Serializable
data class SendCodeRequest(
    val phone: String
)

@Serializable
data class SendCodeResponse(
    val message: String,
    @SerialName("expires_in") val expiresIn: Int
)
