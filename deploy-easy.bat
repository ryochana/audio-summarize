@echo off
echo.
echo ==========================================
echo   วิธีง่าย: Manual Deploy ไป Vercel
echo ==========================================
echo.
echo วิธีนี้ไม่ต้องใช้ Command Line ซับซ้อน!
echo.
echo ขั้นตอน:
echo 1. Build โปรเจค
echo 2. เปิด Vercel Dashboard
echo 3. Upload โฟลเดอร์ dist
echo.
echo กำลัง Build โปรเจค...
npm run build

echo.
echo ✅ Build เสร็จแล้ว! 
echo โฟลเดอร์ 'dist' พร้อมใช้งาน
echo.
echo ต่อไป:
echo 1. ไปที่ https://vercel.com/new
echo 2. เลือก "Browse" หรือลากโฟลเดอร์ 'dist' ไปวาง
echo 3. กด Deploy
echo 4. ตั้งค่า Environment Variables ใน Settings
echo.

echo กด Enter เพื่อเปิด:
echo - โฟลเดอร์ dist (สำหรับ upload)
echo - Vercel Dashboard (สำหรับ deploy)
pause

start .
start https://vercel.com/new

echo.
echo ✅ เปิดโฟลเดอร์และเว็บแล้ว!
echo ลากโฟลเดอร์ 'dist' ไปวางในเว็บ Vercel
echo.
timeout /t 15
