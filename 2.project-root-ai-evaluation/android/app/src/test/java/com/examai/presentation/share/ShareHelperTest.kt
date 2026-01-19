package com.examai.presentation.share

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.*
import java.io.File

/**
 * Unit tests for ShareHelper
 * Tests sharing functionality for email, generic share, and link generation
 */
class ShareHelperTest {
    
    private lateinit var context: Context
    private lateinit var packageManager: PackageManager
    
    private val testReportUrl = "https://example.com/report/123"
    private val testExamSubject = "数学"
    private val testExamGrade = "九年级"
    private val testScore = 85.0
    private val testTotalScore = 100.0
    
    @Before
    fun setup() {
        context = mock()
        packageManager = mock()
        whenever(context.packageManager).thenReturn(packageManager)
        whenever(context.packageName).thenReturn("com.examai")
    }
    
    @Test
    fun `shareViaEmail creates correct intent`() {
        // When
        val intent = ShareHelper.shareViaEmail(
            context = context,
            reportUrl = testReportUrl,
            examSubject = testExamSubject,
            examGrade = testExamGrade,
            score = testScore,
            totalScore = testTotalScore
        )
        
        // Then
        assertNotNull(intent)
        assertEquals(Intent.ACTION_CHOOSER, intent.action)
        
        val emailIntent = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)
        assertNotNull(emailIntent)
        assertEquals(Intent.ACTION_SEND, emailIntent?.action)
        assertEquals("text/plain", emailIntent?.type)
        
        val subject = emailIntent?.getStringExtra(Intent.EXTRA_SUBJECT)
        assertTrue(subject?.contains(testExamSubject) == true)
        assertTrue(subject?.contains(testExamGrade) == true)
        
        val body = emailIntent?.getStringExtra(Intent.EXTRA_TEXT)
        assertTrue(body?.contains(testReportUrl) == true)
        assertTrue(body?.contains(testScore.toString()) == true)
    }
    
    @Test
    fun `shareViaEmail without score creates correct intent`() {
        // When
        val intent = ShareHelper.shareViaEmail(
            context = context,
            reportUrl = testReportUrl,
            examSubject = testExamSubject,
            examGrade = testExamGrade,
            score = null,
            totalScore = null
        )
        
        // Then
        val emailIntent = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)
        val body = emailIntent?.getStringExtra(Intent.EXTRA_TEXT)
        assertFalse(body?.contains("得分") == true)
    }
    
    @Test
    fun `shareViaGeneric creates correct intent`() {
        // When
        val intent = ShareHelper.shareViaGeneric(
            context = context,
            reportUrl = testReportUrl,
            examSubject = testExamSubject,
            examGrade = testExamGrade,
            score = testScore,
            totalScore = testTotalScore
        )
        
        // Then
        assertNotNull(intent)
        assertEquals(Intent.ACTION_CHOOSER, intent.action)
        
        val shareIntent = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)
        assertNotNull(shareIntent)
        assertEquals(Intent.ACTION_SEND, shareIntent?.action)
        assertEquals("text/plain", shareIntent?.type)
        
        val text = shareIntent?.getStringExtra(Intent.EXTRA_TEXT)
        assertTrue(text?.contains(testReportUrl) == true)
        assertTrue(text?.contains(testExamSubject) == true)
        assertTrue(text?.contains(testExamGrade) == true)
    }
    
    @Test
    fun `shareFile returns null when file does not exist`() {
        // Given
        val nonExistentFile = mock<File>()
        whenever(nonExistentFile.exists()).thenReturn(false)
        
        // When
        val intent = ShareHelper.shareFile(context, nonExistentFile)
        
        // Then
        assertNull(intent)
    }
    
    @Test
    fun `generateShareableLink creates correct URL`() {
        // Given
        val examId = "exam123"
        val baseUrl = "https://examai.app"
        
        // When
        val link = ShareHelper.generateShareableLink(examId, baseUrl)
        
        // Then
        assertEquals("$baseUrl/report/$examId", link)
    }
    
    @Test
    fun `generateShareableLink uses default base URL`() {
        // Given
        val examId = "exam123"
        
        // When
        val link = ShareHelper.generateShareableLink(examId)
        
        // Then
        assertTrue(link.contains(examId))
        assertTrue(link.startsWith("https://"))
    }
    
    @Test
    fun `isWeChatInstalled returns true when WeChat is installed`() {
        // Given
        val packageInfo = PackageInfo()
        whenever(packageManager.getPackageInfo("com.tencent.mm", 0))
            .thenReturn(packageInfo)
        
        // When
        val isInstalled = ShareHelper.isWeChatInstalled(context)
        
        // Then
        assertTrue(isInstalled)
    }
    
    @Test
    fun `isWeChatInstalled returns false when WeChat is not installed`() {
        // Given
        whenever(packageManager.getPackageInfo("com.tencent.mm", 0))
            .thenThrow(PackageManager.NameNotFoundException())
        
        // When
        val isInstalled = ShareHelper.isWeChatInstalled(context)
        
        // Then
        assertFalse(isInstalled)
    }
    
    @Test
    fun `shareToWeChat returns false when WeChat not installed`() {
        // Given
        whenever(packageManager.getPackageInfo("com.tencent.mm", 0))
            .thenThrow(PackageManager.NameNotFoundException())
        
        // When
        val result = ShareHelper.shareToWeChat(
            context = context,
            reportUrl = testReportUrl,
            examSubject = testExamSubject,
            examGrade = testExamGrade
        )
        
        // Then
        assertFalse(result)
    }
    
    @Test
    fun `email intent includes all exam information`() {
        // When
        val intent = ShareHelper.shareViaEmail(
            context = context,
            reportUrl = testReportUrl,
            examSubject = testExamSubject,
            examGrade = testExamGrade,
            score = testScore,
            totalScore = testTotalScore
        )
        
        // Then
        val emailIntent = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)
        val body = emailIntent?.getStringExtra(Intent.EXTRA_TEXT)
        
        // Verify all information is included
        assertTrue(body?.contains("科目: $testExamSubject") == true)
        assertTrue(body?.contains("年级: $testExamGrade") == true)
        assertTrue(body?.contains("得分: $testScore/$testTotalScore") == true)
        assertTrue(body?.contains(testReportUrl) == true)
        assertTrue(body?.contains("AI 试卷测评系统") == true)
    }
    
    @Test
    fun `generic share intent includes title`() {
        // When
        val intent = ShareHelper.shareViaGeneric(
            context = context,
            reportUrl = testReportUrl,
            examSubject = testExamSubject,
            examGrade = testExamGrade,
            score = testScore,
            totalScore = testTotalScore
        )
        
        // Then
        val shareIntent = intent.getParcelableExtra<Intent>(Intent.EXTRA_INTENT)
        val title = shareIntent?.getStringExtra(Intent.EXTRA_TITLE)
        
        assertEquals("AI 试卷测评报告", title)
    }
    
    @Test
    fun `shareable link format is correct`() {
        // Given
        val examIds = listOf("exam1", "exam2", "test123", "abc-def-ghi")
        
        examIds.forEach { examId ->
            // When
            val link = ShareHelper.generateShareableLink(examId)
            
            // Then
            assertTrue(link.startsWith("https://"))
            assertTrue(link.contains("/report/"))
            assertTrue(link.endsWith(examId))
        }
    }
}
