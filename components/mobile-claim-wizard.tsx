'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Camera,
  Mic,
  MicOff,
  MapPin,
  CheckCircle,
  FileText,
  User,
  Home,
  TreePine,
  Waves,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Save,
  Upload,
  QrCode,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react'
import { audioService, AudioRecording } from '@/lib/audio-service'
import { offlineService, OfflineClaim } from '@/lib/offline-service'
import Webcam from 'react-webcam'
import QRCode from 'react-qr-code'

interface WizardStep {
  id: number
  title: string
  titleHi: string
  description: string
  descriptionHi: string
  icon: any
  required: boolean
}

interface ClaimDocument {
  id: string
  type: string
  file?: File
  blob?: Blob
  filename: string
  checksum: string
  ocrText?: string
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
  polygon?: [number, number][]
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Choose Claim Type',
    titleHi: 'दावे का प्रकार चुनें',
    description: 'Select the type of forest rights claim',
    descriptionHi: 'वन अधिकार दावे का प्रकार चुनें',
    icon: TreePine,
    required: true
  },
  {
    id: 2,
    title: 'Upload Documents',
    titleHi: 'दस्तावेज़ अपलोड करें',
    description: 'Take photos or upload your documents',
    descriptionHi: 'अपने दस्तावेजों की फोटो लें या अपलोड करें',
    icon: FileText,
    required: true
  },
  {
    id: 3,
    title: 'Mark Location',
    titleHi: 'स्थान चिह्नित करें',
    description: 'Capture GPS location of your land',
    descriptionHi: 'अपनी ज़मीन का GPS स्थान कैप्चर करें',
    icon: MapPin,
    required: true
  },
  {
    id: 4,
    title: 'Claimant Details',
    titleHi: 'दावेदार की जानकारी',
    description: 'Fill in your personal information',
    descriptionHi: 'अपनी व्यक्तिगत जानकारी भरें',
    icon: User,
    required: true
  },
  {
    id: 5,
    title: 'Gram Sabha Consent',
    titleHi: 'ग्राम सभा की सहमति',
    description: 'Upload Gram Sabha meeting minutes',
    descriptionHi: 'ग्राम सभा की बैठक के कार्यवृत्त अपलोड करें',
    icon: Home,
    required: false
  },
  {
    id: 6,
    title: 'Review & Submit',
    titleHi: 'समीक्षा और जमा करें',
    description: 'Review all information and submit',
    descriptionHi: 'सभी जानकारी की समीक्षा करें और जमा करें',
    icon: CheckCircle,
    required: true
  }
]

// Custom hook for responsive design
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return isMobile;
};


export function MobileClaimWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isOnline, setIsOnline] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('hi')
  const [isRecording, setIsRecording] = useState(false)
  const [currentRecording, setCurrentRecording] = useState<AudioRecording | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [claimId, setClaimId] = useState<string>('')

  // Form Data
  const [claimType, setClaimType] = useState<'IFR' | 'CFR' | 'CR' | ''>('')
  const [documents, setDocuments] = useState<ClaimDocument[]>([])
  const [location, setLocation] = useState<LocationData | null>(null)
  const [claimantDetails, setClaimantDetails] = useState({
    name: '',
    fatherName: '',
    address: '',
    phone: '',
    aadhar: ''
  })
  const [gramSabhaConsent, setGramSabhaConsent] = useState({
    meetingDate: '',
    minutesPhoto: null as Blob | null,
    qrCode: ''
  })
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([])

  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    // Initialize claim ID
    setClaimId(`CLAIM_${Date.now()}`)

    // Speak welcome message
    if (voiceEnabled) {
      speakInstruction(currentStep)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (voiceEnabled) {
      speakInstruction(currentStep)
    }
  }, [currentStep, voiceEnabled])

  const speakInstruction = async (step: number) => {
    const instruction = audioService.getInstructions(getStepKey(step), language)
    if (instruction) {
      await audioService.speak(instruction, { language })
    }
  }

  const getStepKey = (step: number) => {
    const keys = ['claim-type', 'documents', 'location', 'details', 'gram-sabha', 'review']
    return keys[step - 1] || ''
  }

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const startRecording = async () => {
    try {
      setIsRecording(true)
      await audioService.startRecording()
      
      if (voiceEnabled) {
        await audioService.speak('रिकॉर्डिंग शुरू', { language: 'hi' })
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      setIsRecording(false)
    }
  }

  const stopRecording = async () => {
    try {
      const recording = await audioService.stopRecording()
      setCurrentRecording(recording)
      setAudioRecordings(prev => [...prev, recording])
      setIsRecording(false)
      
      if (voiceEnabled) {
        await audioService.speak('रिकॉर्डिंग बंद', { language: 'hi' })
      }
    } catch (error) {
      console.error('Failed to stop recording:', error)
      setIsRecording(false)
    }
  }

  const capturePhoto = async () => {
    if (!webcamRef.current) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      // Convert base64 to blob
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      
      const document: ClaimDocument = {
        id: `doc_${Date.now()}`,
        type: 'photo',
        blob,
        filename: `document_${documents.length + 1}.jpg`,
        checksum: await generateChecksum(blob)
      }
      
      setDocuments(prev => [...prev, document])
      setShowCamera(false)
      
      if (voiceEnabled) {
        await audioService.speak('फोटो सेव हो गई', { language: 'hi' })
      }
    }
  }

  const captureLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setLocation(locationData)
        
        if (voiceEnabled) {
          audioService.speak('स्थान कैप्चर हो गया', { language: 'hi' })
        }
      },
      (error) => {
        console.error('Location error:', error)
        alert('Failed to get location. Please enable GPS and try again.')
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }

  const saveOfflineClaim = async () => {
    setIsSaving(true)
    
    try {
      const claimData: Partial<OfflineClaim> = {
        id: claimId,
        claimType: claimType as 'IFR' | 'CFR' | 'CR',
        claimantDetails,
        documents: documents.map(doc => ({
          id: doc.id,
          type: doc.type,
          filename: doc.filename,
          blob: doc.blob!,
          checksum: doc.checksum
        })),
        location: location!,
        audioRecordings: audioRecordings.map(recording => ({
          id: recording.id,
          type: recording.type === 'help' ? 'testimony' : recording.type,
          blob: recording.blob,
          duration: recording.duration
        })),
        gramSabhaConsent: gramSabhaConsent.minutesPhoto ? {
          meetingDate: gramSabhaConsent.meetingDate,
          minutesPhoto: gramSabhaConsent.minutesPhoto,
          qrCode: gramSabhaConsent.qrCode
        } : undefined,
        status: isOnline ? 'ready' : 'draft'
      }

      await offlineService.saveClaim(claimData)
      
      if (isOnline) {
        // Try to sync immediately
        await offlineService.syncPendingClaims()
      }
      
      if (voiceEnabled) {
        await audioService.speak(
          isOnline ? 'दावा जमा हो गया' : 'दावा ऑफलाइन सेव हो गया',
          { language: 'hi' }
        )
      }
      
      router.push(`/my-claims?new=${claimId}`)
      
    } catch (error) {
      console.error('Failed to save claim:', error)
      alert('Failed to save claim. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const generateChecksum = async (blob: Blob): Promise<string> => {
    const arrayBuffer = await blob.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return !!claimType
      case 2: return documents.length > 0
      case 3: return !!location
      case 4: return !!claimantDetails.name && !!claimantDetails.address
      case 5: return true // Optional step
      case 6: return true
      default: return false
    }
  }

  const getCurrentStepComponent = () => {
    const step = WIZARD_STEPS[currentStep - 1]
    
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">
                {language === 'hi' ? step.titleHi : step.title}
              </h3>
              <p className="text-lg text-gray-600">
                {language === 'hi' ? step.descriptionHi : step.description}
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'IFR', name: 'Individual Forest Rights', nameHi: 'व्यक्तिगत वन अधिकार', icon: '🏠', desc: 'For individual/family land rights' },
                { id: 'CFR', name: 'Community Forest Rights', nameHi: 'सामुदायिक वन अधिकार', icon: '🌳', desc: 'For community forest management' },
                { id: 'CR', name: 'Community Resource Rights', nameHi: 'सामुदायिक संसाधन अधिकार', icon: '💧', desc: 'For water, NTFP, grazing rights' }
              ].map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all p-2 ${
                    claimType === type.id ? 'ring-4 ring-primary bg-primary/10' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setClaimType(type.id as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl">{type.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-xl">
                          {language === 'hi' ? type.nameHi : type.name}
                        </h4>
                        <p className="text-base text-gray-600">{type.desc}</p>
                      </div>
                      {claimType === type.id && (
                        <CheckCircle className="w-8 h-8 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">
                {language === 'hi' ? step.titleHi : step.title}
              </h3>
              <p className="text-lg text-gray-600">
                {language === 'hi' ? step.descriptionHi : step.description}
              </p>
            </div>

            {showCamera ? (
              <div className="space-y-4">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                  videoConstraints={{
                    facingMode: "environment"
                  }}
                />
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  <Button onClick={() => setShowCamera(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button onClick={() => setShowCamera(true)} className="h-28 flex-col text-xl">
                    <Camera className="w-10 h-10 mb-2" />
                    Take Photo
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-28 flex-col text-xl">
                    <Upload className="w-10 h-10 mb-2" />
                    Upload File
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach(async (file) => {
                      const doc: ClaimDocument = {
                        id: `doc_${Date.now()}_${Math.random()}`,
                        type: file.type.includes('image') ? 'photo' : 'document',
                        file,
                        filename: file.name,
                        checksum: await generateChecksum(file)
                      }
                      setDocuments(prev => [...prev, doc])
                    })
                  }}
                />

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents:</h4>
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{doc.filename}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">
                {language === 'hi' ? step.titleHi : step.title}
              </h3>
              <p className="text-lg text-gray-600">
                {language === 'hi' ? step.descriptionHi : step.description}
              </p>
            </div>

            <div className="space-y-6">
              <Button onClick={captureLocation} className="w-full h-20 text-xl" disabled={!!location}>
                <MapPin className="w-8 h-8 mr-4" />
                {location ? 'Location Captured!' : 'Capture GPS Location'}
              </Button>

              {location && (
                <Alert className="text-base">
                  <MapPin className="h-5 w-5" />
                  <AlertDescription>
                    Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    <br />
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">
                {language === 'hi' ? step.titleHi : step.title}
              </h3>
              <p className="text-lg text-gray-600">
                {language === 'hi' ? step.descriptionHi : step.description}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg">Name / नाम *</Label>
                <Input
                  id="name"
                  value={claimantDetails.name}
                  onChange={(e) => setClaimantDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="fatherName" className="text-lg">Father's Name / पिता का नाम</Label>
                <Input
                  id="fatherName"
                  value={claimantDetails.fatherName}
                  onChange={(e) => setClaimantDetails(prev => ({ ...prev, fatherName: e.target.value }))}
                  placeholder="Enter father's name"
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-lg">Address / पता *</Label>
                <Textarea
                  id="address"
                  value={claimantDetails.address}
                  onChange={(e) => setClaimantDetails(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your full address"
                  rows={4}
                  className="text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-lg">Phone Number / फोन नंबर</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={claimantDetails.phone}
                  onChange={(e) => setClaimantDetails(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter 10-digit mobile number"
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="aadhar" className="text-lg">Aadhar Number / आधार नंबर</Label>
                <Input
                  id="aadhar"
                  value={claimantDetails.aadhar}
                  onChange={(e) => setClaimantDetails(prev => ({ ...prev, aadhar: e.target.value }))}
                  placeholder="Enter 12-digit Aadhar number"
                  className="h-14 text-lg"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant="outline"
                  className="flex-1 h-16 text-lg"
                >
                  {isRecording ? <MicOff className="w-6 h-6 mr-2" /> : <Mic className="w-6 h-6 mr-2" />}
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
                
                {currentRecording && (
                  <Button onClick={() => audioService.playRecording(currentRecording.blob)} variant="outline" className="h-16">
                    <Play className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">
                {language === 'hi' ? step.titleHi : step.title}
              </h3>
              <p className="text-lg text-gray-600">
                {language === 'hi' ? step.descriptionHi : step.description}
              </p>
              <Badge variant="secondary">Optional</Badge>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="meetingDate" className="text-lg">Meeting Date / बैठक की तारीख</Label>
                <Input
                  id="meetingDate"
                  type="date"
                  value={gramSabhaConsent.meetingDate}
                  onChange={(e) => setGramSabhaConsent(prev => ({ ...prev, meetingDate: e.target.value }))}
                  className="h-14 text-lg"
                />
              </div>

              <Button onClick={() => setShowCamera(true)} variant="outline" className="w-full h-16 text-lg">
                <Camera className="w-6 h-6 mr-2" />
                Upload Meeting Minutes Photo
              </Button>

              <div className="space-y-3">
                <Label htmlFor="qrCode" className="text-lg">QR Code / QR कोड</Label>
                <Input
                  id="qrCode"
                  value={gramSabhaConsent.qrCode}
                  onChange={(e) => setGramSabhaConsent(prev => ({ ...prev, qrCode: e.target.value }))}
                  placeholder="Scan or enter QR code"
                  className="h-14 text-lg"
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">
                {language === 'hi' ? step.titleHi : step.title}
              </h3>
              <p className="text-lg text-gray-600">
                {language === 'hi' ? step.descriptionHi : step.description}
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Claim Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Claim Type:</strong> {claimType}
                  </div>
                  <div>
                    <strong>Claimant:</strong> {claimantDetails.name}
                  </div>
                  <div>
                    <strong>Documents:</strong> {documents.length} files
                  </div>
                  <div>
                    <strong>Location:</strong> {location ? 'Captured' : 'Not captured'}
                  </div>
                  <div>
                    <strong>Audio Recordings:</strong> {audioRecordings.length}
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isOnline ? 
                    'Your claim will be submitted immediately.' : 
                    'You are offline. Your claim will be saved locally and submitted when you come online.'
                  }
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <QRCode value={claimId} size={128} />
                <p className="text-sm text-gray-600 mt-2">Claim ID: {claimId}</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const currentStepData = WIZARD_STEPS[currentStep - 1]
  const progress = (currentStep / WIZARD_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-semibold">File New Claim</h1>
              <p className="text-sm text-gray-600">Step {currentStep} of {WIZARD_STEPS.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        <Progress value={progress} className="h-1" />
      </div>

      {/* Main Content */}
      <div className="p-4 pb-24">
        <div className="max-w-lg mx-auto">
          {getCurrentStepComponent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-inner">
        <div className="max-w-lg mx-auto flex gap-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 h-16 text-xl"
          >
            <ChevronLeft className="w-6 h-6 mr-2" />
            Back
          </Button>
          
          {currentStep === WIZARD_STEPS.length ? (
            <Button
              onClick={saveOfflineClaim}
              disabled={!validateStep(currentStep) || isSaving}
              className="flex-1 h-16 text-xl"
            >
              {isSaving ? (
                <>
                  <Save className="w-6 h-6 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Submit
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="flex-1 h-16 text-xl"
            >
              Next
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
