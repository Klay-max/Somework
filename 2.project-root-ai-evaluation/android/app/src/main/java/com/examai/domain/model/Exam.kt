package com.examai.domain.model

/**
 * Domain model for Exam
 */
data class Exam(
    val examId: String,
    val userId: String,
    val subject: String,
    val grade: String,
    val score: Int?,
    val totalScore: Int?,
    val status: ExamStatus,
    val imageUrl: String?,
    val reportUrl: String?,
    val createdAt: Long,
    val updatedAt: Long
)

/**
 * Exam processing status
 */
enum class ExamStatus(val value: String) {
    UPLOADED("UPLOADED"),
    OCR_PROCESSING("OCR_PROCESSING"),
    OCR_COMPLETED("OCR_COMPLETED"),
    PARSING("PARSING"),
    PARSED("PARSED"),
    ANALYZING("ANALYZING"),
    ANALYZED("ANALYZED"),
    DIAGNOSING("DIAGNOSING"),
    DIAGNOSED("DIAGNOSED"),
    REPORT_GENERATING("REPORT_GENERATING"),
    REPORT_GENERATED("REPORT_GENERATED"),
    COMPLETED("COMPLETED"),
    FAILED("FAILED");
    
    companion object {
        fun fromString(value: String): ExamStatus {
            return values().find { it.value == value } ?: UPLOADED
        }
    }
}

/**
 * Exam status information with progress
 */
data class ExamStatusInfo(
    val status: ExamStatus,
    val progress: Int,
    val estimatedTime: Int?,
    val errorMessage: String?
)

/**
 * Report information
 */
data class Report(
    val examId: String,
    val htmlUrl: String,
    val pdfUrl: String?,
    val generatedAt: Long
)
