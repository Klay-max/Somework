package com.learningapp.domain.model

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import java.time.Instant

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(unique = true, nullable = false)
    @NotBlank
    val username: String,
    
    @Column(unique = true, nullable = false)
    @Email
    @NotBlank
    val email: String,
    
    @Column(nullable = false)
    @NotBlank
    val passwordHash: String,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val role: UserRole = UserRole.STUDENT,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: UserStatus = UserStatus.ACTIVE,
    
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(nullable = false)
    val updatedAt: Instant = Instant.now()
)

enum class UserRole {
    STUDENT, ADMIN
}

enum class UserStatus {
    ACTIVE, DISABLED
}

@Entity
@Table(name = "user_profiles")
data class UserProfile(
    @Id
    val userId: String,
    
    val nickname: String? = null,
    val avatar: String? = null,
    val grade: String? = null,
    
    @Column(columnDefinition = "jsonb")
    val preferences: String? = null
)
