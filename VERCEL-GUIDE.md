# 🚀 Deploy ไป Vercel ใน 5 นาที

## ✅ สิ่งที่ต้องทำ:

### 1. สมัครบัญชี Vercel ฟรี
ไปที่: https://vercel.com/signup
- เลือก "Continue with GitHub" (แนะนำ)
- หรือใช้ Email

### 2. รันคำสั่ง Deploy
```bash
# วิธีที่ 1: ใช้ไฟล์ .bat
deploy-vercel.bat

# วิธีที่ 2: รันคำสั่งเอง
vercel login
vercel --prod
```

### 3. ตั้งค่า Environment Variables
1. ไปที่ Vercel Dashboard: https://vercel.com/dashboard
2. เลือกโปรเจค audio-summarizer
3. ไปที่ Settings > Environment Variables
4. เพิ่ม:
   - **Name:** `VITE_GOOGLE_AI_API_KEY`
   - **Value:** `AIzaSyAt-biBMHaNkujusBmI8V_nSrvCSsgXKJs`
   - **Environment:** Production, Preview, Development

### 4. Redeploy
หลังตั้งค่า Environment Variables แล้ว:
```bash
vercel --prod
```

## 🎉 เสร็จแล้ว!

- เว็บจะได้ URL แบบ: `https://audio-summarizer-xxx.vercel.app`
- ใช้งานได้ทันที
- Update โค้ดแล้ว redeploy ได้เรื่อยๆ

## 💡 Tips:
- Vercel ฟรี 100% สำหรับ hobby project
- Support custom domain ฟรี
- Auto SSL certificate
- CDN ทั่วโลก
