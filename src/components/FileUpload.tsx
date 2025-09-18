import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function FileUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadFile = useMutation(api.files.uploadFile);

  const getFileType = (file: File): string => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    return "document";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى 100 ميجابايت");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الملف");
      return;
    }

    if (!selectedFile) {
      toast.error("يرجى اختيار ملف للرفع");
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Get upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      const json = await result.json();
      if (!result.ok) {
        throw new Error(`فشل في رفع الملف: ${JSON.stringify(json)}`);
      }

      const { storageId } = json;

      // Step 3: Save file info to database
      await uploadFile({
        title: title.trim(),
        description: description.trim() || undefined,
        fileId: storageId,
        fileType: getFileType(selectedFile),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });

      toast.success("تم رفع الملف بنجاح!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          رفع ملف جديد
        </h3>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الملف *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل عنوان الملف"
              disabled={isUploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الملف (اختياري)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل وصف للملف"
              disabled={isUploading}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الملف *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                disabled={isUploading}
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-green-600 text-2xl">✓</div>
                  <p className="font-medium text-gray-800">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedFile.size)} • {getFileType(selectedFile)}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                    disabled={isUploading}
                  >
                    اختيار ملف آخر
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400 text-4xl">📁</div>
                  <p className="text-gray-600">اضغط لاختيار ملف</p>
                  <p className="text-xs text-gray-500">
                    الملفات المدعومة: فيديو، صور، PDF، Word، PowerPoint، نصوص
                  </p>
                  <p className="text-xs text-gray-500">الحد الأقصى: 100 ميجابايت</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isUploading}
                  >
                    اختيار ملف
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !selectedFile || !title.trim()}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isUploading ? "جاري الرفع..." : "رفع الملف"}
          </button>
        </form>
      </div>
    </div>
  );
}
