import React, { useState } from 'react'
import './SRTOptions.css'

interface SRTOptionsProps {
  onTypeSelect: (type: 'transcribe' | 'summarize' | 'srt') => void
  selectedType: 'transcribe' | 'summarize' | 'srt' | null
  isProcessing: boolean
}

const SRTOptions: React.FC<SRTOptionsProps> = ({
  onTypeSelect,
  selectedType,
  isProcessing
}) => {
  const [srtLanguage, setSrtLanguage] = useState<'original' | 'thai'>('original')

  return (
    <div className="processing-options">
      <h2>เลือกประเภทการประมวลผล</h2>
      
      <div className="option-grid">
        <button
          className={`option-card ${selectedType === 'transcribe' ? 'selected' : ''}`}
          onClick={() => {
            console.log('🎯 [SRTOptions] User selected: transcribe')
            onTypeSelect('transcribe')
          }}
          disabled={isProcessing}
        >
          <div className="option-icon">📝</div>
          <div className="option-title">ถอดข้อความ</div>
          <div className="option-desc">แปลงเสียงพูดเป็นข้อความ</div>
        </button>

        <button
          className={`option-card ${selectedType === 'summarize' ? 'selected' : ''}`}
          onClick={() => {
            console.log('🎯 [SRTOptions] User selected: summarize')
            onTypeSelect('summarize')
          }}
          disabled={isProcessing}
        >
          <div className="option-icon">📋</div>
          <div className="option-title">สรุปเนื้อหา</div>
          <div className="option-desc">สรุปประเด็นสำคัญจากเสียง</div>
        </button>

        <button
          className={`option-card ${selectedType === 'srt' ? 'selected' : ''}`}
          onClick={() => {
            console.log('🎯 [SRTOptions] User selected: srt')
            onTypeSelect('srt')
          }}
          disabled={isProcessing}
        >
          <div className="option-icon">🎬</div>
          <div className="option-title">สร้างซับไตเติ้ล</div>
          <div className="option-desc">สร้างไฟล์ซับ .srt พร้อม timing</div>
        </button>
      </div>

      {/* SRT Language Options */}
      {selectedType === 'srt' && (
        <div className="srt-language-options">
          <h3>เลือกภาษาซับไตเติ้ล</h3>
          <div className="language-buttons">
            <button
              className={`language-btn ${srtLanguage === 'original' ? 'selected' : ''}`}
              onClick={() => {
                console.log('🌐 [SRTOptions] SRT language selected: original')
                setSrtLanguage('original')
              }}
              disabled={isProcessing}
            >
              🌐 ภาษาต้นฉบับ
            </button>
            <button
              className={`language-btn ${srtLanguage === 'thai' ? 'selected' : ''}`}
              onClick={() => {
                console.log('🇹🇭 [SRTOptions] SRT language selected: thai')
                setSrtLanguage('thai')
              }}
              disabled={isProcessing}
            >
              🇹🇭 แปลเป็นไทย
            </button>
          </div>
        </div>
      )}

      {/* Auto-Process Mode - No manual button needed */}
      {selectedType && (
        <div className="process-section">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-700 font-medium mb-1">
              🚀 โหมดประมวlผลอัตโนมัติ
            </div>
            <div className="text-sm text-blue-600">
              อัปโหลดไฟล์เสียงแล้วจะเริ่มประมวลผลทันที
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SRTOptions
