import React, { useState } from 'react'
import './SRTOptions.css'

interface SRTOptionsProps {
  onTypeSelect: (type: 'transcribe' | 'summarize' | 'srt') => void
  selectedType: 'transcribe' | 'summarize' | 'srt' | null
  onProcess: (srtLanguage?: 'original' | 'thai') => void
  isProcessing: boolean
}

const SRTOptions: React.FC<SRTOptionsProps> = ({
  onTypeSelect,
  selectedType,
  onProcess,
  isProcessing
}) => {
  const [srtLanguage, setSrtLanguage] = useState<'original' | 'thai'>('original')

  const handleProcess = () => {
    if (selectedType === 'srt') {
      onProcess(srtLanguage)
    } else {
      onProcess()
    }
  }

  return (
    <div className="processing-options">
      <h2>เลือกประเภทการประมวลผล</h2>
      
      <div className="option-grid">
        <button
          className={`option-card ${selectedType === 'transcribe' ? 'selected' : ''}`}
          onClick={() => onTypeSelect('transcribe')}
          disabled={isProcessing}
        >
          <div className="option-icon">📝</div>
          <div className="option-title">ถอดข้อความ</div>
          <div className="option-desc">แปลงเสียงพูดเป็นข้อความ</div>
        </button>

        <button
          className={`option-card ${selectedType === 'summarize' ? 'selected' : ''}`}
          onClick={() => onTypeSelect('summarize')}
          disabled={isProcessing}
        >
          <div className="option-icon">📋</div>
          <div className="option-title">สรุปเนื้อหา</div>
          <div className="option-desc">สรุปประเด็นสำคัญจากเสียง</div>
        </button>

        <button
          className={`option-card ${selectedType === 'srt' ? 'selected' : ''}`}
          onClick={() => onTypeSelect('srt')}
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
              onClick={() => setSrtLanguage('original')}
              disabled={isProcessing}
            >
              🌐 ภาษาต้นฉบับ
            </button>
            <button
              className={`language-btn ${srtLanguage === 'thai' ? 'selected' : ''}`}
              onClick={() => setSrtLanguage('thai')}
              disabled={isProcessing}
            >
              🇹🇭 แปลเป็นไทย
            </button>
          </div>
        </div>
      )}

      {selectedType && (
        <div className="process-section">
          <button
            className="process-button"
            onClick={handleProcess}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading-spinner"></span>
                กำลังประมวลผล...
              </>
            ) : (
              <>
                {selectedType === 'transcribe' && '📝 เริ่มถอดข้อความ'}
                {selectedType === 'summarize' && '📋 เริ่มสรุปเนื้อหา'}
                {selectedType === 'srt' && `🎬 สร้างซับ ${srtLanguage === 'thai' ? '(แปลไทย)' : '(ภาษาต้นฉบับ)'}`}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default SRTOptions
