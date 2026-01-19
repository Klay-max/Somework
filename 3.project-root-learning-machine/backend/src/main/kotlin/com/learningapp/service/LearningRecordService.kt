package com.learningapp.service

import com.learningapp.api.dto.LearningRecordRequest
import com.learningapp.api.dto.LearningRecordResponse
import com.learningapp.domain.model.LearningRecord
import com.learningapp.domain.repository.LearningRecordRepository
import com.learningapp.domain.repository.LearningUnitRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.*

@Service
class LearningRecordService(
    private val learningRecordRepository: LearningRecordRepository,
    private val learningUnitRepository: LearningUnitRepository
) {
    
    @Transactional
    fun saveLearningProgress(userId: String, request: LearningRecordRequest): LearningRecordResponse {
        val existingRecord = learningRecordRepository.findByUserIdAndUnitId(userId, request.unitId)
        
        val record = if (existingRecord != null) {
            existingRecord.copy(
                progress = request.progress,
                lastPosition = request.lastPosition,
                isCompleted = request.progress >= 100,
                completedAt = if (request.progress >= 100 && existingRecord.completedAt == null) 
                    Instant.now() else existingRecord.completedAt,
                updatedAt = Instant.now()
            )
        } else {
            LearningRecord(
                id = UUID.randomUUID().toString(),
                userId = userId,
                courseId = request.courseId,
                unitId = request.unitId,
                progress = request.progress,
                isCompleted = request.progress >= 100,
                lastPosition = request.lastPosition,
                startedAt = Instant.now(),
                completedAt = if (request.progress >= 100) Instant.now() else null,
                updatedAt = Instant.now()
            )
        }
        
        val savedRecord = learningRecordRepository.save(record)
        return savedRecord.toResponse()
    }
    
    fun getLearningRecords(userId: String, courseId: String?): List<LearningRecordResponse> {
        val records = if (courseId != null) {
            learningRecordRepository.findByUserIdAndCourseId(userId, courseId)
        } else {
            learningRecordRepository.findByUserId(userId)
        }
        
        return records.map { it.toResponse() }
    }
    
    fun getOverallProgress(userId: String): Map<String, Double> {
        val records = learningRecordRepository.findByUserId(userId)
        
        return records.groupBy { it.courseId }
            .mapValues { (courseId, courseRecords) ->
                val totalUnits = learningUnitRepository.countByCourseId(courseId)
                val completedUnits = courseRecords.count { it.isCompleted }
                if (totalUnits > 0) {
                    (completedUnits.toDouble() / totalUnits.toDouble()) * 100.0
                } else {
                    0.0
                }
            }
    }
    
    @Transactional
    fun markUnitComplete(userId: String, unitId: String): Boolean {
        val record = learningRecordRepository.findByUserIdAndUnitId(userId, unitId)
            ?: throw IllegalArgumentException("学习记录不存在")
        
        val updatedRecord = record.copy(
            progress = 100,
            isCompleted = true,
            completedAt = Instant.now(),
            updatedAt = Instant.now()
        )
        
        learningRecordRepository.save(updatedRecord)
        return true
    }
    
    private fun LearningRecord.toResponse() = LearningRecordResponse(
        id = id!!,
        userId = userId,
        courseId = courseId,
        unitId = unitId,
        progress = progress,
        isCompleted = isCompleted,
        lastPosition = lastPosition,
        startedAt = startedAt.toEpochMilli(),
        completedAt = completedAt?.toEpochMilli(),
        updatedAt = updatedAt.toEpochMilli()
    )
}
