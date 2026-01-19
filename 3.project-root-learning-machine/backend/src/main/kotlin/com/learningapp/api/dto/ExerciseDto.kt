package com.learningapp.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty

data class CreateExerciseRequest(
    val unitId: String?,
    
    @field:NotBlank(message = "题目不能为空")
    val question: String,
    
    @field:NotEmpty(message = "选项不能为空")
    val options: List<String>,
    
    @field:NotBlank(message = "正确答案不能为空")
    val correctAnswer: String,
    
    @field:NotBlank(message = "解析不能为空")
    val explanation: String,
    
    @field:NotEmpty(message = "知识点不能为空")
    val knowledgePoints: List<String>,
    
    val difficulty: String = "BEGINNER"
)

data class ExerciseResponse(
    val id: String,
    val unitId: String?,
    val courseId: String,
    val question: String,
    val options: List<String>,
    val correctAnswer: String,
    val explanation: String,
    val knowledgePoints: List<String>,
    val difficulty: String,
    val source: String,
    val reviewStatus: String?,
    val createdAt: Long
)
