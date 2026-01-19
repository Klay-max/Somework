/**
 * 图像处理模块
 * 
 * 功能：
 * - 图像压缩
 * - Base64 转换
 * - 图像质量检测
 * - Web 平台兼容
 */

import { Platform } from 'react-native';

// 动态导入 Expo 模块（仅在非 Web 平台）
let ImageManipulator: any;
let FileSystem: any;

if (Platform.OS !== 'web') {
  ImageManipulator = require('expo-image-manipulator');
  FileSystem = require('expo-file-system');
}

/**
 * 图像质量检测结果
 */
export interface QualityResult {
  isValid: boolean;
  brightness: number;  // 0-100
  sharpness: number;   // 0-100
  warnings: string[];
}

/**
 * 图像处理器类
 */
export class ImageProcessor {
  /**
   * Web 平台：将 File 转换为 Base64
   */
  private static async fileToBase64Web(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Web 平台：压缩图像
   */
  private static async compressImageWeb(file: File, maxSizeMB: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 更激进的尺寸限制：1280px（从 1920px 降低）
          const maxWidth = 1280;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d', { willReadFrequently: false });
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // 自适应压缩质量
          let quality = 0.7; // 从 0.8 降低到 0.7
          let base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
          let sizeMB = (base64.length * 3) / 4 / (1024 * 1024);
          
          // 如果仍然超过目标大小，继续降低质量
          let attempts = 0;
          while (sizeMB > maxSizeMB && attempts < 5 && quality > 0.3) {
            quality -= 0.1;
            base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
            sizeMB = (base64.length * 3) / 4 / (1024 * 1024);
            attempts++;
          }
          
          console.log(`[ImageProcessor] Web压缩完成: ${sizeMB.toFixed(2)}MB, 质量: ${quality}`);
          resolve(base64);
        } catch (error: any) {
          reject(new Error(`Failed to compress image: ${error.message}`));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * 压缩图像到指定大小
   * 
   * @param uri - 图像 URI 或 File 对象
   * @param maxSizeMB - 最大大小（MB），默认 0.5MB
   * @returns 压缩后的图像 URI 或 Base64
   */
  static async compressImage(uri: string | File, maxSizeMB: number = 0.5): Promise<string> {
    // Web 平台处理
    if (Platform.OS === 'web' && uri instanceof File) {
      return this.compressImageWeb(uri, maxSizeMB);
    }
    
    // 移动平台处理
    if (typeof uri !== 'string') {
      throw new Error('Invalid URI type for mobile platform');
    }
    
    try {
      // 获取原始图像信息
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }
      
      const fileSizeMB = (fileInfo.size || 0) / (1024 * 1024);
      
      // 如果已经小于目标大小，直接返回
      if (fileSizeMB <= maxSizeMB) {
        return uri;
      }
      
      // 计算压缩质量（更激进）
      let quality = Math.min(0.7, maxSizeMB / fileSizeMB);
      
      // 压缩图像
      let compressedUri = uri;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        const result = await ImageManipulator.manipulateAsync(
          compressedUri,
          [{ resize: { width: 1280 } }], // 限制最大宽度（从 1920 降低到 1280）
          {
            compress: quality,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        
        compressedUri = result.uri;
        
        // 检查压缩后的大小
        const compressedInfo = await FileSystem.getInfoAsync(compressedUri);
        const compressedSizeMB = (compressedInfo.size || 0) / (1024 * 1024);
        
        console.log(`[ImageProcessor] 移动端压缩尝试 ${attempts + 1}: ${compressedSizeMB.toFixed(2)}MB, 质量: ${quality}`);
        
        if (compressedSizeMB <= maxSizeMB) {
          return compressedUri;
        }
        
        // 降低质量继续压缩
        quality *= 0.75;
        attempts++;
      }
      
      // 如果仍然超过大小，返回最后一次压缩的结果
      console.warn(`Image compression reached max attempts. Final size may exceed ${maxSizeMB}MB`);
      return compressedUri;
    } catch (error: any) {
      throw new Error(`Failed to compress image: ${error.message}`);
    }
  }
  
  /**
   * 转换图像为 Base64
   * 
   * @param uri - 图像 URI 或 File 对象
   * @returns Base64 编码的图像字符串
   */
  static async convertToBase64(uri: string | File): Promise<string> {
    // Web 平台处理
    if (Platform.OS === 'web' && uri instanceof File) {
      return this.fileToBase64Web(uri);
    }
    
    // 移动平台处理
    if (typeof uri !== 'string') {
      throw new Error('Invalid URI type for mobile platform');
    }
    
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return base64;
    } catch (error: any) {
      throw new Error(`Failed to convert image to Base64: ${error.message}`);
    }
  }
  
  /**
   * 检测图像质量
   * 
   * @param uri - 图像 URI 或 File 对象
   * @returns 质量检测结果
   */
  static async checkImageQuality(uri: string | File): Promise<QualityResult> {
    const warnings: string[] = [];
    
    try {
      let fileSizeMB = 0;
      
      // Web 平台
      if (Platform.OS === 'web' && uri instanceof File) {
        fileSizeMB = uri.size / (1024 * 1024);
      } else if (typeof uri === 'string') {
        // 移动平台
        const fileInfo = await FileSystem.getInfoAsync(uri);
        
        if (!fileInfo.exists) {
          return {
            isValid: false,
            brightness: 0,
            sharpness: 0,
            warnings: ['图像文件不存在'],
          };
        }
        
        fileSizeMB = (fileInfo.size || 0) / (1024 * 1024);
      }
      
      // 检查文件大小
      if (fileSizeMB > 10) {
        warnings.push('图像文件过大（超过 10MB），建议压缩');
      }
      
      if (fileSizeMB < 0.1) {
        warnings.push('图像文件过小（小于 100KB），可能影响识别质量');
      }
      
      // 注意：实际的亮度和清晰度检测需要图像处理库
      // 这里返回估计值
      const brightness = 50; // 默认中等亮度
      const sharpness = 70;  // 默认较好清晰度
      
      // 基本验证
      const isValid = warnings.length === 0 || warnings.every(w => !w.includes('不存在'));
      
      return {
        isValid,
        brightness,
        sharpness,
        warnings,
      };
    } catch (error: any) {
      return {
        isValid: false,
        brightness: 0,
        sharpness: 0,
        warnings: [`图像质量检测失败: ${error.message}`],
      };
    }
  }
  
  /**
   * 完整的图像处理流程
   * 
   * @param uri - 图像 URI 或 File 对象
   * @param maxSizeMB - 最大大小（MB），默认 0.5MB
   * @returns 处理结果
   */
  static async processImage(uri: string | File, maxSizeMB: number = 0.5): Promise<{
    success: boolean;
    base64?: string;
    quality?: QualityResult;
    originalSize?: number;
    compressedSize?: number;
    error?: string;
  }> {
    try {
      // 1. 检查图像质量
      const quality = await this.checkImageQuality(uri);
      
      if (!quality.isValid) {
        return {
          success: false,
          error: `Image quality check failed: ${quality.warnings.join(', ')}`,
        };
      }
      
      // 获取原始大小
      let originalSize = 0;
      if (Platform.OS === 'web' && uri instanceof File) {
        originalSize = uri.size;
      } else if (typeof uri === 'string') {
        const originalInfo = await FileSystem.getInfoAsync(uri);
        originalSize = originalInfo.size || 0;
      }
      
      // 2. 压缩图像并转换为 Base64
      const base64 = await this.compressImage(uri, maxSizeMB);
      
      // 计算压缩后大小（Base64 大小约为原始的 4/3）
      const compressedSize = Math.ceil((base64.length * 3) / 4);
      
      return {
        success: true,
        base64,
        quality,
        originalSize,
        compressedSize,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to process image: ${error.message}`,
      };
    }
  }
}
