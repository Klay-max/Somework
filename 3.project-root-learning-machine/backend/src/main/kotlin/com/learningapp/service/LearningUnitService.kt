package com.learningapp.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.learningapp.api.dto.CreateLearningUnitRequest
import com.learningapp.api.dto.LearningUnitResponse
import com.learningapp.domain.model.ContentType
import com.learningapp.domain.model.LearningUnit
import com.learningapp.domain.repository.LearningUnitRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class LearningUnitService(
    private val learningUnitRepository: LearningUnitRepository
) {
    
    private val objectMapper = jacksonObjectMapper()
    
    @Transactional
    fun createLearningUnit(courseId: String, request: CreateLearningUnitRequest): LearningUnitResponse {
        val unit = LearningUnit(
            courseId = courseId,
            title = request.title,
            order = request.order,
            contentType = ContentType.valueOf(request.contentType),
            videoUrl = request.videoUrl,
            textContent = request.textContent,
            images = request.images?.let { objectMapper.writeValueAsString(it) },
            duration = request.duration,
            knowledgePoints = request.knowledgePoints?.let { objectMapper.writeValueAsString(it) }
        )
        
        val savedUnit = learningUnitRepository.save(unit)
        return savedUnit.toResponse()
    }
    
    @Transactional
    fun updateLearningUnit(unitId: String, request: CreateLearningUnitRequest): LearningUnitResponse {
        val unit = learningUnitRepository.findById(unitId)
            .orElseThrow { IllegalArgumentException("学习单元不存在") }
        
        val updatedUnit = unit.copy(
            title = request.title,
            order = request.order,
            contentType = ContentType.valueOf(request.contentType),
            videoUrl = request.videoUrl,
            textContent = request.textContent,
            images = request.images?.let { objectMapper.writeValueAsString(it) },
            duration = request.duration,
            knowledgePoints = request.knowledgePoints?.let { objectMapper.writeValueAsString(it) }
        )
        
        val savedUnit = learningUnitRepository.save(updatedUnit)
        return savedUnit.toResponse()
    }
    
    @Transactional
    fun deleteLearningUnit(unitId: String): Boolean {
        if (!learningUnitRepository.existsById(unitId)) {
            throw IllegalArgumentException("学习单元不存在")
        }
        
        learningUnitRepository.deleteById(unitId)
        return true
    }
    
    private fun LearningUnit.toResponse() = LearningUnitResponse(
        id = id!!,
        courseId = courseId,
        title = title,
        order = order,
        contentType = contentType.name,
        videoUrl = videoUrl,
        textContent = textContent,
        images = images?.let { objectMapper.readValue(it, List::class.java) as List<String> },
        duration = duration,
        knowledgePoints = knowledgePoints?.let { objectMapper.readValue(it, List::class.java) as List<String> }
    )
}
