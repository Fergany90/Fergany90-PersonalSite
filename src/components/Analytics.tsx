import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Analytics() {
  const downloadStats = useQuery(api.files.getDownloadStats) || [];
  const students = useQuery(api.students.getAllStudents) || [];
  const stats = useQuery(api.teacher.getDashboardStats);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800">التحليلات والإحصائيات</h3>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-bold mb-4 text-gray-800">أكثر الملفات تحميلاً</h4>
            <div className="space-y-3">
              {downloadStats.slice(0, 10).map((stat, index) => (
                <div key={stat.fileId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{stat.title}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
                    {stat.downloadCount} تحميل
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-bold mb-4 text-gray-800">نشاط الطلاب</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span>الطلاب النشطون</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">
                  {stats.activeStudents}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span>الطلاب غير النشطين</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded font-bold">
                  {stats.totalStudents - stats.activeStudents}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span>محادثات الذكاء الاصطناعي</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-bold">
                  {stats.totalChats}
                </span>
              </div>
            </div>
          </div>

          {/* File Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-bold mb-4 text-gray-800">توزيع الملفات</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span>🎥</span>
                  <span>الفيديوهات</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-bold">
                  {stats.filesByType.videos}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span>🖼️</span>
                  <span>الصور</span>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">
                  {stats.filesByType.images}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span>📄</span>
                  <span>المستندات</span>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded font-bold">
                  {stats.filesByType.documents}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-bold mb-4 text-gray-800">آخر الطلاب المسجلين</h4>
            <div className="space-y-3">
              {students
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5)
                .map((student) => (
                  <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded ${
                        student.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {student.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
