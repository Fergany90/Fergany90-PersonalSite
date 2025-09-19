import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function StudentManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", phone: "" });
  
  const students = useQuery(api.students.getAllStudents) || [];
  const createStudent = useMutation(api.students.createStudent);
  const toggleStudentStatus = useMutation(api.students.toggleStudentStatus);
  const regenerateAccessCode = useMutation(api.students.regenerateAccessCode);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createStudent(newStudent);
      toast.success(`تم إضافة الطالب بنجاح! كود الدخول: ${result.accessCode}`);
      setNewStudent({ name: "", phone: "" });
      setShowAddForm(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (studentId: Id<"students">) => {
    try {
      const newStatus = await toggleStudentStatus({ studentId });
      toast.success(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الطالب`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRegenerateCode = async (studentId: Id<"students">) => {
    try {
      const newCode = await regenerateAccessCode({ studentId });
      toast.success(`تم إنشاء كود جديد: ${newCode}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">إدارة الطلاب</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          {showAddForm ? "إلغاء" : "إضافة طالب جديد"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-bold mb-4">إضافة طالب جديد</h4>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="اسم الطالب"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              إضافة الطالب
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الهاتف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                كود الدخول
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ التسجيل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {student.accessCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    student.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {student.isActive ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleToggleStatus(student._id)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      student.isActive
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {student.isActive ? "إلغاء التفعيل" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => handleRegenerateCode(student._id)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium"
                  >
                    كود جديد
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
