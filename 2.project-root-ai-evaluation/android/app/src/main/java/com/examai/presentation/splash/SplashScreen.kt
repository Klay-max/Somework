package com.examai.presentation.splash

import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.examai.data.local.TokenManager
import com.examai.presentation.navigation.Screen
import kotlinx.coroutines.delay

/**
 * Splash screen shown on app launch
 * Checks authentication status and navigates accordingly
 */
@Composable
fun SplashScreen(
    navController: NavHostController
) {
    val context = LocalContext.current
    
    LaunchedEffect(Unit) {
        // Show splash for 2 seconds
        delay(2000)
        
        // Check if user is logged in
        val tokenManager = TokenManager(context)
        val isLoggedIn = tokenManager.isTokenValid()
        
        if (isLoggedIn) {
            // Navigate to home if logged in
            navController.navigate(Screen.Home.route) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        } else {
            // Navigate to login if not logged in
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        }
    }
    
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(
                text = "AI 试卷测评",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold
            )
            
            CircularProgressIndicator()
        }
    }
}
