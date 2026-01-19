package com.learningapp.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "ai_conversations")
data class AIConversation(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    val userId: String,
    
    @Column(columnDefinition = "jsonb", nullable = false)
    val messages: String, // JSON array of AIMessage
    
    @Column(columnDefinition = "jsonb")
    val context: String? = null, // JSON of LearningContext
    
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(nullable = false)
    val updatedAt: Instant = Instant.now()
)
