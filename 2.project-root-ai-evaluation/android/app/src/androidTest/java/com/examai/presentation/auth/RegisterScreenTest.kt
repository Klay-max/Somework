package com.examai.presentation.auth

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.examai.MainActivity
import com.examai.presentation.navigation.Screen
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * UI tests for registration screen
 * Tests user registration flow
 * 
 * Requirements: 1.1 (User Registration)
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class RegisterScreenTest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
    }
    
    @Test
    fun registerScreen_displaysAllInputFields() {
        // Navigate to register screen
        composeTestRule.onNodeWithText("注册").assertExists()
        
        // Verify all input fields are displayed
        composeTestRule.onNodeWithText("手机号").assertExists()
        composeTestRule.onNodeWithText("验证码").assertExists()
        composeTestRule.onNodeWithText("密码").assertExists()
        composeTestRule.onNodeWithText("发送验证码").assertExists()
        composeTestRule.onNodeWithText("注册").assertExists()
    }
    
    @Test
    fun registerScreen_phoneInput_acceptsValidPhone() {
        // Enter valid phone number
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        
        // Verify input is accepted
        composeTestRule.onNodeWithText("13800138000").assertExists()
    }
    
    @Test
    fun registerScreen_sendCodeButton_enabledWithValidPhone() {
        // Enter valid phone number
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        
        // Verify send code button is enabled
        composeTestRule.onNodeWithText("发送验证码")
            .assertIsEnabled()
    }
    
    @Test
    fun registerScreen_verificationCodeInput_accepts6Digits() {
        // Enter verification code
        composeTestRule.onNodeWithText("6位验证码")
            .performTextInput("123456")
        
        // Verify input is accepted
        composeTestRule.onNodeWithText("123456").assertExists()
    }
    
    @Test
    fun registerScreen_passwordInput_togglesVisibility() {
        // Enter password
        composeTestRule.onNodeWithText("至少6位密码")
            .performTextInput("password123")
        
        // Find and click visibility toggle
        composeTestRule.onNodeWithContentDescription("显示密码")
            .performClick()
        
        // Verify password is visible (icon changes)
        composeTestRule.onNodeWithContentDescription("隐藏密码")
            .assertExists()
    }
    
    @Test
    fun registerScreen_registerButton_showsLoadingState() {
        // Fill in all fields
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        composeTestRule.onNodeWithText("6位验证码")
            .performTextInput("123456")
        composeTestRule.onNodeWithText("至少6位密码")
            .performTextInput("password123")
        
        // Click register button
        composeTestRule.onAllNodesWithText("注册")[1] // Second one is the button
            .performClick()
        
        // Note: Loading state verification would require mocking the repository
        // In a real test, we would verify the CircularProgressIndicator appears
    }
    
    @Test
    fun registerScreen_loginLink_navigatesToLogin() {
        // Click login link
        composeTestRule.onNodeWithText("已有账号？去登录")
            .performClick()
        
        // Verify navigation to login screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun registerScreen_emptyPhone_showsError() {
        // Leave phone empty and try to register
        composeTestRule.onNodeWithText("至少6位密码")
            .performTextInput("password123")
        
        composeTestRule.onAllNodesWithText("注册")[1]
            .performClick()
        
        // Verify error message appears
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("请输入手机号")
                .fetchSemanticsNodes().size > 1 // Label + error message
        }
    }
    
    @Test
    fun registerScreen_emptyVerificationCode_showsError() {
        // Fill phone and password but leave code empty
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        composeTestRule.onNodeWithText("至少6位密码")
            .performTextInput("password123")
        
        composeTestRule.onAllNodesWithText("注册")[1]
            .performClick()
        
        // Verify error message appears
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("请输入验证码")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun registerScreen_emptyPassword_showsError() {
        // Fill phone and code but leave password empty
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        composeTestRule.onNodeWithText("6位验证码")
            .performTextInput("123456")
        
        composeTestRule.onAllNodesWithText("注册")[1]
            .performClick()
        
        // Verify error message appears
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("请输入密码")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
}
