package com.examai.presentation.camera

import android.Manifest
import android.graphics.Bitmap
import android.graphics.Matrix
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.examai.domain.usecase.QualityLevel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import java.util.concurrent.Executors
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * Camera preview screen with real-time guidance
 * Uses CameraX for preview and image analysis
 */
@OptIn(ExperimentalPermissionsApi::class, ExperimentalMaterial3Api::class)
@Composable
fun CameraPreviewScreen(
    navController: NavHostController,
    viewModel: CameraPreviewViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    
    // Camera permission
    val cameraPermissionState = rememberPermissionState(Manifest.permission.CAMERA)
    
    // Camera provider
    var cameraProvider by remember { mutableStateOf<ProcessCameraProvider?>(null) }
    var imageCapture by remember { mutableStateOf<ImageCapture?>(null) }
    
    // Initialize camera
    LaunchedEffect(cameraPermissionState.status.isGranted) {
        if (cameraPermissionState.status.isGranted) {
            cameraProvider = suspendCoroutine { continuation ->
                val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
                cameraProviderFuture.addListener({
                    continuation.resume(cameraProviderFuture.get())
                }, ContextCompat.getMainExecutor(context))
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("拍摄试卷（实时指导）") },
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
            if (!cameraPermissionState.status.isGranted) {
                // Permission request UI (reuse from CameraScreen)
                CameraPermissionRequest(
                    onRequestPermission = { cameraPermissionState.launchPermissionRequest() },
                    onNavigateBack = { navController.popBackStack() }
                )
            } else {
                // Camera preview
                cameraProvider?.let { provider ->
                    CameraPreviewView(
                        cameraProvider = provider,
                        lifecycleOwner = lifecycleOwner,
                        onImageCaptureReady = { imageCapture = it },
                        onQualityAnalyzed = viewModel::updateQuality
                    )
                }
                
                // Guidance overlay
                GuidanceOverlay(
                    qualityResult = uiState.qualityResult,
                    modifier = Modifier.fillMaxSize()
                )
                
                // Capture button
                CaptureButton(
                    enabled = uiState.qualityResult?.isAcceptable() == true,
                    onClick = {
                        imageCapture?.let { capture ->
                            viewModel.capturePhoto(capture, context)
                        }
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(32.dp)
                )
                
                // Guidance message
                uiState.qualityResult?.let { result ->
                    GuidanceMessage(
                        message = result.getGuidanceMessage(),
                        quality = result.overallQuality,
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 16.dp)
                    )
                }
            }
        }
    }
}

/**
 * Camera preview view with CameraX
 */
@Composable
private fun CameraPreviewView(
    cameraProvider: ProcessCameraProvider,
    lifecycleOwner: androidx.lifecycle.LifecycleOwner,
    onImageCaptureReady: (ImageCapture) -> Unit,
    onQualityAnalyzed: (Bitmap) -> Unit
) {
    val context = LocalContext.current
    val previewView = remember { PreviewView(context) }
    
    LaunchedEffect(cameraProvider) {
        val preview = Preview.Builder().build().also {
            it.setSurfaceProvider(previewView.surfaceProvider)
        }
        
        val imageCapture = ImageCapture.Builder()
            .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
            .build()
        
        val imageAnalyzer = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()
            .also {
                it.setAnalyzer(Executors.newSingleThreadExecutor()) { imageProxy ->
                    val bitmap = imageProxy.toBitmap()
                    if (bitmap != null) {
                        onQualityAnalyzed(bitmap)
                    }
                    imageProxy.close()
                }
            }
        
        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
        
        try {
            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(
                lifecycleOwner,
                cameraSelector,
                preview,
                imageCapture,
                imageAnalyzer
            )
            onImageCaptureReady(imageCapture)
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    AndroidView(
        factory = { previewView },
        modifier = Modifier.fillMaxSize()
    )
}

/**
 * Guidance overlay with frame and indicators
 */
@Composable
private fun GuidanceOverlay(
    qualityResult: com.examai.domain.usecase.ImageQualityResult?,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val frameWidth = size.width * 0.85f
        val frameHeight = size.height * 0.7f
        val frameLeft = (size.width - frameWidth) / 2
        val frameTop = (size.height - frameHeight) / 2
        
        // Determine frame color based on quality
        val frameColor = when (qualityResult?.overallQuality) {
            QualityLevel.EXCELLENT, QualityLevel.GOOD -> Color.Green
            QualityLevel.FAIR -> Color.Yellow
            QualityLevel.POOR, null -> Color.Red
        }
        
        // Draw frame
        drawRoundRect(
            color = frameColor,
            topLeft = Offset(frameLeft, frameTop),
            size = Size(frameWidth, frameHeight),
            cornerRadius = CornerRadius(16f, 16f),
            style = Stroke(width = 4f)
        )
        
        // Draw corner markers
        val cornerLength = 40f
        val cornerThickness = 6f
        
        // Top-left corner
        drawLine(
            color = frameColor,
            start = Offset(frameLeft, frameTop),
            end = Offset(frameLeft + cornerLength, frameTop),
            strokeWidth = cornerThickness
        )
        drawLine(
            color = frameColor,
            start = Offset(frameLeft, frameTop),
            end = Offset(frameLeft, frameTop + cornerLength),
            strokeWidth = cornerThickness
        )
        
        // Top-right corner
        drawLine(
            color = frameColor,
            start = Offset(frameLeft + frameWidth, frameTop),
            end = Offset(frameLeft + frameWidth - cornerLength, frameTop),
            strokeWidth = cornerThickness
        )
        drawLine(
            color = frameColor,
            start = Offset(frameLeft + frameWidth, frameTop),
            end = Offset(frameLeft + frameWidth, frameTop + cornerLength),
            strokeWidth = cornerThickness
        )
        
        // Bottom-left corner
        drawLine(
            color = frameColor,
            start = Offset(frameLeft, frameTop + frameHeight),
            end = Offset(frameLeft + cornerLength, frameTop + frameHeight),
            strokeWidth = cornerThickness
        )
        drawLine(
            color = frameColor,
            start = Offset(frameLeft, frameTop + frameHeight),
            end = Offset(frameLeft, frameTop + frameHeight - cornerLength),
            strokeWidth = cornerThickness
        )
        
        // Bottom-right corner
        drawLine(
            color = frameColor,
            start = Offset(frameLeft + frameWidth, frameTop + frameHeight),
            end = Offset(frameLeft + frameWidth - cornerLength, frameTop + frameHeight),
            strokeWidth = cornerThickness
        )
        drawLine(
            color = frameColor,
            start = Offset(frameLeft + frameWidth, frameTop + frameHeight),
            end = Offset(frameLeft + frameWidth, frameTop + frameHeight - cornerLength),
            strokeWidth = cornerThickness
        )
    }
}

/**
 * Guidance message card
 */
@Composable
private fun GuidanceMessage(
    message: String,
    quality: QualityLevel,
    modifier: Modifier = Modifier
) {
    val backgroundColor = when (quality) {
        QualityLevel.EXCELLENT, QualityLevel.GOOD -> Color(0xFF4CAF50).copy(alpha = 0.9f)
        QualityLevel.FAIR -> Color(0xFFFFC107).copy(alpha = 0.9f)
        QualityLevel.POOR -> Color(0xFFF44336).copy(alpha = 0.9f)
    }
    
    Card(
        modifier = modifier
            .fillMaxWidth(0.9f),
        colors = CardDefaults.cardColors(containerColor = backgroundColor)
    ) {
        Text(
            text = message,
            modifier = Modifier.padding(16.dp),
            color = Color.White,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

/**
 * Capture button
 */
@Composable
private fun CaptureButton(
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    FloatingActionButton(
        onClick = onClick,
        modifier = modifier.size(72.dp),
        containerColor = if (enabled) {
            MaterialTheme.colorScheme.primary
        } else {
            MaterialTheme.colorScheme.surfaceVariant
        }
    ) {
        Icon(
            imageVector = Icons.Default.CameraAlt,
            contentDescription = "拍照",
            modifier = Modifier.size(36.dp),
            tint = if (enabled) Color.White else Color.Gray
        )
    }
}

/**
 * Permission request UI
 */
@Composable
private fun CameraPermissionRequest(
    onRequestPermission: () -> Unit,
    onNavigateBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.CameraAlt,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "需要相机权限",
            style = MaterialTheme.typography.headlineSmall
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "需要相机权限来实时预览和拍摄试卷照片。",
            style = MaterialTheme.typography.bodyMedium
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onRequestPermission,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("授予权限")
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        TextButton(
            onClick = onNavigateBack,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("返回")
        }
    }
}

/**
 * Extension function to convert ImageProxy to Bitmap
 */
private fun ImageProxy.toBitmap(): Bitmap? {
    val buffer = planes[0].buffer
    val bytes = ByteArray(buffer.remaining())
    buffer.get(bytes)
    
    return try {
        val bitmap = android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        // Rotate bitmap if needed
        val matrix = Matrix()
        matrix.postRotate(imageInfo.rotationDegrees.toFloat())
        Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
    } catch (e: Exception) {
        null
    }
}
