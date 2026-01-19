package com.examai.presentation.navigation

/**
 * Sealed class representing all navigation destinations in the app
 */
sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Camera : Screen("camera")
    object CameraPreview : Screen("camera_preview")
    object Upload : Screen("upload/{imagePath}") {
        fun createRoute(imagePath: String) = "upload/${imagePath}"
    }
    
    object History : Screen("history")
    
    object ExamDetail : Screen("exam_detail/{examId}") {
        fun createRoute(examId: String) = "exam_detail/$examId"
    }
    
    object Report : Screen("report/{examId}") {
        fun createRoute(examId: String) = "report/$examId"
    }
}
