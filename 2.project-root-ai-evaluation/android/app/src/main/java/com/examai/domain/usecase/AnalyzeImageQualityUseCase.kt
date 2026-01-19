package com.examai.domain.usecase

import android.graphics.Bitmap
import android.graphics.Color
import javax.inject.Inject
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Use case for analyzing image quality in real-time
 * Provides guidance for optimal photo capture
 */
class AnalyzeImageQualityUseCase @Inject constructor() {
    
    /**
     * Analyzes image quality and returns guidance
     */
    fun analyzeQuality(bitmap: Bitmap): ImageQualityResult {
        val brightness = analyzeBrightness(bitmap)
        val sharpness = analyzeSharpness(bitmap)
        val aspectRatio = analyzeAspectRatio(bitmap)
        
        return ImageQualityResult(
            brightness = brightness,
            sharpness = sharpness,
            aspectRatio = aspectRatio,
            overallQuality = calculateOverallQuality(brightness, sharpness, aspectRatio)
        )
    }
    
    /**
     * Analyzes brightness level
     * Returns: LOW, GOOD, HIGH
     */
    private fun analyzeBrightness(bitmap: Bitmap): BrightnessLevel {
        val sampleSize = 10 // Sample every 10th pixel for performance
        var totalBrightness = 0.0
        var pixelCount = 0
        
        for (x in 0 until bitmap.width step sampleSize) {
            for (y in 0 until bitmap.height step sampleSize) {
                val pixel = bitmap.getPixel(x, y)
                val r = Color.red(pixel)
                val g = Color.green(pixel)
                val b = Color.blue(pixel)
                // Calculate perceived brightness
                totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b)
                pixelCount++
            }
        }
        
        val avgBrightness = totalBrightness / pixelCount
        
        return when {
            avgBrightness < 80 -> BrightnessLevel.LOW
            avgBrightness > 200 -> BrightnessLevel.HIGH
            else -> BrightnessLevel.GOOD
        }
    }
    
    /**
     * Analyzes image sharpness using Laplacian variance
     * Returns: BLURRY, ACCEPTABLE, SHARP
     */
    private fun analyzeSharpness(bitmap: Bitmap): SharpnessLevel {
        // Simplified sharpness detection using edge detection
        val sampleSize = 20 // Sample for performance
        var edgeStrength = 0.0
        var sampleCount = 0
        
        for (x in 1 until bitmap.width - 1 step sampleSize) {
            for (y in 1 until bitmap.height - 1 step sampleSize) {
                val center = getGrayscale(bitmap.getPixel(x, y))
                val left = getGrayscale(bitmap.getPixel(x - 1, y))
                val right = getGrayscale(bitmap.getPixel(x + 1, y))
                val top = getGrayscale(bitmap.getPixel(x, y - 1))
                val bottom = getGrayscale(bitmap.getPixel(x, y + 1))
                
                // Laplacian operator
                val laplacian = abs(4 * center - left - right - top - bottom)
                edgeStrength += laplacian
                sampleCount++
            }
        }
        
        val avgEdgeStrength = edgeStrength / sampleCount
        
        return when {
            avgEdgeStrength < 50 -> SharpnessLevel.BLURRY
            avgEdgeStrength < 100 -> SharpnessLevel.ACCEPTABLE
            else -> SharpnessLevel.SHARP
        }
    }
    
    /**
     * Analyzes aspect ratio for document capture
     * Returns: TOO_NARROW, GOOD, TOO_WIDE
     */
    private fun analyzeAspectRatio(bitmap: Bitmap): AspectRatioLevel {
        val ratio = bitmap.width.toFloat() / bitmap.height.toFloat()
        
        // Typical exam paper is A4 (210x297mm = 0.707) or similar
        // Allow range from 0.6 to 0.85 for portrait orientation
        return when {
            ratio < 0.6f -> AspectRatioLevel.TOO_NARROW
            ratio > 0.85f -> AspectRatioLevel.TOO_WIDE
            else -> AspectRatioLevel.GOOD
        }
    }
    
    /**
     * Calculates overall quality score
     */
    private fun calculateOverallQuality(
        brightness: BrightnessLevel,
        sharpness: SharpnessLevel,
        aspectRatio: AspectRatioLevel
    ): QualityLevel {
        val brightnessScore = when (brightness) {
            BrightnessLevel.GOOD -> 1.0
            else -> 0.5
        }
        
        val sharpnessScore = when (sharpness) {
            SharpnessLevel.SHARP -> 1.0
            SharpnessLevel.ACCEPTABLE -> 0.7
            SharpnessLevel.BLURRY -> 0.3
        }
        
        val aspectScore = when (aspectRatio) {
            AspectRatioLevel.GOOD -> 1.0
            else -> 0.6
        }
        
        val overallScore = (brightnessScore + sharpnessScore + aspectScore) / 3.0
        
        return when {
            overallScore >= 0.8 -> QualityLevel.EXCELLENT
            overallScore >= 0.6 -> QualityLevel.GOOD
            overallScore >= 0.4 -> QualityLevel.FAIR
            else -> QualityLevel.POOR
        }
    }
    
    /**
     * Converts RGB pixel to grayscale
     */
    private fun getGrayscale(pixel: Int): Double {
        val r = Color.red(pixel)
        val g = Color.green(pixel)
        val b = Color.blue(pixel)
        return 0.299 * r + 0.587 * g + 0.114 * b
    }
}

/**
 * Image quality analysis result
 */
data class ImageQualityResult(
    val brightness: BrightnessLevel,
    val sharpness: SharpnessLevel,
    val aspectRatio: AspectRatioLevel,
    val overallQuality: QualityLevel
) {
    /**
     * Gets user-friendly guidance message
     */
    fun getGuidanceMessage(): String {
        val messages = mutableListOf<String>()
        
        when (brightness) {
            BrightnessLevel.LOW -> messages.add("光线不足，请移至明亮处")
            BrightnessLevel.HIGH -> messages.add("光线过强，请避免强光直射")
            BrightnessLevel.GOOD -> {}
        }
        
        when (sharpness) {
            SharpnessLevel.BLURRY -> messages.add("图像模糊，请保持手机稳定")
            SharpnessLevel.ACCEPTABLE -> messages.add("清晰度一般，建议调整焦距")
            SharpnessLevel.SHARP -> {}
        }
        
        when (aspectRatio) {
            AspectRatioLevel.TOO_NARROW -> messages.add("试卷未完整显示，请调整角度")
            AspectRatioLevel.TOO_WIDE -> messages.add("试卷角度不佳，请垂直拍摄")
            AspectRatioLevel.GOOD -> {}
        }
        
        return when {
            messages.isEmpty() -> "拍摄条件良好，可以拍照"
            else -> messages.joinToString("\n")
        }
    }
    
    /**
     * Checks if quality is acceptable for capture
     */
    fun isAcceptable(): Boolean {
        return overallQuality >= QualityLevel.FAIR
    }
}

enum class BrightnessLevel {
    LOW, GOOD, HIGH
}

enum class SharpnessLevel {
    BLURRY, ACCEPTABLE, SHARP
}

enum class AspectRatioLevel {
    TOO_NARROW, GOOD, TOO_WIDE
}

enum class QualityLevel {
    POOR, FAIR, GOOD, EXCELLENT
}
