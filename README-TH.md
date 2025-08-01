# 🎵 Audio Summarizer

เว็บแอปพลิเคชันสำหรับอัปโหลดไฟล์เสียงและประมวลผลด้วย Google AI Studio เพื่อถอดข้อความหรือสรุปเนื้อหาโดยละเอียด พร้อมเก็บไฟล์ใน Google Drive

## ✨ ฟีเจอร์หลัก

- 📁 **อัปโหลดไฟล์เสียง** - รองรับไฟล์เสียงทุกประเภท (MP3, WAV, M4A, AAC, FLAC, OGG, WMA, AMR, 3GP)
- 📝 **ถอดข้อความ** - แปลงเสียงพูดให้เป็นข้อความด้วย Google AI
- 📋 **สรุปโดยละเอียด** - วิเคราะห์และสรุปเนื้อหาสำคัญจากไฟล์เสียง
- ☁️ **เก็บใน Google Drive** - อัปโหลดไฟล์อัตโนมัติไป Google Drive
- 💾 **ดาวน์โหลดผลลัพธ์** - บันทึกผลลัพธ์เป็นไฟล์ข้อความ
- 📋 **คัดลอกผลลัพธ์** - คัดลอกข้อความได้ทันที

## 🚀 การติดตั้งและใช้งาน

### ความต้องการของระบบ

- Node.js 18+ 
- npm หรือ yarn
- Google AI Studio API Key
- Google Drive API Key (ทางเลือก)

### การติดตั้ง

1. Clone หรือดาวน์โหลดโปรเจค
2. ติดตั้ง dependencies:
   ```bash
   npm install
   ```

3. สร้างไฟล์ `.env` จาก `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. กรอก API Keys ในไฟล์ `.env`:
   ```env
   VITE_GOOGLE_AI_API_KEY=your_google_ai_studio_api_key_here
   VITE_GOOGLE_DRIVE_API_KEY=your_google_drive_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

### การรัน

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 การตั้งค่า API Keys

### Google AI Studio API Key

1. ไปที่ [Google AI Studio](https://aistudio.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มี
3. ไปที่ API Keys และสร้าง API Key ใหม่
4. คัดลอก API Key ไปใส่ในไฟล์ `.env`

### Google Drive API (ทางเลือก)

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มี
3. เปิดใช้งาน Google Drive API
4. สร้าง credentials (API Key และ OAuth 2.0 Client ID)
5. คัดลอกค่าต่างๆ ไปใส่ในไฟล์ `.env`

## 📱 การใช้งาน

1. **อัปโหลดไฟล์** - ลากไฟล์เสียงมาวางหรือคลิกเพื่อเลือกไฟล์
2. **เลือกประเภทการประมวลผล** - เลือกระหว่าง "ถอดข้อความ" หรือ "สรุปโดยละเอียด"
3. **เริ่มประมวลผล** - คลิกปุ่มเพื่อเริ่มประมวลผล
4. **ดูผลลัพธ์** - ผลลัพธ์จะแสดงพร้อมตัวเลือกคัดลอกและดาวน์โหลด

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS3 with modern features
- **AI Processing**: Google AI Studio (Gemini)
- **File Storage**: Google Drive API
- **Build Tool**: Vite
- **Package Manager**: npm

## 📂 โครงสร้างโปรเจค

```
src/
├── components/          # React components
│   ├── AudioUploader/   # คอมโพเนนต์อัปโหลดไฟล์
│   ├── ProcessingOptions/ # ตัวเลือกการประมวลผล
│   └── ResultDisplay/   # แสดงผลลัพธ์
├── services/           # API services
│   ├── googleAI.ts     # Google AI Studio integration
│   └── googleDrive.ts  # Google Drive integration
├── App.tsx            # Main application component
├── App.css           # Main styles
└── main.tsx          # Application entry point
```

## 🔒 ความปลอดภัย

- API Keys จะถูกเก็บใน environment variables
- ไฟล์จะถูกประมวลผลแบบ client-side
- ไม่มีการเก็บไฟล์บนเซิร์ฟเวอร์

## 📝 ข้อจำกัด

- ขนาดไฟล์ขึ้นอยู่กับ Google AI Studio limits
- Google Drive integration ต้องการการตั้งค่า OAuth ที่ถูกต้อง
- การประมวลผลขึ้นอยู่กับคุณภาพของไฟล์เสียง

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาสร้าง issue ในโปรเจคนี้

## 📄 ลิขสิทธิ์

MIT License - ใช้งานได้อย่างอิสระ
