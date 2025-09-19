import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import FileViewer from "./FileViewer";
import AIChat from "./AIChat";

interface StudentDashboardProps {
  student: any;
}

export default function StudentDashboard({ student }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"files" | "videos" | "images" | "documents" | "ai">("files");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  const allFiles = useQuery(api.files.getAllFiles) || [];
  const videos = useQuery(api.files.getFilesByType, { fileType: "video" }) || [];
  const images = useQuery(api.files.getFilesByType, { fileType: "image" }) || [];
  const documents = useQuery(api.files.getFilesByType, { fileType: "document" }) || [];
  
  const recordDownload = useMutation(api.files.recordDownload);

  const handleDownload = async (file: any) => {
    try {
      await recordDownload({ studentId: student._id, fileId: file._id });
      
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("تم تحميل الملف بنجاح");
    } catch (error) {
      toast.error("حدث خطأ في تحميل الملف");
    }
  };

  const getFilesToShow = () => {
    switch (activeTab) {
      case "videos": return videos;
      case "images": return images;
      case "documents": return documents;
      default: return allFiles;
    }
  };

  const tabs = [
    { id: "files", label: "جميع الملفات", icon: "📁", count: allFiles.length },
    { id: "videos", label: "الفيديوهات", icon: "🎥", count: videos.length },
    { id: "images", label: "الصور", icon: "🖼️", count: images.length },
    { id: "documents", label: "المستندات", icon: "📄", count: documents.length },
    { id: "ai", label: "المساعد الذكي", icon: "🤖", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">مرحباً {student.name}! 👋</h2>
        <p className="opacity-90">كود الدخول الخاص بك: <span className="font-mono bg-white/20 px-2 py-1 rounded">{student.accessCode}</span></p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-white/20" : "bg-gray-200"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "ai" ? (
        <AIChat studentId={student._id} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilesToShow().map((file) => (
            <div key={file._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {file.fileType === "video" ? "🎥" : 
                       file.fileType === "image" ? "🖼️" : "📄"}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{file.fileType}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(file.uploadedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 text-gray-800">{file.title}</h3>
                {file.description && (
                  <p className="text-gray-600 text-sm mb-4">{file.description}</p>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedFile(file)}
                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    عرض
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    تحميل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}
    </div>
  );
}
