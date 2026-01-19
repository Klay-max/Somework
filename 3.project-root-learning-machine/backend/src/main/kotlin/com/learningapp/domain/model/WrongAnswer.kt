package com.learningapp.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "wrong_answers")
data class WrongAnswer(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    val userId: String,
    
    @Column(nullable = false)
    val exerciseId: String,
    
    @Column(nullable = false)
    val userAnswer: String,
    
    @Column(nullable = false)
    val correctAnswer: String,
    
    @Column(columnDefinition = "jsonb", nullable = false)
    val knowledgePoints: String, // JSON array
    
    @Column(nullable = false)
    val isMastered: Boolean = false,
    
    @Column(nullable = false)
    val redoCount: Int = 0,
    
    val lastRedoAt: Instant? = null,
    
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
