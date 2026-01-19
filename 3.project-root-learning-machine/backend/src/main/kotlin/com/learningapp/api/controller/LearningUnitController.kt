package com.learningapp.api.controller

import com.learningapp.api.dto.CreateLearningUnitRequest
import com.learningapp.api.dto.LearningUnitResponse
import com.learningapp.service.LearningUnitService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/courses/{courseId}/units")
class LearningUnitController(
    private val learningUnitService: LearningUnitService
) {
    
    @PostMapping
    fun createLearningUnit(
        @PathVariable courseId: String,
        @Valid @RequestBody request: CreateLearningUnitRequest
    ): ResponseEntity<LearningUnitResponse> {
        val unit = learningUnitService.createLearningUnit(courseId, request)
        return ResponseEntity.ok(unit)
    }
    
    @PutMapping("/{unitId}")
    fun updateLearningUnit(
        @PathVariable courseId: String,
        @PathVariable unitId: String,
        @Valid @RequestBody request: CreateLearningUnitRequest
    ): ResponseEntity<LearningUnitResponse> {
        val unit = learningUnitService.updateLearningUnit(unitId, request)
        return ResponseEntity.ok(unit)
    }
    
    @DeleteMapping("/{unitId}")
    fun deleteLearningUnit(
        @PathVariable courseId: String,
        @PathVariable unitId: String
    ): ResponseEntity<Map<String, Boolean>> {
        val result = learningUnitService.deleteLearningUnit(unitId)
        return ResponseEntity.ok(mapOf("success" to result))
    }
}
