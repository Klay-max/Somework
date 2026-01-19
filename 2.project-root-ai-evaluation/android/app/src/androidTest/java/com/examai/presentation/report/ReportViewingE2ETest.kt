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
 * End-to-end tests for report viewing functionality
 * Tests complete user flows from history to report viewing and sharing
 * 
 * Requirements: 11.1, 11.5, 11.6, 12.1, 12.2 (Complete Report Viewing Flow)
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class ReportViewingE2ETest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
        
        // Wait for app to load
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule.onAllNodesWithText("历史记录")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun completeFlow_historyToReportDetail() {
        // Test complete flow: Home -> History -> Report Detail
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen to load
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Verify history screen is displayed
        composeTestRule
            .onNodeWithText("历史记录")
            .assertIsDisplayed()
        
        // 4. Skip if no exams
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // 5. Click first exam card
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // 6. Wait for report detail screen to load
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 7. Verify report detail screen is displayed
            composeTestRule
                .onNodeWithText("诊断报告")
                .assertIsDisplayed()
            
            // 8. Wait for report to load
            composeTestRule.waitUntil(timeoutMillis = 10000) {
                composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                    .fetchSemanticsNodes().isEmpty()
            }
            
            // 9. Verify share button is enabled
            composeTestRule
                .onNodeWithContentDescription("分享")
                .assertIsEnabled()
        }
    }
    
    @Test
    fun completeFlow_historyToReportDetailAndBack() {
        // Test complete flow with navigation back
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Skip if no exams
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // 4. Click first exam card
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // 5. Wait for report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 6. Click back button
            composeTestRule
                .onNodeWithContentDescription("返回")
                .performClick()
            
            // 7. Verify back to history screen
            composeTestRule.waitUntil(timeoutMillis = 2000) {
                composeTestRule.onAllNodesWithText("历史记录")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 8. Click back again to home
            composeTestRule
                .onNodeWithContentDescription("返回")
                .performClick()
            
            // 9. Verify back to home screen
            composeTestRule.waitUntil(timeoutMillis = 2000) {
                composeTestRule.onAllNodesWithText("首页")
                    .fetchSemanticsNodes().isNotEmpty()
            }
        }
    }
    
    @Test
    fun completeFlow_reportDetailToShare() {
        // Test complete flow: History -> Report Detail -> Share Dialog
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Skip if no exams
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // 4. Click first exam card
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // 5. Wait for report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 6. Wait for report to load
            composeTestRule.waitUntil(timeoutMillis = 10000) {
                composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                    .fetchSemanticsNodes().isEmpty()
            }
            
            // 7. Click share button
            composeTestRule
                .onNodeWithContentDescription("分享")
                .performClick()
            
            // 8. Verify share dialog is displayed
            composeTestRule
                .onNodeWithText("分享报告")
                .assertIsDisplayed()
            
            // 9. Verify all share options are displayed
            composeTestRule
                .onNodeWithText("邮件分享")
                .assertIsDisplayed()
            
            composeTestRule
                .onNodeWithText("更多分享方式")
                .assertIsDisplayed()
            
            composeTestRule
                .onNodeWithText("复制链接")
                .assertIsDisplayed()
        }
    }
    
    @Test
    fun completeFlow_shareViaCopyLink() {
        // Test complete share flow using copy link option
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Skip if no exams
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // 4. Click first exam card
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // 5. Wait for report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 6. Wait for report to load
            composeTestRule.waitUntil(timeoutMillis = 10000) {
                composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                    .fetchSemanticsNodes().isEmpty()
            }
            
            // 7. Click share button
            composeTestRule
                .onNodeWithContentDescription("分享")
                .performClick()
            
            // 8. Click copy link option
            composeTestRule
                .onNodeWithText("复制链接")
                .performClick()
            
            // 9. Verify dialog is dismissed
            composeTestRule.waitUntil(timeoutMillis = 1000) {
                composeTestRule.onAllNodesWithText("分享报告")
                    .fetchSemanticsNodes().isEmpty()
            }
            
            // 10. Verify still on report detail screen
            composeTestRule
                .onNodeWithText("诊断报告")
                .assertIsDisplayed()
        }
    }
    
    @Test
    fun completeFlow_deleteExamFromHistory() {
        // Test complete delete flow
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Skip if no exams
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // 4. Get initial exam count
            val initialCount = composeTestRule
                .onAllNodesWithContentDescription("删除")
                .fetchSemanticsNodes().size
            
            // 5. Click delete button on first exam
            composeTestRule
                .onAllNodesWithContentDescription("删除")
                .onFirst()
                .performClick()
            
            // 6. Verify confirmation dialog appears
            composeTestRule
                .onNodeWithText("确认删除")
                .assertIsDisplayed()
            
            // 7. Click confirm button
            composeTestRule
                .onAllNodesWithText("删除")
                .onLast()
                .performClick()
            
            // 8. Wait for deletion to complete
            composeTestRule.waitUntil(timeoutMillis = 2000) {
                val currentCount = composeTestRule
                    .onAllNodesWithContentDescription("删除")
                    .fetchSemanticsNodes().size
                currentCount < initialCount || currentCount == 0
            }
            
            // 9. Verify exam is removed from list
            val finalCount = composeTestRule
                .onAllNodesWithContentDescription("删除")
                .fetchSemanticsNodes().size
            
            assert(finalCount < initialCount || finalCount == 0) {
                "Exam was not deleted"
            }
        }
    }
    
    @Test
    fun completeFlow_offlineViewing() {
        // Test offline viewing with cached reports
        // Note: This test requires a cached report
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Skip if no exams
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // 4. Click first exam card
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // 5. Wait for report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 6. Wait for report to load
            composeTestRule.waitUntil(timeoutMillis = 10000) {
                composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                    .fetchSemanticsNodes().isEmpty()
            }
            
            // 7. Check if cache indicator is displayed
            if (composeTestRule.onAllNodesWithText("离线可用")
                    .fetchSemanticsNodes().isNotEmpty()
            ) {
                // 8. Verify cache indicator is displayed
                composeTestRule
                    .onNodeWithText("离线可用")
                    .assertIsDisplayed()
                
                // 9. Verify report is displayed (no error)
                composeTestRule
                    .onAllNodesWithText("加载失败", substring = true)
                    .assertCountEquals(0)
                
                // 10. Verify share button is enabled
                composeTestRule
                    .onNodeWithContentDescription("分享")
                    .assertIsEnabled()
            }
        }
    }
    
    @Test
    fun completeFlow_multipleExamsNavigation() {
        // Test navigating between multiple exams
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Check if multiple exams exist
        val examCount = composeTestRule
            .onAllNodesWithContentDescription("删除")
            .fetchSemanticsNodes().size
        
        if (examCount >= 2) {
            // 4. Click first exam
            composeTestRule
                .onAllNodes(hasText(" - ", substring = true))
                .onFirst()
                .performClick()
            
            // 5. Wait for report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 6. Go back to history
            composeTestRule
                .onNodeWithContentDescription("返回")
                .performClick()
            
            // 7. Wait for history screen
            composeTestRule.waitUntil(timeoutMillis = 2000) {
                composeTestRule.onAllNodesWithText("历史记录")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 8. Click second exam
            composeTestRule
                .onAllNodes(hasText(" - ", substring = true))
                .get(1)
                .performClick()
            
            // 9. Wait for report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 10. Verify report detail screen is displayed
            composeTestRule
                .onNodeWithText("诊断报告")
                .assertIsDisplayed()
        }
    }
    
    @Test
    fun completeFlow_shareDialogCancelAndRetry() {
        // Test opening and closing share dialog multiple times
        
        // 1. Navigate to history screen
        composeTestRule
            .onNodeWithText("历史记录")
            .performClick()
        
        // 2. Wait for history screen
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // 3. Skip if no exams
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // 4. Click first exam card
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // 5. Wait for report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
            
            // 6. Wait for report to load
            composeTestRule.waitUntil(timeoutMillis = 10000) {
                composeTestRule.onAllNodes(hasProgressBarRangeInfo(ProgressBarRangeInfo.Indeterminate))
                    .fetchSemanticsNodes().isEmpty()
            }
            
            // 7. Click share button
            composeTestRule
                .onNodeWithContentDescription("分享")
                .performClick()
            
            // 8. Verify dialog is displayed
            composeTestRule
                .onNodeWithText("分享报告")
                .assertIsDisplayed()
            
            // 9. Click cancel
            composeTestRule
                .onAllNodesWithText("取消")
                .onLast()
                .performClick()
            
            // 10. Verify dialog is dismissed
            composeTestRule.waitUntil(timeoutMillis = 1000) {
                composeTestRule.onAllNodesWithText("分享报告")
                    .fetchSemanticsNodes().isEmpty()
            }
            
            // 11. Click share button again
            composeTestRule
                .onNodeWithContentDescription("分享")
                .performClick()
            
            // 12. Verify dialog is displayed again
            composeTestRule
                .onNodeWithText("分享报告")
                .assertIsDisplayed()
        }
    }
}
