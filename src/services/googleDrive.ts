// Simplified Google Drive service
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
  async signIn(): Promise<AuthStatus> {
    return { isSignedIn: false } // Simplified - always return not signed in
  }

  async signOut(): Promise<void> {
    // Simplified - do nothing
  }

  async isSignedIn(): Promise<boolean> {
    return false // Simplified - always return false
  }

  async uploadFile(file: File): Promise<DriveUploadResult> {
    // Simplified - just return success without actual upload
    return {
      success: true,
      fileId: `local_${Date.now()}`,
      fileUrl: `Local file: ${file.name}`
    }
  }
}

export const googleDriveService = new GoogleDriveService()
