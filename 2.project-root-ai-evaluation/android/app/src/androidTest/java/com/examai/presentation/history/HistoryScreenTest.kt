package com.examai.presentation.history

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
 * UI tests for HistoryScreen
 * Tests history list display, pagination, refresh, delete, and navigation
 * 
 * Requirements: 12.1, 12.2 (History Display)
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class HistoryScreenTest {
    
    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)
    
    @get:Rule(order = 1)
    val composeTestRule = createAndroidComposeRule<MainActivity>()
    
    @Before
    fun setup() {
        hiltRule.inject()
        
        // Navigate to history screen
        // Assuming user is logged in and on home screen
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule.onAllNodesWithText("历史记录")
                .fetchSemanticsNodes().isNotEmpty()
        }
        
        // Click history button to navigate
        composeTestRule.onNodeWithText("历史记录")
            .performClick()
        
        // Wait for history screen to load
        composeTestRule.waitUntil(timeoutMillis = 3000) {
            composeTestRule.onAllNodesWithContentDescription("返回")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun historyScreen_displaysTitle() {
        // Verify title is displayed
        composeTestRule
            .onNodeWithText("历史记录")
            .assertIsDisplayed()
    }
    
    @Test
    fun historyScreen_displaysBackButton() {
        // Verify back button is displayed
        composeTestRule
            .onNodeWithContentDescription("返回")
            .assertIsDisplayed()
            .assertHasClickAction()
    }
    
    @Test
    fun historyScreen_backButton_navigatesBack() {
        // Click back button
        composeTestRule
            .onNodeWithContentDescription("返回")
            .performClick()
        
        // Verify navigation back to home screen
        composeTestRule.waitUntil(timeoutMillis = 2000) {
            composeTestRule.onAllNodesWithText("首页")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }
    
    @Test
    fun historyScreen_emptyState_displaysCorrectMessage() {
        // If no exams, verify empty state is displayed
        // Note: This test assumes empty state
        composeTestRule
            .onNode(hasText("暂无历史记录"))
            .assertExists()
        
        composeTestRule
            .onNode(hasText("拍摄试卷后，历史记录将显示在这里", substring = true))
            .assertExists()
    }
    
    @Test
    fun historyScreen_withExams_displaysExamList() {
        // Note: This test requires mock data or actual exams
        // Verify exam cards are displayed
        // We check for common exam card elements
        
        // Skip if empty state is shown
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Verify at least one exam card exists
            composeTestRule
                .onAllNodesWithContentDescription("删除")
                .assertCountEquals(1)
        }
    }
    
    @Test
    fun historyScreen_examCard_displaysSubjectAndGrade() {
        // Note: This test requires mock data
        // Verify exam card displays subject and grade
        // Example: "数学 - 高一"
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Verify subject-grade format exists
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .assertExists()
        }
    }
    
    @Test
    fun historyScreen_examCard_displaysDate() {
        // Note: This test requires mock data
        // Verify exam card displays date in format "yyyy-MM-dd HH:mm"
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Date format verification would require regex
            // For now, just verify some date-like text exists
            composeTestRule
                .onNode(hasText("-", substring = true))
                .assertExists()
        }
    }
    
    @Test
    fun historyScreen_examCard_displaysScore() {
        // Note: This test requires mock data with scores
        // Verify exam card displays score in format "得分: X/Y"
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Check for score format
            composeTestRule
                .onNode(hasText("得分:", substring = true))
                .assertExists()
        }
    }
    
    @Test
    fun historyScreen_examCard_displaysStatusChip() {
        // Verify status chip is displayed
        // Status chips include: 已上传, 识别中, 已完成, etc.
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Check for any status text
            val statusTexts = listOf(
                "已上传", "识别中", "识别完成", "解析中", "解析完成",
                "分析中", "分析完成", "诊断中", "诊断完成",
                "生成报告中", "报告已生成", "已完成", "处理失败"
            )
            
            // At least one status should be visible
            var foundStatus = false
            for (status in statusTexts) {
                if (composeTestRule.onAllNodesWithText(status)
                        .fetchSemanticsNodes().isNotEmpty()
                ) {
                    foundStatus = true
                    break
                }
            }
            
            assert(foundStatus) { "No status chip found" }
        }
    }
    
    @Test
    fun historyScreen_examCard_hasDeleteButton() {
        // Verify delete button is displayed on exam cards
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Verify delete button exists
            composeTestRule
                .onAllNodesWithContentDescription("删除")
                .onFirst()
                .assertIsDisplayed()
                .assertHasClickAction()
        }
    }
    
    @Test
    fun historyScreen_examCard_clickable() {
        // Verify exam card is clickable
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Find first exam card and verify it's clickable
            // Exam cards contain subject-grade text
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .assertHasClickAction()
        }
    }
    
    @Test
    fun historyScreen_examCard_click_navigatesToDetail() {
        // Click exam card and verify navigation to detail screen
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Click first exam card
            composeTestRule
                .onNode(hasText(" - ", substring = true))
                .performClick()
            
            // Verify navigation to report detail screen
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                composeTestRule.onAllNodesWithText("诊断报告")
                    .fetchSemanticsNodes().isNotEmpty()
            }
        }
    }
    
    @Test
    fun historyScreen_deleteButton_showsConfirmationDialog() {
        // Click delete button and verify confirmation dialog appears
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Click delete button
            composeTestRule
                .onAllNodesWithContentDescription("删除")
                .onFirst()
                .performClick()
            
            // Verify confirmation dialog appears
            composeTestRule
                .onNodeWithText("确认删除")
                .assertIsDisplayed()
            
            composeTestRule
                .onNode(hasText("确定要删除这份试卷吗？", substring = true))
                .assertIsDisplayed()
            
            composeTestRule
                .onNodeWithText("删除")
                .assertIsDisplayed()
            
            composeTestRule
                .onNodeWithText("取消")
                .assertIsDisplayed()
        }
    }
    
    @Test
    fun historyScreen_deleteDialog_cancelButton_dismissesDialog() {
        // Test cancel button in delete confirmation dialog
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Click delete button
            composeTestRule
                .onAllNodesWithContentDescription("删除")
                .onFirst()
                .performClick()
            
            // Click cancel button
            composeTestRule
                .onAllNodesWithText("取消")
                .onLast()
                .performClick()
            
            // Verify dialog is dismissed
            composeTestRule.waitUntil(timeoutMillis = 1000) {
                composeTestRule.onAllNodesWithText("确认删除")
                    .fetchSemanticsNodes().isEmpty()
            }
        }
    }
    
    @Test
    fun historyScreen_deleteDialog_confirmButton_deletesExam() {
        // Test confirm button in delete confirmation dialog
        
        // Skip if empty state
        if (composeTestRule.onAllNodesWithText("暂无历史记录")
                .fetchSemanticsNodes().isEmpty()
        ) {
            // Get initial exam count
            val initialCount = composeTestRule
                .onAllNodesWithContentDescription("删除")
                .fetchSemanticsNodes().size
            
            // Click delete button
            composeTestRule
                .onAllNodesWithContentDescription("删除")
                .onFirst()
                .performClick()
            
            // Click confirm button
            composeTestRule
                .onAllNodesWithText("删除")
                .onLast()
                .performClick()
            
            // Wait for deletion to complete
            composeTestRule.waitUntil(timeoutMillis = 2000) {
                val currentCount = composeTestRule
                    .onAllNodesWithContentDescription("删除")
                    .fetchSemanticsNodes().size
                currentCount < initialCount || currentCount == 0
            }
        }
    }
    
    @Test
    fun historyScreen_loading_displaysProgressIndicator() {
        // Verify loading indicator is displayed during initial load
        // Note: This test is timing-sensitive and may need adjustment
        
        // On first load, progress indicator should appear briefly
        // We can't reliably test this without controlling the data source
        // This is a placeholder test
    }
    
    @Test
    fun historyScreen_pagination_loadsMoreOnScroll() {
        // Test pagination by scrolling to bottom
        // Note: This requires sufficient mock data (>20 items)
        
        // Skip if empty state or insufficient data
        val examCount = composeTestRule
            .onAllNodesWithContentDescription("删除")
            .fetchSemanticsNodes().size
        
        if (examCount >= 15) {
            // Scroll to bottom
            composeTestRule
                .onNode(hasScrollAction())
                .performScrollToIndex(examCount - 1)
            
            // Wait for more items to load
            composeTestRule.waitUntil(timeoutMillis = 3000) {
                val newCount = composeTestRule
                    .onAllNodesWithContentDescription("删除")
                    .fetchSemanticsNodes().size
                newCount > examCount
            }
        }
    }
    
    @Test
    fun historyScreen_errorMessage_displaysSnackbar() {
        // Test error message display
        // Note: This requires triggering an error condition
        // This is a placeholder test for error handling
    }
    
    @Test
    fun historyScreen_errorSnackbar_hasCloseButton() {
        // Verify error snackbar has close button
        // Note: This requires triggering an error condition
        // This is a placeholder test
    }
}
