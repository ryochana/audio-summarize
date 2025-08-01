// Google Drive API service with OAuth2 authentication
export interface DriveUploadResult {
  success: boolean
  fileId?: string
  fileUrl?: string
  error?: string
}

export interface AuthStatus {
  isSignedIn: boolean
  userEmail?: string
}

export class GoogleDriveService {
  private readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '629461186727-example.apps.googleusercontent.com'
  private readonly API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
  private readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.file'
  
  private gapi: any = null
  private isInitialized = false

  constructor() {
    this.initializeGapi()
  }

  private async initializeGapi(): Promise<void> {
    try {
      // Load Google API script
      await this.loadGoogleAPIScript()
      
      if (window.gapi) {
        await window.gapi.load('client:auth2', async () => {
          await window.gapi.client.init({
            apiKey: this.API_KEY,
            clientId: this.CLIENT_ID,
            discoveryDocs: [this.DISCOVERY_DOC],
            scope: this.SCOPES
          })
          
          this.gapi = window.gapi
          this.isInitialized = true
          console.log('Google Drive API initialized successfully')
        })
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error)
    }
  }

  private loadGoogleAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google API script'))
      document.head.appendChild(script)
    })
  }

  async signIn(): Promise<AuthStatus> {
    try {
      if (!this.isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for initialization
      }

      if (!this.gapi) {
        return { isSignedIn: false, userEmail: undefined }
      }

      const authInstance = this.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      
      if (user.isSignedIn()) {
        const profile = user.getBasicProfile()
        return {
          isSignedIn: true,
          userEmail: profile.getEmail()
        }
      }

      return { isSignedIn: false }
    } catch (error) {
      console.error('Sign in failed:', error)
      return { isSignedIn: false }
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.gapi) {
        const authInstance = this.gapi.auth2.getAuthInstance()
        await authInstance.signOut()
      }
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      if (!this.gapi) return false
      
      const authInstance = this.gapi.auth2.getAuthInstance()
      return authInstance.isSignedIn.get()
    } catch (error) {
      return false
    }
  }

  async uploadFile(file: File, fileName?: string): Promise<DriveUploadResult> {
    try {
      // Check if user is signed in
      const signedIn = await this.isSignedIn()
      if (!signedIn) {
        const authStatus = await this.signIn()
        if (!authStatus.isSignedIn) {
          return {
            success: false,
            error: 'กรุณาเข้าสู่ระบบ Google Drive ก่อน'
          }
        }
      }

      const uploadFileName = fileName || file.name
      const timestamp = new Date().getTime()
      const finalFileName = `audio-summarize-${timestamp}-${uploadFileName}`

      // Create file metadata
      const metadata = {
        name: finalFileName,
        parents: ['appDataFolder'] // Store in app's private folder
      }

      // Create form data for multipart upload
      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      form.append('file', file)

      // Get access token
      const authInstance = this.gapi.auth2.getAuthInstance()
      const user = authInstance.currentUser.get()
      const accessToken = user.getAuthResponse().access_token

      // Upload file
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      })

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          fileId: result.id,
          fileUrl: `https://drive.google.com/file/d/${result.id}/view`
        }
      } else {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

    } catch (error) {
      console.error('Drive upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์'
      }
    }
  }
}

// Global declaration for Google API
declare global {
  interface Window {
    gapi: any
  }
}

export const googleDriveService = new GoogleDriveService()
