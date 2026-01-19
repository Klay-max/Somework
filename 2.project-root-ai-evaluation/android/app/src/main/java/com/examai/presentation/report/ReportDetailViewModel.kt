package com.examai.presentation.report

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.examai.domain.repository.ExamRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for report detail screen
 * Manages report loading and display state
 */
@HiltViewModel
class ReportDetailViewModel @Inject constructor(
    private val examRepository: ExamRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    
    private val examId: String = checkNotNull(savedStateHandle["examId"])
    
    private val _uiState = MutableStateFlow(ReportDetailUiState())
    val uiState: StateFlow<ReportDetailUiState> = _uiState.asStateFlow()
    
    init {
        loadReport()
    }
    
    /**
     * Loads report from repository
     * Uses cached content if available, otherwise fetches from server
     */
    fun loadReport() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            
            val result = examRepository.getExamDetail(examId)
            
            result.fold(
                onSuccess = { exam ->
                    if (exam.reportUrl != null) {
                        // Try to get cached content first
                        val contentResult = examRepository.getReportContent(examId)
                        
                        contentResult.fold(
                            onSuccess = { htmlContent ->
                                _uiState.update {
                                    it.copy(
                                        reportUrl = exam.reportUrl,
                                        cachedHtmlContent = htmlContent,
                                        isCached = examRepository.isReportCached(examId),
                                        examData = ExamData(
                                            examId = exam.examId,
                                            subject = exam.subject,
                                            grade = exam.grade,
                                            score = exam.score,
                                            totalScore = exam.totalScore
                                        ),
                                        isLoading = false,
                                        errorMessage = null
                                    )
                                }
                            },
                            onFailure = { error ->
                                // Fallback to URL if cache fails
                                _uiState.update {
                                    it.copy(
                                        reportUrl = exam.reportUrl,
                                        isCached = false,
                                        examData = ExamData(
                                            examId = exam.examId,
                                            subject = exam.subject,
                                            grade = exam.grade,
                                            score = exam.score,
                                            totalScore = exam.totalScore
                                        ),
                                        isLoading = false,
                                        errorMessage = null
                                    )
                                }
                            }
                        )
                    } else {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = "报告尚未生成"
                            )
                        }
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "加载失败"
                        )
                    }
                }
            )
        }
    }
    
    /**
     * Retries loading the report
     */
    fun retry() {
        loadReport()
    }
    
    /**
     * Clears error message
     */
    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
    
    /**
     * Updates WebView loading progress
     */
    fun updateLoadingProgress(progress: Int) {
        _uiState.update { it.copy(webViewProgress = progress) }
    }
    
    /**
     * Sets WebView loading state
     */
    fun setWebViewLoading(isLoading: Boolean) {
        _uiState.update { it.copy(isWebViewLoading = isLoading) }
    }
    
    /**
     * Handles WebView error
     */
    fun onWebViewError(errorMessage: String) {
        _uiState.update { it.copy(errorMessage = errorMessage) }
    }
    
    /**
     * Shows share dialog
     */
    fun showShareDialog() {
        _uiState.update { it.copy(showShareDialog = true) }
    }
    
    /**
     * Hides share dialog
     */
    fun hideShareDialog() {
        _uiState.update { it.copy(showShareDialog = false) }
    }
}

/**
 * UI state for report detail screen
 */
data class ReportDetailUiState(
    val reportUrl: String? = null,
    val cachedHtmlContent: String? = null,
    val isCached: Boolean = false,
    val examData: ExamData? = null,
    val isLoading: Boolean = false,
    val isWebViewLoading: Boolean = false,
    val webViewProgress: Int = 0,
    val errorMessage: String? = null,
    val showShareDialog: Boolean = false
)

/**
 * Exam data for sharing
 */
data class ExamData(
    val examId: String,
    val subject: String,
    val grade: String,
    val score: Int?,
    val totalScore: Int?
)
