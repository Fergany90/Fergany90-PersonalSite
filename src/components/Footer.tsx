import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">منصة التعلم الذكية</h3>
            <p className="text-gray-300 text-sm">
              منصة تعليمية متطورة مدعومة بالذكاء الاصطناعي لتوفير تجربة تعلم فريدة ومتميزة
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">المطور والمعلم</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>الاسم:</strong> عمر الفرجاني</p>
              <p><strong>البريد الإلكتروني:</strong> omarfergany100@gmail.com</p>
              <p><strong>الموقع الشخصي:</strong> Fergany71.github.io</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">تواصل معنا</h4>
            <div className="space-y-3">
              <a 
                href="https://wa.me/201225860308" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <span>📱</span>
                <span>WhatsApp</span>
              </a>
              <a 
                href="https://www.facebook.com/share/1B6Aef5zFx/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>📘</span>
                <span>Facebook</span>
              </a>
              <a 
                href="https://www.instagram.com/fergany___x" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-colors"
              >
                <span>📷</span>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 منصة التعلم الذكية - جميع الحقوق محفوظة للأستاذ عمر الفرجاني
          </p>
          <p className="text-gray-500 text-xs mt-2">
            مدعوم بتقنية Convex و Gemini AI
          </p>
        </div>
      </div>
    </footer>
  );
}
