package com.examai.presentation.share

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import java.io.File

/**
 * Helper class for sharing reports
 * Supports email, generic share, and WeChat (when SDK available)
 */
object ShareHelper {
    
    /**
     * Share report via email
     * Opens email client with pre-filled subject and body
     */
    fun shareViaEmail(
        context: Context,
        reportUrl: String,
        examSubject: String,
        examGrade: String,
        score: Double?,
        totalScore: Double?
    ): Intent {
        val emailIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            
            // Email subject
            putExtra(
                Intent.EXTRA_SUBJECT,
                "AI 试卷测评报告 - $examSubject ($examGrade)"
            )
            
            // Email body
            val scoreText = if (score != null && totalScore != null) {
                "得分: $score/$totalScore\n"
            } else {
                ""
            }
            
            val body = """
                AI 试卷测评报告
                
                科目: $examSubject
                年级: $examGrade
                $scoreText
                查看完整报告: $reportUrl
                
                ---
                此报告由 AI 试卷测评系统生成
            """.trimIndent()
            
            putExtra(Intent.EXTRA_TEXT, body)
        }
        
        return Intent.createChooser(emailIntent, "选择邮件应用")
    }
    
    /**
     * Share report via generic share sheet
     * Allows user to choose any sharing app
     */
    fun shareViaGeneric(
        context: Context,
        reportUrl: String,
        examSubject: String,
        examGrade: String,
        score: Double?,
        totalScore: Double?
    ): Intent {
        val scoreText = if (score != null && totalScore != null) {
            "得分: $score/$totalScore\n"
        } else {
            ""
        }
        
        val shareText = """
            AI 试卷测评报告
            
            科目: $examSubject
            年级: $examGrade
            $scoreText
            查看完整报告: $reportUrl
        """.trimIndent()
        
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, shareText)
            putExtra(Intent.EXTRA_TITLE, "AI 试卷测评报告")
        }
        
        return Intent.createChooser(shareIntent, "分享报告")
    }
    
    /**
     * Share report file (PDF or HTML)
     * Uses FileProvider for secure file sharing
     */
    fun shareFile(
        context: Context,
        file: File,
        mimeType: String = "application/pdf"
    ): Intent? {
        if (!file.exists()) {
            return null
        }
        
        val fileUri = try {
            FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
        } catch (e: Exception) {
            return null
        }
        
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, fileUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        
        return Intent.createChooser(shareIntent, "分享报告文件")
    }
    
    /**
     * Generate shareable link for report
     * Creates a deep link that can be opened in the app
     */
    fun generateShareableLink(
        examId: String,
        baseUrl: String = "https://examai.app"
    ): String {
        return "$baseUrl/report/$examId"
    }
    
    /**
     * Copy text to clipboard
     */
    fun copyToClipboard(
        context: Context,
        text: String,
        label: String = "报告链接"
    ) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) 
            as android.content.ClipboardManager
        val clip = android.content.ClipData.newPlainText(label, text)
        clipboard.setPrimaryClip(clip)
    }
    
    /**
     * Check if WeChat is installed
     * Returns true if WeChat app is available
     */
    fun isWeChatInstalled(context: Context): Boolean {
        return try {
            context.packageManager.getPackageInfo("com.tencent.mm", 0)
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Share to WeChat (requires WeChat SDK)
     * This is a placeholder - actual implementation requires WeChat SDK integration
     * 
     * To implement:
     * 1. Add WeChat SDK dependency to build.gradle
     * 2. Register app with WeChat Open Platform
     * 3. Implement WXAPIFactory and share logic
     * 4. Add WXEntryActivity for callbacks
     */
    fun shareToWeChat(
        context: Context,
        reportUrl: String,
        examSubject: String,
        examGrade: String
    ): Boolean {
        // Check if WeChat is installed
        if (!isWeChatInstalled(context)) {
            return false
        }
        
        // TODO: Implement WeChat SDK sharing
        // This requires:
        // - WeChat SDK dependency
        // - App registration with WeChat
        // - WXAPIFactory initialization
        // - Share request creation
        
        // For now, fall back to generic share
        return false
    }
}
