# 🚀 Deploy Audio Summarizer ไปเว็บฟรี

## 🌟 วิธีที่ 1: Vercel (แนะนำ - ง่ายที่สุด)

### ขั้นตอนการ Deploy:

1. **สร้างบัญชี Vercel:**
   - ไปที่ https://vercel.com/
   - Sign up ด้วย GitHub account

2. **Connect GitHub Repository:**
   - อัปโหลดโปรเจคไป GitHub ก่อน
   - หรือใช้ Vercel CLI

### 🔧 Deploy ด้วย Vercel CLI:

```bash
# 1. Login Vercel
vercel login

# 2. Deploy โปรเจค
vercel

# 3. ทำตามขั้นตอนที่ปรากฏ
# - Set up and deploy? [Y/n] Y
# - Which scope? เลือก account ของคุณ
# - Link to existing project? [y/N] N
# - What's your project's name? audio-summarizer
# - In which directory is your code located? ./
```

### 🌍 Deploy ด้วย GitHub:

1. Push โปรเจคไป GitHub
2. ไปที่ Vercel Dashboard
3. คลิก "New Project"
4. Import จาก GitHub
5. ตั้งค่า Environment Variables:
   - `VITE_GOOGLE_AI_API_KEY` = API Key ของคุณ

---

## 🎯 วิธีที่ 2: Netlify

1. ไปที่ https://netlify.com/
2. Sign up ด้วย GitHub
3. Drag & Drop โฟลเดอร์ `dist` หลัง `npm run build`
4. ตั้งค่า Environment Variables ใน Site Settings

---

## ☁️ วิธีที่ 3: GitHub Pages

1. Push โปรเจคไป GitHub
2. ไปที่ Settings > Pages
3. เลือก Source: GitHub Actions
4. สร้างไฟล์ `.github/workflows/deploy.yml`

---

## 🔑 Environment Variables สำคัญ:

สำหรับทุกแพลตฟอร์ม ต้องตั้งค่า:
- `VITE_GOOGLE_AI_API_KEY` = Google AI Studio API Key ของคุณ
- `VITE_GOOGLE_CLIENT_ID` = Google OAuth Client ID (ถ้าต้องการ Google Drive)

---

## 📝 ข้อควรระวัง:

- **อย่าใส่ API Key ในโค้ด** - ใช้ Environment Variables เท่านั้น
- **ตรวจสอบ CORS** - อาจต้องเพิ่ม domain ใน Google Cloud Console
- **ทดสอบบนมือถือ** - แอปรองรับ responsive design

---

## 🎉 หลังจาก Deploy แล้ว:

1. ทดสอบการอัปโหลดไฟล์
2. ทดสอบการถอดข้อความ
3. ทดสอบการสรุปเนื้อหา
4. แชร์ลิงค์ให้เพื่อนใช้งาน!
