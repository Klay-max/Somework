package com.learningapp.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.learningapp.api.dto.CreateExerciseRequest
import com.learningapp.api.dto.ExerciseResponse
import com.learningapp.domain.model.DifficultyLevel
import com.learningapp.domain.model.Exercise
import com.learningapp.domain.model.ExerciseSource
import com.learningapp.domain.repository.ExerciseRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class ExerciseService(
    private val exerciseRepository: ExerciseRepository
) {
    
    private val objectMapper = jacksonObjectMapper()
    
    fun getExercisesByUnit(unitId: String): List<ExerciseResponse> {
        return exerciseRepository.findByUnitId(unitId)
            .map { it.toResponse() }
    }
    
    fun getExercisesByCourse(courseId: String): List<ExerciseResponse> {
        return exerciseRepository.findByCourseId(courseId)
            .map { it.toResponse() }
    }
    
    @Transactional
    fun createExercise(courseId: String, request: CreateExerciseRequest): ExerciseResponse {
        val exercise = Exercise(
            unitId = request.unitId,
            courseId = courseId,
            question = request.question,
            options = objectMapper.writeValueAsString(request.options),
            correctAnswer = request.correctAnswer,
            explanation = request.explanation,
            knowledgePoints = objectMapper.writeValueAsString(request.knowledgePoints),
            difficulty = DifficultyLevel.valueOf(request.difficulty),
            source = ExerciseSource.MANUAL,
            reviewStatus = null,
            createdAt = Instant.now()
        )
        
        val savedExercise = exerciseRepository.save(exercise)
        return savedExercise.toResponse()
    }
    
    @Transactional
    fun updateExercise(exerciseId: String, request: CreateExerciseRequest): ExerciseResponse {
        val exercise = exerciseRepository.findById(exerciseId)
            .orElseThrow { IllegalArgumentException("练习题不存在") }
        
        val updatedExercise = exercise.copy(
            unitId = request.unitId,
            question = request.question,
            options = objectMapper.writeValueAsString(request.options),
            correctAnswer = request.correctAnswer,
            explanation = request.explanation,
            knowledgePoints = objectMapper.writeValueAsString(request.knowledgePoints),
            difficulty = DifficultyLevel.valueOf(request.difficulty)
        )
        
        val savedExercise = exerciseRepository.save(updatedExercise)
        return savedExercise.toResponse()
    }
    
    @Transactional
    fun deleteExercise(exerciseId: String): Boolean {
        if (!exerciseRepository.existsById(exerciseId)) {
            throw IllegalArgumentException("练习题不存在")
        }
        
        exerciseRepository.deleteById(exerciseId)
        return true
    }
    
    private fun Exercise.toResponse() = ExerciseResponse(
        id = id!!,
        unitId = unitId,
        courseId = courseId,
        question = question,
        options = objectMapper.readValue(options, List::class.java) as List<String>,
        correctAnswer = correctAnswer,
        explanation = explanation,
        knowledgePoints = objectMapper.readValue(knowledgePoints, List::class.java) as List<String>,
        difficulty = difficulty.name,
        source = source.name,
        reviewStatus = reviewStatus?.name,
        createdAt = createdAt.toEpochMilli()
    )
}
