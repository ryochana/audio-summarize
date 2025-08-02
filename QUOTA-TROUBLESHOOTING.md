# 🚨 Google AI Quota & Rate Limits

## ปัญหาที่พบบ่อย: "You exceeded your current quota"

### 📊 **ข้อจำกัดของแต่ละ Model (ฟรี):**

#### **gemini-1.5-flash** ⚡ (แนะนำ!)
- ✅ **15 requests/minute**
- ✅ **1,500 requests/day**
- ✅ เร็วที่สุด, stable

#### **gemini-1.5-pro** 🚀
- ⚠️ **2 requests/minute** (น้อยมาก!)
- ⚠️ **50 requests/day**
- ❌ **หมดเร็ว** → Error 429

#### **gemini-2.0-flash-exp** 🆕
- ⚠️ **ไม่แน่นอน** (experimental)
- ⚠️ **อาจหยุดบริการได้**

---

## 🔧 **วิธีแก้ปัญหา:**

### **1. เปลี่ยน Model ทันที:**
แก้ไขในไฟล์ `.env`:
```env
VITE_AI_MODEL=gemini-1.5-flash  # เปลี่ยนเป็นนี้
```

### **2. รอ Quota Reset:**
```
⏰ Reset ทุก: 1 นาที (สำหรับ per-minute limit)
⏰ Reset ทุก: เที่ยงคืน UTC (สำหรับ per-day limit)
```

### **3. ใช้ Multiple API Keys:**
- สร้าง Project ใหม่ใน Google AI Studio
- ได้ API Key ใหม่
- เปลี่ยนใน `.env`

---

## 💡 **Tips การใช้:**

### **สำหรับทดสอบ:**
```env
VITE_AI_MODEL=gemini-1.5-flash  # 15 req/min = เยอะ
```

### **สำหรับใช้งานจริง:**
```env
VITE_AI_MODEL=gemini-1.5-pro    # คุณภาพดี แต่ 2 req/min
```

### **Auto Fallback:**
แอปจะเปลี่ยนจาก Pro → Flash อัตโนมัติเมื่อโควต้าหมด

---

## 🚀 **Upgrade Options:**

### **Google AI Studio Paid:**
- $0.125 per 1M input tokens
- $0.375 per 1M output tokens
- ไม่มี rate limit

### **Alternative APIs:**
- **OpenAI Whisper:** $0.006/minute
- **Azure Speech:** ฟรี 5 ชั่วโมง/เดือน
- **AssemblyAI:** ฟรี 5 ชั่วโมง/เดือน

---

## ⚡ **Quick Fix:**

**หากเจอ Error 429 ตอนนี้:**
1. รอ 1-2 นาที
2. หรือเปลี่ยนเป็น `gemini-1.5-flash`
3. Restart dev server: `npm run dev`
