package com.learningapp.data.model

data class RegisterRequest(
    val username: String,
    val password: String,
    val email: String
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val userId: String,
    val username: String,
    val email: String,
    val role: String
)

data class User(
    val id: String,
    val username: String,
    val email: String,
    val role: String
)
