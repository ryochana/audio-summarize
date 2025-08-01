import { GoogleGenerativeAI } from '@google/generative-ai'

// Configuration
const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || ''

if (!GOOGLE_AI_API_KEY) {
  console.warn('Google AI API key is not configured. Please set VITE_GOOGLE_AI_API_KEY in your environment.')
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY)

export interface ProcessingResult {
  success: boolean
  data?: string
  error?: string
}

export interface ProcessingProgress {
  step: string
  progress: number
  details: string
  logs: string[]
}

export class GoogleAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  private progressCallback?: (progress: ProcessingProgress) => void

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback
  }

  private updateProgress(step: string, progress: number, details: string, log?: string) {
    if (this.progressCallback) {
      const logs = log ? [log] : []
      this.progressCallback({ step, progress, details, logs })
    }
  }

  async transcribeAudio(audioFile: File): Promise<ProcessingResult> {
    try {
      if (!GOOGLE_AI_API_KEY) {
        this.updateProgress('Error', 0, 'API Key ไม่ถูกต้อง', '❌ ไม่พบ Google AI API Key')
        return {
          success: false,
          error: 'Google AI API key is not configured'
        }
      }

      // Step 1: Validate file
      this.updateProgress('Validating', 10, 'ตรวจสอบไฟล์...', `📁 ตรวจสอบไฟล์: ${audioFile.name}`)
      
      if (!this.isValidAudioFile(audioFile)) {
        this.updateProgress('Error', 0, 'ไฟล์ไม่ถูกต้อง', '❌ ไฟล์ไม่ใช่ไฟล์เสียงที่รองรับ')
        return {
          success: false,
          error: 'Invalid audio file format'
        }
      }

      // Step 2: Convert to base64
      this.updateProgress('Converting', 25, 'แปลงไฟล์...', `🔄 แปลงไฟล์เป็น Base64 (ขนาด: ${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`)
      
      const audioData = await this.fileToBase64(audioFile)
      
      // Step 3: Prepare for AI
      this.updateProgress('Preparing', 40, 'เตรียมส่งไปยัง AI...', '🤖 เตรียมข้อมูลสำหรับ Google AI Studio')

      // Step 4: Send to AI
      this.updateProgress('Processing', 60, 'กำลังถอดข้อความ...', '🎵 ส่งไฟล์เสียงไปยัง Gemini AI เพื่อถอดข้อความ')
      
      const result = await this.model.generateContent([
        {
          inlineData: {
            data: audioData,
            mimeType: audioFile.type || 'audio/mpeg'
          }
        },
        'กรุณาถอดข้อความจากไฟล์เสียงนี้ให้ครบถ้วนและถูกต้อง โดยใช้ภาษาไทยหากเป็นเสียงภาษาไทย หรือภาษาอังกฤษหากเป็นเสียงภาษาอังกฤษ'
      ])

      // Step 5: Process result
      this.updateProgress('Finalizing', 85, 'ประมวลผลผลลัพธ์...', '📝 ได้รับผลลัพธ์จาก AI แล้ว กำลังจัดรูปแบบข้อความ')

      const response = await result.response
      const text = response.text()

      if (!text || text.trim().length === 0) {
        this.updateProgress('Error', 0, 'ไม่พบข้อความ', '❌ AI ไม่สามารถถอดข้อความจากไฟล์นี้ได้')
        return {
          success: false,
          error: 'No transcription result received from AI'
        }
      }

      // Step 6: Complete
      this.updateProgress('Complete', 100, 'เสร็จสิ้น!', `✅ ถอดข้อความสำเร็จ! ได้ข้อความทั้งหมด ${text.length} ตัวอักษร`)

      return {
        success: true,
        data: text
      }

    } catch (error: any) {
      console.error('Transcription error:', error)
      this.updateProgress('Error', 0, 'เกิดข้อผิดพลาด', `❌ Error: ${error.message || 'Unknown error'}`)
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during transcription'
      }
    }
  }

  async summarizeAudio(audioFile: File): Promise<ProcessingResult> {
    try {
      if (!GOOGLE_AI_API_KEY) {
        this.updateProgress('Error', 0, 'API Key ไม่ถูกต้อง', '❌ ไม่พบ Google AI API Key')
        return {
          success: false,
          error: 'Google AI API key is not configured'
        }
      }

      // Step 1: Validate file
      this.updateProgress('Validating', 10, 'ตรวจสอบไฟล์...', `📁 ตรวจสอบไฟล์: ${audioFile.name}`)
      
      if (!this.isValidAudioFile(audioFile)) {
        this.updateProgress('Error', 0, 'ไฟล์ไม่ถูกต้อง', '❌ ไฟล์ไม่ใช่ไฟล์เสียงที่รองรับ')
        return {
          success: false,
          error: 'Invalid audio file format'
        }
      }

      // Step 2: Convert to base64
      this.updateProgress('Converting', 25, 'แปลงไฟล์...', `🔄 แปลงไฟล์เป็น Base64 (ขนาด: ${(audioFile.size / 1024 / 1024).toFixed(2)} MB)`)
      
      const base64Audio = await this.fileToBase64(audioFile)
      const mimeType = audioFile.type || 'audio/mpeg'

      // Step 3: Prepare for AI
      this.updateProgress('Preparing', 40, 'เตรียมส่งไปยัง AI...', '🤖 เตรียมข้อมูลสำหรับ Google AI Studio')

      // Step 4: Send to AI for summarization
      this.updateProgress('Processing', 60, 'กำลังสรุปเนื้อหา...', '🎵 ส่งไฟล์เสียงไปยัง Gemini AI เพื่อสรุปเนื้อหา')

      const prompt = `
        กรุณาถอดข้อความจากไฟล์เสียงนี้ก่อน แล้วจึงสรุปเนื้อหาสำคัญ โดย:
        
        1. ถอดข้อความให้ครบถ้วนก่อน
        2. จัดรูปแบบให้อ่านง่าย แบ่งย่อหน้าตามเนื้อหา
        3. สรุปประเด็นสำคัญเป็นหัวข้อ
        4. หากมีการสนทนาหลายคน ให้ระบุผู้พูด
        5. สรุปข้อสรุปหลักในท้าย
        
        รูปแบบที่ต้องการ:
        ## ข้อความต้นฉบับ
        [ข้อความที่ถอดได้]
        
        ## สรุปเนื้อหา
        [สรุปประเด็นสำคัญ]
        
        ## ข้อสรุป
        [ข้อสรุปหลัก]
      `

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType
          }
        }
      ])

      // Step 5: Process result
      this.updateProgress('Finalizing', 85, 'ประมวลผลผลลัพธ์...', '📝 ได้รับผลลัพธ์จาก AI แล้ว กำลังจัดรูปแบบการสรุป')

      const response = await result.response
      const text = response.text()

      if (!text || text.trim().length === 0) {
        this.updateProgress('Error', 0, 'ไม่พบเนื้อหา', '❌ AI ไม่สามารถสรุปเนื้อหาจากไฟล์นี้ได้')
        return {
          success: false,
          error: 'No summarization result received from AI'
        }
      }

      // Step 6: Complete
      this.updateProgress('Complete', 100, 'เสร็จสิ้น!', `✅ สรุปเนื้อหาสำเร็จ! ได้เนื้อหาทั้งหมด ${text.length} ตัวอักษร`)

      return {
        success: true,
        data: text
      }

    } catch (error: any) {
      console.error('Summarization error:', error)
      this.updateProgress('Error', 0, 'เกิดข้อผิดพลาด', `❌ Error: ${error.message || 'Unknown error'}`)
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during summarization'
      }
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix (e.g., "data:audio/mpeg;base64,")
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private isValidAudioFile(file: File): boolean {
    const validTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/m4a',
      'audio/flac',
      'audio/webm',
      'video/mp4', // Often contains audio
      'video/webm'
    ]
    
    const validExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac', '.webm', '.mp4']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    return validTypes.includes(file.type) || hasValidExtension
  }
}

export const googleAIService = new GoogleAIService()
