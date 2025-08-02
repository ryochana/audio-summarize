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
    console.log(`🎬 [SRT] Parsing transcription to SRT format...`)
    console.log(`🎬 [SRT] Original transcription length: ${transcription.length} characters`)
    
    // Clean and normalize transcription
    let cleanText = transcription
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    console.log(`🎬 [SRT] Cleaned transcription: ${cleanText.substring(0, 100)}...`)
    
    // Smart sentence splitting with better punctuation handling
    const sentences = cleanText
      .split(/(?<=[.!?])\s+|(?<=।)\s+|(?<=၊)\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim())
    
    console.log(`🎬 [SRT] Split into ${sentences.length} sentences`)

    let srtContent = ''
    let index = 1
    const averageDuration = 4 // Increase to 4 seconds per subtitle for better readability
    const maxCharsPerSubtitle = 70 // Reduce for better mobile viewing

    for (let i = 0; i < sentences.length; i++) {
      let currentText = sentences[i]
      
      // Skip very short fragments
      if (currentText.length < 3) continue
      
      // Split long sentences into chunks
      if (currentText.length > maxCharsPerSubtitle) {
        const words = currentText.split(' ')
        let chunk = ''
        
        for (const word of words) {
          const testChunk = chunk ? `${chunk} ${word}` : word
          
          if (testChunk.length > maxCharsPerSubtitle && chunk) {
            // Add this chunk as a subtitle
            const startTime = (index - 1) * averageDuration
            const endTime = startTime + averageDuration
            
            srtContent += `${index}\n`
            srtContent += `${this.formatTimeCode(startTime)} --> ${this.formatTimeCode(endTime)}\n`
            srtContent += `${chunk.trim()}\n\n`
            
            console.log(`🎬 [SRT] Added subtitle ${index}: "${chunk.trim()}"`)
            index++
            chunk = word
          } else {
            chunk = testChunk
          }
        }
        
        // Add remaining chunk
        if (chunk && chunk.trim().length > 0) {
          const startTime = (index - 1) * averageDuration
          const endTime = startTime + averageDuration
          
          srtContent += `${index}\n`
          srtContent += `${this.formatTimeCode(startTime)} --> ${this.formatTimeCode(endTime)}\n`
          srtContent += `${chunk.trim()}\n\n`
          
          console.log(`🎬 [SRT] Added subtitle ${index}: "${chunk.trim()}"`)
          index++
        }
      } else {
        // Add normal sentence
        const startTime = (index - 1) * averageDuration
        const endTime = startTime + averageDuration
        
        srtContent += `${index}\n`
        srtContent += `${this.formatTimeCode(startTime)} --> ${this.formatTimeCode(endTime)}\n`
        srtContent += `${currentText}\n\n`
        
        console.log(`🎬 [SRT] Added subtitle ${index}: "${currentText}"`)
        index++
      }
    }

    console.log(`🎬 [SRT] Generated ${index - 1} subtitle entries`)
    console.log(`🎬 [SRT] Final SRT length: ${srtContent.length} characters`)
    
    return srtContent.trim()
  }

  async generateSRT(audioFile: File, language: 'original' | 'thai' = 'original'): Promise<string> {
    console.log(`🎬 [SRT] Starting SRT generation for ${audioFile.name}`)
    console.log(`🎬 [SRT] File size: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB, Language: ${language}`)
    
    const selectedAI = this.getRandomAI()
    const model = selectedAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    console.log(`🎬 [SRT] Selected AI instance, using model: gemini-1.5-flash`)
    
    const startTime = Date.now()
    const base64Audio = await this.fileToBase64(audioFile)
    console.log(`🎬 [SRT] File converted to base64 in ${Date.now() - startTime}ms`)
    
    let prompt: string
    
    if (language === 'thai') {
      prompt = `กรุณาถอดข้อความจากไฟล์เสียงนี้และแปลเป็นภาษาไทย โดย:
1. ถอดข้อความให้ถูกต้องและครบถ้วน
2. แปลเป็นภาษาไทยที่เข้าใจง่าย
3. แบ่งประโยคให้สั้นกระชับ เหมาะสำหรับซับไตเติ้ล
4. ไม่ต้องใส่คำว่า "ส่วนที่" หรือหมายเลขส่วน
5. ตัดประโยคยาวออกเป็นประโยคสั้นๆ
6. ถ้ามีหลายคนพูดให้พยายามแยกคำพูดของแต่ละคน`
      console.log(`🎬 [SRT] Using Thai translation prompt`)
    } else {
      prompt = `กรุณาถอดข้อความจากไฟล์เสียงนี้ โดย:
1. ใช้ภาษาต้นฉบับที่ได้ยิน
2. ถอดข้อความให้ถูกต้องและครบถ้วน
3. แบ่งประโยคให้สั้นกระชับ เหมาะสำหรับซับไตเติ้ล
4. ไม่ต้องใส่คำว่า "ส่วนที่" หรือหมายเลขส่วน
5. ตัดประโยคยาวออกเป็นประโยคสั้นๆ
6. ถ้ามีหลายคนพูดให้พยายามแยกคำพูดของแต่ละคน`
      console.log(`🎬 [SRT] Using original language prompt`)
    }

    console.log(`🎬 [SRT] Sending request to AI...`)
    const aiStartTime = Date.now()
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: audioFile.type || 'audio/mpeg'
        }
      }
    ])

    const aiProcessingTime = Date.now() - aiStartTime
    console.log(`🎬 [SRT] AI processing completed in ${aiProcessingTime}ms`)

    const transcription = result.response.text()
    console.log(`🎬 [SRT] Transcription received: ${transcription.length} characters`)
    
    // Check for error responses
    if (transcription.includes('ไม่สามารถสรุปไฟล์เสียงได้') || 
        transcription.includes('ไม่มีความสามารถในการประมวลผลเสียง')) {
      console.error(`🎬 [SRT] Error: AI cannot process audio file`)
      throw new Error('ไม่สามารถประมวลผลไฟล์เสียงเป็นซับไตเติ้ลได้')
    }

    console.log(`🎬 [SRT] Converting transcription to SRT format...`)
    const srtStartTime = Date.now()
    const srtContent = this.parseTranscriptionToSRT(transcription)
    const srtProcessingTime = Date.now() - srtStartTime
    
    // Validate SRT format
    const subtitleCount = srtContent.split(/\n\d+\n/).length - 1
    const hasTimeStamps = srtContent.includes('-->')
    
    console.log(`🎬 [SRT] SRT conversion completed in ${srtProcessingTime}ms`)
    console.log(`🎬 [SRT] Generated ${subtitleCount} subtitle entries`)
    console.log(`🎬 [SRT] Has timestamps: ${hasTimeStamps}`)
    console.log(`🎬 [SRT] Sample SRT content:`)
    console.log(srtContent.substring(0, 300))
    
    if (!hasTimeStamps || subtitleCount === 0) {
      console.error(`🎬 [SRT] Invalid SRT format generated`)
      throw new Error('ไม่สามารถสร้างไฟล์ SRT ที่ถูกต้องได้')
    }
    console.log(`🎬 [SRT] Total processing time: ${Date.now() - startTime}ms`)

    return srtContent
  }

  downloadSRT(srtContent: string, filename: string) {
    console.log(`💾 [SRTService] Downloading SRT file: ${filename}.srt`)
    console.log(`💾 [SRTService] Content length: ${srtContent.length} characters`)
    console.log(`💾 [SRTService] Content preview:`, srtContent.substring(0, 200))
    
    // Ensure proper SRT format
    let cleanContent = srtContent.trim()
    if (!cleanContent.includes('-->')) {
      console.warn(`⚠️ [SRTService] Content doesn't appear to be valid SRT format`)
    }
    
    const element = document.createElement('a')
    // Use proper MIME type for SRT files
    const file = new Blob([cleanContent], { 
      type: 'text/plain; charset=utf-8' 
    })
    element.href = URL.createObjectURL(file)
    element.download = `${filename}.srt`
    element.style.display = 'none'
    
    document.body.appendChild(element)
    element.click()
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(element)
      URL.revokeObjectURL(element.href)
    }, 100)
    
    console.log(`💾 [SRTService] SRT file download initiated successfully`)
  }
}

export const srtService = new SRTService()
