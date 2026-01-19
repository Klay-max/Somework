package com.examai.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Data Transfer Objects for Report API
 */

@Serializable
data class ReportResponse(
    @SerialName("exam_id") val examId: String,
    @SerialName("html_url") val htmlUrl: String,
    @SerialName("pdf_url") val pdfUrl: String? = null,
    @SerialName("generated_at") val generatedAt: String
)
