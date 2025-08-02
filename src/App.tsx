import { useState } from 'react'
import './App.css'
import AudioUploader from './components/AudioUploader'
import ProcessingOptions from './components/ProcessingOptions'
import ResultDisplay from './components/ResultDisplay'
import ProcessingProgress from './components/ProcessingProgress'
import { googleAIService } from './services/googleAI'
import type { ProcessingProgress as ProcessingProgressType } from './services/googleAI'

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processingType, setProcessingType] = useState<'transcribe' | 'summarize' | null>(null)
  const [result, setResult] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [progress, setProgress] = useState<ProcessingProgressType>({
    step: '',
    progress: 0,
    details: '',
    logs: []
  })

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setResult('')
    setError('')
    setProgress({ step: '', progress: 0, details: '', logs: [] })
  }

  const handleProcessingTypeSelect = (type: 'transcribe' | 'summarize') => {
    setProcessingType(type)
    setError('')
  }

  const handleProcess = async () => {
    if (!uploadedFile || !processingType) return

    setIsProcessing(true)
    setError('')
    setResult('')
    
    // Set up progress callback
    googleAIService.setProgressCallback((progressData) => {
      setProgress(prev => ({
        ...progressData,
        logs: [...prev.logs, ...progressData.logs]
      }))
    })
    
    try {
      console.log(`เริ่ม${processingType === 'transcribe' ? 'ถอดข้อความ' : 'สรุป'}...`)
      
      const aiResult = processingType === 'transcribe' 
        ? await googleAIService.transcribeAudio(uploadedFile)
        : await googleAIService.summarizeAudio(uploadedFile)

      if (!aiResult.success) {
        if (aiResult.error?.includes('429') || aiResult.error?.includes('quota')) {
          throw new Error('📊 โควต้าของ AI model หมดแล้ว\n\n💡 ลองใหม่ในอีก 1-2 นาที หรือเปลี่ยน model ใน .env:\nVITE_AI_MODEL=gemini-1.5-flash')
        }
        if (aiResult.error?.includes('API key')) {
          throw new Error('กรุณาตั้งค่า Google AI Studio API Key\n\nรอบนี้ API Key ถูกตั้งค่าอัตโนมัติใน Environment Variables แล้ว\nหากยังขึ้น error นี้ให้ contact admin')
        }
        throw new Error(aiResult.error || 'เกิดข้อผิดพลาดในการประมวลผล')
      }

      let processedResult = aiResult.data || ''
      processedResult += `\n\n---\n📁 ไฟล์: ${uploadedFile.name}`
      processedResult += `\n⚡ ประมวลผลด้วย Google AI Studio`
      
      setResult(processedResult)
      
    } catch (error) {
      console.error('Processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      setError(errorMessage)
      setResult('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Audio Summarizer</h1>
        <p>อัปโหลดไฟล์เสียงเพื่อถอดข้อความหรือสรุปเนื้อหาด้วย Google AI</p>
      </header>

      <main className="app-main">
        <div className="container">
          <AudioUploader 
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
          />

          {uploadedFile && (
            <ProcessingOptions
              onTypeSelect={handleProcessingTypeSelect}
              selectedType={processingType}
              onProcess={handleProcess}
              isProcessing={isProcessing}
            />
          )}

          <ProcessingProgress
            step={progress.step}
            progress={progress.progress}
            details={progress.details}
            logs={progress.logs}
            isVisible={isProcessing || progress.step === 'Complete' || progress.step === 'Error'}
          />

          {error && (
            <div className="error-message">
              <h3>⚠️ เกิดข้อผิดพลาด</h3>
              <p style={{whiteSpace: 'pre-line'}}>{error}</p>
            </div>
          )}

          {result && !error && (
            <ResultDisplay
              result={result}
              processingType={processingType}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
