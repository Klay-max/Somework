package com.learningapp.api.controller

import com.learningapp.api.dto.*
import com.learningapp.service.CourseService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/courses")
class CourseController(
    private val courseService: CourseService
) {
    
    @GetMapping
    fun getCourseList(
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Page<CourseResponse>> {
        val pageable = PageRequest.of(page, size)
        val courses = courseService.getCourseList(category, status, pageable)
        return ResponseEntity.ok(courses)
    }
    
    @GetMapping("/{courseId}")
    fun getCourseDetail(@PathVariable courseId: String): ResponseEntity<CourseDetailResponse> {
        val course = courseService.getCourseDetail(courseId)
        return ResponseEntity.ok(course)
    }
    
    @GetMapping("/{courseId}/units")
    fun getLearningUnits(@PathVariable courseId: String): ResponseEntity<List<LearningUnitResponse>> {
        val units = courseService.getLearningUnits(courseId)
        return ResponseEntity.ok(units)
    }
}

@RestController
@RequestMapping("/api/admin/courses")
class AdminCourseController(
    private val courseService: CourseService
) {
    
    @PostMapping
    fun createCourse(
        @Valid @RequestBody request: CreateCourseRequest,
        authentication: Authentication
    ): ResponseEntity<CourseResponse> {
        val userId = authentication.principal as String
        val course = courseService.createCourse(request, userId)
        return ResponseEntity.ok(course)
    }
    
    @PutMapping("/{courseId}")
    fun updateCourse(
        @PathVariable courseId: String,
        @Valid @RequestBody request: UpdateCourseRequest
    ): ResponseEntity<CourseResponse> {
        val course = courseService.updateCourse(courseId, request)
        return ResponseEntity.ok(course)
    }
    
    @PostMapping("/{courseId}/publish")
    fun publishCourse(@PathVariable courseId: String): ResponseEntity<Map<String, Boolean>> {
        val result = courseService.publishCourse(courseId)
        return ResponseEntity.ok(mapOf("success" to result))
    }
    
    @DeleteMapping("/{courseId}")
    fun deleteCourse(@PathVariable courseId: String): ResponseEntity<Map<String, Boolean>> {
        val result = courseService.deleteCourse(courseId)
        return ResponseEntity.ok(mapOf("success" to result))
    }
}
