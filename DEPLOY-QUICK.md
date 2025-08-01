# 🚀 3 วิธีง่ายๆ ขึ้นเว็บฟรี

## ⚡ วิธีเร็วสุด: Netlify Drop

1. รันคำสั่ง: `npm run build`
2. ไปที่ https://netlify.com/drop
3. ลากโฟลเดอร์ `dist` ไปวาง
4. รอ 30 วินาที - เสร็จ! 🎉

**ข้อจำกัด:** ไม่สามารถตั้งค่า Environment Variables ได้

---

## 🌟 วิธีแนะนำ: Vercel

1. สมัครที่ https://vercel.com/ 
2. รันคำสั่ง: `vercel` (หรือดับเบิลคลิก `deploy.bat`)
3. ทำตามขั้นตอน Login
4. ตั้งค่า Environment Variables:
   - `VITE_GOOGLE_AI_API_KEY` = API Key ของคุณ

**ข้อดี:** ตั้งค่า Environment Variables ได้, Auto-deploy

---

## 🔄 วิธีครบครัน: GitHub Pages

1. Push โปรเจคไป GitHub
2. ไปที่ Settings > Pages > Source: GitHub Actions  
3. ใน Secrets ตั้งค่า:
   - `VITE_GOOGLE_AI_API_KEY` = API Key ของคุณ
4. Push อีกครั้ง - จะ auto-deploy

**ข้อดี:** ฟรีตลอดไป, Professional

---

## 🔑 สำคัญ: Environment Variables

ทุกวิธีต้องตั้งค่า API Key:
- **ชื่อ:** `VITE_GOOGLE_AI_API_KEY`  
- **ค่า:** API Key จาก Google AI Studio

**อย่าใส่ API Key ลงในโค้ดโดยตรง!**

---

## ✅ ทดสอบหลัง Deploy

1. เปิดเว็บที่ได้
2. อัปโหลดไฟล์เสียงทดสอบ
3. ลองถอดข้อความ
4. แชร์ให้เพื่อนใช้งาน! 🎉
