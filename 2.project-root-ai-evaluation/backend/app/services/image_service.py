"""
图像处理服务
"""
import os
import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple, Optional
import hashlib
from datetime import datetime

from app.core.config import settings
from app.core.logging import logger


class ImageValidationResult:
    """图像验证结果"""
    def __init__(self, is_valid: bool, reason: str = ""):
        self.is_valid = is_valid
        self.reason = reason


class ImageService:
    """图像处理服务类"""
    
    @staticmethod
    def validate_image_format_and_size(filename: str, file_content: bytes) -> None:
        """
        验证图像格式和大小
        
        Args:
            filename: 文件名
            file_content: 文件内容
            
        Raises:
            ValueError: 如果格式或大小无效
        """
        # 检查文件大小
        file_size = len(file_content)
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise ValueError(
                f"File size {file_size} bytes exceeds maximum allowed size "
                f"{settings.MAX_UPLOAD_SIZE} bytes (10MB)"
            )
        
        # 检查文件扩展名
        ext = filename.lower().split('.')[-1] if '.' in filename else ''
        if ext not in settings.ALLOWED_IMAGE_FORMATS:
            raise ValueError(
                f"File format '{ext}' not allowed. "
                f"Allowed formats: {', '.join(settings.ALLOWED_IMAGE_FORMATS)}"
            )
        
        # 尝试打开图像以验证它是有效的图像文件
        try:
            image = Image.open(io.BytesIO(file_content))
            image.verify()  # 验证图像完整性
        except Exception as e:
            raise ValueError(f"Invalid image file: {str(e)}")
    
    @staticmethod
    def validate_image_quality(image_array: np.ndarray) -> ImageValidationResult:
        """
        验证图像质量
        
        Args:
            image_array: OpenCV 图像数组
            
        Returns:
            ImageValidationResult: 验证结果
        """
        # 检查分辨率
        height, width = image_array.shape[:2]
        if width < settings.MIN_RESOLUTION_WIDTH or height < settings.MIN_RESOLUTION_HEIGHT:
            return ImageValidationResult(
                False,
                f"Resolution {width}x{height} is below minimum required "
                f"{settings.MIN_RESOLUTION_WIDTH}x{settings.MIN_RESOLUTION_HEIGHT}"
            )
        
        # 检查模糊度（使用 Laplacian 方差）
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        if laplacian_var < settings.MIN_BLUR_THRESHOLD:
            return ImageValidationResult(
                False,
                f"Image is too blurry (blur score: {laplacian_var:.2f}, "
                f"minimum required: {settings.MIN_BLUR_THRESHOLD})"
            )
        
        # 检查亮度
        mean_brightness = np.mean(gray)
        if mean_brightness < settings.MIN_BRIGHTNESS or mean_brightness > settings.MAX_BRIGHTNESS:
            return ImageValidationResult(
                False,
                f"Image brightness {mean_brightness:.2f} is outside acceptable range "
                f"({settings.MIN_BRIGHTNESS}-{settings.MAX_BRIGHTNESS})"
            )
        
        return ImageValidationResult(True)
    
    @staticmethod
    def preprocess_image(image_array: np.ndarray) -> np.ndarray:
        """
        预处理图像（去噪、增强、矫正）
        
        Args:
            image_array: OpenCV 图像数组
            
        Returns:
            np.ndarray: 处理后的图像数组
        """
        # 转换为灰度图
        if len(image_array.shape) == 3:
            gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        else:
            gray = image_array
        
        # 去噪
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # 自适应直方图均衡化（增强对比度）
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)
        
        # 二值化（可选，根据需要）
        # _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # 转回 BGR 以便保存
        if len(image_array.shape) == 3:
            processed = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
        else:
            processed = enhanced
        
        return processed
    
    @staticmethod
    async def store_image(
        file_content: bytes,
        exam_id: str,
        image_type: str,
        original_filename: str
    ) -> str:
        """
        存储图像到本地或 OSS
        
        Args:
            file_content: 文件内容
            exam_id: 试卷 ID
            image_type: 图像类型（original/processed）
            original_filename: 原始文件名
            
        Returns:
            str: 图像 URL
        """
        # 生成文件名
        ext = original_filename.split('.')[-1] if '.' in original_filename else 'jpg'
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        filename = f"{exam_id}_{image_type}_{timestamp}.{ext}"
        
        # TODO: 集成阿里云 OSS
        # 这里暂时存储到本地
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        # 返回 URL（开发环境使用本地路径，生产环境使用 OSS URL）
        url = f"/uploads/{filename}"
        
        logger.info(f"Image stored: {url}")
        return url
    
    @staticmethod
    async def read_image(image_url: str) -> bytes:
        """
        从本地或 OSS 读取图像
        
        Args:
            image_url: 图像 URL
            
        Returns:
            bytes: 图像字节内容
            
        Raises:
            FileNotFoundError: 如果图像不存在
        """
        # TODO: 支持从 OSS 读取
        # 这里暂时从本地读取
        if image_url.startswith('/uploads/'):
            file_path = image_url[1:]  # 移除开头的 /
        else:
            file_path = image_url
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image not found: {image_url}")
        
        with open(file_path, 'rb') as f:
            return f.read()
    
    @staticmethod
    def bytes_to_cv2_image(file_content: bytes) -> np.ndarray:
        """
        将字节内容转换为 OpenCV 图像数组
        
        Args:
            file_content: 文件内容
            
        Returns:
            np.ndarray: OpenCV 图像数组
        """
        nparr = np.frombuffer(file_content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return image
    
    @staticmethod
    def cv2_image_to_bytes(image_array: np.ndarray, format: str = '.jpg') -> bytes:
        """
        将 OpenCV 图像数组转换为字节内容
        
        Args:
            image_array: OpenCV 图像数组
            format: 图像格式（.jpg, .png）
            
        Returns:
            bytes: 图像字节内容
        """
        success, encoded_image = cv2.imencode(format, image_array)
        if not success:
            raise ValueError("Failed to encode image")
        return encoded_image.tobytes()
