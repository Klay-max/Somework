package com.learningapp.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "learning_records")
data class LearningRecord(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    val userId: String,
    
    @Column(nullable = false)
    val courseId: String,
    
    @Column(nullable = false)
    val unitId: String,
    
    @Column(nullable = false)
    val progress: Int = 0, // 0-100
    
    @Column(nullable = false)
    val isCompleted: Boolean = false,
    
    val lastPosition: Int? = null, // video position in seconds
    
    @Column(nullable = false, updatable = false)
    val startedAt: Instant = Instant.now(),
    
    val completedAt: Instant? = null,
    
    @Column(nullable = false)
    val updatedAt: Instant = Instant.now()
)
