import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function FilesList() {
  const files = useQuery(api.files.getFilesForTeacher);
  const deleteFile = useMutation(api.files.deleteFile);

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case "video": return "🎥";
      case "image": return "🖼️";
      default: return "📄";
    }
  };

  const handleDelete = async (fileId: any, fileName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الملف "${fileName}"؟`)) {
      return;
    }

    try {
      await deleteFile({ fileId });
      toast.success("تم حذف الملف بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف الملف");
    }
  };

  if (files === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          لا توجد ملفات مرفوعة
        </h3>
        <p className="text-gray-600">
          ابدأ برفع أول ملف من تبويب "رفع ملف"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          الملفات المرفوعة ({files.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {files.map((file) => (
          <div
            key={file._id}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-3xl">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">
                    {file.title}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {file.fileName}
                  </p>
                  {file.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {file.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                    <span className="capitalize">{file.fileType}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {file.downloadUrl && (
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    عرض
                  </a>
                )}
                <button
                  onClick={() => handleDelete(file._id, file.fileName)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
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
