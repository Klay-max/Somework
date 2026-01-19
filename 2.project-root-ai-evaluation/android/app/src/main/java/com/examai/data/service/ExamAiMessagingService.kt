package com.examai.data.service

import android.util.Log
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

/**
 * Firebase Cloud Messaging service for handling push notifications
 * 
 * Requirements: 16.4 (Push Notifications)
 * 
 * Note: This is a placeholder implementation. To enable FCM:
 * 1. Add Firebase to your project (google-services.json)
 * 2. Add FCM dependencies to build.gradle
 * 3. Uncomment the FirebaseMessagingService extension
 * 4. Register this service in AndroidManifest.xml
 * 5. Implement token registration with backend
 */
// @AndroidEntryPoint
class ExamAiMessagingService /* : FirebaseMessagingService() */ {
    
    @Inject
    lateinit var notificationService: NotificationService
    
    companion object {
        private const val TAG = "ExamAiMessagingService"
        private const val KEY_EXAM_ID = "exam_id"
        private const val KEY_STATUS = "status"
        private const val KEY_ERROR_MESSAGE = "error_message"
        
        const val STATUS_COMPLETED = "COMPLETED"
        const val STATUS_FAILED = "FAILED"
    }
    
    /**
     * Called when a new FCM token is generated
     * Should register the token with backend
     */
    /*
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")
        
        // TODO: Send token to backend
        // POST /api/v1/fcm/register with { "token": token }
    }
    */
    
    /**
     * Called when a message is received
     * Handles different notification types based on payload
     */
    /*
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        Log.d(TAG, "Message received from: ${remoteMessage.from}")
        
        // Handle data payload
        remoteMessage.data.let { data ->
            val examId = data[KEY_EXAM_ID]
            val status = data[KEY_STATUS]
            val errorMessage = data[KEY_ERROR_MESSAGE]
            
            if (examId != null && status != null) {
                handleExamStatusNotification(examId, status, errorMessage)
            }
        }
        
        // Handle notification payload (if app is in foreground)
        remoteMessage.notification?.let { notification ->
            Log.d(TAG, "Notification title: ${notification.title}")
            Log.d(TAG, "Notification body: ${notification.body}")
        }
    }
    */
    
    /**
     * Handle exam status notification
     */
    private fun handleExamStatusNotification(
        examId: String,
        status: String,
        errorMessage: String?
    ) {
        when (status) {
            STATUS_COMPLETED -> {
                notificationService.showProcessingCompleteNotification(examId)
            }
            STATUS_FAILED -> {
                notificationService.showProcessingFailedNotification(examId, errorMessage)
            }
            else -> {
                Log.w(TAG, "Unknown status: $status")
            }
        }
    }
}
