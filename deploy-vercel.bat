@echo off
echo.
echo ==========================================
echo   Deploy Audio Summarizer to Vercel
echo ==========================================
echo.
echo ขั้นตอนที่ 1: ตรวจสอบ Vercel CLI
vercel --version
if errorlevel 1 (
    echo ❌ Vercel CLI ยังไม่ได้ติดตั้ง
    echo กำลังติดตั้ง Vercel CLI...
    npm install -g vercel
)

echo.
echo ขั้นตอนที่ 2: Login Vercel
echo คุณต้อง:
echo 1. ไปสมัครที่ https://vercel.com/signup ก่อน ถ้ายังไม่มีบัญชี
echo 2. เลือกวิธี login เมื่อถาม
echo.
echo กด Enter เพื่อเปิดหน้าสมัคร Vercel...
pause
start https://vercel.com/signup
echo.
echo รอสมัครเสร็จแล้วกด Enter เพื่อ Login...
pause
vercel login

echo.
echo ขั้นตอนที่ 3: Build โปรเจค
npm run build

echo.
echo ขั้นตอนที่ 4: Deploy โปรเจค
echo ตอบคำถาม:
echo - Set up and deploy? กด Y
echo - Project name? กด Enter (ใช้ audio-summarize)
echo - Directory? กด Enter
echo.
pause
vercel --prod

echo.
echo ✅ Deploy เสร็จแล้ว!
echo.
echo 🔧 สำคัญ: ตั้งค่า Environment Variables
echo 1. ไปที่ลิงค์ที่ได้จาก deploy
echo 2. Login Vercel Dashboard
echo 3. เลือกโปรเจค audio-summarize
echo 4. ไปที่ Settings > Environment Variables
echo 5. เพิ่ม VITE_GOOGLE_AI_API_KEY = API Key ของคุณ
echo 6. กด Save และ Redeploy
echo.
echo กด Enter เพื่อเปิด Vercel Dashboard
pause
start https://vercel.com/dashboard
echo.
echo สคริปต์จบแล้ว - หน้าต่างจะปิดใน 30 วินาที
timeout /t 30
