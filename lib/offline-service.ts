import localforage from 'localforage'

// Configure storage instances
const claimsStore = localforage.createInstance({
  name: 'fra-claims',
  storeName: 'claims',
  description: 'Offline FRA claims storage'
})

const mapStore = localforage.createInstance({
  name: 'fra-maps',
  storeName: 'maps',
  description: 'Cached map tiles and vector data'
})

const mediaStore = localforage.createInstance({
  name: 'fra-media',
  storeName: 'media',
  description: 'Photos, audio and documents'
})

const settingsStore = localforage.createInstance({
  name: 'fra-settings',
  storeName: 'settings',
  description: 'User preferences and app settings'
})

export interface OfflineClaim {
  id: string
  claimType: 'IFR' | 'CFR' | 'CR'
  claimantDetails: {
    name: string
    fatherName?: string
    address: string
    phone?: string
    aadhar?: string
  }
  documents: {
    id: string
    type: string
    filename: string
    blob: Blob
    checksum: string
  }[]
  location: {
    latitude: number
    longitude: number
    accuracy?: number
    polygon?: [number, number][]
  }
  audioRecordings?: {
    id: string
    type: 'testimony' | 'description'
    blob: Blob
    duration: number
  }[]
  gramSabhaConsent?: {
    meetingDate?: string
    minutesPhoto?: Blob
    qrCode?: string
  }
  status: 'draft' | 'ready' | 'syncing' | 'synced' | 'failed'
  createdAt: Date
  lastModified: Date
  syncAttempts: number
}

export interface CachedMapData {
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  zoom: number
  layers: string[]
  vectorTiles: {
    [key: string]: ArrayBuffer
  }
  lastUpdated: Date
  expiresAt: Date
}

export interface UserSettings {
  language: 'en' | 'hi' | 'od' | 'te' | 'bn'
  voiceEnabled: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  location?: {
    district: string
    state: string
    village?: string
  }
  notificationsEnabled: boolean
}

class OfflineService {
  private isOnline = true

  constructor() {
    this.setupNetworkListener()
  }

  private setupNetworkListener() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      
      window.addEventListener('online', () => {
        this.isOnline = true
        this.syncPendingClaims()
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
    }
  }

  // Claims Management
  async saveClaim(claim: Partial<OfflineClaim>): Promise<string> {
    const id = claim.id || this.generateId()
    const fullClaim: OfflineClaim = {
      id,
      claimType: claim.claimType || 'IFR',
      claimantDetails: claim.claimantDetails || { name: '', address: '' },
      documents: claim.documents || [],
      location: claim.location || { latitude: 0, longitude: 0 },
      status: claim.status || 'draft',
      createdAt: claim.createdAt || new Date(),
      lastModified: new Date(),
      syncAttempts: 0,
      ...claim
    }
    
    await claimsStore.setItem(id, fullClaim)
    return id
  }

  async getClaim(id: string): Promise<OfflineClaim | null> {
    return await claimsStore.getItem(id)
  }

  async getAllClaims(): Promise<OfflineClaim[]> {
    const claims: OfflineClaim[] = []
    await claimsStore.iterate((value: OfflineClaim) => {
      claims.push(value)
    })
    return claims.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
  }

  async deleteClaim(id: string): Promise<void> {
    await claimsStore.removeItem(id)
  }

  // Media Storage
  async saveMedia(id: string, blob: Blob, type: string): Promise<void> {
    await mediaStore.setItem(id, { blob, type, savedAt: new Date() })
  }

  async getMedia(id: string): Promise<{ blob: Blob; type: string; savedAt: Date } | null> {
    return await mediaStore.getItem(id)
  }

  // Map Data Caching
  async cacheMapData(region: string, data: CachedMapData): Promise<void> {
    await mapStore.setItem(region, data)
  }

  async getCachedMapData(region: string): Promise<CachedMapData | null> {
    const cached = await mapStore.getItem<CachedMapData>(region)
    if (cached && cached.expiresAt > new Date()) {
      return cached
    }
    return null
  }

  // Settings Management
  async saveSettings(settings: UserSettings): Promise<void> {
    await settingsStore.setItem('userSettings', settings)
  }

  async getSettings(): Promise<UserSettings | null> {
    return await settingsStore.getItem('userSettings')
  }

  // Sync Operations
  async syncPendingClaims(): Promise<void> {
    if (!this.isOnline) return

    const claims = await this.getAllClaims()
    const pendingClaims = claims.filter(claim => 
      claim.status === 'ready' || claim.status === 'failed'
    )

    for (const claim of pendingClaims) {
      try {
        await this.syncClaim(claim)
      } catch (error) {
        console.error(`Failed to sync claim ${claim.id}:`, error)
        claim.status = 'failed'
        claim.syncAttempts++
        await this.saveClaim(claim)
      }
    }
  }

  private async syncClaim(claim: OfflineClaim): Promise<void> {
    claim.status = 'syncing'
    await this.saveClaim(claim)

    // Prepare form data for upload
    const formData = new FormData()
    formData.append('claimData', JSON.stringify({
      claimType: claim.claimType,
      claimantDetails: claim.claimantDetails,
      location: claim.location,
      gramSabhaConsent: claim.gramSabhaConsent
    }))

    // Add documents
    for (const doc of claim.documents) {
      formData.append('documents', doc.blob, doc.filename)
    }

    // Add audio recordings
    if (claim.audioRecordings) {
      for (const audio of claim.audioRecordings) {
        formData.append('audio', audio.blob, `${audio.type}_${audio.id}.webm`)
      }
    }

    // Upload to server
    const response = await fetch('/api/claims/submit', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Update claim with server response
    claim.status = 'synced'
    claim.id = result.claimId || claim.id
    await this.saveClaim(claim)
  }

  // Utility Methods
  private generateId(): string {
    return `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async getStorageStats(): Promise<{
    claimsCount: number
    mediaSize: number
    mapCacheSize: number
    totalSize: number
  }> {
    let claimsCount = 0
    let mediaSize = 0
    let mapCacheSize = 0

    await claimsStore.iterate(() => { claimsCount++ })
    
    await mediaStore.iterate((value: any) => {
      mediaSize += value.blob?.size || 0
    })

    await mapStore.iterate((value: any) => {
      mapCacheSize += JSON.stringify(value).length
    })

    return {
      claimsCount,
      mediaSize,
      mapCacheSize,
      totalSize: mediaSize + mapCacheSize
    }
  }

  async clearCache(): Promise<void> {
    await mapStore.clear()
  }

  async exportClaimData(claimId: string): Promise<Blob> {
    const claim = await this.getClaim(claimId)
    if (!claim) throw new Error('Claim not found')

    const exportData = {
      claim,
      mediaFiles: {} as Record<string, any>
    }

    // Include media files
    for (const doc of claim.documents) {
      const media = await this.getMedia(doc.id)
      if (media) {
        exportData.mediaFiles[doc.id] = {
          type: media.type,
          data: await this.blobToBase64(media.blob)
        }
      }
    }

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

export const offlineService = new OfflineService()
