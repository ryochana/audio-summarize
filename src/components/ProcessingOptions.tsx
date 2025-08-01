import React from 'react'
import './ProcessingOptions.css'

interface ProcessingOptionsProps {
  onTypeSelect: (type: 'transcribe' | 'summarize') => void
  selectedType: 'transcribe' | 'summarize' | null
  onProcess: () => void
  isProcessing: boolean
}

const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  onTypeSelect,
  selectedType,
  onProcess,
  isProcessing
}) => {
  return (
    <div className="processing-options">
      <h2>เลือกประเภทการประมวลผล</h2>
      
      <div className="option-cards">
        <div 
          className={`option-card ${selectedType === 'transcribe' ? 'selected' : ''}`}
          onClick={() => onTypeSelect('transcribe')}
        >
          <div className="option-icon">📝</div>
          <h3>ถอดข้อความ</h3>
          <p>แปลงเสียงพูดให้เป็นข้อความ</p>
          <ul>
            <li>แปลงเสียงเป็นข้อความ</li>
            <li>รองรับหลายภาษา</li>
            <li>ความแม่นยำสูง</li>
          </ul>
        </div>

        <div 
          className={`option-card ${selectedType === 'summarize' ? 'selected' : ''}`}
          onClick={() => onTypeSelect('summarize')}
        >
          <div className="option-icon">📋</div>
          <h3>สรุปโดยละเอียด</h3>
          <p>สรุปเนื้อหาสำคัญจากไฟล์เสียง</p>
          <ul>
            <li>สรุปจุดสำคัญ</li>
            <li>ระบุหัวข้อหลัก</li>
            <li>จัดกลุ่มข้อมูล</li>
          </ul>
        </div>
      </div>

      {selectedType && (
        <div className="process-section">
          <button 
            className="process-button"
            onClick={onProcess}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading-spinner"></span>
                กำลังประมวลผล...
              </>
            ) : (
              `เริ่ม${selectedType === 'transcribe' ? 'ถอดข้อความ' : 'สรุป'}`
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ProcessingOptions
