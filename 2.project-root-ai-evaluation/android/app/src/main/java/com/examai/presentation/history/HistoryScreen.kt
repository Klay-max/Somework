package com.examai.presentation.history

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.examai.domain.model.Exam
import com.examai.domain.model.ExamStatus
import java.text.SimpleDateFormat
import java.util.*

/**
 * History screen displaying list of exams
 * Shows exam thumbnails, date, subject, score, and status
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    navController: NavHostController,
    viewModel: HistoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()
    
    // Load more when reaching end of list
    LaunchedEffect(listState) {
        snapshotFlow { listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index }
            .collect { lastVisibleIndex ->
                if (lastVisibleIndex != null && 
                    lastVisibleIndex >= uiState.exams.size - 3 && 
                    uiState.hasMore && 
                    !uiState.isLoading
                ) {
                    viewModel.loadMore()
                }
            }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("历史记录") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                uiState.isLoading && uiState.exams.isEmpty() -> {
                    // Initial loading
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                
                uiState.exams.isEmpty() && !uiState.isLoading -> {
                    // Empty state
                    EmptyState(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                
                else -> {
                    // Exam list
                    LazyColumn(
                        state = listState,
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(
                            items = uiState.exams,
                            key = { it.examId }
                        ) { exam ->
                            ExamCard(
                                exam = exam,
                                onClick = {
                                    navController.navigate("exam_detail/${exam.examId}")
                                },
                                onDelete = {
                                    viewModel.deleteExam(exam.examId)
                                }
                            )
                        }
                        
                        // Loading more indicator
                        if (uiState.isLoading && uiState.exams.isNotEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator()
                                }
                            }
                        }
                    }
                }
            }
            
            // Error message
            uiState.errorMessage?.let { error ->
                Snackbar(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(16.dp),
                    action = {
                        TextButton(onClick = viewModel::clearError) {
                            Text("关闭")
                        }
                    }
                ) {
                    Text(error)
                }
            }
        }
    }
}

/**
 * Exam card displaying exam information
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ExamCard(
    exam: Exam,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    var showDeleteDialog by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Subject and grade
                Text(
                    text = "${exam.subject} - ${exam.grade}",
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                
                // Date
                Text(
                    text = formatDate(exam.createdAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                // Score
                if (exam.score != null && exam.totalScore != null) {
                    Text(
                        text = "得分: ${exam.score}/${exam.totalScore}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                
                // Status
                StatusChip(status = exam.status)
            }
            
            // Delete button
            IconButton(onClick = { showDeleteDialog = true }) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "删除",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
    
    // Delete confirmation dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("确认删除") },
            text = { Text("确定要删除这份试卷吗？删除后可在30天内恢复。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        onDelete()
                        showDeleteDialog = false
                    }
                ) {
                    Text("删除")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("取消")
                }
            }
        )
    }
}

/**
 * Status chip displaying exam processing status
 */
@Composable
private fun StatusChip(status: ExamStatus) {
    val (text, color) = when (status) {
        ExamStatus.UPLOADED -> "已上传" to MaterialTheme.colorScheme.secondary
        ExamStatus.OCR_PROCESSING -> "识别中" to MaterialTheme.colorScheme.tertiary
        ExamStatus.OCR_COMPLETED -> "识别完成" to MaterialTheme.colorScheme.tertiary
        ExamStatus.PARSING -> "解析中" to MaterialTheme.colorScheme.tertiary
        ExamStatus.PARSED -> "解析完成" to MaterialTheme.colorScheme.tertiary
        ExamStatus.ANALYZING -> "分析中" to MaterialTheme.colorScheme.tertiary
        ExamStatus.ANALYZED -> "分析完成" to MaterialTheme.colorScheme.tertiary
        ExamStatus.DIAGNOSING -> "诊断中" to MaterialTheme.colorScheme.tertiary
        ExamStatus.DIAGNOSED -> "诊断完成" to MaterialTheme.colorScheme.tertiary
        ExamStatus.REPORT_GENERATING -> "生成报告中" to MaterialTheme.colorScheme.tertiary
        ExamStatus.REPORT_GENERATED -> "报告已生成" to MaterialTheme.colorScheme.primary
        ExamStatus.COMPLETED -> "已完成" to MaterialTheme.colorScheme.primary
        ExamStatus.FAILED -> "处理失败" to MaterialTheme.colorScheme.error
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            color = color
        )
    }
}

/**
 * Empty state when no exams are found
 */
@Composable
private fun EmptyState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "暂无历史记录",
            style = MaterialTheme.typography.titleLarge
        )
        
        Text(
            text = "拍摄试卷后，历史记录将显示在这里",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

/**
 * Formats timestamp to readable date string
 */
private fun formatDate(timestamp: Long): String {
    val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
    return sdf.format(Date(timestamp))
}
