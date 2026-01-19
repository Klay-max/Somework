package com.learningapp.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.learningapp.api.dto.*
import com.learningapp.domain.model.*
import com.learningapp.domain.repository.CourseRepository
import com.learningapp.domain.repository.LearningUnitRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class CourseService(
    private val courseRepository: CourseRepository,
    private val learningUnitRepository: LearningUnitRepository
) {
    
    private val objectMapper = jacksonObjectMapper()
    
    fun getCourseList(category: String?, status: String?, pageable: Pageable): Page<CourseResponse> {
        val courses = when {
            category != null && status != null -> {
                courseRepository.findByCategoryAndStatus(
                    category,
                    CourseStatus.valueOf(status),
                    pageable
                )
            }
            category != null -> courseRepository.findByCategory(category, pageable)
            status != null -> courseRepository.findByStatus(CourseStatus.valueOf(status), pageable)
            else -> courseRepository.findAll(pageable)
        }
        
        return courses.map { it.toResponse() }
    }
    
    fun getCourseDetail(courseId: String): CourseDetailResponse {
        val course = courseRepository.findById(courseId)
            .orElseThrow { IllegalArgumentException("课程不存在") }
        
        val units = learningUnitRepository.findByCourseIdOrderByOrderAsc(courseId)
        
        return CourseDetailResponse(
            id = course.id!!,
            name = course.name,
            description = course.description,
            coverImage = course.coverImage,
            category = course.category,
            difficulty = course.difficulty.name,
            status = course.status.name,
            units = units.map { it.toResponse() },
            createdAt = course.createdAt.toEpochMilli(),
            updatedAt = course.updatedAt.toEpochMilli()
        )
    }
    
    @Transactional
    fun createCourse(request: CreateCourseRequest, createdBy: String): CourseResponse {
        val course = Course(
            name = request.name,
            description = request.description,
            coverImage = request.coverImage,
            category = request.category,
            difficulty = DifficultyLevel.valueOf(request.difficulty),
            status = CourseStatus.DRAFT,
            createdBy = createdBy,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        val savedCourse = courseRepository.save(course)
        return savedCourse.toResponse()
    }
    
    @Transactional
    fun updateCourse(courseId: String, request: UpdateCourseRequest): CourseResponse {
        val course = courseRepository.findById(courseId)
            .orElseThrow { IllegalArgumentException("课程不存在") }
        
        val updatedCourse = course.copy(
            name = request.name ?: course.name,
            description = request.description ?: course.description,
            coverImage = request.coverImage ?: course.coverImage,
            category = request.category ?: course.category,
            difficulty = request.difficulty?.let { DifficultyLevel.valueOf(it) } ?: course.difficulty,
            updatedAt = Instant.now()
        )
        
        val savedCourse = courseRepository.save(updatedCourse)
        return savedCourse.toResponse()
    }
    
    @Transactional
    fun publishCourse(courseId: String): Boolean {
        val course = courseRepository.findById(courseId)
            .orElseThrow { IllegalArgumentException("课程不存在") }
        
        val publishedCourse = course.copy(
            status = CourseStatus.PUBLISHED,
            updatedAt = Instant.now()
        )
        
        courseRepository.save(publishedCourse)
        return true
    }
    
    @Transactional
    fun deleteCourse(courseId: String): Boolean {
        if (!courseRepository.existsById(courseId)) {
            throw IllegalArgumentException("课程不存在")
        }
        
        courseRepository.deleteById(courseId)
        return true
    }
    
    fun getLearningUnits(courseId: String): List<LearningUnitResponse> {
        return learningUnitRepository.findByCourseIdOrderByOrderAsc(courseId)
            .map { it.toResponse() }
    }
    
    private fun Course.toResponse() = CourseResponse(
        id = id!!,
        name = name,
        description = description,
        coverImage = coverImage,
        category = category,
        difficulty = difficulty.name,
        status = status.name,
        createdBy = createdBy,
        createdAt = createdAt.toEpochMilli(),
        updatedAt = updatedAt.toEpochMilli()
    )
    
    private fun LearningUnit.toResponse() = LearningUnitResponse(
        id = id!!,
        courseId = courseId,
        title = title,
        order = order,
        contentType = contentType.name,
        videoUrl = videoUrl,
        textContent = textContent,
        images = images?.let { objectMapper.readValue(it, List::class.java) as List<String> },
        duration = duration,
        knowledgePoints = knowledgePoints?.let { objectMapper.readValue(it, List::class.java) as List<String> }
    )
}
