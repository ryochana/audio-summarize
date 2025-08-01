import { useState } from 'react'
import './App.css'
import AudioUploader from './components/AudioUploader'
import ProcessingOptions from './components/ProcessingOptions'
import ResultDisplay from './components/ResultDisplay'
import GoogleAuthButton from './components/GoogleAuthButton'
import { googleAIService } from './services/googleAI'
import { googleDriveService } from './services/googleDrive'
import type { AuthStatus } from './services/googleDrive'

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processingType, setProcessingType] = useState<'transcribe' | 'summarize' | null>(null)
  const [result, setResult] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isSignedIn: false })

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setResult('')
    setError('')
  }

  const handleProcessingTypeSelect = (type: 'transcribe' | 'summarize') => {
    setProcessingType(type)
    setError('')
  }

  const handleAuthChange = (status: AuthStatus) => {
    setAuthStatus(status)
  }

  const handleProcess = async () => {
    if (!uploadedFile || !processingType) return

    setIsProcessing(true)
    setError('')
    
    try {
      let driveResult = null
      
      // Try to upload to Google Drive if user is signed in
      if (authStatus.isSignedIn) {
        console.log('อัปโหลดไฟล์ไป Google Drive...')
        driveResult = await googleDriveService.uploadFile(uploadedFile)
        
        if (!driveResult.success) {
          console.warn('การอัปโหลด Google Drive ล้มเหลว:', driveResult.error)
          // Don't stop processing, just continue without Drive upload
        } else {
          console.log('ไฟล์อัปโหลดสำเร็จ:', driveResult.fileUrl)
        }
      }

      // Process with Google AI
      console.log(`เริ่ม${processingType === 'transcribe' ? 'ถอดข้อความ' : 'สรุป'}...`)
      
      const aiResult = processingType === 'transcribe' 
        ? await googleAIService.transcribeAudio(uploadedFile)
        : await googleAIService.summarizeAudio(uploadedFile)

      if (!aiResult.success) {
        if (aiResult.error?.includes('API key')) {
          throw new Error('กรุณาตั้งค่า Google AI Studio API Key ในไฟล์ .env ก่อนใช้งาน\n\nวิธีการ:\n1. ไปที่ https://aistudio.google.com/\n2. สร้าง API Key\n3. ใส่ใน VITE_GOOGLE_AI_API_KEY ในไฟล์ .env')
        }
        throw new Error(aiResult.error || 'เกิดข้อผิดพลาดในการประมวลผล')
      }

      let processedResult = aiResult.data || ''
      
      // Add file info
      processedResult += `\n\n---\n📁 ไฟล์ต้นฉบับ: ${uploadedFile.name}`
      
      if (driveResult && driveResult.success) {
        processedResult += `\n☁️ เก็บใน Google Drive: ${driveResult.fileUrl}`
      } else if (authStatus.isSignedIn) {
        processedResult += `\n⚠️ ไม่สามารถอัปโหลดไป Google Drive ได้`
      } else {
        processedResult += `\n💡 เชื่อมต่อ Google Drive เพื่อเก็บไฟล์อัตโนมัติ`
      }
      
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
          {/* API Key Setup Notice */}
          {!import.meta.env.VITE_GOOGLE_AI_API_KEY && (
            <div className="setup-notice">
              <h3>🔧 การตั้งค่าเริ่มต้น</h3>
              <p>เพื่อใช้งานการถอดข้อความและสรุปเสียง คุณต้องตั้งค่า Google AI Studio API Key:</p>
              <ol>
                <li>ไปที่ <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                <li>สร้าง API Key ใหม่</li>
                <li>สร้างไฟล์ <code>.env</code> ในโฟลเดอร์โปรเจค</li>
                <li>เพิ่มบรรทัด: <code>VITE_GOOGLE_AI_API_KEY=your_api_key_here</code></li>
                <li>รีสตาร์ทเซิร์ฟเวอร์ (npm run dev)</li>
              </ol>
            </div>
          )}

          <GoogleAuthButton onAuthChange={handleAuthChange} />
          
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

          {error && (
            <div className="error-message">
              <h3>⚠️ เกิดข้อผิดพลาด</h3>
              <p>{error}</p>
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
