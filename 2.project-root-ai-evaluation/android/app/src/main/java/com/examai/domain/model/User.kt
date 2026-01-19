package com.examai.domain.model

/**
 * Domain model for User
 */
data class User(
    val userId: String,
    val phone: String,
    val role: String
)

/**
 * Authentication result
 */
data class AuthResult(
    val user: User,
    val token: String
)
