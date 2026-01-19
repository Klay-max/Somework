package com.learningapp.domain.repository

import com.learningapp.domain.model.Exercise
import com.learningapp.domain.model.ReviewStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ExerciseRepository : JpaRepository<Exercise, String> {
    fun findByUnitId(unitId: String): List<Exercise>
    fun findByCourseId(courseId: String): List<Exercise>
    fun findByReviewStatus(reviewStatus: ReviewStatus): List<Exercise>
}
