import { useState } from 'react'
import AudioUploader from './components/AudioUploader'
import SRTOptions from './components/SRTOptions'
import ProcessingProgress from './components/ProcessingProgress'
import ResultDisplay from './components/ResultDisplay'
import { googleAI } from './services/googleAI-enhanced'
import { srtService } from './services/srtService'
import type { ProcessingProgress as ProcessingProgressType } from './services/googleAI-enhanced'
import './App.css'

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [processingType, setProcessingType] = useState<'transcribe' | 'summarize' | 'srt'>('srt')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProcessingProgressType | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [srtContent, setSrtContent] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    console.log(`📁 [APP] File selected: ${file.name}`)
    console.log(`📁 [APP] File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    console.log(`📁 [APP] File type: ${file.type}`)
    
    setAudioFile(file)
    setResult(null)
    setError(null)
    setProgress(null)
    setSrtContent(null)
  }

  const handleProcess = async (srtLanguage?: 'original' | 'thai') => {
    if (!audioFile) {
      console.warn('⚠️ [APP] No audio file selected for processing')
      return
    }

    console.log(`🚀 [APP] === PROCESSING STARTED ===`)
    console.log(`🚀 [APP] File: ${audioFile.name}`)
    console.log(`🚀 [APP] Type: ${processingType}`)
    console.log(`🚀 [APP] Time: ${new Date().toLocaleString('th-TH')}`)
    if (srtLanguage) {
      console.log(`🚀 [APP] SRT Language: ${srtLanguage}`)
    }

    setIsProcessing(true)
    setResult(null)
    setError(null)
    setProgress(null)
    setSrtContent(null)

    try {
      if (processingType === 'srt') {
        console.log(`📊 [APP] Progress: 0% - เริ่มต้นการสร้าง SRT`)
        setProgress({ step: 'Starting', progress: 0, details: 'เริ่มต้นการสร้าง SRT...', logs: [], percentage: 0, message: 'เริ่มต้นการสร้าง SRT...' })
        
        console.log(`📊 [APP] Progress: 10% - เตรียมไฟล์เสียง`)
        setProgress({ step: 'Preparing', progress: 10, details: 'เตรียมไฟล์เสียงสำหรับประมวลผล...', logs: [], percentage: 10, message: 'เตรียมไฟล์เสียงสำหรับประมวลผล...' })
        
        const srtResult = await srtService.generateSRT(audioFile, srtLanguage || 'original')
        
        console.log(`📊 [APP] Progress: 90% - สร้าง SRT สำเร็จ`)
        setProgress({ step: 'Finalizing', progress: 90, details: 'กำลังจัดรูปแบบ SRT...', logs: [], percentage: 90, message: 'กำลังจัดรูปแบบ SRT...' })
        
        const subtitleCount = srtResult.split('\n\n').filter(s => s.trim()).length
        console.log(`✅ [APP] Progress: 100% - เสร็จสิ้น`)
        console.log(`✅ [APP] Generated ${subtitleCount} subtitle blocks`)
        
        setSrtContent(srtResult)
        setResult(`SRT ซับไตเติ้ลสำเร็จ!\n\nจำนวนซับ: ${subtitleCount} บรรทัด\nภาษา: ${srtLanguage === 'thai' ? 'ไทย (แปล)' : 'ต้นฉบับ'}\n\nคลิกปุ่ม "💾 ดาวน์โหลด SRT" เพื่อบันทึกไฟล์`)
      } else {
        console.log(`� [APP] Progress: 0% - เริ่มต้น${processingType}`)
        setProgress({ step: 'Starting', progress: 0, details: `เริ่มต้น${processingType}...`, logs: [], percentage: 0, message: `เริ่มต้น${processingType}...` })
        
        // Set up progress callback with detailed logging
        googleAI.setProgressCallback((progressData) => {
          console.log(`� [APP] Progress: ${progressData.percentage}% - ${progressData.message}`)
          console.log(`📊 [APP] Step: ${progressData.step} | Details: ${progressData.details}`)
          setProgress(progressData)
        })

        let processingResult
        
        if (processingType === 'transcribe') {
          console.log(`📝 [APP] Starting transcription...`)
          processingResult = await googleAI.transcribeAudio(audioFile)
        } else {
          console.log(`📋 [APP] Starting summarization...`)
          processingResult = await googleAI.summarizeAudio(audioFile)
        }

        if (processingResult.success && processingResult.data) {
          console.log(`✅ [APP] ${processingType} completed successfully`)
          console.log(`✅ [APP] Result length: ${JSON.stringify(processingResult.data).length} characters`)
          setResult(processingResult.data)
        } else {
          console.error(`❌ [APP] ${processingType} failed:`, processingResult.error)
          setError(processingResult.error || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
        }
      }
    } catch (err: any) {
      console.error(`💥 [APP] Processing error:`, err)
      console.error(`💥 [APP] Error message: ${err.message}`)
      setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผล')
    } finally {
      console.log(`🏁 [APP] === PROCESSING COMPLETED ===`)
      console.log(`🏁 [APP] End time: ${new Date().toLocaleString('th-TH')}`)
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    console.log(`🔄 [APP] Resetting application state`)
    console.log(`🔄 [APP] Previous file: ${audioFile?.name || 'none'}`)
    
    setAudioFile(null)
    setResult(null)
    setError(null)
    setProgress(null)
    setSrtContent(null)
    
    console.log(`🔄 [APP] Reset completed at: ${new Date().toLocaleString('th-TH')}`)
  }

  const handleDownloadSRT = () => {
    if (srtContent && audioFile) {
      console.log(`💾 [APP] Starting SRT download for: ${audioFile.name}`)
      const filename = audioFile.name.split('.')[0]
      console.log(`💾 [APP] SRT filename: ${filename}.srt`)
      console.log(`💾 [APP] SRT content length: ${srtContent.length} characters`)
      
      srtService.downloadSRT(srtContent, filename)
      console.log(`💾 [APP] SRT download initiated successfully`)
    } else {
      console.warn(`⚠️ [APP] Cannot download SRT - missing content or file`)
      console.warn(`⚠️ [APP] srtContent exists: ${!!srtContent}`)
      console.warn(`⚠️ [APP] audioFile exists: ${!!audioFile}`)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🎵 ผลการสร้างซับไตเติ้ล</h1>
        <p>⚡ Manual Process Mode | 🎯 Enhanced AI Processing</p>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {/* File Upload */}
          <AudioUploader 
            onFileUpload={handleFileSelect} 
            uploadedFile={audioFile}
          />

          {/* Processing Options */}
          {audioFile && (
            <SRTOptions
              selectedType={processingType}
              onTypeSelect={setProcessingType}
              onProcess={handleProcess}
              isProcessing={isProcessing}
            />
          )}

          {/* Progress */}
          {isProcessing && progress && (
            <div className="modern-card">
              <ProcessingProgress 
                step={progress.step}
                progress={progress.progress}
                details={progress.details}
                logs={progress.logs}
                isVisible={true}
              />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="modern-card">
              <ResultDisplay
                result={result}
                processingType={processingType}
                onReset={handleReset}
              />
              
              {/* SRT Download Button */}
              {processingType === 'srt' && srtContent && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button
                    onClick={handleDownloadSRT}
                    className="process-button"
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      boxShadow: '0 15px 35px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    💾 ดาวน์โหลด SRT ไฟล์
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="modern-card" style={{ 
              borderLeft: '4px solid #ef4444',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem',
                  color: '#ef4444',
                  fontWeight: '700'
                }}>
                  ❌ เกิดข้อผิดพลาด
                </div>
                <div style={{ 
                  color: '#dc2626', 
                  marginBottom: '1.5rem', 
                  padding: '1rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '12px',
                  lineHeight: '1.6'
                }}>
                  {error}
                </div>
                <button
                  onClick={handleReset}
                  className="process-button"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    boxShadow: '0 15px 35px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  � ลองใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
