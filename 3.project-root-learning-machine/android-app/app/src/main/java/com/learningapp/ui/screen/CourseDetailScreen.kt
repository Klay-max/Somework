package com.learningapp.ui.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.learningapp.data.model.LearningUnit
import com.learningapp.ui.viewmodel.CourseDetailUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CourseDetailScreen(
    uiState: CourseDetailUiState,
    onBackClick: () -> Unit,
    onUnitClick: (String) -> Unit,
    onStartLearning: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("课程详情") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { paddingValues ->
        when {
            uiState.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            uiState.error != null -> {
                ErrorView(
                    message = uiState.error,
                    onRetry = onRetry,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                )
            }
            uiState.courseDetail != null -> {
                val course = uiState.courseDetail
                LazyColumn(
                    modifier = modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // 课程封面
                    item {
                        AsyncImage(
                            model = course.coverImage,
                            contentDescription = course.name,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentScale = ContentScale.Crop
                        )
                    }
                    
                    // 课程信息
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = course.name,
                                style = MaterialTheme.typography.headlineMedium
                            )
                            
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                AssistChip(
                                    onClick = { },
                                    label = { Text(course.category) },
                                    enabled = false
                                )
                                AssistChip(
                                    onClick = { },
                                    label = { Text(getDifficultyText(course.difficulty)) },
                                    enabled = false
                                )
                            }
                            
                            Text(
                                text = course.description,
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    
                    // 开始学习按钮
                    item {
                        Button(
                            onClick = onStartLearning,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("开始学习")
                        }
                    }
                    
                    // 学习单元列表
                    item {
                        Text(
                            text = "学习单元 (${course.units.size})",
                            style = MaterialTheme.typography.titleLarge
                        )
                    }
                    
                    items(
                        items = course.units,
                        key = { it.id }
                    ) { unit ->
                        LearningUnitCard(
                            unit = unit,
                            onClick = { onUnitClick(unit.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun LearningUnitCard(
    unit: LearningUnit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "${unit.order}. ${unit.title}",
                    style = MaterialTheme.typography.titleMedium
                )
                
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    AssistChip(
                        onClick = { },
                        label = { Text(getContentTypeText(unit.contentType)) },
                        enabled = false
                    )
                    
                    unit.duration?.let { duration ->
                        AssistChip(
                            onClick = { },
                            label = { Text("${duration}分钟") },
                            enabled = false
                        )
                    }
                }
            }
            
            Icon(
                Icons.Default.PlayArrow,
                contentDescription = "播放",
                tint = MaterialTheme.colorScheme.primary
            )
        }
    }
}

private fun getDifficultyText(difficulty: String): String {
    return when (difficulty) {
        "BEGINNER" -> "初级"
        "INTERMEDIATE" -> "中级"
        "ADVANCED" -> "高级"
        else -> difficulty
    }
}

private fun getContentTypeText(contentType: String): String {
    return when (contentType) {
        "VIDEO" -> "视频"
        "TEXT" -> "文本"
        "IMAGE" -> "图片"
        "MIXED" -> "混合"
        else -> contentType
    }
}
