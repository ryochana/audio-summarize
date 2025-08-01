@echo off
echo.
echo ====================================
echo   Audio Summarizer Development Server
echo ====================================
echo.
echo เปิดในเบราว์เซอร์ที่: http://localhost:5173
echo.
echo หากยังไม่ได้ตั้งค่า API Key:
echo 1. สร้างไฟล์ .env ในโฟลเดอร์นี้
echo 2. เพิ่มบรรทัด: VITE_GOOGLE_AI_API_KEY=your_api_key_here
echo 3. ไปรับ API Key ที่: https://aistudio.google.com/
echo.
echo กำลังเริ่มเซิร์ฟเวอร์...
echo.
npm run dev
