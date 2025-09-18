import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface StudentPortalProps {
  accessCode: string;
  setAccessCode: (code: string) => void;
}

export default function StudentPortal({ accessCode, setAccessCode }: StudentPortalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [student, setStudent] = useState<any>(null);

  const files = useQuery(
    api.files.getFilesForStudents,
    isLoggedIn && accessCode ? { accessCode } : "skip"
  );
  
  const verifyCode = useQuery(
    api.students.verifyAccessCode,
    accessCode.length === 6 ? { accessCode } : "skip"
  );

  const recordDownload = useMutation(api.files.recordDownload);

  const handleLogin = () => {
    if (accessCode.length !== 6) {
      toast.error("كود الوصول يجب أن يكون 6 أرقام");
      return;
    }

    if (verifyCode) {
      setIsLoggedIn(true);
      setStudent(verifyCode);
      toast.success(`مرحباً ${verifyCode.name}!`);
    } else {
      toast.error("كود الوصول غير صحيح أو غير مفعل");
    }
  };

  const handleDownload = async (fileId: any, downloadUrl: string, fileName: string) => {
    try {
      await recordDownload({ fileId, accessCode });
      
      // Open download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("تم بدء التحميل");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحميل");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case "video": return "🎥";
      case "image": return "🖼️";
      default: return "📄";
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              دخول الطلاب
            </h2>
            <p className="text-gray-600">
              أدخل كود الوصول المكون من 6 أرقام
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كود الوصول
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setAccessCode(value);
                }}
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {accessCode.length === 6 && verifyCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <span>✓</span>
                  <span className="font-medium">{verifyCode.name}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={accessCode.length !== 6 || !verifyCode}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              دخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              مرحباً {student?.name}
            </h1>
            <p className="text-gray-600">
              يمكنك تصفح وتحميل الملفات المتاحة
            </p>
          </div>
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setAccessCode("");
              setStudent(null);
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            تسجيل خروج
          </button>
        </div>
      </div>

      {/* Files */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            الملفات المتاحة ({files?.length || 0})
          </h2>
        </div>

        <div className="p-6">
          {files === undefined ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                لا توجد ملفات متاحة حالياً
              </h3>
              <p className="text-gray-600">
                سيتم إضافة الملفات قريباً
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {file.title}
                      </h3>
                      {file.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {file.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{file.fileName}</span>
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.downloadUrl && (
                        <>
                          {file.fileType === "video" || file.fileType === "image" ? (
                            <a
                              href={file.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              عرض
                            </a>
                          ) : null}
                          <button
                            onClick={() => handleDownload(file._id, file.downloadUrl!, file.fileName)}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            تحميل
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
