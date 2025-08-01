import React, { useRef } from 'react'
import './AudioUploader.css'

interface AudioUploaderProps {
  onFileUpload: (file: File) => void
  uploadedFile: File | null
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileUpload, uploadedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is audio format
      if (file.type.startsWith('audio/') || 
          file.name.match(/\.(mp3|wav|m4a|aac|flac|ogg|wma|amr|3gp)$/i)) {
        onFileUpload(file)
      } else {
        alert('กรุณาเลือกไฟล์เสียงเท่านั้น')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type.startsWith('audio/') || 
        file.name.match(/\.(mp3|wav|m4a|aac|flac|ogg|wma|amr|3gp)$/i))) {
      onFileUpload(file)
    } else {
      alert('กรุณาเลือกไฟล์เสียงเท่านั้น')
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="audio-uploader">
      <div 
        className={`upload-area ${uploadedFile ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.wma,.amr,.3gp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {uploadedFile ? (
          <div className="file-info">
            <div className="file-icon">🎵</div>
            <div className="file-details">
              <h3>{uploadedFile.name}</h3>
              <p>ขนาด: {formatFileSize(uploadedFile.size)}</p>
              <p>ประเภท: {uploadedFile.type || 'ไฟล์เสียง'}</p>
            </div>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <h2>เลือกไฟล์เสียงหรือลากไฟล์มาวางที่นี่</h2>
            <p>รองรับไฟล์: MP3, WAV, M4A, AAC, FLAC, OGG, WMA, AMR, 3GP</p>
            <button className="upload-button">เลือกไฟล์</button>
          </div>
        )}
      </div>
      
      {uploadedFile && (
        <button 
          className="change-file-button"
          onClick={() => fileInputRef.current?.click()}
        >
          เปลี่ยนไฟล์
        </button>
      )}
    </div>
  )
}

export default AudioUploader
