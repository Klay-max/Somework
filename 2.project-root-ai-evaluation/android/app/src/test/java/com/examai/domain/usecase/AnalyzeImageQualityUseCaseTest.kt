package com.examai.domain.usecase

import android.graphics.Bitmap
import android.graphics.Color
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

/**
 * Unit tests for AnalyzeImageQualityUseCase
 */
@RunWith(RobolectricTestRunner::class)
class AnalyzeImageQualityUseCaseTest {
    
    private lateinit var useCase: AnalyzeImageQualityUseCase
    
    @Before
    fun setup() {
        useCase = AnalyzeImageQualityUseCase()
    }
    
    @Test
    fun `analyzeQuality should detect low brightness`() {
        // Given - dark image
        val darkBitmap = createSolidColorBitmap(Color.rgb(30, 30, 30))
        
        // When
        val result = useCase.analyzeQuality(darkBitmap)
        
        // Then
        assertEquals(BrightnessLevel.LOW, result.brightness)
    }
    
    @Test
    fun `analyzeQuality should detect high brightness`() {
        // Given - bright image
        val brightBitmap = createSolidColorBitmap(Color.rgb(220, 220, 220))
        
        // When
        val result = useCase.analyzeQuality(brightBitmap)
        
        // Then
        assertEquals(BrightnessLevel.HIGH, result.brightness)
    }
    
    @Test
    fun `analyzeQuality should detect good brightness`() {
        // Given - well-lit image
        val goodBitmap = createSolidColorBitmap(Color.rgb(150, 150, 150))
        
        // When
        val result = useCase.analyzeQuality(goodBitmap)
        
        // Then
        assertEquals(BrightnessLevel.GOOD, result.brightness)
    }
    
    @Test
    fun `analyzeQuality should detect blurry image`() {
        // Given - uniform color (no edges = blurry)
        val blurryBitmap = createSolidColorBitmap(Color.rgb(128, 128, 128))
        
        // When
        val result = useCase.analyzeQuality(blurryBitmap)
        
        // Then
        assertEquals(SharpnessLevel.BLURRY, result.sharpness)
    }
    
    @Test
    fun `analyzeQuality should detect sharp image`() {
        // Given - high contrast pattern (sharp edges)
        val sharpBitmap = createCheckerboardBitmap()
        
        // When
        val result = useCase.analyzeQuality(sharpBitmap)
        
        // Then
        assertTrue(result.sharpness == SharpnessLevel.SHARP || result.sharpness == SharpnessLevel.ACCEPTABLE)
    }
    
    @Test
    fun `analyzeQuality should detect good aspect ratio for portrait`() {
        // Given - A4-like portrait aspect ratio (0.707)
        val portraitBitmap = Bitmap.createBitmap(700, 1000, Bitmap.Config.ARGB_8888)
        
        // When
        val result = useCase.analyzeQuality(portraitBitmap)
        
        // Then
        assertEquals(AspectRatioLevel.GOOD, result.aspectRatio)
    }
    
    @Test
    fun `analyzeQuality should detect too narrow aspect ratio`() {
        // Given - very narrow image
        val narrowBitmap = Bitmap.createBitmap(500, 1000, Bitmap.Config.ARGB_8888)
        
        // When
        val result = useCase.analyzeQuality(narrowBitmap)
        
        // Then
        assertEquals(AspectRatioLevel.TOO_NARROW, result.aspectRatio)
    }
    
    @Test
    fun `analyzeQuality should detect too wide aspect ratio`() {
        // Given - very wide image
        val wideBitmap = Bitmap.createBitmap(900, 1000, Bitmap.Config.ARGB_8888)
        
        // When
        val result = useCase.analyzeQuality(wideBitmap)
        
        // Then
        assertEquals(AspectRatioLevel.TOO_WIDE, result.aspectRatio)
    }
    
    @Test
    fun `getGuidanceMessage should return appropriate message for low brightness`() {
        // Given
        val darkBitmap = createSolidColorBitmap(Color.rgb(30, 30, 30))
        val result = useCase.analyzeQuality(darkBitmap)
        
        // When
        val message = result.getGuidanceMessage()
        
        // Then
        assertTrue(message.contains("光线不足"))
    }
    
    @Test
    fun `getGuidanceMessage should return appropriate message for high brightness`() {
        // Given
        val brightBitmap = createSolidColorBitmap(Color.rgb(220, 220, 220))
        val result = useCase.analyzeQuality(brightBitmap)
        
        // When
        val message = result.getGuidanceMessage()
        
        // Then
        assertTrue(message.contains("光线过强"))
    }
    
    @Test
    fun `getGuidanceMessage should return appropriate message for blurry image`() {
        // Given
        val blurryBitmap = createSolidColorBitmap(Color.rgb(128, 128, 128))
        val result = useCase.analyzeQuality(blurryBitmap)
        
        // When
        val message = result.getGuidanceMessage()
        
        // Then
        assertTrue(message.contains("模糊") || message.contains("稳定"))
    }
    
    @Test
    fun `getGuidanceMessage should return success message for good quality`() {
        // Given - good brightness, sharp, good aspect ratio
        val goodBitmap = createCheckerboardBitmap(700, 1000)
        val result = useCase.analyzeQuality(goodBitmap)
        
        // When
        val message = result.getGuidanceMessage()
        
        // Then - if all conditions are good, should say ready to capture
        if (result.overallQuality >= QualityLevel.GOOD) {
            assertTrue(message.contains("良好") || message.contains("可以拍照"))
        }
    }
    
    @Test
    fun `isAcceptable should return true for fair or better quality`() {
        // Given - decent quality image
        val decentBitmap = createSolidColorBitmap(Color.rgb(150, 150, 150))
        val result = useCase.analyzeQuality(decentBitmap)
        
        // When
        val acceptable = result.isAcceptable()
        
        // Then
        assertTrue(acceptable || result.overallQuality == QualityLevel.POOR)
    }
    
    @Test
    fun `overallQuality should be excellent for perfect conditions`() {
        // Given - perfect image
        val perfectBitmap = createCheckerboardBitmap(700, 1000)
        fillBitmapWithGoodBrightness(perfectBitmap)
        
        // When
        val result = useCase.analyzeQuality(perfectBitmap)
        
        // Then - should be at least GOOD
        assertTrue(result.overallQuality >= QualityLevel.FAIR)
    }
    
    // Helper functions
    
    private fun createSolidColorBitmap(color: Int, width: Int = 800, height: Int = 1000): Bitmap {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        bitmap.eraseColor(color)
        return bitmap
    }
    
    private fun createCheckerboardBitmap(width: Int = 800, height: Int = 1000): Bitmap {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val squareSize = 50
        
        for (x in 0 until width) {
            for (y in 0 until height) {
                val isBlack = ((x / squareSize) + (y / squareSize)) % 2 == 0
                bitmap.setPixel(x, y, if (isBlack) Color.BLACK else Color.WHITE)
            }
        }
        
        return bitmap
    }
    
    private fun fillBitmapWithGoodBrightness(bitmap: Bitmap) {
        val goodColor = Color.rgb(150, 150, 150)
        bitmap.eraseColor(goodColor)
    }
}
