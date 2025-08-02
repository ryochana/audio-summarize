import { useState } from 'react'
import AudioUploader from './components/AudioUploader'
import SRTOptions from './components/SRTOptions'
import ProcessingProgress from './components/ProcessingProgress'
import ResultDisplay from './components/ResultDisplay'
import { PerformanceStats } from './components/PerformanceStats'
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
  const [showStats, setShowStats] = useState(false)
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
    
    // Auto-start processing after file selection
    console.log(`🚀 [APP] Auto-starting ${processingType} processing...`)
    startAutoProcess(file)
  }

  const startAutoProcess = (file: File) => {
    setTimeout(() => {
      if (file) {
        handleProcess(processingType === 'srt' ? 'original' : undefined)
      }
    }, 800) // Increased delay for better UX
  }

  const handleTypeChange = (type: 'transcribe' | 'summarize' | 'srt') => {
    console.log(`🎯 [APP] Processing type changed to: ${type}`)
    setProcessingType(type)
    
    // Auto-reprocess with new type if file exists
    if (audioFile && !isProcessing) {
      console.log(`🔄 [APP] Auto-reprocessing with new type: ${type}`)
      setResult(null)
      setError(null)
      setSrtContent(null)
      
      setTimeout(() => {
        handleProcess(type === 'srt' ? 'original' : undefined)
      }, 300)
    }
  }

  const handleProcess = async (srtLanguage?: 'original' | 'thai') => {
    if (!audioFile) {
      console.warn('⚠️ [APP] No audio file selected for processing')
      return
    }

    console.log(`🚀 [APP] Starting ${processingType} processing for: ${audioFile.name}`)
    console.log(`🚀 [APP] Processing type: ${processingType}`)
    console.log(`🚀 [APP] Processing started at: ${new Date().toLocaleString('th-TH')}`)
    if (srtLanguage) {
      console.log(`🚀 [APP] SRT language: ${srtLanguage}`)
    }

    setIsProcessing(true)
    setResult(null)
    setError(null)
    setProgress(null)
    setSrtContent(null)

    try {
      if (processingType === 'srt') {
        console.log(`🎬 [APP] Starting SRT generation...`)
        // SRT Generation
        const srtResult = await srtService.generateSRT(audioFile, srtLanguage || 'original')
        
        const subtitleCount = srtResult.split('\n\n').filter(s => s.trim()).length
        console.log(`🎬 [APP] SRT generation completed successfully`)
        console.log(`🎬 [APP] Generated ${subtitleCount} subtitle blocks`)
        
        setSrtContent(srtResult)
        setResult(`SRT ซับไตเติ้ลสำเร็จ!\n\nจำนวนซับ: ${subtitleCount} บรรทัด\nภาษา: ${srtLanguage === 'thai' ? 'ไทย (แปล)' : 'ต้นฉบับ'}\n\nไฟล์ SRT จะดาวน์โหลดอัตโนมัติ`)
        
        // Auto-download SRT file
        setTimeout(() => {
          if (audioFile && srtResult) {
            console.log(`💾 [APP] Auto-downloading SRT file...`)
            const filename = audioFile.name.split('.')[0]
            srtService.downloadSRT(srtResult, filename)
          }
        }, 1500) // Short delay to show result first
      } else {
        console.log(`🔄 [APP] Starting ${processingType} with Google AI service...`)
        // Regular transcription/summarization
        // Set up progress callback
        googleAI.setProgressCallback((progressData) => {
          console.log('🔄 [APP] Progress update: ' + progressData.percentage + '% - ' + progressData.message)
          setProgress(progressData)
        })

        let processingResult
        
        if (processingType === 'transcribe') {
          console.log(`📝 [APP] Calling transcribeAudio()...`)
          processingResult = await googleAI.transcribeAudio(audioFile)
        } else {
          console.log(`📋 [APP] Calling summarizeAudio()...`)
          processingResult = await googleAI.summarizeAudio(audioFile)
        }

        if (processingResult.success && processingResult.data) {
          console.log(`✅ [APP] ${processingType} completed successfully`)
          console.log(`✅ [APP] Result data length: ${JSON.stringify(processingResult.data).length} characters`)
          setResult(processingResult.data)
        } else {
          console.error(`❌ [APP] ${processingType} failed:`, processingResult.error)
          setError(processingResult.error || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
        }
      }
    } catch (err: any) {
      console.error(`💥 [APP] Processing error:`, err)
      console.error(`💥 [APP] Error message: ${err.message}`)
      console.error(`💥 [APP] Error stack:`, err.stack)
      setError(err.message || 'เกิดข้อผิดพลาดในการประมวลผล')
    } finally {
      console.log(`🏁 [APP] Processing ended at: ${new Date().toLocaleString('th-TH')}`)
      console.log(`🏁 [APP] Final processing state: ${isProcessing ? 'STILL PROCESSING' : 'COMPLETED'}`)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🎵</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Audio Summarizer</h1>
                <p className="text-sm text-gray-600">🚀 Auto-Process Mode | ⚡ Enhanced Performance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">อัปโหลดไฟล์เสียงแล้วประมวลผลทันที</div>
              <div className="text-xs text-blue-600 font-medium">Multi-API Load Balancing</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <AudioUploader 
              onFileUpload={handleFileSelect} 
              uploadedFile={audioFile}
            />
          </div>

          {/* Processing Options */}
          {audioFile && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <SRTOptions
                selectedType={processingType}
                onTypeSelect={handleTypeChange}
                onProcess={handleProcess}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {/* Progress */}
          {isProcessing && progress && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ResultDisplay
                result={result}
                processingType={processingType}
                onReset={handleReset}
              />
              
              {/* SRT Download Button */}
              {processingType === 'srt' && srtContent && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleDownloadSRT}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    💾 ดาวน์โหลด SRT ไฟล์
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-4">❌ เกิดข้อผิดพลาด</div>
                <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
                  {error}
                </div>
                <button
                  onClick={handleReset}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Performance Stats */}
      <PerformanceStats
        isVisible={showStats}
        onToggle={() => setShowStats(!showStats)}
      />

      {/* Footer */}
      <footer className="mt-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              🚀 Enhanced Performance Features
            </div>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <span>⚡ Multi-API Load Balancing</span>
              <span>🔄 Smart API Selection</span>
              <span>📊 Parallel Processing</span>
              <span>� SRT Subtitle Generation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
