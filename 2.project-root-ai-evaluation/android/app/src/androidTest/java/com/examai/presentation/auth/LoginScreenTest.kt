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
 * UI tests for login screen
 * Tests user login flow
 * 
 * Requirements: 1.3 (User Login)
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class LoginScreenTest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
        
        // Navigate to login screen from splash
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithText("登录")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun loginScreen_displaysAllInputFields() {
        // Verify all input fields are displayed
        composeTestRule.onNodeWithText("欢迎回来").assertExists()
        composeTestRule.onNodeWithText("手机号").assertExists()
        composeTestRule.onNodeWithText("密码").assertExists()
        composeTestRule.onNodeWithText("登录").assertExists()
        composeTestRule.onNodeWithText("还没有账号？去注册").assertExists()
    }
    
    @Test
    fun loginScreen_phoneInput_acceptsValidPhone() {
        // Enter valid phone number
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        
        // Verify input is accepted
        composeTestRule.onNodeWithText("13800138000").assertExists()
    }
    
    @Test
    fun loginScreen_passwordInput_acceptsPassword() {
        // Enter password
        composeTestRule.onNodeWithText("请输入密码")
            .performTextInput("password123")
        
        // Password should be hidden by default
        // We can't directly verify the masked text, but we can verify the field exists
        composeTestRule.onNodeWithText("请输入密码").assertExists()
    }
    
    @Test
    fun loginScreen_passwordInput_togglesVisibility() {
        // Enter password
        composeTestRule.onNodeWithText("请输入密码")
            .performTextInput("password123")
        
        // Find and click visibility toggle
        composeTestRule.onNodeWithContentDescription("显示密码")
            .performClick()
        
        // Verify password visibility icon changes
        composeTestRule.onNodeWithContentDescription("隐藏密码")
            .assertExists()
        
        // Click again to hide
        composeTestRule.onNodeWithContentDescription("隐藏密码")
            .performClick()
        
        // Verify icon changes back
        composeTestRule.onNodeWithContentDescription("显示密码")
            .assertExists()
    }
    
    @Test
    fun loginScreen_loginButton_clickable() {
        // Fill in credentials
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        composeTestRule.onNodeWithText("请输入密码")
            .performTextInput("password123")
        
        // Click login button
        composeTestRule.onAllNodesWithText("登录")[1] // Second one is the button
            .performClick()
        
        // Note: Actual login would require mocking the repository
    }
    
    @Test
    fun loginScreen_registerLink_navigatesToRegister() {
        // Click register link
        composeTestRule.onNodeWithText("还没有账号？去注册")
            .performClick()
        
        // Verify navigation to register screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("注册")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun loginScreen_emptyPhone_showsError() {
        // Leave phone empty and try to login
        composeTestRule.onNodeWithText("请输入密码")
            .performTextInput("password123")
        
        composeTestRule.onAllNodesWithText("登录")[1]
            .performClick()
        
        // Verify error message appears
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("请输入手机号")
                .fetchSemanticsNodes().size > 1 // Label + error message
        }
    }
    
    @Test
    fun loginScreen_emptyPassword_showsError() {
        // Fill phone but leave password empty
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        
        composeTestRule.onAllNodesWithText("登录")[1]
            .performClick()
        
        // Verify error message appears
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("请输入密码")
                .fetchSemanticsNodes().size > 1 // Label + error message
        }
    }
    
    @Test
    fun loginScreen_bothFieldsEmpty_showsError() {
        // Try to login with empty fields
        composeTestRule.onAllNodesWithText("登录")[1]
            .performClick()
        
        // Verify error message appears
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("请输入手机号")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun loginScreen_inputFields_clearOnError() {
        // Fill in credentials
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13800138000")
        composeTestRule.onNodeWithText("请输入密码")
            .performTextInput("wrongpassword")
        
        // Click login
        composeTestRule.onAllNodesWithText("登录")[1]
            .performClick()
        
        // After error, user should be able to modify input
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextClearance()
        composeTestRule.onNodeWithText("请输入11位手机号")
            .performTextInput("13900139000")
        
        // Verify new input is accepted
        composeTestRule.onNodeWithText("13900139000").assertExists()
    }
}
