package com.learningapp.api.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank

data class LearningRecordRequest(
    @field:NotBlank(message = "课程ID不能为空")
    val courseId: String,
    
    @field:NotBlank(message = "单元ID不能为空")
    val unitId: String,
    
    @field:Min(0, message = "进度不能小于0")
    @field:Max(100, message = "进度不能大于100")
    val progress: Int,
    
    val lastPosition: Int? = null
)

data class LearningRecordResponse(
    val id: String,
    val userId: String,
    val courseId: String,
    val unitId: String,
    val progress: Int,
    val isCompleted: Boolean,
    val lastPosition: Int?,
    val startedAt: Long,
    val completedAt: Long?,
    val updatedAt: Long
)
