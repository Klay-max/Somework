package com.examai.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.examai.data.local.TokenExpiryManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for home screen
 * Handles token expiry events
 */
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val tokenExpiryManager: TokenExpiryManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    
    init {
        // Listen for token expiry events
        viewModelScope.launch {
            tokenExpiryManager.tokenExpiredEvents.collect {
                _uiState.update { 
                    it.copy(
                        showTokenExpiredDialog = true,
                        isTokenExpired = true
                    )
                }
            }
        }
    }
    
    /**
     * Dismiss token expired dialog
     */
    fun onDismissTokenExpiredDialog() {
        _uiState.update { it.copy(showTokenExpiredDialog = false) }
    }
    
    /**
     * Confirm token expired and navigate to login
     */
    fun onConfirmTokenExpired() {
        _uiState.update { 
            it.copy(
                showTokenExpiredDialog = false,
                isTokenExpired = true
            )
        }
    }
}

/**
 * UI state for home screen
 */
data class HomeUiState(
    val showTokenExpiredDialog: Boolean = false,
    val isTokenExpired: Boolean = false
)
