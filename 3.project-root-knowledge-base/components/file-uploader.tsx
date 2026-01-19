'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('正在解析文档并存入向量数据库...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('上传失败');

      setStatus('success');
      setMessage('文档已成功存入知识库！');
      setFile(null); // 上传成功后清空
    } catch (e) {
      console.error(e);
      setStatus('error');
      setMessage('上传过程中出错，请重试。');
    }
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-gray-50 text-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt,.md,.pdf"
          onChange={handleFileChange}
        />
        
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Upload size={24} />
          </div>
          <span className="text-gray-700 font-medium">点击选择文件 或 拖拽至此</span>
          <span className="text-gray-400 text-xs">支持 PDF, TXT, MD (最大 5MB)</span>
        </label>

        {file && (
          <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-700 truncate">
              <FileText size={16} />
              <span className="truncate max-w-[200px]">{file.name}</span>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
              }}
              className="text-red-500 hover:text-red-700 text-xs font-bold px-2"
            >
              移除
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className={`mt-4 w-full py-2 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center space-x-2
          ${!file || status === 'uploading' 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-black hover:bg-gray-800'}`}
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>处理中...</span>
          </>
        ) : (
          <span>开始上传</span>
        )}
      </button>

      {/* 状态提示 */}
      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md flex items-center">
          <CheckCircle size={18} className="mr-2" />
          {message}
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {message}
        </div>
      )}
    </div>
  );
}