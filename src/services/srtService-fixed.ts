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
    
    console.log(`🎬 [SRT] Converting file to base64...`)
    const startTime = Date.now()
    const base64Audio = await this.fileToBase64(audioFile)
    console.log(`🎬 [SRT] File converted to base64 in ${Date.now() - startTime}ms`)
    
    let prompt: string
    
    if (language === 'thai') {
      prompt = `ถอดข้อความจากไฟล์เสียงนี้และแปลเป็นภาษาไทยให้ฉันหน่อย:

ให้ทำตามขั้นตอนนี้:
1. ฟังไฟล์เสียงอย่างระวัง
2. ถอดข้อความทุกคำที่ได้ยิน
3. แปลเป็นภาษาไทยที่เข้าใจง่าย
4. แบ่งเป็นประโยคสั้นๆ สำหรับซับไตเติ้ล
5. ใช้คำพูดง่ายๆ ไม่ซับซ้อน

สำคัญ: กรุณาให้เฉพาะข้อความที่ถอดได้จากเสียงเท่านั้น ไม่ต้องบอกว่าไม่สามารถทำได้`
      console.log(`🎬 [SRT] Using Thai translation prompt`)
    } else {
      prompt = `Please transcribe this audio file for me:

Follow these steps:
1. Listen to the audio carefully
2. Transcribe every word you can hear
3. Use the original language from the audio
4. Break into short sentences suitable for subtitles
5. Keep the language natural and easy to read

Important: Please provide only the transcribed text from the audio, do not say you cannot do it.`
      console.log(`🎬 [SRT] Using original language prompt`)
    }

    console.log(`🎬 [SRT] Sending request to AI...`)
    const aiStartTime = Date.now()
    
    let transcription = ''
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      attempts++
      console.log(`🎬 [SRT] Attempt ${attempts}/${maxAttempts}`)
      
      try {
        const selectedAI = this.getRandomAI()
        const model = selectedAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Audio,
              mimeType: audioFile.type || 'audio/mpeg'
            }
          }
        ])

        transcription = result.response.text()
        console.log(`🎬 [SRT] Received response: ${transcription.length} characters`)
        
        // Check for error responses
        const errorKeywords = [
          'ไม่สามารถถอดเสียงได้',
          'ไม่สามารถสรุปไฟล์เสียงได้',
          'ไม่มีความสามารถในการประมวลผลเสียง',
          'ขออภัย ฉันไม่สามารถ',
          'I cannot transcribe',
          'I am unable to process',
          'I cannot process audio',
          'Sorry, I cannot'
        ]
        
        const hasError = errorKeywords.some(keyword => 
          transcription.toLowerCase().includes(keyword.toLowerCase())
        )
        
        if (hasError || transcription.trim().length < 10) {
          console.warn(`🎬 [SRT] Attempt ${attempts} failed - AI error response`)
          console.warn(`🎬 [SRT] Response: "${transcription.substring(0, 100)}..."`)
          
          if (attempts < maxAttempts) {
            console.log(`🎬 [SRT] Retrying with different AI instance...`)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
            continue
          } else {
            throw new Error(`AI ไม่สามารถประมวลผลไฟล์เสียงได้หลังจากลอง ${maxAttempts} ครั้ง: ${transcription.substring(0, 100)}...`)
          }
        }
        
        // Success - break out of retry loop
        break
        
      } catch (error) {
        console.error(`🎬 [SRT] Attempt ${attempts} failed:`, error)
        if (attempts >= maxAttempts) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
      }
    }

    const aiProcessingTime = Date.now() - aiStartTime
    console.log(`🎬 [SRT] AI processing completed in ${aiProcessingTime}ms after ${attempts} attempts`)
    console.log(`🎬 [SRT] Final transcription: ${transcription.length} characters`)
    console.log(`🎬 [SRT] Transcription preview: "${transcription.substring(0, 200)}..."`)

    console.log(`🎬 [SRT] Converting transcription to SRT format...`)
    const srtStartTime = Date.now()
    const srtContent = this.parseTranscriptionToSRT(transcription)
    const srtProcessingTime = Date.now() - srtStartTime
    
    // Validate SRT format - more strict validation
    const subtitleCount = srtContent.split(/\n\d+\n/).length - 1
    const hasTimeStamps = srtContent.includes('-->')
    const hasValidSubtitles = subtitleCount > 0
    
    // Check if content contains error messages
    const containsErrorMessage = [
      'ขออภัย',
      'ไม่สามารถ',
      'Sorry',
      'cannot',
      'unable'
    ].some(keyword => srtContent.toLowerCase().includes(keyword.toLowerCase()))
    
    console.log(`🎬 [SRT] SRT conversion completed in ${srtProcessingTime}ms`)
    console.log(`🎬 [SRT] Generated ${subtitleCount} subtitle entries`)
    console.log(`🎬 [SRT] Has timestamps: ${hasTimeStamps}`)
    console.log(`🎬 [SRT] Contains error message: ${containsErrorMessage}`)
    console.log(`🎬 [SRT] Sample SRT content:`)
    console.log(srtContent.substring(0, 300))
    
    if (!hasTimeStamps || !hasValidSubtitles || containsErrorMessage) {
      console.error(`🎬 [SRT] Invalid SRT format generated`)
      console.error(`🎬 [SRT] hasTimeStamps: ${hasTimeStamps}`)
      console.error(`🎬 [SRT] hasValidSubtitles: ${hasValidSubtitles}`)
      console.error(`🎬 [SRT] containsErrorMessage: ${containsErrorMessage}`)
      throw new Error('ไม่สามารถสร้างไฟล์ SRT ที่ถูกต้องได้ - เนื้อหาไม่ใช่ข้อความที่ถอดจากเสียง')
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
      console.warn(`⚠️ [SRTService] Content does not appear to be valid SRT format`)
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
