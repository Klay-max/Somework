package com.learningapp.api.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank(message = "用户名不能为空")
    @field:Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    val username: String,
    
    @field:NotBlank(message = "密码不能为空")
    @field:Size(min = 8, max = 100, message = "密码长度必须在8-100之间")
    val password: String,
    
    @field:NotBlank(message = "邮箱不能为空")
    @field:Email(message = "邮箱格式不正确")
    val email: String
)

data class LoginRequest(
    @field:NotBlank(message = "用户名不能为空")
    val username: String,
    
    @field:NotBlank(message = "密码不能为空")
    val password: String
)

data class AuthResponse(
    val token: String,
    val userId: String,
    val username: String,
    val email: String,
    val role: String
)

data class UserResponse(
    val id: String,
    val username: String,
    val email: String,
    val role: String,
    val status: String,
    val createdAt: Long
)
