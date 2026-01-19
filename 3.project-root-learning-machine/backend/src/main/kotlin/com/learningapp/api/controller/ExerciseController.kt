package com.learningapp.api.controller

import com.learningapp.api.dto.CreateExerciseRequest
import com.learningapp.api.dto.ExerciseResponse
import com.learningapp.service.ExerciseService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/exercises")
class ExerciseController(
    private val exerciseService: ExerciseService
) {
    
    @GetMapping("/unit/{unitId}")
    fun getExercisesByUnit(@PathVariable unitId: String): ResponseEntity<List<ExerciseResponse>> {
        val exercises = exerciseService.getExercisesByUnit(unitId)
        return ResponseEntity.ok(exercises)
    }
    
    @GetMapping("/course/{courseId}")
    fun getExercisesByCourse(@PathVariable courseId: String): ResponseEntity<List<ExerciseResponse>> {
        val exercises = exerciseService.getExercisesByCourse(courseId)
        return ResponseEntity.ok(exercises)
    }
}

@RestController
@RequestMapping("/api/admin/exercises")
class AdminExerciseController(
    private val exerciseService: ExerciseService
) {
    
    @PostMapping
    fun createExercise(
        @RequestParam courseId: String,
        @Valid @RequestBody request: CreateExerciseRequest
    ): ResponseEntity<ExerciseResponse> {
        val exercise = exerciseService.createExercise(courseId, request)
        return ResponseEntity.ok(exercise)
    }
    
    @PutMapping("/{exerciseId}")
    fun updateExercise(
        @PathVariable exerciseId: String,
        @Valid @RequestBody request: CreateExerciseRequest
    ): ResponseEntity<ExerciseResponse> {
        val exercise = exerciseService.updateExercise(exerciseId, request)
        return ResponseEntity.ok(exercise)
    }
    
    @DeleteMapping("/{exerciseId}")
    fun deleteExercise(@PathVariable exerciseId: String): ResponseEntity<Map<String, Boolean>> {
        val result = exerciseService.deleteExercise(exerciseId)
        return ResponseEntity.ok(mapOf("success" to result))
    }
}
