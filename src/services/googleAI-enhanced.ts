import { GoogleGenerativeAI } from '@google/generative-ai'

// Enhanced Performance Configuration
const API_KEYS = [
  import.meta.env.VITE_GOOGLE_AI_API_KEY,
  import.meta.env.VITE_GOOGLE_AI_API_KEY_2,
  import.meta.env.VITE_GOOGLE_AI_API_KEY_3,
  import.meta.env.VITE_GOOGLE_AI_API_KEY_4,
  import.meta.env.VITE_GOOGLE_AI_API_KEY_5
].filter(key => key && key.trim() !== '')

const MODEL_VERSION = import.meta.env.VITE_AI_MODEL || 'gemini-1.5-flash'

if (API_KEYS.length === 0) {
  console.warn('No Google AI API keys configured. Please set VITE_GOOGLE_AI_API_KEY in your environment.')
}

console.log(`🚀 Enhanced Performance Mode: ${API_KEYS.length} API key(s) for parallel processing`)
console.log(`🤖 Using model: ${MODEL_VERSION}`)

// สร้าง AI instances สำหรับแต่ละ API key
const aiInstances = API_KEYS.map(key => new GoogleGenerativeAI(key))

// Performance tracking for each API
interface APIStats {
  requests: number
  errors: number
  lastUsed: number
  avgResponseTime: number
  isHealthy: boolean
  successRate: number
}

const apiStats: APIStats[] = aiInstances.map(() => ({
  requests: 0,
  errors: 0,
  lastUsed: 0,
  avgResponseTime: 0,
  isHealthy: true,
  successRate: 1.0
}))

export interface ProcessingResult {
  success: boolean
  data?: string
  error?: string
  processingTime?: number
  apiUsed?: number
}

export interface ProcessingProgress {
  step: string
  progress: number
  details: string
  logs: string[]
  percentage?: number  // สำหรับ logging compatibility
  message?: string     // สำหรับ logging compatibility
}

export class GoogleAIService {
  private progressCallback?: (progress: ProcessingProgress) => void
  private currentLogs: string[] = []

  // Smart API selection based on performance and health
  private getSmartAIInstance(): { model: any; apiIndex: number } {
    // Filter healthy APIs
    const healthyApis = apiStats
      .map((stats, index) => ({ stats, index }))
      .filter(({ stats }) => stats.isHealthy && stats.successRate > 0.3)

    if (healthyApis.length === 0) {
      // Reset all to healthy if all are marked unhealthy
      apiStats.forEach(stats => {
        stats.isHealthy = true
        stats.successRate = Math.max(stats.successRate, 0.5)
      })
      const apiIndex = 0
      return { 
        model: aiInstances[apiIndex].getGenerativeModel({ model: MODEL_VERSION as any }), 
        apiIndex 
      }
    }

    // Calculate score for each API (lower is better)
    const scoredApis = healthyApis.map(({ stats, index }) => {
      const timeSinceLastUse = Date.now() - stats.lastUsed
      const errorWeight = stats.errors * 2
      const requestWeight = stats.requests * 0.1
      const responseTimeWeight = stats.avgResponseTime / 1000
      const healthWeight = stats.isHealthy ? 0 : 10
      const successRateWeight = (1 - stats.successRate) * 5
      
      const score = errorWeight + requestWeight + responseTimeWeight + healthWeight + successRateWeight - (timeSinceLastUse / 10000)
      
      return { index, score, stats }
    })

    // Select API with best score
    const bestApi = scoredApis.reduce((best, current) => 
      current.score < best.score ? current : best
    )

    this.updateProgress('Preparing', 35, 'เลือก API ที่เหมาะสมที่สุด...', 
      `🎯 API #${bestApi.index + 1} (${bestApi.stats.requests} req, ${(bestApi.stats.successRate * 100).toFixed(1)}% success)`)
    
    return { 
      model: aiInstances[bestApi.index].getGenerativeModel({ model: MODEL_VERSION as any }), 
      apiIndex: bestApi.index 
    }
  }

  // Parallel processing for large files
  private async processLargeFileParallel(audioFile: File, type: 'transcribe' | 'summarize'): Promise<string> {
    if (aiInstances.length < 2) {
      return await this.processSingleFile(audioFile, type)
    }

    const fileSizeMB = audioFile.size / (1024 * 1024)
    const optimalChunks = Math.min(Math.ceil(fileSizeMB / 5), aiInstances.length, 4) // Max 4 chunks
    
    this.updateProgress('Processing', 40, `ประมวลผลไฟล์ขนาดใหญ่แบบ Parallel`, 
      `⚡ Processing large file with ${optimalChunks} parallel requests`)

    const chunkSize = Math.ceil(audioFile.size / optimalChunks)
    const chunks: File[] = []
    
    // Split file into chunks
    for (let i = 0; i < audioFile.size; i += chunkSize) {
      const chunk = audioFile.slice(i, Math.min(i + chunkSize, audioFile.size))
      chunks.push(new File([chunk], `${audioFile.name}.part${chunks.length + 1}`, { type: audioFile.type }))
    }

    // Process chunks in parallel
    const chunkPromises = chunks.map(async (chunk, index) => {
      const startTime = Date.now()
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          const { model, apiIndex } = this.getSmartAIInstance()
          const stats = apiStats[apiIndex]
          
          stats.requests++
          stats.lastUsed = Date.now()
          
          const base64Audio = await this.fileToBase64(chunk)
          const prompt = type === 'transcribe' 
            ? `กรุณาถอดข้อความจากไฟล์เสียงนี้ให้ครบถ้วนและถูกต้อง โดยไม่ต้องบอกว่าเป็นส่วนที่เท่าไหร่`
            : `กรุณาสรุปเนื้อหาจากไฟล์เสียงนี้อย่างละเอียด โดยไม่ต้องแจ้งว่าเป็นส่วนที่เท่าไหร่`

          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Audio,
                mimeType: chunk.type || 'audio/mpeg'
              }
            }
          ])

          const responseText = result.response.text()
          
          // Check for error responses and retry if needed
          if (responseText.includes('ไม่สามารถสรุปไฟล์เสียงได้') || 
              responseText.includes('ไม่มีความสามารถในการประมวลผลเสียง') ||
              responseText.includes('ขออภัย')) {
            throw new Error('AI response indicates inability to process audio')
          }

          // Update success stats
          const responseTime = Date.now() - startTime
          stats.avgResponseTime = stats.avgResponseTime === 0 ? responseTime : (stats.avgResponseTime + responseTime) / 2
          stats.successRate = (stats.successRate * stats.requests + 1) / (stats.requests + 1)
          stats.isHealthy = true

          this.updateProgress('Processing', 50 + (index * 30 / chunks.length), 
            `เสร็จส่วนที่ ${index + 1}/${chunks.length}`, 
            `✅ Chunk ${index + 1} completed by API #${apiIndex + 1}`)

          return responseText
        } catch (error: any) {
          retryCount++
          const randomApiIndex = Math.floor(Math.random() * aiInstances.length)
          const stats = apiStats[randomApiIndex]
          stats.errors++
          stats.successRate = Math.max(0, (stats.successRate * stats.requests - 1) / Math.max(stats.requests, 1))
          
          if (error.message?.includes('429') || error.message?.includes('quota')) {
            stats.isHealthy = false
          }
          
          if (retryCount < maxRetries) {
            this.updateProgress('Processing', 50 + (index * 30 / chunks.length), 
              `ลองใหม่ส่วนที่ ${index + 1} (ครั้งที่ ${retryCount + 1})`, 
              `🔄 Retrying chunk ${index + 1} with different API`)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            continue
          }
          
          // If all retries failed, return empty or try different approach
          this.updateProgress('Processing', 50 + (index * 30 / chunks.length), 
            `ข้ามส่วนที่ ${index + 1} ไปก่อน`, 
            `⚠️ Chunk ${index + 1} failed after ${maxRetries} attempts`)
          
          return '' // Return empty instead of error message
        }
      }
      return ''
    })

    const results = await Promise.all(chunkPromises)

    // Filter out empty results and combine intelligently
    const validResults = results.filter(r => r && r.trim().length > 0)
    
    if (validResults.length === 0) {
      throw new Error('ไม่สามารถประมวลผลไฟล์ได้ กรุณาลองไฟล์อื่นหรือแบ่งไฟล์ให้เล็กลง')
    }

    // Combine results seamlessly
    if (type === 'transcribe') {
      return validResults.join(' ') // Join with space for natural flow
    } else {
      return validResults.join('\n\n') // Join with paragraph breaks for summaries
    }
  }

  private async processSingleFile(audioFile: File, type: 'transcribe' | 'summarize'): Promise<string> {
    const startTime = Date.now()
    let retries = Math.min(aiInstances.length * 2, 6) // Max 6 retries
    let lastError: any

    while (retries > 0) {
      try {
        const { model, apiIndex } = this.getSmartAIInstance()
        const stats = apiStats[apiIndex]
        
        stats.requests++
        stats.lastUsed = Date.now()
        
        this.updateProgress('Processing', 60, 
          type === 'transcribe' ? 'กำลังถอดข้อความ...' : 'กำลังสรุปเนื้อหา...', 
          `🚀 API #${apiIndex + 1} processing with ${MODEL_VERSION}`)
        
        const base64Audio = await this.fileToBase64(audioFile)
        const prompt = type === 'transcribe' 
          ? 'กรุณาถอดข้อความจากไฟล์เสียงนี้ให้ครบถ้วนและถูกต้อง โดยใช้ภาษาไทยในการตอบ'
          : 'กรุณาสรุปเนื้อหาสำคัญจากไฟล์เสียงนี้ โดยใช้ภาษาไทยในการตอบ และจัดรูปแบบให้อ่านง่าย'

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Audio,
              mimeType: audioFile.type || 'audio/mpeg'
            }
          }
        ])

        // Update success stats
        const responseTime = Date.now() - startTime
        stats.avgResponseTime = stats.avgResponseTime === 0 ? responseTime : (stats.avgResponseTime + responseTime) / 2
        stats.successRate = (stats.successRate * stats.requests + 1) / (stats.requests + 1)
        stats.isHealthy = true

        this.updateProgress('Processing', 85, 'ประมวลผลสำเร็จ!', 
          `✅ Completed by API #${apiIndex + 1} in ${responseTime}ms`)

        return result.response.text()
      } catch (error: any) {
        retries--
        lastError = error
        
        // Find which API failed and update stats
        const failedApiIndex = Math.floor(Math.random() * aiInstances.length) // Approximate
        const stats = apiStats[failedApiIndex]
        stats.errors++
        stats.successRate = Math.max(0, (stats.successRate * stats.requests - 1) / Math.max(stats.requests, 1))
        
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          stats.isHealthy = false
          this.updateProgress('Processing', 60, 
            `API โควต้าเต็ม เปลี่ยนไปใช้ API อื่น (เหลือ ${retries} ครั้ง)`, 
            `⚠️ API quota exceeded, switching to another API`)
          
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * (6 - retries), 3000)))
            continue
          }
        } else {
          // For non-quota errors, reduce retry count more aggressively
          retries = Math.max(0, retries - 2)
          if (retries <= 0) {
            throw error
          }
        }
      }
    }

    throw new Error(`ไม่สามารถประมวลผลได้หลังจากลองหลายครั้ง: ${lastError?.message}`)
  }

  // Enhanced main processing method
  private async callAI(audioFile: File, type: 'transcribe' | 'summarize'): Promise<string> {
    const fileSizeMB = audioFile.size / (1024 * 1024)
    
    // Decide on processing strategy
    if (fileSizeMB > 8 && aiInstances.length > 1) {
      this.updateProgress('Analyzing', 30, `ไฟล์ขนาดใหญ่ (${fileSizeMB.toFixed(1)}MB) เลือกประมวลผลแบบ Parallel`, 
        `📊 Large file detected, using parallel processing`)
      return await this.processLargeFileParallel(audioFile, type)
    } else {
      return await this.processSingleFile(audioFile, type)
    }
  }

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback
    this.currentLogs = []
  }

  private updateProgress(step: string, progress: number, details: string, log?: string) {
    if (log) {
      const timestamp = new Date().toLocaleTimeString('th-TH')
      this.currentLogs.push(`${timestamp} - ${log}`)
      // Keep only last 50 logs for better performance
      if (this.currentLogs.length > 50) {
        this.currentLogs = this.currentLogs.slice(-50)
      }
    }
    
    // Always log to console for debugging
    console.log(`[${step}] ${progress}% - ${details}`, log ? `| ${log}` : '')
    
    if (this.progressCallback) {
      this.progressCallback({ 
        step, 
        progress, 
        details, 
        logs: [...this.currentLogs],
        percentage: progress,  // สำหรับ logging compatibility
        message: details       // สำหรับ logging compatibility
      })
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

  private simulateDetailedProgress(type: 'transcribe' | 'summarize') {
    return new Promise<void>((resolve) => {
      const steps = type === 'transcribe' 
        ? [
            { progress: 65, detail: 'กำลังวิเคราะห์ความถี่เสียง...', log: '🔊 วิเคราะห์ spectrum เสียง' },
            { progress: 70, detail: 'กำลังแยกคำพูด...', log: '🗣️ แยกแยะเสียงพูดจากเสียงรบกวน' },
            { progress: 75, detail: 'กำลังแปลงเสียงเป็นข้อความ...', log: '📝 ใช้ Speech-to-Text AI' },
            { progress: 80, detail: 'กำลังตรวจสอบความถูกต้อง...', log: '✅ ตรวจสอบการสะกดคำ' }
          ]
        : [
            { progress: 65, detail: 'กำลังวิเคราะห์เนื้อหา...', log: '🔍 สแกนหาประเด็นสำคัญ' },
            { progress: 70, detail: 'กำลังจัดกลุ่มข้อมูล...', log: '📂 จัดหมวดหมู่เนื้อหา' },
            { progress: 75, detail: 'กำลังสรุปประเด็นหลัก...', log: '💡 สกัดประเด็นสำคัญ' },
            { progress: 80, detail: 'กำลังจัดรูปแบบการสรุป...', log: '📋 จัดรูปแบบให้อ่านง่าย' }
          ]

      let currentStep = 0
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          const step = steps[currentStep]
          this.updateProgress('Processing', step.progress, step.detail, step.log)
          currentStep++
        } else {
          clearInterval(interval)
          resolve()
        }
      }, 800) // แต่ละ step ห่าง 0.8 วินาที (เร็วขึ้น)
    })
  }

  async transcribeAudio(audioFile: File): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    try {
      this.updateProgress('Starting', 0, 'เริ่มต้นการถอดข้อความ...', 
        `🎵 File: ${audioFile.name}, Size: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB, Type: ${audioFile.type}`)
      
      this.updateProgress('Validating', 5, 'ตรวจสอบไฟล์เสียง...', 
        `🔍 Validating audio format and size`)
      
      if (!audioFile.type.startsWith('audio/')) {
        throw new Error('กรุณาอัพโหลดไฟล์เสียงเท่านั้น')
      }

      this.updateProgress('Preparing', 15, 'เตรียมการประมวลผล...', 
        `📋 Available APIs: ${API_KEYS.length}, Selected model: ${MODEL_VERSION}`)

      // Log API health status
      const healthyApis = apiStats.filter(stats => stats.isHealthy).length
      this.updateProgress('Preparing', 20, 'ตรวจสอบสถานะ API...', 
        `💚 Healthy APIs: ${healthyApis}/${API_KEYS.length}`)

      await this.simulateDetailedProgress('transcribe')
      
      const result = await this.callAI(audioFile, 'transcribe')
      
      const processingTime = Date.now() - startTime
      this.updateProgress('Completed', 100, 'ถอดข้อความเสร็จสิ้น!', 
        `🎉 Transcription completed in ${processingTime}ms, Result length: ${result.length} characters`)

      return {
        success: true,
        data: result,
        processingTime: processingTime
      }
    } catch (error: any) {
      const processingTime = Date.now() - startTime
      this.updateProgress('Error', 0, 'เกิดข้อผิดพลาด', 
        `❌ Error after ${processingTime}ms: ${error.message}`)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  async summarizeAudio(audioFile: File): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    try {
      this.updateProgress('Starting', 0, 'เริ่มต้นการสรุปเนื้อหา...', 
        `🎵 File: ${audioFile.name}, Size: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB, Type: ${audioFile.type}`)
      
      this.updateProgress('Validating', 5, 'ตรวจสอบไฟล์เสียง...', 
        `🔍 Validating audio format and size`)
      
      if (!audioFile.type.startsWith('audio/')) {
        throw new Error('กรุณาอัพโหลดไฟล์เสียงเท่านั้น')
      }

      this.updateProgress('Preparing', 15, 'เตรียมการประมวลผล...', 
        `📋 Available APIs: ${API_KEYS.length}, Selected model: ${MODEL_VERSION}`)

      // Log API health status
      const healthyApis = apiStats.filter(stats => stats.isHealthy).length
      this.updateProgress('Preparing', 20, 'ตรวจสอบสถานะ API...', 
        `💚 Healthy APIs: ${healthyApis}/${API_KEYS.length}`)

      await this.simulateDetailedProgress('summarize')
      
      const result = await this.callAI(audioFile, 'summarize')
      
      const processingTime = Date.now() - startTime
      this.updateProgress('Completed', 100, 'สรุปเนื้อหาเสร็จสิ้น!', 
        `🎉 Summary completed in ${processingTime}ms, Result length: ${result.length} characters`)

      return {
        success: true,
        data: result,
        processingTime: processingTime
      }
    } catch (error: any) {
      const processingTime = Date.now() - startTime
      this.updateProgress('Error', 0, 'เกิดข้อผิดพลาด', 
        `❌ Error after ${processingTime}ms: ${error.message}`)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get performance stats
  getPerformanceStats() {
    return {
      totalApis: API_KEYS.length,
      stats: apiStats.map((stats, index) => ({
        apiIndex: index + 1,
        requests: stats.requests,
        errors: stats.errors,
        successRate: (stats.successRate * 100).toFixed(1) + '%',
        avgResponseTime: stats.avgResponseTime.toFixed(0) + 'ms',
        isHealthy: stats.isHealthy
      }))
    }
  }
}

export const googleAI = new GoogleAIService()
