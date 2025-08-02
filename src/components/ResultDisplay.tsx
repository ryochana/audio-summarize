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
          {processingType === 'srt' ? (
            // Special formatting for SRT content
            <div className="srt-content">
              <div className="srt-preview">
                {result.split('\n\n').map((subtitle, index) => {
                  const lines = subtitle.trim().split('\n')
                  if (lines.length >= 3) {
                    const number = lines[0]
                    const timestamp = lines[1]
                    const text = lines.slice(2).join('\n')
                    return (
                      <div key={index} className="srt-subtitle">
                        <div className="srt-number">{number}</div>
                        <div className="srt-timestamp">{timestamp}</div>
                        <div className="srt-text">{text}</div>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
              <div className="srt-raw">
                <h4>📄 เนื้อหา SRT (คัดลอกไปบันทึกเป็น .srt)</h4>
                <pre className="srt-raw-content">{result}</pre>
              </div>
            </div>
          ) : (
            // Normal text formatting for transcribe/summarize
            result.split('\n').map((line, index) => (
              <p key={index}>{line || '\u00A0'}</p>
            ))
          )}
        </div>
      </div>
      
      <div className="result-info">
        <p>
          ประเภท: {processingType === 'transcribe' && 'การถอดข้อความ'}
                  {processingType === 'summarize' && 'การสรุปโดยละเอียด'}
                  {processingType === 'srt' && 'การสร้างซับไตเติ้ล SRT'} | 
          {processingType === 'srt' ? (
            <>จำนวนซับ: {result.split('\n\n').filter(s => s.trim()).length} ซับ</>
          ) : (
            <>ความยาว: {result.length} ตัวอักษร</>
          )} | 
          เวลา: {new Date().toLocaleString('th-TH')}
          {processingType === 'srt' && (
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
              💡 คัดลอกเนื้อหาด้านล่างแล้วบันทึกเป็นไฟล์ .srt เพื่อใช้กับโปรแกรมเล่นวิดีโอ
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export default ResultDisplay
