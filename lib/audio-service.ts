export interface AudioRecording {
  id: string
  blob: Blob
  duration: number
  type: 'testimony' | 'description' | 'help'
  timestamp: Date
}

export interface TTSSettings {
  language: 'en' | 'hi' | 'od' | 'te' | 'bn'
  rate: number
  pitch: number
  volume: number
}

class AudioService {
  private mediaRecorder: MediaRecorder | null = null
  private recordingStream: MediaStream | null = null
  private isRecording = false
  private recordedChunks: Blob[] = []

  // Text-to-Speech
  async speak(text: string, settings?: Partial<TTSSettings>): Promise<void> {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported')
      return
    }

    const defaultSettings: TTSSettings = {
      language: 'en',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0
    }

    const config = { ...defaultSettings, ...settings }
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = config.rate
    utterance.pitch = config.pitch
    utterance.volume = config.volume

    // Set voice based on language
    const voices = speechSynthesis.getVoices()
    let preferredVoice = null

    switch (config.language) {
      case 'hi':
        preferredVoice = voices.find(voice => 
          voice.lang.includes('hi') || voice.name.includes('Hindi')
        )
        break
      case 'en':
      default:
        preferredVoice = voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('US')
        )
        break
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(event.error)
      speechSynthesis.speak(utterance)
    })
  }

  // Voice Recording
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress')
    }

    try {
      this.recordingStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      this.mediaRecorder = new MediaRecorder(this.recordingStream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      this.recordedChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()
      this.isRecording = true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to start recording: ${errorMessage}`)
    }
  }

  async stopRecording(): Promise<AudioRecording> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress')
    }

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' })
        const recording: AudioRecording = {
          id: this.generateId(),
          blob,
          duration: 0, // Will be calculated
          type: 'testimony',
          timestamp: new Date()
        }

        // Calculate duration
        this.calculateDuration(blob).then(duration => {
          recording.duration = duration
          resolve(recording)
        }).catch(reject)

        // Cleanup
        this.cleanup()
      }

      this.mediaRecorder!.onerror = (event) => {
        reject(new Error(`Recording failed: ${event.error}`))
        this.cleanup()
      }

      this.mediaRecorder!.stop()
      this.isRecording = false
    })
  }

  private async calculateDuration(blob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(blob)
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url)
        resolve(audio.duration)
      })
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to calculate audio duration'))
      })
      
      audio.src = url
    })
  }

  private cleanup(): void {
    if (this.recordingStream) {
      this.recordingStream.getTracks().forEach(track => track.stop())
      this.recordingStream = null
    }
    this.mediaRecorder = null
    this.recordedChunks = []
  }

  async playRecording(blob: Blob): Promise<void> {
    const audio = new Audio()
    const url = URL.createObjectURL(blob)
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(url)
        resolve()
      })
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to play audio'))
      })
      
      audio.src = url
      audio.play()
    })
  }

  // Voice Commands (simplified speech recognition)
  async startListening(onResult: (text: string) => void): Promise<void> {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported')
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'hi-IN' // Can be configurable

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      onResult(text)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
    }

    recognition.start()
  }

  // Audio Guidance for UI elements
  getAudioHints(): Record<string, string> {
    return {
      'file-claim': 'नया दावा दर्ज करने के लिए यहां दबाएं', // Hindi: Press here to file a new claim
      'my-claims': 'अपने दावे देखने के लिए यहां दबाएं', // View your claims
      'map': 'नक्शा देखने के लिए यहां दबाएं', // View map
      'help': 'सहायता के लिए यहां दबाएं', // For help
      'camera': 'फोटो लेने के लिए यहां दबाएं', // Take photo
      'record': 'आवाज़ रिकॉर्ड करने के लिए यहां दबाएं', // Record voice
      'location': 'स्थान पकड़ने के लिए यहां दबाएं', // Capture location
      'submit': 'दावा जमा करने के लिए यहां दबाएं' // Submit claim
    }
  }

  // Language-specific audio instructions
  getInstructions(step: string, language: string = 'hi'): string {
    const instructions: Record<string, Record<string, string>> = {
      hi: {
        'claim-type': 'कृपया अपना दावे का प्रकार चुनें - व्यक्तिगत वन अधिकार, सामुदायिक वन अधिकार, या सामुदायिक संसाधन अधिकार',
        'documents': 'अपने दस्तावेजों की फोटो लें या अपलोड करें',
        'location': 'अपनी जमीन की सटीक लोकेशन मार्क करें',
        'details': 'अपनी जानकारी भरें या आवाज़ में बताएं',
        'review': 'सभी जानकारी की जांच करें और दावा जमा करें'
      },
      en: {
        'claim-type': 'Please choose your claim type - Individual Forest Rights, Community Forest Rights, or Community Resource Rights',
        'documents': 'Take photos or upload your documents',
        'location': 'Mark the exact location of your land',
        'details': 'Fill in your details or record them by voice',
        'review': 'Review all information and submit your claim'
      }
    }

    return instructions[language]?.[step] || instructions.en[step] || ''
  }

  private generateId(): string {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Global declaration for speech APIs
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export const audioService = new AudioService()
