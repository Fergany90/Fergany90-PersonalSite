import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function StudentManagement() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const students = useQuery(api.students.getStudents);
  const addStudent = useMutation(api.students.addStudent);
  const toggleStatus = useMutation(api.students.toggleStudentStatus);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setIsAdding(true);
    try {
      const result = await addStudent({ name: name.trim(), phone: phone.trim() });
      toast.success(`تم إضافة الطالب بنجاح! كود الوصول: ${result.accessCode}`);
      setName("");
      setPhone("");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إضافة الطالب");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (studentId: any) => {
    try {
      const newStatus = await toggleStatus({ studentId });
      toast.success(newStatus ? "تم تفعيل الطالب" : "تم إلغاء تفعيل الطالب");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Student Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          إضافة طالب جديد
        </h3>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الطالب
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسم الطالب"
                disabled={isAdding}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل رقم الهاتف"
                disabled={isAdding}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? "جاري الإضافة..." : "إضافة الطالب"}
          </button>
        </form>
      </div>

      {/* Students List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          قائمة الطلاب ({students?.length || 0})
        </h3>
        
        {students === undefined ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا يوجد طلاب مسجلين بعد
          </div>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-white border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{student.name}</h4>
                  <p className="text-sm text-gray-600">{student.phone}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      كود الوصول: {student.accessCode}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        student.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.isActive ? "مفعل" : "غير مفعل"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(student._id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    student.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {student.isActive ? "إلغاء التفعيل" : "تفعيل"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
