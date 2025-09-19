import React from "react";

interface FileViewerProps {
  file: any;
  onClose: () => void;
}

export default function FileViewer({ file, onClose }: FileViewerProps) {
  const renderFileContent = () => {
    switch (file.fileType) {
      case "video":
        return (
          <video
            controls
            className="w-full max-h-96 rounded-lg"
            poster={file.thumbnail}
          >
            <source src={file.url} type={file.mimeType} />
            متصفحك لا يدعم تشغيل الفيديو.
          </video>
        );
      
      case "image":
        return (
          <img
            src={file.url}
            alt={file.title}
            className="w-full max-h-96 object-contain rounded-lg"
          />
        );
      
      case "document":
        return (
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📄</span>
            </div>
            <p className="text-gray-600 mb-4">معاينة المستند غير متاحة</p>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              فتح المستند
            </a>
          </div>
        );
      
      default:
        return (
          <div className="text-center p-8">
            <p className="text-gray-600">نوع الملف غير مدعوم للمعاينة</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{file.title}</h3>
              {file.description && (
                <p className="text-gray-600 mt-2">{file.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          <div className="mb-6">
            {renderFileContent()}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
            <div className="flex items-center space-x-4">
              <span>النوع: {file.fileType}</span>
              <span>الحجم: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <span>تم الرفع: {new Date(file.uploadedAt).toLocaleDateString('ar-EG')}</span>
          </div>

          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {file.tags.map((tag: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
