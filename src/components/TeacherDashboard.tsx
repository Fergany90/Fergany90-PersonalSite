import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import StudentManagement from "./StudentManagement";
import FileUpload from "./FileUpload";
import FilesList from "./FilesList";
import Statistics from "./Statistics";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<"files" | "students" | "upload" | "stats">("files");

  const tabs = [
    { id: "files", label: "الملفات", icon: "📁" },
    { id: "students", label: "الطلاب", icon: "👥" },
    { id: "upload", label: "رفع ملف", icon: "⬆️" },
    { id: "stats", label: "الإحصائيات", icon: "📊" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          لوحة تحكم المدرس
        </h1>
        <p className="text-gray-600">
          إدارة الملفات والطلاب ومتابعة الإحصائيات
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "files" && <FilesList />}
          {activeTab === "students" && <StudentManagement />}
          {activeTab === "upload" && <FileUpload />}
          {activeTab === "stats" && <Statistics />}
        </div>
      </div>
    </div>
  );
}
