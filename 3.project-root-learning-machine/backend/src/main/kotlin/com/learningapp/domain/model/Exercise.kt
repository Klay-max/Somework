package com.learningapp.domain.model

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import java.time.Instant

@Entity
@Table(name = "exercises")
data class Exercise(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    val unitId: String? = null,
    
    @Column(nullable = false)
    val courseId: String,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank
    val question: String,
    
    @Column(columnDefinition = "jsonb", nullable = false)
    val options: String, // JSON array of options
    
    @Column(nullable = false)
    @NotBlank
    val correctAnswer: String,
    
    @Column(columnDefinition = "TEXT", nullable = false)
    @NotBlank
    val explanation: String,
    
    @Column(columnDefinition = "jsonb", nullable = false)
    val knowledgePoints: String, // JSON array of knowledge points
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val difficulty: DifficultyLevel = DifficultyLevel.BEGINNER,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val source: ExerciseSource = ExerciseSource.MANUAL,
    
    @Enumerated(EnumType.STRING)
    val reviewStatus: ReviewStatus? = null,
    
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)

enum class ExerciseSource {
    MANUAL, AI_GENERATED
}

enum class ReviewStatus {
    PENDING, APPROVED, REJECTED
}

@Entity
@Table(name = "exercise_history")
data class ExerciseHistory(
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
    val isCorrect: Boolean,
    
    @Column(nullable = false)
    val attemptCount: Int = 1,
    
    @Column(nullable = false, updatable = false)
    val submittedAt: Instant = Instant.now()
)
