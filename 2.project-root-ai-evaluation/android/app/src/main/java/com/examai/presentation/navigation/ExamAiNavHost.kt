package com.examai.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.examai.presentation.splash.SplashScreen

/**
 * Main navigation host for ExamAI application
 * Defines all navigation routes and their corresponding screens
 */
@Composable
fun ExamAiNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Splash.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        // Splash screen
        composable(Screen.Splash.route) {
            SplashScreen(navController = navController)
        }
        
        // Register screen
        composable(Screen.Register.route) {
            com.examai.presentation.auth.register.RegisterScreen(navController = navController)
        }
        
        // Login screen
        composable(Screen.Login.route) {
            com.examai.presentation.auth.login.LoginScreen(navController = navController)
        }
        
        // Home screen
        composable(Screen.Home.route) {
            com.examai.presentation.home.HomeScreen(navController = navController)
        }
        
        // Camera screen
        composable(Screen.Camera.route) {
            com.examai.presentation.camera.CameraScreen(navController = navController)
        }
        
        // Camera preview screen (with real-time guidance)
        composable(Screen.CameraPreview.route) {
            com.examai.presentation.camera.CameraPreviewScreen(navController = navController)
        }
        
        // Upload screen
        composable(
            route = Screen.Upload.route,
            arguments = listOf(navArgument("imagePath") { type = NavType.StringType })
        ) { backStackEntry ->
            val imagePath = backStackEntry.arguments?.getString("imagePath") ?: return@composable
            val imageFile = java.io.File(imagePath)
            com.examai.presentation.upload.UploadScreen(
                navController = navController,
                imageFile = imageFile
            )
        }
        
        // History screen
        composable(Screen.History.route) {
            com.examai.presentation.history.HistoryScreen(navController = navController)
        }
        
        // Exam detail screen (TODO: Implement in future)
        // For now, navigate directly to report
        composable(
            route = Screen.ExamDetail.route,
            arguments = listOf(navArgument("examId") { type = NavType.StringType })
        ) { backStackEntry ->
            val examId = backStackEntry.arguments?.getString("examId") ?: return@composable
            // Navigate to report screen
            LaunchedEffect(Unit) {
                navController.navigate(Screen.Report.createRoute(examId)) {
                    popUpTo(Screen.ExamDetail.route) { inclusive = true }
                }
            }
        }
        
        // Report screen
        composable(
            route = Screen.Report.route,
            arguments = listOf(navArgument("examId") { type = NavType.StringType })
        ) { backStackEntry ->
            val examId = backStackEntry.arguments?.getString("examId") ?: return@composable
            com.examai.presentation.report.ReportDetailScreen(
                navController = navController,
                examId = examId
            )
        }
    }
}
