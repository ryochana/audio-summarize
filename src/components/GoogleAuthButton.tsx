import React, { useState, useEffect } from 'react'
import { googleDriveService } from '../services/googleDrive'
import type { AuthStatus } from '../services/googleDrive'
import './GoogleAuthButton.css'

interface GoogleAuthButtonProps {
  onAuthChange: (authStatus: AuthStatus) => void
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onAuthChange }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isSignedIn: false })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check initial auth status
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const isSignedIn = await googleDriveService.isSignedIn()
      const status = { isSignedIn }
      setAuthStatus(status)
      onAuthChange(status)
    } catch (error) {
      console.error('Failed to check auth status:', error)
    }
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const status = await googleDriveService.signIn()
      setAuthStatus(status)
      onAuthChange(status)
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await googleDriveService.signOut()
      const status = { isSignedIn: false }
      setAuthStatus(status)
      onAuthChange(status)
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="google-auth">
      {authStatus.isSignedIn ? (
        <div className="auth-status signed-in">
          <div className="auth-info">
            <span className="auth-icon">✅</span>
            <div className="auth-text">
              <span className="auth-label">เชื่อมต่อ Google Drive แล้ว</span>
              {authStatus.userEmail && (
                <span className="user-email">{authStatus.userEmail}</span>
              )}
            </div>
          </div>
          <button 
            className="auth-button sign-out"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
          </button>
        </div>
      ) : (
        <div className="auth-status signed-out">
          <div className="auth-info">
            <span className="auth-icon">📁</span>
            <div className="auth-text">
              <span className="auth-label">เชื่อมต่อ Google Drive</span>
              <span className="auth-description">เพื่อเก็บไฟล์เสียงของคุณ</span>
            </div>
          </div>
          <button 
            className="auth-button sign-in"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google Drive'}
          </button>
        </div>
      )}
    </div>
  )
}

export default GoogleAuthButton
