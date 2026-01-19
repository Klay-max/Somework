package com.learningapp.domain.model

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import java.time.Instant

@Entity
@Table(name = "courses")
data class Course(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    @NotBlank
    val name: String,
    
    @Column(columnDefinition = "TEXT")
    @NotBlank
    val description: String,
    
    @Column(nullable = false)
    val coverImage: String,
    
    @Column(nullable = false)
    val category: String,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val difficulty: DifficultyLevel = DifficultyLevel.BEGINNER,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: CourseStatus = CourseStatus.DRAFT,
    
    @Column(nullable = false)
    val createdBy: String,
    
    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(nullable = false)
    val updatedAt: Instant = Instant.now()
)

enum class DifficultyLevel {
    BEGINNER, INTERMEDIATE, ADVANCED
}

enum class CourseStatus {
    DRAFT, PUBLISHED, ARCHIVED
}

@Entity
@Table(name = "learning_units")
data class LearningUnit(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,
    
    @Column(nullable = false)
    val courseId: String,
    
    @Column(nullable = false)
    @NotBlank
    val title: String,
    
    @Column(nullable = false)
    val order: Int,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val contentType: ContentType,
    
    val videoUrl: String? = null,
    
    @Column(columnDefinition = "TEXT")
    val textContent: String? = null,
    
    @Column(columnDefinition = "jsonb")
    val images: String? = null, // JSON array of image URLs
    
    val duration: Int? = null, // in minutes
    
    @Column(columnDefinition = "jsonb")
    val knowledgePoints: String? = null // JSON array of knowledge points
)

enum class ContentType {
    VIDEO, TEXT, IMAGE, MIXED
}
