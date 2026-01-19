package com.examai.presentation.auth

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.examai.MainActivity
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * End-to-end tests for authentication flow
 * Tests complete user journey from splash to login/register
 * 
 * Requirements: 1.1, 1.3 (Complete Auth Flow)
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class AuthFlowE2ETest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
    }
    
    @Test
    fun authFlow_splashToLogin_navigation() {
        // Wait for splash screen
        composeTestRule.onNodeWithText("AI 试卷测评").assertExists()
        
        // Wait for navigation to login (no valid token)
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Verify we're on login screen
        composeTestRule.onNodeWithText("欢迎回来").assertExists()
    }
    
    @Test
    fun authFlow_loginToRegister_navigation() {
        // Wait for login screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Click register link
        composeTestRule.onNodeWithText("还没有账号？去注册")
            .performClick()
        
        // Verify navigation to register screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("注册")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Verify we're on register screen
        composeTestRule.onNodeWithText("创建账号").assertExists()
    }
    
    @Test
    fun authFlow_registerToLogin_navigation() {
        // Navigate to register screen first
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        composeTestRule.onNodeWithText("还没有账号？去注册")
            .performClick()
        
        // Wait for register screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("注册")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Click login link
        composeTestRule.onNodeWithText("已有账号？去登录")
            .performClick()
        
        // Verify navigation back to login screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onNodeWithText("欢迎回来")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun authFlow_completeRegistration_flow() {
        // Navigate to register screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        composeTestRule.onNodeWithText("还没有账号？去注册")
            .performClick()
        
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("注册")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Fill in registration form
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        
        // Click send code button
        composeTestRule.onNodeWithText("发送验证码")
            .performClick()
        
        // Wait for countdown to start (button should show countdown)
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("发送验证码")
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Enter verification code
        composeTestRule.onNodeWithText("6位验证码")
            .performTextInput("123456")
        
        // Enter password
        composeTestRule.onNodeWithText("至少6位密码")
            .performTextInput("password123")
        
        // Click register button
        composeTestRule.onAllNodesWithText("注册")[1]
            .performClick()
        
        // Note: Actual registration would require mocking the API
        // In a real test, we would verify navigation to home screen
    }
    
    @Test
    fun authFlow_completeLogin_flow() {
        // Wait for login screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Fill in login form
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        
        composeTestRule.onNodeWithText("请输入密码")
            .performTextInput("password123")
        
        // Click login button
        composeTestRule.onAllNodesWithText("登录")[1]
            .performClick()
        
        // Note: Actual login would require mocking the API
        // In a real test, we would verify navigation to home screen
    }
    
    @Test
    fun authFlow_backNavigation_works() {
        // Navigate to register screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        composeTestRule.onNodeWithText("还没有账号？去注册")
            .performClick()
        
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("注册")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Navigate back to login
        composeTestRule.onNodeWithText("已有账号？去登录")
            .performClick()
        
        // Verify we're back on login screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onNodeWithText("欢迎回来")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Navigate to register again
        composeTestRule.onNodeWithText("还没有账号？去注册")
            .performClick()
        
        // Verify we're on register screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onNodeWithText("创建账号")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
}
