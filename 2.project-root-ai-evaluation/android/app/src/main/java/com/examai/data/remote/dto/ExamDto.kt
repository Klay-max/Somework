package com.examai.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Data Transfer Objects for Exam API
 */

@Serializable
data class UploadResponse(
    @SerialName("exam_id") val examId: String,
    val status: String,
    val message: String
)

@Serializable
data class ExamStatusResponse(
    @SerialName("exam_id") val examId: String,
    val status: String,
    val progress: Int,
    @SerialName("estimated_time") val estimatedTime: Int? = null,
    @SerialName("error_message") val errorMessage: String? = null
)

@Serializable
data class HistoryResponse(
    val exams: List<ExamHistoryItemDto>,
    val total: Int,
    val page: Int,
    @SerialName("page_size") val pageSize: Int,
    @SerialName("has_more") val hasMore: Boolean
)

@Serializable
data class ExamHistoryItemDto(
    @SerialName("exam_id") val examId: String,
    val subject: String,
    val grade: String,
    val score: Int? = null,
    @SerialName("total_score") val totalScore: Int? = null,
    val status: String,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("report_url") val reportUrl: String? = null,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String
)

@Serializable
data class ExamDetailResponse(
    @SerialName("exam_id") val examId: String,
    @SerialName("user_id") val userId: String,
    val subject: String,
    val grade: String,
    val score: Int? = null,
    @SerialName("total_score") val totalScore: Int? = null,
    val status: String,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("report_url") val reportUrl: String? = null,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String
)

@Serializable
data class DeleteResponse(
    val message: String,
    @SerialName("recovery_deadline") val recoveryDeadline: String
)
