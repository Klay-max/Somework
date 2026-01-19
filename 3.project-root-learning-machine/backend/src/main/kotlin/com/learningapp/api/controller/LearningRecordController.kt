package com.learningapp.api.controller

import com.learningapp.api.dto.LearningRecordRequest
import com.learningapp.api.dto.LearningRecordResponse
import com.learningapp.service.LearningRecordService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/learning")
class LearningRecordController(
    private val learningRecordService: LearningRecordService
) {
    
    @PostMapping("/progress")
    fun saveLearningProgress(
        @Valid @RequestBody request: LearningRecordRequest,
        authentication: Authentication
    ): ResponseEntity<LearningRecordResponse> {
        val userId = authentication.principal as String
        val record = learningRecordService.saveLearningProgress(userId, request)
        return ResponseEntity.ok(record)
    }
    
    @GetMapping("/records")
    fun getLearningRecords(
        @RequestParam(required = false) courseId: String?,
        authentication: Authentication
    ): ResponseEntity<List<LearningRecordResponse>> {
        val userId = authentication.principal as String
        val records = learningRecordService.getLearningRecords(userId, courseId)
        return ResponseEntity.ok(records)
    }
    
    @GetMapping("/progress/overall")
    fun getOverallProgress(
        authentication: Authentication
    ): ResponseEntity<Map<String, Double>> {
        val userId = authentication.principal as String
        val progress = learningRecordService.getOverallProgress(userId)
        return ResponseEntity.ok(progress)
    }
    
    @PostMapping("/units/{unitId}/complete")
    fun markUnitComplete(
        @PathVariable unitId: String,
        authentication: Authentication
    ): ResponseEntity<Map<String, Boolean>> {
        val userId = authentication.principal as String
        val result = learningRecordService.markUnitComplete(userId, unitId)
        return ResponseEntity.ok(mapOf("success" to result))
    }
}
