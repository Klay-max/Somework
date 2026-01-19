package com.examai.presentation.report

import android.content.Context
import android.graphics.Bitmap
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.examai.presentation.share.ShareHelper

/**
 * Report detail screen displaying HTML report in WebView
 * Supports zoom, scroll, and sharing
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportDetailScreen(
    navController: NavHostController,
    examId: String,
    viewModel: ReportDetailViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    
    // Share dialog
    if (uiState.showShareDialog && uiState.examData != null && uiState.reportUrl != null) {
        ShareDialog(
            examData = uiState.examData!!,
            reportUrl = uiState.reportUrl!!,
            onDismiss = viewModel::hideShareDialog,
            context = context
        )
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("诊断报告") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    // Share button (enabled when report is loaded)
                    IconButton(
                        onClick = viewModel::showShareDialog,
                        enabled = uiState.reportUrl != null && !uiState.isLoading
                    ) {
                        Icon(Icons.Default.Share, contentDescription = "分享")
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
                uiState.isLoading -> {
                    // Initial loading
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                
                uiState.errorMessage != null && uiState.reportUrl == null -> {
                    // Error state (no report URL)
                    ErrorState(
                        errorMessage = uiState.errorMessage!!,
                        onRetry = viewModel::retry,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                
                uiState.reportUrl != null || uiState.cachedHtmlContent != null -> {
                    // WebView with report
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Cache indicator
                        if (uiState.isCached) {
                            Surface(
                                color = MaterialTheme.colorScheme.primaryContainer,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp),
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "离线可用",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                }
                            }
                        }
                        
                        // Loading progress bar
                        if (uiState.isWebViewLoading && uiState.webViewProgress < 100) {
                            LinearProgressIndicator(
                                progress = uiState.webViewProgress / 100f,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        
                        // WebView
                        ReportWebView(
                            url = uiState.reportUrl,
                            htmlContent = uiState.cachedHtmlContent,
                            onProgressChanged = viewModel::updateLoadingProgress,
                            onLoadingChanged = viewModel::setWebViewLoading,
                            onError = viewModel::onWebViewError,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
            
            // Error snackbar (for WebView errors)
            uiState.errorMessage?.let { error ->
                if (uiState.reportUrl != null) {
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
}

/**
 * WebView composable for displaying HTML report
 * Supports both URL loading and direct HTML content
 */
@Composable
private fun ReportWebView(
    url: String?,
    htmlContent: String?,
    onProgressChanged: (Int) -> Unit,
    onLoadingChanged: (Boolean) -> Unit,
    onError: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var webView by remember { mutableStateOf<WebView?>(null) }
    
    // Reload when content changes
    LaunchedEffect(url, htmlContent) {
        webView?.let { wv ->
            when {
                htmlContent != null -> {
                    // Load from cached HTML content
                    wv.loadDataWithBaseURL(
                        null,
                        htmlContent,
                        "text/html",
                        "UTF-8",
                        null
                    )
                }
                url != null -> {
                    // Load from URL
                    wv.loadUrl(url)
                }
            }
        }
    }
    
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                webView = this
                
                // Enable JavaScript
                settings.javaScriptEnabled = true
                
                // Enable zoom controls
                settings.builtInZoomControls = true
                settings.displayZoomControls = false
                
                // Enable viewport and responsive layout
                settings.useWideViewPort = true
                settings.loadWithOverviewMode = true
                
                // Enable DOM storage
                settings.domStorageEnabled = true
                
                // Set WebViewClient
                webViewClient = object : WebViewClient() {
                    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                        super.onPageStarted(view, url, favicon)
                        onLoadingChanged(true)
                        onProgressChanged(0)
                    }
                    
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        onLoadingChanged(false)
                        onProgressChanged(100)
                    }
                    
                    override fun onReceivedError(
                        view: WebView?,
                        request: WebResourceRequest?,
                        error: WebResourceError?
                    ) {
                        super.onReceivedError(view, request, error)
                        onError("加载失败: ${error?.description ?: "未知错误"}")
                    }
                    
                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        // Allow all URLs to load in WebView
                        return false
                    }
                }
                
                // Set WebChromeClient for progress updates
                webChromeClient = object : android.webkit.WebChromeClient() {
                    override fun onProgressChanged(view: WebView?, newProgress: Int) {
                        super.onProgressChanged(view, newProgress)
                        onProgressChanged(newProgress)
                    }
                }
            }
        },
        modifier = modifier
    )
}

/**
 * Error state when report cannot be loaded
 */
@Composable
private fun ErrorState(
    errorMessage: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Refresh,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.error
        )
        
        Text(
            text = errorMessage,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.error
        )
        
        Button(onClick = onRetry) {
            Icon(
                imageVector = Icons.Default.Refresh,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("重试")
        }
    }
}


/**
 * Share dialog with multiple sharing options
 */
@Composable
private fun ShareDialog(
    examData: ExamData,
    reportUrl: String,
    onDismiss: () -> Unit,
    context: Context
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("分享报告") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "选择分享方式",
                    style = MaterialTheme.typography.bodyMedium
                )
                
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                
                // Email share option
                ShareOption(
                    icon = Icons.Default.Email,
                    title = "邮件分享",
                    onClick = {
                        val intent = ShareHelper.shareViaEmail(
                            context = context,
                            reportUrl = reportUrl,
                            examSubject = examData.subject,
                            examGrade = examData.grade,
                            score = examData.score?.toDouble(),
                            totalScore = examData.totalScore?.toDouble()
                        )
                        context.startActivity(intent)
                        onDismiss()
                    }
                )
                
                // Generic share option
                ShareOption(
                    icon = Icons.Default.Share,
                    title = "更多分享方式",
                    onClick = {
                        val intent = ShareHelper.shareViaGeneric(
                            context = context,
                            reportUrl = reportUrl,
                            examSubject = examData.subject,
                            examGrade = examData.grade,
                            score = examData.score?.toDouble(),
                            totalScore = examData.totalScore?.toDouble()
                        )
                        context.startActivity(intent)
                        onDismiss()
                    }
                )
                
                // Copy link option
                ShareOption(
                    icon = Icons.Default.Link,
                    title = "复制链接",
                    onClick = {
                        ShareHelper.copyToClipboard(context, reportUrl, "报告链接")
                        Toast.makeText(context, "链接已复制", Toast.LENGTH_SHORT).show()
                        onDismiss()
                    }
                )
                
                // WeChat share option (if installed)
                if (ShareHelper.isWeChatInstalled(context)) {
                    ShareOption(
                        icon = Icons.Default.Chat,
                        title = "微信分享",
                        subtitle = "需要微信 SDK",
                        enabled = false, // TODO: Enable when WeChat SDK is integrated
                        onClick = {
                            Toast.makeText(
                                context,
                                "微信分享功能即将推出",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        }
    )
}

/**
 * Share option item in dialog
 */
@Composable
private fun ShareOption(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String? = null,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.small
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (enabled) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                }
            )
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    color = if (enabled) {
                        MaterialTheme.colorScheme.onSurface
                    } else {
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                    }
                )
                
                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
