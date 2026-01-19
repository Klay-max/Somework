package com.examai.presentation.camera

import android.Manifest
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.PickVisualMediaRequest
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import coil.compose.rememberAsyncImagePainter
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.accompanist.permissions.shouldShowRationale

/**
 * Camera screen for capturing exam photos
 * Uses CameraX for photo capture with permission handling
 */
@OptIn(ExperimentalPermissionsApi::class, ExperimentalMaterial3Api::class)
@Composable
fun CameraScreen(
    navController: NavHostController,
    viewModel: CameraViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // Camera permission state
    val cameraPermissionState = rememberPermissionState(Manifest.permission.CAMERA)
    
    // Camera launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            uiState.currentPhotoFile?.let { file ->
                viewModel.onPhotoCaptured(file)
            }
        }
    }
    
    // Gallery launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        uri?.let { viewModel.onPhotoSelectedFromGallery(it) }
    }
    
    // Handle photo confirmation
    LaunchedEffect(uiState.isPhotoConfirmed) {
        if (uiState.isPhotoConfirmed && uiState.currentPhotoFile != null) {
            // Navigate to upload screen with photo file path
            val imagePath = uiState.currentPhotoFile!!.absolutePath
            navController.navigate("upload/$imagePath")
            viewModel.resetConfirmation()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("拍摄试卷") },
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
                // Show preview if photo is captured
                uiState.showPreview && uiState.capturedPhotoUri != null -> {
                    PhotoPreview(
                        photoUri = uiState.capturedPhotoUri!!,
                        onConfirm = viewModel::confirmPhoto,
                        onRetake = viewModel::retakePhoto
                    )
                }
                
                // Show camera permission request
                !cameraPermissionState.status.isGranted -> {
                    CameraPermissionRequest(
                        permissionState = cameraPermissionState,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
                
                // Show camera capture button
                else -> {
                    CameraCapture(
                        onCaptureClick = {
                            viewModel.preparePhotoCapture()?.let { (uri, _) ->
                                cameraLauncher.launch(uri)
                            }
                        },
                        onGalleryClick = {
                            galleryLauncher.launch(
                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                            )
                        }
                    )
                }
            }
            
            // Show error message
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
 * Camera permission request UI
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
private fun CameraPermissionRequest(
    permissionState: com.google.accompanist.permissions.PermissionState,
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
            text = if (permissionState.status.shouldShowRationale) {
                "相机权限被拒绝。请在设置中授予相机权限以拍摄试卷照片。"
            } else {
                "需要相机权限来拍摄试卷照片。"
            },
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = { permissionState.launchPermissionRequest() },
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
 * Camera capture UI with capture button
 */
@Composable
private fun CameraCapture(
    onCaptureClick: () -> Unit,
    onGalleryClick: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Icon(
                imageVector = Icons.Default.CameraAlt,
                contentDescription = null,
                modifier = Modifier.size(120.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            
            Text(
                text = "拍摄试卷照片",
                style = MaterialTheme.typography.headlineMedium
            )
            
            Text(
                text = "请确保试卷完整、清晰、光线充足",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.padding(top = 16.dp)
            ) {
                // Gallery button
                OutlinedButton(
                    onClick = onGalleryClick,
                    modifier = Modifier.size(width = 140.dp, height = 56.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.PhotoLibrary,
                        contentDescription = "从相册选择",
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("相册")
                }
                
                // Camera button
                Button(
                    onClick = onCaptureClick,
                    modifier = Modifier.size(width = 140.dp, height = 56.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = "拍照",
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("拍照")
                }
            }
        }
    }
}

/**
 * Photo preview UI with confirm/retake buttons
 */
@Composable
private fun PhotoPreview(
    photoUri: Uri,
    onConfirm: () -> Unit,
    onRetake: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        // Display captured photo
        Image(
            painter = rememberAsyncImagePainter(photoUri),
            contentDescription = "拍摄的照片",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Fit
        )
        
        // Action buttons
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(24.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            // Retake button
            FloatingActionButton(
                onClick = onRetake,
                containerColor = MaterialTheme.colorScheme.error
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "重拍"
                )
            }
            
            // Confirm button
            FloatingActionButton(
                onClick = onConfirm,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "确认"
                )
            }
        }
    }
}
