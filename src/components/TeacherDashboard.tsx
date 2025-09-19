import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import StudentManagement from "./StudentManagement";
import FileManagement from "./FileManagement";
import Analytics from "./Analytics";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "files" | "analytics">("overview");
  
  const stats = useQuery(api.teacher.getDashboardStats);

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: "📊" },
    { id: "students", label: "إدارة الطلاب", icon: "👥" },
    { id: "files", label: "إدارة الملفات", icon: "📁" },
    { id: "analytics", label: "التحليلات", icon: "📈" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">لوحة تحكم المعلم 👨‍🏫</h2>
        <p className="opacity-90">مرحباً أستاذ عمر الفرجاني - إدارة شاملة للمنصة التعليمية</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الطلاب</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الطلاب النشطون</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الملفات</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalFiles}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي التحميلات</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⬇️</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">نظرة عامة على المنصة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                <h4 className="font-bold text-blue-800 mb-4">توزيع الملفات</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>فيديوهات:</span>
                    <span className="font-bold">{stats.filesByType.videos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>صور:</span>
                    <span className="font-bold">{stats.filesByType.images}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مستندات:</span>
                    <span className="font-bold">{stats.filesByType.documents}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                <h4 className="font-bold text-green-800 mb-4">نشاط المنصة</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>محادثات الذكاء الاصطناعي:</span>
                    <span className="font-bold">{stats.totalChats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>معدل التحميل:</span>
                    <span className="font-bold">
                      {stats.totalFiles > 0 ? Math.round(stats.totalDownloads / stats.totalFiles) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                <h4 className="font-bold text-purple-800 mb-4">معلومات المطور</h4>
                <div className="text-sm space-y-1">
                  <p><strong>الاسم:</strong> عمر الفرجاني</p>
                  <p><strong>البريد:</strong> omarfergany100@gmail.com</p>
                  <p><strong>الموقع:</strong> Fergany71.github.io</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "students" && <StudentManagement />}
        {activeTab === "files" && <FileManagement />}
        {activeTab === "analytics" && <Analytics />}
      </div>
    </div>
  );
}
