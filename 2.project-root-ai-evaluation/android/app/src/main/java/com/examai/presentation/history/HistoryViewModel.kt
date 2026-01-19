package com.examai.presentation.history

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.examai.domain.model.Exam
import com.examai.domain.repository.ExamRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for history screen
 * Manages exam history list and pagination
 */
@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val examRepository: ExamRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(HistoryUiState())
    val uiState: StateFlow<HistoryUiState> = _uiState.asStateFlow()
    
    init {
        loadHistory()
    }
    
    /**
     * Loads exam history from repository
     */
    fun loadHistory(refresh: Boolean = false) {
        if (_uiState.value.isLoading) return
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            
            val currentPage = if (refresh) 1 else _uiState.value.currentPage
            
            val result = examRepository.getExamHistory(
                page = currentPage,
                pageSize = 20
            )
            
            result.fold(
                onSuccess = { exams ->
                    _uiState.update {
                        it.copy(
                            exams = if (refresh) exams else it.exams + exams,
                            isLoading = false,
                            isRefreshing = false,
                            currentPage = currentPage,
                            hasMore = exams.size >= 20,
                            errorMessage = null
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isRefreshing = false,
                            errorMessage = error.message ?: "加载失败"
                        )
                    }
                }
            )
        }
    }
    
    /**
     * Refreshes the exam history
     */
    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true, currentPage = 1) }
        loadHistory(refresh = true)
    }
    
    /**
     * Loads more exams (pagination)
     */
    fun loadMore() {
        if (_uiState.value.hasMore && !_uiState.value.isLoading) {
            _uiState.update { it.copy(currentPage = it.currentPage + 1) }
            loadHistory()
        }
    }
    
    /**
     * Deletes an exam
     */
    fun deleteExam(examId: String) {
        viewModelScope.launch {
            val result = examRepository.deleteExam(examId)
            
            result.fold(
                onSuccess = {
                    // Remove from local list
                    _uiState.update {
                        it.copy(
                            exams = it.exams.filter { exam -> exam.examId != examId }
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(errorMessage = error.message ?: "删除失败")
                    }
                }
            )
        }
    }
    
    /**
     * Clears error message
     */
    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}

/**
 * UI state for history screen
 */
data class HistoryUiState(
    val exams: List<Exam> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val currentPage: Int = 1,
    val hasMore: Boolean = true,
    val errorMessage: String? = null
)
