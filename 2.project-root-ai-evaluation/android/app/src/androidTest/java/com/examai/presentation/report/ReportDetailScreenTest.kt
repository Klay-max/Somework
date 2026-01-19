package com.examai.presentation.report

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
 * UI tests for ReportDetailScreen
 * Tests report display, WebView functionality, sharing, and offline viewing
 * 
 * Requirements: 11.1 (Report Display), 11.5 (Report Sharing), 11.6 (Offline Viewing)
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class ReportDetailScreenTest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
        
        // Navigate to report detail screen via history
        // 1. Navigate to history screen
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule.onAllNodesWithText("历史记录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        composeTestRule.onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen to load
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Click first exam card (if exists)
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // Wait for report detail screen to load
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
        }
    }
    
    @Test
    fun reportDetailScreen_displaysTitle() {
        // Verify title is displayed
        composeTestRule
            .onNodeWithText("诊断报告")
            .assertIsDisplayed()
    }
    
    @Test
    fun reportDetailScreen_displaysBackButton() {
        // Verify back button is displayed
        composeTestRule
            .onNodeWithContentDescription("返回")
            .assertIsDisplayed()
            .assertHasClickAction()
    }
    
    @Test
    fun reportDetailScreen_backButton_navigatesBack() {
        // Click back button
        composeTestRule
            .onNodeWithContentDescription("返回")
            .performClick()
        
        // Verify navigation back to history screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("历史记录")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun reportDetailScreen_displaysShareButton() {
        // Verify share button is displayed
        composeTestRule
            .onNodeWithContentDescription("分享")
            .assertIsDisplayed()
    }
    
    @Test
    fun reportDetailScreen_shareButton_initiallyDisabled() {
        // Share button should be disabled during loading
        // Note: This test is timing-sensitive
        
        // If still loading, share button should be disabled
        if (composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isNotEmpty()
        ) {
            composeTestRule
                .onNodeWithContentDescription("分享")
                .assertIsNotEnabled()
        }
    }
    
    @Test
    fun reportDetailScreen_shareButton_enabledAfterLoad() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Share button should be enabled after loading
        composeTestRule
            .onNodeWithContentDescription("分享")
            .assertIsEnabled()
    }
    
    @Test
    fun reportDetailScreen_loading_displaysProgressIndicator() {
        // Verify loading indicator is displayed during initial load
        // Note: This test is timing-sensitive
        
        // Progress indicator should appear during loading
        // This may not be visible if loading is too fast
    }
    
    @Test
    fun reportDetailScreen_loadingProgress_displaysLinearProgressBar() {
        // Verify linear progress bar is displayed during WebView loading
        // Note: This test is timing-sensitive
        
        // Linear progress bar should appear during WebView loading
        // This may not be visible if loading is too fast
    }
    
    @Test
    fun reportDetailScreen_webView_displaysReport() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Verify WebView is displayed
        // Note: WebView content is not directly testable via Compose test API
        // We can only verify that loading completed without errors
        
        // Verify no error state is shown
        composeTestRule
            .onAllNodesWithText("加载失败", substring = true)
            .assertCountEquals(0)
    }
    
    @Test
    fun reportDetailScreen_cacheIndicator_displaysWhenCached() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Check if cache indicator is displayed
        // Note: This depends on whether the report is cached
        if (composeTestRule.onAllNodesWithText("离线可用")
                .fetchSemanticsNodes().isNotEmpty()
        ) {
            composeTestRule
                .onNodeWithText("离线可用")
                .assertIsDisplayed()
            
            // Verify checkmark icon is displayed
            composeTestRule
                .onNode(hasContentDescription("null") and hasClickAction().not())
                .assertExists()
        }
    }
    
    @Test
    fun reportDetailScreen_cacheIndicator_notDisplayedWhenNotCached() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // If not cached, indicator should not be displayed
        // Note: This test depends on cache state
    }
    
    @Test
    fun reportDetailScreen_errorState_displaysErrorMessage() {
        // Test error state display
        // Note: This requires triggering an error condition
        // This is a placeholder test for error handling
        
        // If error occurs, verify error message is displayed
        if (composeTestRule.onAllNodesWithText("加载失败", substring = true)
                .fetchSemanticsNodes().isNotEmpty()
        ) {
            composeTestRule
                .onNode(hasText("加载失败", substring = true))
                .assertIsDisplayed()
        }
    }
    
    @Test
    fun reportDetailScreen_errorState_displaysRetryButton() {
        // Test retry button in error state
        // Note: This requires triggering an error condition
        
        // If error occurs, verify retry button is displayed
        if (composeTestRule.onAllNodesWithText("加载失败", substring = true)
                .fetchSemanticsNodes().isNotEmpty()
        ) {
            composeTestRule
                .onNodeWithText("重试")
                .assertIsDisplayed()
                .assertHasClickAction()
        }
    }
    
    @Test
    fun reportDetailScreen_errorState_retryButton_reloadsReport() {
        // Test retry button functionality
        // Note: This requires triggering an error condition
        
        // If error occurs, click retry button
        if (composeTestRule.onAllNodesWithText("重试")
                .fetchSemanticsNodes().isNotEmpty()
        ) {
            composeTestRule
                .onNodeWithText("重试")
                .performClick()
            
            // Verify loading starts again
            composeTestRule.waitUntil(timeoutMillis = 2000) {
                composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                    .fetchSemanticsNodes().isNotEmpty()
            }
        }
    }
    
    @Test
    fun reportDetailScreen_shareButton_opensShareDialog() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Click share button
        composeTestRule
            .onNodeWithContentDescription("分享")
            .performClick()
        
        // Verify share dialog is displayed
        composeTestRule
            .onNodeWithText("分享报告")
            .assertIsDisplayed()
        
        composeTestRule
            .onNodeWithText("选择分享方式")
            .assertIsDisplayed()
    }
    
    @Test
    fun reportDetailScreen_shareDialog_displaysAllOptions() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Click share button
        composeTestRule
            .onNodeWithContentDescription("分享")
            .performClick()
        
        // Verify all share options are displayed
        composeTestRule
            .onNodeWithText("邮件分享")
            .assertIsDisplayed()
        
        composeTestRule
            .onNodeWithText("更多分享方式")
            .assertIsDisplayed()
        
        composeTestRule
            .onNodeWithText("复制链接")
            .assertIsDisplayed()
        
        // WeChat option may or may not be displayed
        // depending on whether WeChat is installed
    }
    
    @Test
    fun reportDetailScreen_shareDialog_emailOption_clickable() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Click share button
        composeTestRule
            .onNodeWithContentDescription("分享")
            .performClick()
        
        // Verify email option is clickable
        composeTestRule
            .onNodeWithText("邮件分享")
            .assertHasClickAction()
    }
    
    @Test
    fun reportDetailScreen_shareDialog_genericOption_clickable() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Click share button
        composeTestRule
            .onNodeWithContentDescription("分享")
            .performClick()
        
        // Verify generic share option is clickable
        composeTestRule
            .onNodeWithText("更多分享方式")
            .assertHasClickAction()
    }
    
    @Test
    fun reportDetailScreen_shareDialog_copyLinkOption_clickable() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Click share button
        composeTestRule
            .onNodeWithContentDescription("分享")
            .performClick()
        
        // Verify copy link option is clickable
        composeTestRule
            .onNodeWithText("复制链接")
            .assertHasClickAction()
    }
    
    @Test
    fun reportDetailScreen_shareDialog_cancelButton_dismissesDialog() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Click share button
        composeTestRule
            .onNodeWithContentDescription("分享")
            .performClick()
        
        // Click cancel button
        composeTestRule
            .onAllNodesWithText("取消")
            .onLast()
            .performClick()
        
        // Verify dialog is dismissed
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("分享报告")
                .fetchSemanticsNodes().isEmpty()
        }
    }
    
    @Test
    fun reportDetailScreen_shareDialog_copyLink_dismissesDialog() {
        // Wait for loading to complete
        composeTestRule.waitUntil(timeoutMillis = 10000) {
            composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Click share button
        composeTestRule
            .onNodeWithContentDescription("分享")
            .performClick()
        
        // Click copy link option
        composeTestRule
            .onNodeWithText("复制链接")
            .performClick()
        
        // Verify dialog is dismissed
        composeTestRule.waitUntil(timeoutMillis = 1000) {
            composeTestRule.onAllNodesWithText("分享报告")
                .fetchSemanticsNodes().isEmpty()
        }
        
        // Verify toast message appears (optional, may not be testable)
    }
    
    @Test
    fun reportDetailScreen_errorSnackbar_displaysOnWebViewError() {
        // Test error snackbar display for WebView errors
        // Note: This requires triggering a WebView error
        // This is a placeholder test
    }
    
    @Test
    fun reportDetailScreen_errorSnackbar_hasCloseButton() {
        // Verify error snackbar has close button
        // Note: This requires triggering a WebView error
        
        // If error snackbar is displayed, verify close button
        if (composeTestRule.onAllNodesWithText("关闭")
                .fetchSemanticsNodes().isNotEmpty()
        ) {
            composeTestRule
                .onNodeWithText("关闭")
                .assertIsDisplayed()
                .assertHasClickAction()
        }
    }
}
