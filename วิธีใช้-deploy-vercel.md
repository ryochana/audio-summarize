# 🚀 วิธีใช้งานไฟล์ deploy-vercel.bat

## 📋 ขั้นตอนก่อนเริ่ม:

### 1. สมัครบัญชี Vercel ฟรี (ถ้ายังไม่มี)
- เปิดเบราว์เซอร์ไปที่: https://vercel.com/signup
- เลือก "Continue with GitHub" (แนะนำ)
- หรือใช้ Email สมัคร

### 2. รันไฟล์ deploy-vercel.bat
- **ดับเบิลคลิก** ไฟล์ `deploy-vercel.bat`
- **อย่าปิดหน้าต่างดำ** - ให้มันทำงานจนจบ
- จะมีคำถามให้ตอบเป็นระยะๆ

## 🔄 สิ่งที่จะเกิดขึ้นเมื่อรัน:

### ขั้นตอนที่ 1: ติดตั้ง Vercel CLI
- จะติดตั้งให้อัตโนมัติถ้ายังไม่มี

### ขั้นตอนที่ 2: Login
- จะเปิดเบราว์เซอร์ให้ login Vercel
- Login แล้วกลับมาที่หน้าต่างดำ

### ขั้นตอนที่ 3: Build โปรเจค
- จะ build โปรเจคให้พร้อม deploy

### ขั้นตอนที่ 4: Deploy
จะถามคำถาม:
- **Set up and deploy?** ตอบ: `Y`
- **Project name?** กด `Enter` (ใช้ชื่อเดิม)
- **Directory?** กด `Enter`

### ขั้นตอนที่ 5: เสร็จแล้ว!
- จะได้ลิงค์เว็บ เช่น: `https://audio-summarize-xxx.vercel.app`

## ⚠️ สำคัญ: ตั้งค่า API Key

เว็บจะยังใช้งานไม่ได้เพราะขาด API Key:

1. **เปิดลิงค์เว็บที่ได้**
2. **ไป Vercel Dashboard** (จะเปิดให้อัตโนมัติ)
3. **เลือกโปรเจค** audio-summarize
4. **ไปที่** Settings > Environment Variables
5. **เพิ่มตัวแปร:**
   - Name: `VITE_GOOGLE_AI_API_KEY`
   - Value: `AIzaSyAt-biBMHaNkujusBmI8V_nSrvCSsgXKJs`
   - Environment: เลือกทั้งหมด (Production, Preview, Development)
6. **กด Save**
7. **ไปที่** Deployments > กด menu ... > Redeploy

## 🎉 เสร็จแล้ว!
เว็บพร้อมใช้งาน - ลองอัปโหลดไฟล์เสียงและถอดข้อความได้เลย!

---

## 🆘 ถ้าติดปัญหา:

### หน้าต่างดับทันที:
- เปิด Command Prompt แล้วพิมพ์: `cd C:\Users\P\Documents\audio-summarize`
- แล้วพิมพ์: `deploy-vercel.bat`

### ไม่สามารถ login:
- ตรวจสอบว่าสมัครบัญชี Vercel แล้ว
- ลองปิดเบราว์เซอร์แล้วเปิดใหม่

### Deploy ไม่สำเร็จ:
- ตรวจสอบอินเทอร์เน็ต
- ลองรันคำสั่ง `npm run build` ก่อน
