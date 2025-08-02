import { GoogleGenerativeAI } from '@google/generative-ai'

// Performance optimized version
export class PerformanceAIService {
  private static instance: PerformanceAIService
  private apiPool: GoogleGenerativeAI[] = []

  constructor() {
    // สร้าง API pool
    const apiKeys = [
      import.meta.env.VITE_GOOGLE_AI_API_KEY,
      import.meta.env.VITE_GOOGLE_AI_API_KEY_2,
      import.meta.env.VITE_GOOGLE_AI_API_KEY_3
    ].filter(key => key && key.trim() !== '')

    this.apiPool = apiKeys.map(key => new GoogleGenerativeAI(key))
    console.log(`🏊‍♂️ Created API pool with ${this.apiPool.length} instances`)
  }

  static getInstance(): PerformanceAIService {
    if (!PerformanceAIService.instance) {
      PerformanceAIService.instance = new PerformanceAIService()
    }
    return PerformanceAIService.instance
  }

  // แยกไฟล์เสียงออกเป็นชิ้นเล็กๆ (เพื่อประมวลผลแบบ parallel)
  private async splitAudioProcessing(audioFile: File, type: 'transcribe' | 'summarize') {
    const fileSize = audioFile.size
    const chunkSize = 5 * 1024 * 1024 // 5MB per chunk
    
    if (fileSize <= chunkSize) {
      // ไฟล์เล็ก ประมวลผลเดียว
      return await this.processSingleFile(audioFile, type)
    }

    // ไฟล์ใหญ่ แยกออกเป็นชิ้น
    console.log(`📂 Large file detected (${(fileSize/1024/1024).toFixed(2)}MB), splitting...`)
    
    const chunks = await this.splitFile(audioFile, chunkSize)
    const results = await Promise.all(
      chunks.map((chunk, index) => 
        this.processSingleFile(chunk, type, `chunk-${index + 1}`)
      )
    )

    // รวมผลลัพธ์
    return this.combineResults(results, type)
  }

  private async splitFile(file: File, chunkSize: number): Promise<File[]> {
    const chunks: File[] = []
    let start = 0

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      chunks.push(new File([chunk], `${file.name}.chunk${chunks.length + 1}`, { type: file.type }))
      start = end
    }

    return chunks
  }

  private async processSingleFile(audioFile: File, type: 'transcribe' | 'summarize', chunkName?: string): Promise<string> {
    // เลือก API instance ที่ว่างที่สุด
    const selectedAPI = this.apiPool[Math.floor(Math.random() * this.apiPool.length)]
    const model = selectedAPI.getGenerativeModel({ 
      model: import.meta.env.VITE_AI_MODEL || 'gemini-1.5-flash' 
    })

    const base64Audio = await this.fileToBase64(audioFile)
    
    const prompt = type === 'transcribe' 
      ? 'กรุณาถอดข้อความจากไฟล์เสียงนี้ให้ครบถ้วนและถูกต้อง'
      : 'กรุณาสรุปเนื้อหาสำคัญจากไฟล์เสียงนี้'

    console.log(`🎯 Processing ${chunkName || audioFile.name} with ${type}`)

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: audioFile.type || 'audio/mpeg'
        }
      }
    ])

    return result.response.text()
  }

  private combineResults(results: string[], type: 'transcribe' | 'summarize'): string {
    if (type === 'transcribe') {
      return results.join('\n\n--- ตอนต่อไป ---\n\n')
    } else {
      return `## สรุปรวม\n\n${results.map((result, i) => `### ส่วนที่ ${i + 1}\n${result}`).join('\n\n')}`
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Public API
  async processAudio(audioFile: File, type: 'transcribe' | 'summarize'): Promise<string> {
    return await this.splitAudioProcessing(audioFile, type)
  }
}

export const performanceAI = PerformanceAIService.getInstance()
