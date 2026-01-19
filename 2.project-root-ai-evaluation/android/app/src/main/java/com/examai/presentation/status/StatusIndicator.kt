package com.examai.presentation.status

import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.examai.domain.model.ExamStatus

/**
 * Status indicator component for displaying exam processing status
 * Shows current status, progress, and estimated time
 * 
 * Requirements: 16.4 (Status Display)
 */
@Composable
fun StatusIndicator(
    status: ExamStatus,
    progress: Int,
    estimatedTime: Int?,
    errorMessage: String?,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = getStatusColor(status).copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Status text
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = getStatusText(status),
                    style = MaterialTheme.typography.titleMedium,
                    color = getStatusColor(status)
                )
                
                if (status != ExamStatus.COMPLETED && status != ExamStatus.FAILED) {
                    // Animated loading indicator
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = getStatusColor(status),
                        strokeWidth = 2.dp
                    )
                }
            }
            
            // Progress bar
            if (progress > 0 && status != ExamStatus.FAILED) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    LinearProgressIndicator(
                        progress = progress / 100f,
                        modifier = Modifier.fillMaxWidth(),
                        color = getStatusColor(status)
                    )
                    
                    Text(
                        text = "$progress%",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // Estimated time
            if (estimatedTime != null && estimatedTime > 0) {
                Text(
                    text = "预计剩余时间: ${formatTime(estimatedTime)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Error message
            if (errorMessage != null) {
                Text(
                    text = errorMessage,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }
            
            // Status description
            Text(
                text = getStatusDescription(status),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

/**
 * Get color for status
 */
@Composable
private fun getStatusColor(status: ExamStatus): androidx.compose.ui.graphics.Color {
    return when (status) {
        ExamStatus.COMPLETED, ExamStatus.REPORT_GENERATED -> MaterialTheme.colorScheme.primary
        ExamStatus.FAILED -> MaterialTheme.colorScheme.error
        else -> MaterialTheme.colorScheme.tertiary
    }
}

/**
 * Get display text for status
 */
private fun getStatusText(status: ExamStatus): String {
    return when (status) {
        ExamStatus.UPLOADED -> "已上传"
        ExamStatus.OCR_PROCESSING -> "识别中"
        ExamStatus.OCR_COMPLETED -> "识别完成"
        ExamStatus.PARSING -> "解析中"
        ExamStatus.PARSED -> "解析完成"
        ExamStatus.ANALYZING -> "分析中"
        ExamStatus.ANALYZED -> "分析完成"
        ExamStatus.DIAGNOSING -> "诊断中"
        ExamStatus.DIAGNOSED -> "诊断完成"
        ExamStatus.REPORT_GENERATING -> "生成报告中"
        ExamStatus.REPORT_GENERATED -> "报告已生成"
        ExamStatus.COMPLETED -> "处理完成"
        ExamStatus.FAILED -> "处理失败"
    }
}

/**
 * Get description for status
 */
private fun getStatusDescription(status: ExamStatus): String {
    return when (status) {
        ExamStatus.UPLOADED -> "试卷已上传，等待处理"
        ExamStatus.OCR_PROCESSING -> "正在识别试卷内容..."
        ExamStatus.OCR_COMPLETED -> "试卷内容识别完成"
        ExamStatus.PARSING -> "正在解析题目..."
        ExamStatus.PARSED -> "题目解析完成"
        ExamStatus.ANALYZING -> "正在分析答案..."
        ExamStatus.ANALYZED -> "答案分析完成"
        ExamStatus.DIAGNOSING -> "正在生成诊断..."
        ExamStatus.DIAGNOSED -> "诊断完成"
        ExamStatus.REPORT_GENERATING -> "正在生成报告..."
        ExamStatus.REPORT_GENERATED -> "报告生成完成"
        ExamStatus.COMPLETED -> "所有处理已完成，可以查看报告"
        ExamStatus.FAILED -> "处理过程中出现错误"
    }
}

/**
 * Format time in seconds to readable string
 */
private fun formatTime(seconds: Int): String {
    return when {
        seconds < 60 -> "${seconds}秒"
        seconds < 3600 -> "${seconds / 60}分${seconds % 60}秒"
        else -> "${seconds / 3600}小时${(seconds % 3600) / 60}分"
    }
}
