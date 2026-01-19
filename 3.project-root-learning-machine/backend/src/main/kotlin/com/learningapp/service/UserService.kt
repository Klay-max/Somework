package com.learningapp.service

import com.learningapp.api.dto.AuthResponse
import com.learningapp.api.dto.LoginRequest
import com.learningapp.api.dto.RegisterRequest
import com.learningapp.api.dto.UserResponse
import com.learningapp.domain.model.User
import com.learningapp.domain.model.UserRole
import com.learningapp.domain.model.UserStatus
import com.learningapp.domain.repository.UserRepository
import com.learningapp.security.JwtUtil
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil
) {
    
    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        // Check if username already exists
        if (userRepository.existsByUsername(request.username)) {
            throw IllegalArgumentException("用户名已存在")
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("邮箱已被注册")
        }
        
        // Create new user
        val user = User(
            username = request.username,
            email = request.email,
            passwordHash = passwordEncoder.encode(request.password),
            role = UserRole.STUDENT,
            status = UserStatus.ACTIVE,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        val savedUser = userRepository.save(user)
        
        // Generate JWT token
        val token = jwtUtil.generateToken(
            savedUser.id!!,
            savedUser.username,
            savedUser.role.name
        )
        
        return AuthResponse(
            token = token,
            userId = savedUser.id,
            username = savedUser.username,
            email = savedUser.email,
            role = savedUser.role.name
        )
    }
    
    fun login(request: LoginRequest): AuthResponse {
        // Find user by username
        val user = userRepository.findByUsername(request.username)
            ?: throw IllegalArgumentException("用户名或密码错误")
        
        // Check if account is disabled
        if (user.status == UserStatus.DISABLED) {
            throw IllegalArgumentException("账户已被禁用")
        }
        
        // Verify password
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw IllegalArgumentException("用户名或密码错误")
        }
        
        // Generate JWT token
        val token = jwtUtil.generateToken(
            user.id!!,
            user.username,
            user.role.name
        )
        
        return AuthResponse(
            token = token,
            userId = user.id,
            username = user.username,
            email = user.email,
            role = user.role.name
        )
    }
    
    fun getUserById(userId: String): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("用户不存在") }
        
        return UserResponse(
            id = user.id!!,
            username = user.username,
            email = user.email,
            role = user.role.name,
            status = user.status.name,
            createdAt = user.createdAt.toEpochMilli()
        )
    }
    
    @Transactional
    fun resetPassword(userId: String, newPassword: String): Boolean {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("用户不存在") }
        
        val updatedUser = user.copy(
            passwordHash = passwordEncoder.encode(newPassword),
            updatedAt = Instant.now()
        )
        
        userRepository.save(updatedUser)
        return true
    }
}
