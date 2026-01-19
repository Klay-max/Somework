package com.examai.data.service

import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationManagerCompat
import io.mockk.*
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment

/**
 * Unit tests for NotificationService
 */
@RunWith(RobolectricTestRunner::class)
class NotificationServiceTest {
    
    private lateinit var context: Context
    private lateinit var notificationService: NotificationService
    private lateinit var notificationManagerCompat: NotificationManagerCompat
    
    @Before
    fun setup() {
        context = RuntimeEnvironment.getApplication()
        notificationService = NotificationService(context)
        
        // Mock NotificationManagerCompat
        mockkStatic(NotificationManagerCompat::class)
        notificationManagerCompat = mockk(relaxed = true)
        every { NotificationManagerCompat.from(any()) } returns notificationManagerCompat
    }
    
    @After
    fun tearDown() {
        unmockkAll()
    }
    
    @Test
    fun `showProcessingCompleteNotification should display notification`() {
        // Given
        val examId = "exam_123"
        val examTitle = "数学试卷"
        
        // When
        notificationService.showProcessingCompleteNotification(examId, examTitle)
        
        // Then
        verify {
            notificationManagerCompat.notify(
                NotificationService.NOTIFICATION_ID_PROCESSING_COMPLETE,
                any()
            )
        }
    }
    
    @Test
    fun `showProcessingCompleteNotification should use default title when not provided`() {
        // Given
        val examId = "exam_123"
        
        // When
        notificationService.showProcessingCompleteNotification(examId)
        
        // Then
        verify {
            notificationManagerCompat.notify(
                NotificationService.NOTIFICATION_ID_PROCESSING_COMPLETE,
                any()
            )
        }
    }
    
    @Test
    fun `showProcessingFailedNotification should display notification`() {
        // Given
        val examId = "exam_123"
        val errorMessage = "OCR 识别失败"
        
        // When
        notificationService.showProcessingFailedNotification(examId, errorMessage)
        
        // Then
        verify {
            notificationManagerCompat.notify(
                NotificationService.NOTIFICATION_ID_PROCESSING_FAILED,
                any()
            )
        }
    }
    
    @Test
    fun `showProcessingFailedNotification should use default message when not provided`() {
        // Given
        val examId = "exam_123"
        
        // When
        notificationService.showProcessingFailedNotification(examId)
        
        // Then
        verify {
            notificationManagerCompat.notify(
                NotificationService.NOTIFICATION_ID_PROCESSING_FAILED,
                any()
            )
        }
    }
    
    @Test
    fun `cancelAllNotifications should cancel all notifications`() {
        // When
        notificationService.cancelAllNotifications()
        
        // Then
        verify { notificationManagerCompat.cancelAll() }
    }
    
    @Test
    fun `cancelNotification should cancel specific notification`() {
        // Given
        val notificationId = NotificationService.NOTIFICATION_ID_PROCESSING_COMPLETE
        
        // When
        notificationService.cancelNotification(notificationId)
        
        // Then
        verify { notificationManagerCompat.cancel(notificationId) }
    }
    
    @Test
    fun `multiple notifications should use different IDs`() {
        // Given
        val examId1 = "exam_123"
        val examId2 = "exam_456"
        
        // When
        notificationService.showProcessingCompleteNotification(examId1)
        notificationService.showProcessingFailedNotification(examId2)
        
        // Then
        verify {
            notificationManagerCompat.notify(
                NotificationService.NOTIFICATION_ID_PROCESSING_COMPLETE,
                any()
            )
        }
        verify {
            notificationManagerCompat.notify(
                NotificationService.NOTIFICATION_ID_PROCESSING_FAILED,
                any()
            )
        }
    }
}
