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

export class GoogleAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  async transcribeAudio(audioFile: File): Promise<ProcessingResult> {
    try {
      if (!GOOGLE_AI_API_KEY) {
        return {
          success: false,
          error: 'Google AI API key is not configured'
        }
      }

      // Convert audio file to base64
      const base64Audio = await this.fileToBase64(audioFile)
      const mimeType = audioFile.type || 'audio/mpeg'

      const prompt = `
        กรุณาถอดข้อความจากไฟล์เสียงนี้ให้ถูกต้องและครบถ้วน
        ให้จัดรูปแบบข้อความให้อ่านง่าย โดยแบ่งย่อหน้าตามเนื้อหา
        หากมีการสนทนาหลายคน ให้ระบุผู้พูดด้วย
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

      const response = await result.response
      const text = response.text()

      return {
        success: true,
        data: text
      }
    } catch (error) {
      console.error('Transcription error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการถอดข้อความ'
      }
    }
  }

  async summarizeAudio(audioFile: File): Promise<ProcessingResult> {
    try {
      if (!GOOGLE_AI_API_KEY) {
        return {
          success: false,
          error: 'Google AI API key is not configured'
        }
      }

      // Convert audio file to base64
      const base64Audio = await this.fileToBase64(audioFile)
      const mimeType = audioFile.type || 'audio/mpeg'

      const prompt = `
        กรุณาวิเคราะห์และสรุปเนื้อหาจากไฟล์เสียงนี้โดยละเอียด โดยให้รวม:
        
        1. หัวข้อหลักและประเด็นสำคัญ
        2. สาระสำคัญของเนื้อหา
        3. จุดเด่นและข้อมูลที่น่าสนใจ
        4. ข้อสรุปหรือแนวทางการดำเนินการ (หากมี)
        
        จัดรูปแบบให้อ่านง่าย ใช้หัวข้อย่อยและ bullet points ตามความเหมาะสม
        เขียนเป็นภาษาไทยที่เข้าใจง่าย
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

      const response = await result.response
      const text = response.text()

      return {
        success: true,
        data: text
      }
    } catch (error) {
      console.error('Summarization error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสรุปเนื้อหา'
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
}

export const googleAIService = new GoogleAIService()
