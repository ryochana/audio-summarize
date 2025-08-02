import React, { useState } from 'react'
import './ResultDisplay.css'

interface ResultDisplayProps {
  result: string
  processingType: 'transcribe' | 'summarize' | 'srt' | null
  onReset?: () => void
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, 
  processingType, 
  onReset
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([result], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    
    let filename = ''
    if (processingType === 'transcribe') {
      filename = `transcription_${new Date().getTime()}.txt`
    } else if (processingType === 'summarize') {
      filename = `summary_${new Date().getTime()}.txt`
    } else if (processingType === 'srt') {
      filename = `subtitle_${new Date().getTime()}.txt`
    } else {
      filename = `result_${new Date().getTime()}.txt`
    }
    
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="result-display">
      <div className="result-header">
        <h2>
          {processingType === 'transcribe' && '📝 ผลการถอดข้อความ'}
          {processingType === 'summarize' && '📋 ผลการสรุป'}
          {processingType === 'srt' && '🎬 ผลการสร้างซับไตเติ้ล'}
        </h2>
        <div className="result-actions">
          <button 
            className="action-button copy-button"
            onClick={handleCopy}
            title="คัดลอกผลลัพธ์"
          >
            {copied ? '✓ คัดลอกแล้ว' : '📋 คัดลอก'}
          </button>
          <button 
            className="action-button download-button"
            onClick={handleDownload}
            title="ดาวน์โหลดเป็นไฟล์ข้อความ"
          >
            💾 ดาวน์โหลด
          </button>
          {onReset && (
            <button 
              className="action-button reset-button"
              onClick={onReset}
              title="ประมวลผลใหม่"
            >
              🔄 ประมวลผลใหม่
            </button>
          )}
        </div>
      </div>
      
      <div className="result-content">
        <div className="result-box">
          {result.split('\n').map((line, index) => (
            <p key={index}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>
      
      <div className="result-info">
        <p>
          ประเภท: {processingType === 'transcribe' && 'การถอดข้อความ'}
                  {processingType === 'summarize' && 'การสรุปโดยละเอียด'}
                  {processingType === 'srt' && 'การสร้างซับไตเติ้ล SRT'} | 
          ความยาว: {result.length} ตัวอักษร | 
          เวลา: {new Date().toLocaleString('th-TH')}
        </p>
      </div>
    </div>
  )
}

export default ResultDisplay
