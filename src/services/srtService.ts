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
    
    // Import googleAI service to use its transcribe function
    const { googleAI } = await import('./googleAI-enhanced')
    
    console.log(`🎬 [SRT] Using existing transcribe service instead of separate SRT processing`)
    const startTime = Date.now()
    
    try {
      // Use the existing transcribe function which already works
      console.log(`🎬 [SRT] Calling transcribe service...`)
      const result = await googleAI.transcribeAudio(audioFile)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to transcribe audio')
      }
      
      const transcription = result.data
      console.log(`🎬 [SRT] Transcription completed: ${transcription.length} characters`)
      console.log(`🎬 [SRT] Transcription preview: "${transcription.substring(0, 200)}..."`)
      
      // If user wants Thai translation, translate the result
      let finalText = transcription
      if (language === 'thai' && !this.isThaiText(transcription)) {
        console.log(`🎬 [SRT] Translating to Thai...`)
        try {
          const selectedAI = this.getRandomAI()
          const model = selectedAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
          
          const translateResult = await model.generateContent([
            `แปลข้อความต่อไปนี้เป็นภาษาไทยที่เข้าใจง่าย ให้แปลความหมายให้ถูกต้อง:\n\n${transcription}`
          ])
          
          const translatedText = translateResult.response.text()
          finalText = translatedText
          console.log(`🎬 [SRT] Translation completed: ${finalText.length} characters`)
        } catch (translateError) {
          console.warn(`🎬 [SRT] Translation failed, using original transcription`)
          finalText = transcription
        }
      }
      
      // Convert to SRT format
      console.log(`🎬 [SRT] Converting to SRT format...`)
      const srtContent = this.parseTranscriptionToSRT(finalText)
      
      // Validate SRT format
      const subtitleCount = srtContent.split(/\n\d+\n/).length - 1
      const hasTimeStamps = srtContent.includes('-->')
      
      console.log(`🎬 [SRT] SRT generation completed in ${Date.now() - startTime}ms`)
      console.log(`🎬 [SRT] Generated ${subtitleCount} subtitle entries`)
      console.log(`🎬 [SRT] Sample SRT content:`)
      console.log(srtContent.substring(0, 300))
      
      if (!hasTimeStamps || subtitleCount === 0) {
        throw new Error('ไม่สามารถสร้างไฟล์ SRT ที่ถูกต้องได้')
      }
      
      return srtContent
      
    } catch (error) {
      console.error(`🎬 [SRT] Error generating SRT:`, error)
      throw new Error(`ไม่สามารถสร้างซับไตเติ้ลได้: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private isThaiText(text: string): boolean {
    // Check if text contains Thai characters
    const thaiRegex = /[\u0E00-\u0E7F]/
    return thaiRegex.test(text)
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
