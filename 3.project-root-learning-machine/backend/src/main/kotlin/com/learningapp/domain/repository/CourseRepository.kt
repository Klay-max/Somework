package com.learningapp.domain.repository

import com.learningapp.domain.model.Course
import com.learningapp.domain.model.CourseStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CourseRepository : JpaRepository<Course, String> {
    fun findByStatus(status: CourseStatus, pageable: Pageable): Page<Course>
    fun findByCategory(category: String, pageable: Pageable): Page<Course>
    fun findByCategoryAndStatus(category: String, status: CourseStatus, pageable: Pageable): Page<Course>
}
