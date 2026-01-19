package com.learningapp.domain.repository

import com.learningapp.domain.model.LearningUnit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LearningUnitRepository : JpaRepository<LearningUnit, String> {
    fun findByCourseIdOrderByOrderAsc(courseId: String): List<LearningUnit>
    fun deleteByCourseId(courseId: String)
    fun countByCourseId(courseId: String): Long
}
