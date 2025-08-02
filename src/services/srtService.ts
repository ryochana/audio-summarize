import { GoogleGenerativeAI } from '@google/generative-ai'

// SRT Subtitle Service
export class SRTService {
  private aiInstances: GoogleGenerativeAI[]
  
  constructor() {
    const API_KEYS = [
      import.meta.env.VITE_GOOGLE_AI_API_KEY,
      import.meta.env.VITE_GOOGLE_AI_API_KEY_2,
      import.meta.env.VITE_GOOGLE_AI_API_KEY_3,
      import.meta.env.VITE_GOOGLE_AI_API_KEY_4,
      import.meta.env.VITE_GOOGLE_AI_API_KEY_5
    ].filter(key => key && key.trim() !== '')
    
    this.aiInstances = API_KEYS.map(key => new GoogleGenerativeAI(key))
  }

  private getRandomAI() {
    return this.aiInstances[Math.floor(Math.random() * this.aiInstances.length)]
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

  private formatTimeCode(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const milliseconds = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
  }

  private parseTranscriptionToSRT(transcription: string): string {
    // Smart sentence splitting
    const sentences = transcription
      .split(/[.!?]\s+|[\n\r]+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim())

    let srtContent = ''
    let index = 1
    const averageDuration = 3 // seconds per subtitle
    const maxCharsPerSubtitle = 80

    for (let i = 0; i < sentences.length; i++) {
      let currentText = sentences[i]
      
      // Split long sentences
      if (currentText.length > maxCharsPerSubtitle) {
        const words = currentText.split(' ')
        let chunk = ''
        
        for (const word of words) {
          if ((chunk + ' ' + word).length > maxCharsPerSubtitle) {
            if (chunk) {
              const startTime = (index - 1) * averageDuration
              const endTime = startTime + averageDuration
              
              srtContent += `${index}\n`
              srtContent += `${this.formatTimeCode(startTime)} --> ${this.formatTimeCode(endTime)}\n`
              srtContent += `${chunk.trim()}\n\n`
              index++
              chunk = word
            } else {
              chunk = word
            }
          } else {
            chunk = chunk ? chunk + ' ' + word : word
          }
        }
        
        if (chunk) {
          const startTime = (index - 1) * averageDuration
          const endTime = startTime + averageDuration
          
          srtContent += `${index}\n`
          srtContent += `${this.formatTimeCode(startTime)} --> ${this.formatTimeCode(endTime)}\n`
          srtContent += `${chunk.trim()}\n\n`
          index++
        }
      } else {
        const startTime = (index - 1) * averageDuration
        const endTime = startTime + averageDuration
        
        srtContent += `${index}\n`
        srtContent += `${this.formatTimeCode(startTime)} --> ${this.formatTimeCode(endTime)}\n`
        srtContent += `${currentText}\n\n`
        index++
      }
    }

    return srtContent
  }

  async generateSRT(audioFile: File, language: 'original' | 'thai' = 'original'): Promise<string> {
    const selectedAI = this.getRandomAI()
    const model = selectedAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const base64Audio = await this.fileToBase64(audioFile)
    
    let prompt: string
    
    if (language === 'thai') {
      prompt = `กรุณาถอดข้อความจากไฟล์เสียงนี้และแปลเป็นภาษาไทย โดย:
1. ถอดข้อความให้ถูกต้องและครบถ้วน
2. แปลเป็นภาษาไทยที่เข้าใจง่าย
3. แบ่งประโยคให้สั้นกระชับ เหมาะสำหรับซับไตเติ้ล
4. ไม่ต้องใส่คำว่า "ส่วนที่" หรือหมายเลขส่วน
5. ตัดประโยคยาวออกเป็นประโยคสั้นๆ
6. ถ้ามีหลายคนพูดให้พยายามแยกคำพูดของแต่ละคน`
    } else {
      prompt = `กรุณาถอดข้อความจากไฟล์เสียงนี้ โดย:
1. ใช้ภาษาต้นฉบับที่ได้ยิน
2. ถอดข้อความให้ถูกต้องและครบถ้วน
3. แบ่งประโยคให้สั้นกระชับ เหมาะสำหรับซับไตเติ้ล
4. ไม่ต้องใส่คำว่า "ส่วนที่" หรือหมายเลขส่วน
5. ตัดประโยคยาวออกเป็นประโยคสั้นๆ
6. ถ้ามีหลายคนพูดให้พยายามแยกคำพูดของแต่ละคน`
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: audioFile.type || 'audio/mpeg'
        }
      }
    ])

    const transcription = result.response.text()
    
    // Check for error responses
    if (transcription.includes('ไม่สามารถสรุปไฟล์เสียงได้') || 
        transcription.includes('ไม่มีความสามารถในการประมวลผลเสียง')) {
      throw new Error('ไม่สามารถประมวลผลไฟล์เสียงเป็นซับไตเติ้ลได้')
    }

    return this.parseTranscriptionToSRT(transcription)
  }

  downloadSRT(srtContent: string, filename: string) {
    const element = document.createElement('a')
    const file = new Blob([srtContent], { type: 'text/srt' })
    element.href = URL.createObjectURL(file)
    element.download = `${filename}_${new Date().getTime()}.srt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
}

export const srtService = new SRTService()
