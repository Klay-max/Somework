package com.examai.presentation.auth.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.examai.domain.usecase.RegisterUseCase
import com.examai.domain.usecase.SendVerificationCodeUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * ViewModel for registration screen
 * Manages registration state and business logic
 */
@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val registerUseCase: RegisterUseCase,
    private val sendVerificationCodeUseCase: SendVerificationCodeUseCase
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()
    
    private var countdownJob: Job? = null
    
    /**
     * Update phone number
     */
    fun onPhoneChanged(phone: String) {
        _uiState.update { it.copy(phone = phone, errorMessage = null) }
    }
    
    /**
     * Update password
     */
    fun onPasswordChanged(password: String) {
        _uiState.update { it.copy(password = password, errorMessage = null) }
    }
    
    /**
     * Update verification code
     */
    fun onVerificationCodeChanged(code: String) {
        _uiState.update { it.copy(verificationCode = code, errorMessage = null) }
    }
    
    /**
     * Toggle password visibility
     */
    fun onPasswordVisibilityToggled() {
        _uiState.update { it.copy(isPasswordVisible = !it.isPasswordVisible) }
    }
    
    /**
     * Send verification code
     */
    fun onSendCodeClicked() {
        val phone = _uiState.value.phone
        
        if (phone.isBlank()) {
            _uiState.update { it.copy(errorMessage = "请输入手机号") }
            return
        }
        
        viewModelScope.launch {
            _uiState.update { it.copy(isSendingCode = true, errorMessage = null) }
            
            sendVerificationCodeUseCase(phone)
                .onSuccess { expiresIn ->
                    _uiState.update { 
                        it.copy(
                            isSendingCode = false,
                            isCodeSent = true,
                            codeCountdown = expiresIn
                        )
                    }
                    startCountdown(expiresIn)
                }
                .onFailure { error ->
                    _uiState.update { 
                        it.copy(
                            isSendingCode = false,
                            errorMessage = error.message ?: "发送验证码失败"
                        )
                    }
                }
        }
    }
    
    /**
     * Register user
     */
    fun onRegisterClicked() {
        val state = _uiState.value
        
        // Validate inputs
        if (state.phone.isBlank()) {
            _uiState.update { it.copy(errorMessage = "请输入手机号") }
            return
        }
        
        if (state.password.isBlank()) {
            _uiState.update { it.copy(errorMessage = "请输入密码") }
            return
        }
        
        if (state.verificationCode.isBlank()) {
            _uiState.update { it.copy(errorMessage = "请输入验证码") }
            return
        }
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            
            registerUseCase(
                phone = state.phone,
                password = state.password,
                verificationCode = state.verificationCode
            )
                .onSuccess { authResult ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            isRegisterSuccessful = true
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update { 
                        it.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "注册失败"
                        )
                    }
                }
        }
    }
    
    /**
     * Start countdown timer for verification code
     */
    private fun startCountdown(seconds: Int) {
        countdownJob?.cancel()
        countdownJob = viewModelScope.launch {
            var remaining = seconds
            while (remaining > 0) {
                delay(1000)
                remaining--
                _uiState.update { it.copy(codeCountdown = remaining) }
            }
            _uiState.update { it.copy(isCodeSent = false, codeCountdown = 0) }
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        countdownJob?.cancel()
    }
}

/**
 * UI state for registration screen
 */
data class RegisterUiState(
    val phone: String = "",
    val password: String = "",
    val verificationCode: String = "",
    val isPasswordVisible: Boolean = false,
    val isLoading: Boolean = false,
    val isSendingCode: Boolean = false,
    val isCodeSent: Boolean = false,
    val codeCountdown: Int = 0,
    val isRegisterSuccessful: Boolean = false,
    val errorMessage: String? = null
)
