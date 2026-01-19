package com.learningapp.domain.repository

import com.learningapp.domain.model.LearningRecord
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LearningRecordRepository : JpaRepository<LearningRecord, String> {
    fun findByUserId(userId: String): List<LearningRecord>
    fun findByUserIdAndCourseId(userId: String, courseId: String): List<LearningRecord>
    fun findByUserIdAndUnitId(userId: String, unitId: String): LearningRecord?
}
