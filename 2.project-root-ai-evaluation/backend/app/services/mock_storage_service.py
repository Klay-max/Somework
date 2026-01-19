"""Mock Storage Service for local development"""
import os
import shutil
from pathlib import Path
from typing import Optional


class MockStorageService:
    """Mock storage service that stores files locally"""
    
    def __init__(self, base_path: str = "/app/uploads"):
        """Initialize mock storage with base path"""
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def upload_file(self, file_path: str, destination: str) -> str:
        """
        Store file locally and return mock URL
        
        Args:
            file_path: Source file path
            destination: Destination path relative to base
            
        Returns:
            str: Mock URL for the uploaded file
        """
        dest_path = self.base_path / destination
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 复制文件
        shutil.copy2(file_path, dest_path)
        
        # 返回模拟 URL
        return f"http://localhost:8000/uploads/{destination}"
    
    async def download_file(self, url: str, local_path: str) -> str:
        """
        Download file from mock storage
        
        Args:
            url: Mock URL of the file
            local_path: Local path to save the file
            
        Returns:
            str: Local file path
        """
        # 从 URL 提取文件路径
        file_path = url.replace("http://localhost:8000/uploads/", "")
        source_path = self.base_path / file_path
        
        if source_path.exists():
            shutil.copy2(source_path, local_path)
            return local_path
        else:
            raise FileNotFoundError(f"File not found: {url}")
    
    async def delete_file(self, url: str) -> bool:
        """
        Delete file from mock storage
        
        Args:
            url: Mock URL of the file
            
        Returns:
            bool: True if deleted successfully
        """
        file_path = url.replace("http://localhost:8000/uploads/", "")
        full_path = self.base_path / file_path
        
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    
    async def file_exists(self, url: str) -> bool:
        """
        Check if file exists in mock storage
        
        Args:
            url: Mock URL of the file
            
        Returns:
            bool: True if file exists
        """
        file_path = url.replace("http://localhost:8000/uploads/", "")
        full_path = self.base_path / file_path
        return full_path.exists()
    
    async def get_file_size(self, url: str) -> Optional[int]:
        """
        Get file size in bytes
        
        Args:
            url: Mock URL of the file
            
        Returns:
            Optional[int]: File size in bytes, None if not found
        """
        file_path = url.replace("http://localhost:8000/uploads/", "")
        full_path = self.base_path / file_path
        
        if full_path.exists():
            return full_path.stat().st_size
        return None
