package com.learningapp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.learningapp.data.model.Course
import com.learningapp.data.model.CourseDetail
import com.learningapp.data.repository.CourseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CourseListUiState(
    val courses: List<Course> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val hasMore: Boolean = true,
    val currentPage: Int = 0
)

data class CourseDetailUiState(
    val courseDetail: CourseDetail? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class CourseViewModel(
    private val courseRepository: CourseRepository
) : ViewModel() {
    
    private val _courseListState = MutableStateFlow(CourseListUiState())
    val courseListState: StateFlow<CourseListUiState> = _courseListState.asStateFlow()
    
    private val _courseDetailState = MutableStateFlow(CourseDetailUiState())
    val courseDetailState: StateFlow<CourseDetailUiState> = _courseDetailState.asStateFlow()
    
    private var currentCategory: String? = null
    
    init {
        // 自动加载课程列表
        loadCourseList(refresh = true)
    }
    
    fun loadCourseList(category: String? = null, refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _courseListState.value = CourseListUiState(isLoading = true)
                currentCategory = category
            } else {
                _courseListState.value = _courseListState.value.copy(isLoading = true, error = null)
            }
            
            val page = if (refresh) 0 else _courseListState.value.currentPage
            
            courseRepository.getCourseList(
                category = category,
                status = "PUBLISHED",
                page = page,
                size = 20
            ).fold(
                onSuccess = { pageResponse ->
                    val newCourses = if (refresh) {
                        pageResponse.content
                    } else {
                        _courseListState.value.courses + pageResponse.content
                    }
                    
                    _courseListState.value = CourseListUiState(
                        courses = newCourses,
                        isLoading = false,
                        error = null,
                        hasMore = pageResponse.number < pageResponse.totalPages - 1,
                        currentPage = pageResponse.number + 1
                    )
                },
                onFailure = { exception ->
                    _courseListState.value = _courseListState.value.copy(
                        isLoading = false,
                        error = exception.message ?: "加载失败"
                    )
                }
            )
        }
    }
    
    fun loadMoreCourses() {
        if (!_courseListState.value.isLoading && _courseListState.value.hasMore) {
            loadCourseList(currentCategory, refresh = false)
        }
    }
    
    fun loadCourseDetail(courseId: String) {
        viewModelScope.launch {
            _courseDetailState.value = CourseDetailUiState(isLoading = true)
            
            courseRepository.getCourseDetail(courseId).fold(
                onSuccess = { courseDetail ->
                    _courseDetailState.value = CourseDetailUiState(
                        courseDetail = courseDetail,
                        isLoading = false,
                        error = null
                    )
                },
                onFailure = { exception ->
                    _courseDetailState.value = CourseDetailUiState(
                        isLoading = false,
                        error = exception.message ?: "加载失败"
                    )
                }
            )
        }
    }
    
    fun retryLoadCourseList() {
        loadCourseList(currentCategory, refresh = true)
    }
    
    fun retryLoadCourseDetail(courseId: String) {
        loadCourseDetail(courseId)
    }
}
