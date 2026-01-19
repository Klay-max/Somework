package com.learningapp.domain.model

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import java.time.Instant

@Entity
@Table(name = "notifications")
data class Notification(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    val userId: String,
    
    @Column(nullable = false)
    @NotBlank
    val title: String,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank
    val content: String,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: NotificationType = NotificationType.SYSTEM,
    
    @Column(nullable = false)
    val isRead: Boolean = false,
    
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)

enum class NotificationType {
    SYSTEM, REMINDER, ACHIEVEMENT
}

@Entity
@Table(name = "reminders")
data class Reminder(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    val userId: String,
    
    @Column(nullable = false)
    val time: String, // HH:mm format
    
    @Column(columnDefinition = "jsonb", nullable = false)
    val daysOfWeek: String, // JSON array of day names
    
    @Column(nullable = false)
    val isEnabled: Boolean = true,
    
    @Column(nullable = false)
    val message: String
)

@Entity
@Table(name = "system_notifications")
data class SystemNotification(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    @NotBlank
    val title: String,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank
    val content: String,
    
    @Column(columnDefinition = "jsonb", nullable = false)
    val targetUserIds: String, // JSON array of user IDs
    
    val scheduledAt: Instant? = null,
    val sentAt: Instant? = null,
    val deliveryRate: Double? = null,
    val readRate: Double? = null
)
