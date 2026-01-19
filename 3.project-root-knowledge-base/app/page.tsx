import FileUploader from '@/components/file-uploader';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Memex 🧠</h1>
        <p className="mb-8 text-gray-600">你的 AI 个人知识库 (Powered by SiliconFlow)</p>
        
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">上传文档</h2>
          <FileUploader />
        </div>
      </div>
    </main>
  );
}