# 🔑 วิธีตั้งค่า Google AI Studio API Key

## ขั้นตอนที่ 1: รับ API Key

1. ไปที่ [Google AI Studio](https://aistudio.google.com/)
2. เข้าสู่ระบบด้วย Google Account ของคุณ
3. คลิกที่ **"Get API key"** ในเมนูด้านซ้าย
4. คลิก **"Create API key"**
5. เลือก Google Cloud project หรือสร้างใหม่
6. คัดลอก API Key ที่ได้

## ขั้นตอนที่ 2: สร้างไฟล์ .env

1. ในโฟลเดอร์ `audio-summarize` สร้างไฟล์ชื่อ `.env`
2. เปิดไฟล์ `.env` ด้วย Text Editor
3. เพิ่มบรรทัดนี้:

```
VITE_GOOGLE_AI_API_KEY=YOUR_API_KEY_HERE
```

**แทนที่ `YOUR_API_KEY_HERE` ด้วย API Key จริงของคุณ**

### ตัวอย่าง:
```
VITE_GOOGLE_AI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ขั้นตอนที่ 3: รีสตาร์ทเซิร์ฟเวอร์

1. หยุดเซิร์ฟเวอร์ (กด Ctrl+C ใน Terminal)
2. รันใหม่: `npm run dev`
3. เปิดเบราว์เซอร์ไปที่ http://localhost:5173

## ⚠️ ข้อควรระวัง

- **อย่าแชร์ API Key กับใครและไม่ควรอัปโหลดไฟล์ .env ขึ้น Git**
- API Key มีค่าใช้จ่าย - ตรวจสอบ usage ที่ Google AI Studio
- หากไม่ใช้งานแล้ว ควร revoke API Key เพื่อความปลอดภัย

## 🔍 การแก้ไขปัญหา

### หากยังขึ้น "API key is not configured":
1. ตรวจสอบว่าไฟล์ `.env` อยู่ในโฟลเดอร์เดียวกับ `package.json`
2. ตรวจสอบว่าไม่มีเครื่องหมาย space หรือ quote พิเศษ
3. รีสตาร์ทเซิร์ฟเวอร์ใหม่

### หากขึ้น "Invalid API key":
1. ตรวจสอบว่า API Key ถูกต้อง
2. ตรวจสอบว่า Google AI Studio API เปิดใช้งานแล้ว
3. ลองสร้าง API Key ใหม่
