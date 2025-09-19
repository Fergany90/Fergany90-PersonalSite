import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function FileManagement() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    fileType: "document" as "video" | "image" | "document",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const files = useQuery(api.files.getAllFiles) || [];
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);
  const deleteFile = useMutation(api.files.deleteFile);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Auto-detect file type
      if (file.type.startsWith('video/')) {
        setUploadData(prev => ({ ...prev, fileType: 'video' }));
      } else if (file.type.startsWith('image/')) {
        setUploadData(prev => ({ ...prev, fileType: 'image' }));
      } else {
        setUploadData(prev => ({ ...prev, fileType: 'document' }));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف");
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Get upload URL
      const postUrl = await generateUploadUrl();
      
      // Step 2: Upload file to storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      
      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }
      
      // Step 3: Save file metadata
      await uploadFile({
        title: uploadData.title,
        description: uploadData.description || undefined,
        fileId: json.storageId,
        fileType: uploadData.fileType,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        tags: uploadData.tags ? uploadData.tags.split(',').map(tag => tag.trim()) : undefined,
      });

      toast.success("تم رفع الملف بنجاح!");
      setShowUploadForm(false);
      setUploadData({ title: "", description: "", fileType: "document", tags: "" });
      setSelectedFile(null);
    } catch (error: any) {
      toast.error("حدث خطأ في رفع الملف");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: Id<"files">) => {
    if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
      try {
        await deleteFile({ fileId });
        toast.success("تم حذف الملف بنجاح");
      } catch (error: any) {
        toast.error("حدث خطأ في حذف الملف");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">إدارة الملفات</h3>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {showUploadForm ? "إلغاء" : "رفع ملف جديد"}
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-bold mb-4">رفع ملف جديد</h4>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="عنوان الملف"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={uploadData.fileType}
                onChange={(e) => setUploadData({ ...uploadData, fileType: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="document">مستند</option>
                <option value="video">فيديو</option>
                <option value="image">صورة</option>
              </select>
            </div>
            
            <textarea
              placeholder="وصف الملف (اختياري)"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            
            <input
              type="text"
              placeholder="العلامات (مفصولة بفواصل)"
              value={uploadData.tags}
              onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            
            {selectedFile && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>الملف المحدد:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isUploading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? "جاري الرفع..." : "رفع الملف"}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div key={file._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">
                  {file.fileType === "video" ? "🎥" : 
                   file.fileType === "image" ? "🖼️" : "📄"}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
              
              <h4 className="font-bold text-lg mb-2">{file.title}</h4>
              {file.description && (
                <p className="text-gray-600 text-sm mb-4">{file.description}</p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>{new Date(file.uploadedAt).toLocaleDateString('ar-EG')}</span>
                <span className="capitalize">{file.fileType}</span>
              </div>
              
              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {file.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2">
                <a
                  href={file.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm text-center"
                >
                  عرض
                </a>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
