package com.learningapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.learningapp.data.model.LearningUnit
import com.learningapp.data.repository.CourseRepository
import com.learningapp.data.repository.LearningRecordRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class LearningUiState(
    val units: List<LearningUnit> = emptyList(),
    val currentUnitIndex: Int = 0,
    val currentUnit: LearningUnit? = null,
    val progress: Int = 0,
    val lastPosition: Int? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class LearningViewModel(
    private val courseRepository: CourseRepository,
    private val learningRecordRepository: LearningRecordRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(LearningUiState())
    val uiState: StateFlow<LearningUiState> = _uiState.asStateFlow()
    
    private var courseId: String = ""
    
    fun loadCourseUnits(courseId: String, startUnitId: String? = null) {
        this.courseId = courseId
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            courseRepository.getLearningUnits(courseId).fold(
                onSuccess = { units ->
                    val sortedUnits = units.sortedBy { it.order }
                    val startIndex = if (startUnitId != null) {
                        sortedUnits.indexOfFirst { it.id == startUnitId }.takeIf { it >= 0 } ?: 0
                    } else {
                        0
                    }
                    
                    _uiState.value = LearningUiState(
                        units = sortedUnits,
                        currentUnitIndex = startIndex,
                        currentUnit = sortedUnits.getOrNull(startIndex),
                        isLoading = false
                    )
                    
                    // 加载进度
                    loadProgress()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "加载失败"
                    )
                }
            )
        }
    }
    
    private fun loadProgress() {
        val currentUnit = _uiState.value.currentUnit ?: return
        
        viewModelScope.launch {
            learningRecordRepository.getLearningRecords(courseId).fold(
                onSuccess = { records ->
                    val record = records.find { it.unitId == currentUnit.id }
                    _uiState.value = _uiState.value.copy(
                        progress = record?.progress ?: 0,
                        lastPosition = record?.lastPosition
                    )
                },
                onFailure = { }
            )
        }
    }
    
    fun saveProgress(progress: Int, lastPosition: Int? = null) {
        val currentUnit = _uiState.value.currentUnit ?: return
        
        viewModelScope.launch {
            learningRecordRepository.saveLearningProgress(
                courseId = courseId,
                unitId = currentUnit.id,
                progress = progress,
                lastPosition = lastPosition
            )
            
            _uiState.value = _uiState.value.copy(
                progress = progress,
                lastPosition = lastPosition
            )
        }
    }
    
    fun markCurrentUnitComplete() {
        val currentUnit = _uiState.value.currentUnit ?: return
        
        viewModelScope.launch {
            learningRecordRepository.saveLearningProgress(
                courseId = courseId,
                unitId = currentUnit.id,
                progress = 100
            )
            
            learningRecordRepository.markUnitComplete(currentUnit.id)
            
            _uiState.value = _uiState.value.copy(progress = 100)
        }
    }
    
    fun goToNextUnit() {
        val nextIndex = _uiState.value.currentUnitIndex + 1
        if (nextIndex < _uiState.value.units.size) {
            _uiState.value = _uiState.value.copy(
                currentUnitIndex = nextIndex,
                currentUnit = _uiState.value.units[nextIndex],
                progress = 0,
                lastPosition = null
            )
            loadProgress()
        }
    }
    
    fun goToPreviousUnit() {
        val prevIndex = _uiState.value.currentUnitIndex - 1
        if (prevIndex >= 0) {
            _uiState.value = _uiState.value.copy(
                currentUnitIndex = prevIndex,
                currentUnit = _uiState.value.units[prevIndex],
                progress = 0,
                lastPosition = null
            )
            loadProgress()
        }
    }
    
    fun hasNextUnit(): Boolean {
        return _uiState.value.currentUnitIndex < _uiState.value.units.size - 1
    }
    
    fun hasPreviousUnit(): Boolean {
        return _uiState.value.currentUnitIndex > 0
    }
}
