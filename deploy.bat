@echo off
echo.
echo ====================================
echo   Deploy Audio Summarizer
echo ====================================
echo.
echo เลือกวิธีการ Deploy:
echo.
echo 1. Vercel (แนะนำ - ง่ายที่สุด)
echo 2. Build สำหรับ Netlify
echo 3. ดูคำแนะนำ Deploy
echo.
set /p choice="เลือก (1-3): "

if %choice%==1 (
    echo.
    echo กำลัง Deploy ด้วย Vercel...
    echo กรุณา Login และทำตามขั้นตอน
    echo.
    vercel
) else if %choice%==2 (
    echo.
    echo กำลัง Build โปรเจค...
    npm run build
    echo.
    echo ✅ Build เสร็จแล้ว!
    echo โฟลเดอร์ 'dist' พร้อมสำหรับอัปโหลดไป Netlify
    echo ไปที่ https://netlify.com/ และลาก dist folder ไปวาง
    echo.
) else if %choice%==3 (
    echo.
    echo เปิดไฟล์ DEPLOYMENT-GUIDE.md เพื่อดูคำแนะนำ
    start DEPLOYMENT-GUIDE.md
) else (
    echo Invalid choice
)

pause
