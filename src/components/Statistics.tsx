import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Statistics() {
  const downloadStats = useQuery(api.files.getDownloadStats);
  const students = useQuery(api.students.getStudents);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (downloadStats === undefined || students === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const totalDownloads = downloadStats.reduce((sum, file) => sum + file.downloadCount, 0);
  const activeStudents = students.filter(s => s.isActive).length;
  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl text-blue-600 mb-2">📁</div>
          <div className="text-2xl font-bold text-blue-800">
            {downloadStats.length}
          </div>
          <div className="text-sm text-blue-600">إجمالي الملفات</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl text-green-600 mb-2">⬇️</div>
          <div className="text-2xl font-bold text-green-800">
            {totalDownloads}
          </div>
          <div className="text-sm text-green-600">إجمالي التحميلات</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl text-purple-600 mb-2">👥</div>
          <div className="text-2xl font-bold text-purple-800">
            {totalStudents}
          </div>
          <div className="text-sm text-purple-600">إجمالي الطلاب</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-2xl text-orange-600 mb-2">✅</div>
          <div className="text-2xl font-bold text-orange-800">
            {activeStudents}
          </div>
          <div className="text-sm text-orange-600">الطلاب المفعلين</div>
        </div>
      </div>

      {/* Download Statistics */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          إحصائيات التحميل
        </h3>
        
        {downloadStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد ملفات لعرض إحصائياتها
          </div>
        ) : (
          <div className="space-y-3">
            {downloadStats
              .sort((a, b) => b.downloadCount - a.downloadCount)
              .map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">
                      {file.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      رُفع في {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {file.downloadCount}
                    </div>
                    <div className="text-xs text-gray-500">تحميل</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Students Status */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          حالة الطلاب
        </h3>
        
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا يوجد طلاب مسجلين
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {activeStudents}
                </div>
                <div className="text-sm text-green-600">طلاب مفعلين</div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">
                  {totalStudents - activeStudents}
                </div>
                <div className="text-sm text-red-600">طلاب غير مفعلين</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
