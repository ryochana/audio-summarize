import React from 'react'

interface ProcessingProgressProps {
  step: string
  progress: number
  details: string
  logs: string[]
  isVisible: boolean
}

const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  step,
  progress,
  details,
  logs,
  isVisible
}) => {
  if (!isVisible) return null

  const getStepIcon = (currentStep: string) => {
    switch (currentStep) {
      case 'Validating': return '🔍'
      case 'Converting': return '🔄'
      case 'Preparing': return '⚙️'
      case 'Processing': return '🤖'
      case 'Finalizing': return '📝'
      case 'Complete': return '✅'
      case 'Error': return '❌'
      default: return '⏳'
    }
  }

  const getStepName = (currentStep: string) => {
    switch (currentStep) {
      case 'Validating': return 'ตรวจสอบไฟล์'
      case 'Converting': return 'แปลงไฟล์'
      case 'Preparing': return 'เตรียมข้อมูล'
      case 'Processing': return 'ประมวลผล AI'
      case 'Finalizing': return 'จัดรูปแบบ'
      case 'Complete': return 'เสร็จสิ้น!'
      case 'Error': return 'เกิดข้อผิดพลาด'
      default: return 'กำลังประมวลผล...'
    }
  }

  return (
    <div className="processing-progress">
      <div className="progress-header">
        <div className="progress-icon">
          {getStepIcon(step)}
        </div>
        <div className="progress-info">
          <h3>{getStepName(step)}</h3>
          <p>{details}</p>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${progress}%`
            }}
          />
        </div>
        <span className="progress-text">{progress}%</span>
      </div>

      {logs.length > 0 && (
        <div className="progress-logs">
          <h4>📋 Log การทำงาน</h4>
          <div className="log-container">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">
                  {new Date().toLocaleTimeString('th-TH', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
                <span className="log-message">{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcessingProgress
