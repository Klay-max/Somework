package com.examai.presentation.upload

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import com.examai.presentation.status.StatusIndicator
import java.io.File

/**
 * Upload screen for exam image upload
 * Displays upload progress and handles errors
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadScreen(
    navController: NavController,
    imageFile: File,
    viewModel: UploadViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // Start upload when screen is first displayed
    LaunchedEffect(Unit) {
        viewModel.uploadExam(imageFile)
    }
    
    // Navigate to home when upload is complete
    LaunchedEffect(uiState.isUploadComplete) {
        if (uiState.isUploadComplete && uiState.uploadedExamId != null) {
            // Wait a moment to show success state
            kotlinx.coroutines.delay(1000)
            navController.navigate("home") {
                popUpTo("camera") { inclusive = true }
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("上传试卷") }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Image preview
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Image(
                    painter = rememberAsyncImagePainter(imageFile),
                    contentDescription = "试卷照片",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Upload status
            when {
                uiState.isUploading -> {
                    // Uploading state
                    Text(
                        text = "正在上传...",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Progress indicator
                    LinearProgressIndicator(
                        progress = uiState.uploadProgress / 100f,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "${uiState.uploadProgress}%",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                uiState.isQueuedForUpload -> {
                    // Queued state
                    CircularProgressIndicator()
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = uiState.queueStatus ?: "已加入上传队列",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    val workId = uiState.queuedWorkId
                    if (workId != null) {
                        OutlinedButton(
                            onClick = {
                                viewModel.cancelQueuedUpload(workId)
                                navController.popBackStack()
                            }
                        ) {
                            Text("取消上传")
                        }
                    }
                }
                
                uiState.isUploadComplete -> {
                    // Success state
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "上传成功",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "上传成功！",
                        style = MaterialTheme.typography.titleLarge
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Show status indicator if polling is active
                    if (uiState.isPolling && uiState.statusInfo != null) {
                        val statusInfo = uiState.statusInfo!!
                        StatusIndicator(
                            status = statusInfo.status,
                            progress = statusInfo.progress,
                            estimatedTime = statusInfo.estimatedTime,
                            errorMessage = uiState.pollingError
                        )
                    } else {
                        Text(
                            text = "正在处理试卷，请稍后查看结果",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                
                uiState.errorMessage != null -> {
                    // Error state
                    Icon(
                        imageVector = Icons.Default.Error,
                        contentDescription = "上传失败",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "上传失败",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.error
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = uiState.errorMessage ?: "未知错误",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        OutlinedButton(
                            onClick = { navController.popBackStack() }
                        ) {
                            Text("取消")
                        }
                        
                        Button(
                            onClick = { viewModel.retryUpload(imageFile) }
                        ) {
                            Text("重试")
                        }
                        
                        OutlinedButton(
                            onClick = {
                                val workId = viewModel.queueExamUpload(imageFile)
                                viewModel.observeQueuedUpload(workId)
                            }
                        ) {
                            Text("稍后上传")
                        }
                    }
                }
            }
        }
    }
}
